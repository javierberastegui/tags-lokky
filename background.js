// El icono de la extensión controla el Modo escucha.
// El sidepanel queda para configuración, historial y explicación detallada.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error("Error al configurar el comportamiento del panel lateral:", error));

const DEFAULT_SHORTCUTS = {
  listenModeEnabled: false,
  listenModeShortcut: "F8"
};

const DEFAULT_CONFIG = {
  connectionMode: "api",
  apiProvider: "gemini",
  geminiKey: "",
  geminiModel: "gemini-2.5-flash",
  openaiKey: "",
  openaiModel: "gpt-4o-mini",
  claudeKey: "",
  claudeModel: "claude-3-5-sonnet-latest",
  gatewayProvider: "hermes",
  gatewayUrl: "https://api.hermes-gateway.com/v1",
  gatewayToken: "",
  gatewayModel: "hermes-agent-v1",
  localUrl: "http://localhost:11434",
  localModel: "llama3",
  language: "es"
};

async function getShortcutsConfig() {
  const saved = await chrome.storage.local.get("shortcuts");
  return { ...DEFAULT_SHORTCUTS, ...(saved.shortcuts || {}) };
}

async function saveShortcutsConfig(nextConfig) {
  const current = await getShortcutsConfig();
  const shortcuts = { ...current, ...nextConfig };
  await chrome.storage.local.set({ shortcuts });
  await updateActionIcon(shortcuts.listenModeEnabled);
  return shortcuts;
}

async function resetListenModeOnBoot() {
  const current = await getShortcutsConfig();
  const shortcuts = { ...current, listenModeEnabled: false };
  await chrome.storage.local.set({ shortcuts });
  await updateActionIcon(false);
}

async function getAppConfig() {
  const saved = await chrome.storage.local.get("config");
  return { ...DEFAULT_CONFIG, ...(saved.config || {}) };
}

function createActionIcon(isListening, size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  if (isListening) {
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = Math.max(1, size * 0.06);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#f9fafb";
    ctx.font = `700 ${Math.floor(size * 0.6)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("C", size / 2, size / 2 + 1);
  }

  return ctx.getImageData(0, 0, size, size);
}

async function setActionBadge(text, color = "#10b981") {
  const cleanText = String(text || "").trim().slice(0, 4).toUpperCase();
  await chrome.action.setBadgeText({ text: cleanText });
  if (cleanText) {
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setBadgeTextColor({ color: "#ffffff" }).catch(() => {});
  }
}

async function updateActionIcon(isListening, badgeText = "") {
  const cleanBadge = String(badgeText || "").trim().slice(0, 4).toUpperCase();

  try {
    await chrome.action.setIcon({
      imageData: {
        16: createActionIcon(isListening, 16),
        32: createActionIcon(isListening, 32)
      }
    });
  } catch (error) {
    // Si falla el icono dinámico, el badge sigue dando estado visible.
  }

  if (!isListening) {
    await setActionBadge("");
  } else if (cleanBadge) {
    await setActionBadge(cleanBadge, cleanBadge === "!" ? "#ef4444" : "#10b981");
  } else {
    await setActionBadge("");
  }

  await chrome.action.setTitle({
    title: isListening
      ? cleanBadge
        ? `Canvas Study — Respuesta sugerida: ${cleanBadge}`
        : "Canvas Study — Modo escucha activo"
      : "Canvas Study"
  });
}

async function ensureContentScriptInActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;

    await chrome.scripting.insertCSS({ target: { tabId: tab.id, allFrames: true }, files: ["content/content.css"] }).catch(() => {});
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ["content/content.js"] }).catch(() => {});
  } catch (error) {
    console.warn("No se pudo asegurar content script en la pestaña activa:", error.message);
  }
}

async function setPendingAnalysisFromSelection(selectedText, tab, source) {
  const cleanText = (selectedText || "").trim();
  if (!cleanText || !tab) return;

  await chrome.storage.session.set({
    pendingAnalysis: { text: cleanText, timestamp: Date.now(), type: "free_text", source: source || "selection" }
  });

  if (tab.windowId !== undefined) await chrome.sidePanel.open({ windowId: tab.windowId });

  try {
    await chrome.runtime.sendMessage({ type: "ANALYZE_TEXT", text: cleanText, source: source || "selection" });
  } catch (err) {
    console.log("El panel lateral aún no está escuchando. Datos guardados en almacenamiento de sesión.");
  }
}

async function notifyActiveTabShortcutsChanged(shortcuts) {
  await ensureContentScriptInActiveTab();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) await chrome.tabs.sendMessage(tab.id, { type: "SHORTCUTS_UPDATED", shortcuts });
  } catch (error) {
    // Algunas páginas no aceptan content scripts; no es un error bloqueante.
  }

  try {
    await chrome.runtime.sendMessage({ type: "SHORTCUTS_UPDATED", shortcuts });
  } catch (error) {
    // El sidepanel puede no estar abierto.
  }
}

function normalizeQuestionData(payload) {
  const data = payload?.data || payload || {};
  const text = String(data.text || payload?.text || "").trim();
  return {
    id: data.id || `listen-${Date.now()}`,
    text,
    options: Array.isArray(data.options) ? data.options : [],
    sourceUrl: data.sourceUrl || ""
  };
}

function indexToLetter(index) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Number.isInteger(index) && index >= 0 ? alphabet[index] || String(index) : "";
}

function normalizeTextForMatch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^[a-d][).:\-\s]+/i, "")
    .replace(/[^a-z0-9ñ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLetterFromAnswer(answer) {
  const match = String(answer || "").match(/\b([A-D])\b/i);
  return match ? match[1].toUpperCase() : "";
}

function findOptionLetterFromAnswer(questionData, result) {
  const directLetter = indexToLetter(result?.recommendedOptionIndex);
  if (directLetter) return directLetter;

  const explicitLetter = extractLetterFromAnswer(result?.recommendedAnswer);
  if (explicitLetter) return explicitLetter;

  const answerText = normalizeTextForMatch(result?.recommendedAnswer);
  if (!answerText || !Array.isArray(questionData.options)) return "";

  const exactIndex = questionData.options.findIndex((option) => {
    const optionText = normalizeTextForMatch(option.text);
    return optionText && optionText === answerText;
  });
  if (exactIndex >= 0) return indexToLetter(exactIndex);

  const partialIndex = questionData.options.findIndex((option) => {
    const optionText = normalizeTextForMatch(option.text);
    return optionText && (optionText.includes(answerText) || answerText.includes(optionText));
  });
  if (partialIndex >= 0) return indexToLetter(partialIndex);

  return "";
}

function buildPrompt(questionData, config) {
  let prompt = `Analiza la siguiente pregunta académica y devuelve una respuesta útil para estudio.\n\nPregunta:\n"${questionData.text}"\n\n`;

  if (questionData.options && questionData.options.length > 0) {
    prompt += "Opciones de respuesta disponibles:\n";
    questionData.options.forEach((opt) => { prompt += `${opt.index}: ${opt.text}\n`; });
    prompt += `\nInstrucciones adicionales:\n1. Selecciona la opción recomendada exacta en 'recommendedAnswer'.\n2. Indica el índice numérico correcto en 'recommendedOptionIndex'. Si no hay respuesta listada, devuelve -1.\n`;
  } else {
    prompt += "\nInstrucciones adicionales:\n1. Resuelve la pregunta directamente en 'recommendedAnswer'.\n2. Pon 'recommendedOptionIndex' como -1.\n";
  }

  prompt += `\n3. Explica de forma educativa y clara el porqué en 'explanation' (idioma: ${config.language}).\n4. Devuelve 2 o 3 conceptos clave en 'keyConcepts'.\n5. Asigna una confianza de 0 a 100 en 'confidence'.\n6. Devuelve JSON válido sin texto adicional.`;
  return prompt;
}

async function analyzeQuestionData(questionData) {
  if (!questionData.text) throw new Error("No hay texto seleccionado para analizar.");

  const config = await getAppConfig();
  const prompt = buildPrompt(questionData, config);

  if (config.connectionMode === "api") {
    if (config.apiProvider === "gemini") return callGemini(prompt, config);
    if (config.apiProvider === "openai") return callOpenAI(prompt, config.openaiKey, config.openaiModel, "https://api.openai.com/v1");
    if (config.apiProvider === "claude") return callClaude(prompt, config);
  }

  if (config.connectionMode === "gateway") return callOpenAI(prompt, config.gatewayToken, config.gatewayModel, config.gatewayUrl);
  if (config.connectionMode === "local") return callOllama(prompt, config.localUrl, config.localModel);

  throw new Error("Modo de conexión no soportado o mal configurado.");
}

async function callGemini(prompt, config) {
  if (!config.geminiKey) throw new Error("API Key de Gemini no configurada.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            recommendedAnswer: { type: "STRING" },
            explanation: { type: "STRING" },
            confidence: { type: "INTEGER" },
            keyConcepts: { type: "ARRAY", items: { type: "STRING" } },
            recommendedOptionIndex: { type: "INTEGER" }
          },
          required: ["recommendedAnswer", "explanation", "confidence", "keyConcepts"]
        }
      }
    })
  });
  if (!response.ok) throw new Error(`Error en API de Gemini: ${response.status} - ${await response.text()}`);
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Gemini no devolvió contenido analizable.");
  return JSON.parse(rawText);
}

async function callOpenAI(prompt, apiKey, model, baseUrl) {
  if (!apiKey && String(baseUrl).includes("openai.com")) throw new Error("API Key de OpenAI no configurada.");
  const endpoint = `${String(baseUrl || "").replace(/\/+$/, "")}/chat/completions`;
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Eres un asistente de estudio. Devuelve estrictamente JSON válido con recommendedAnswer, explanation, confidence, keyConcepts y recommendedOptionIndex." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) throw new Error(`Error en llamada OpenAI/Gateway: HTTP ${response.status} - ${await response.text()}`);
  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("OpenAI/Gateway no devolvió contenido analizable.");
  return JSON.parse(rawText);
}

async function callClaude(prompt, config) {
  if (!config.claudeKey) throw new Error("API Key de Claude no configurada.");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.claudeKey,
      "anthropic-version": "2023-06-01",
      "dangerously-allow-browser": "true"
    },
    body: JSON.stringify({
      model: config.claudeModel,
      max_tokens: 1024,
      system: "Devuelve estrictamente JSON válido con recommendedAnswer, explanation, confidence, keyConcepts y recommendedOptionIndex.",
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!response.ok) throw new Error(`Error en llamada Claude: HTTP ${response.status} - ${await response.text()}`);
  const data = await response.json();
  const rawText = data.content?.[0]?.text || "";
  const jsonStartIndex = rawText.indexOf("{");
  const jsonEndIndex = rawText.lastIndexOf("}");
  if (jsonStartIndex === -1 || jsonEndIndex === -1) throw new Error("Claude no devolvió un JSON estructurado.");
  return JSON.parse(rawText.substring(jsonStartIndex, jsonEndIndex + 1));
}

async function callOllama(prompt, localUrl, model) {
  const endpoint = `${String(localUrl || "").replace(/\/+$/, "")}/api/chat`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      format: "json",
      stream: false,
      messages: [
        { role: "system", content: "Devuelve estrictamente JSON válido con recommendedAnswer, explanation, confidence, keyConcepts y recommendedOptionIndex." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) throw new Error(`Error en Ollama local: HTTP ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return JSON.parse(data.message.content);
}

async function saveAnalysisToHistory(questionData, result) {
  try {
    const historyObj = await chrome.storage.local.get("solveHistory");
    let history = historyObj.solveHistory || [];
    history = history.filter((item) => item.question.text !== questionData.text);
    history.unshift({ id: questionData.id, timestamp: Date.now(), question: questionData, analysis: result });
    if (history.length > 30) history = history.slice(0, 30);
    await chrome.storage.local.set({ solveHistory: history });
  } catch (error) {
    console.error("Error al guardar análisis en historial:", error);
  }
}

async function handleListenSelection(message) {
  await updateActionIcon(true, "...");

  try {
    const questionData = normalizeQuestionData(message);
    const result = await analyzeQuestionData(questionData);
    const answerLabel = findOptionLetterFromAnswer(questionData, result) || "?";

    await saveAnalysisToHistory(questionData, result);
    await chrome.storage.session.set({ pendingAnalysis: { type: "analysis_result", questionData, result, timestamp: Date.now(), source: "listen_mode" } });
    await updateActionIcon(true, answerLabel);

    return { success: true, questionData, result, iconAnswer: answerLabel };
  } catch (error) {
    await updateActionIcon(true, "!");
    throw error;
  }
}

async function toggleListenMode() {
  const current = await getShortcutsConfig();
  const nextEnabled = !current.listenModeEnabled;
  const shortcuts = await saveShortcutsConfig({ listenModeEnabled: nextEnabled });
  await updateActionIcon(nextEnabled);
  await notifyActiveTabShortcutsChanged(shortcuts);
  return shortcuts;
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({ id: "solve-selection", title: "Analizar con Gemini", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "open-sidepanel", title: "Abrir panel de explicación", contexts: ["action"] });
  await resetListenModeOnBoot();
  console.log("Menús registrados y Modo escucha iniciado apagado.");
});

chrome.runtime.onStartup.addListener(() => {
  resetListenModeOnBoot().catch((error) => console.error("Error al apagar Modo escucha en startup:", error));
});

chrome.action.onClicked.addListener(async () => {
  await toggleListenMode();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-listen-mode") return;
  await toggleListenMode();
});

resetListenModeOnBoot()
  .catch((error) => console.error("Error al inicializar Modo escucha apagado:", error));

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "solve-selection" && tab) {
    try {
      await setPendingAnalysisFromSelection(info.selectionText, tab, "context_menu");
    } catch (error) {
      console.error("Error al manejar la selección del menú contextual:", error);
    }
    return;
  }

  if (info.menuItemId === "open-sidepanel" && tab?.windowId !== undefined) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "LISTEN_SELECTION") return sendResponse(await handleListenSelection(message));
    if (message.type === "GET_SHORTCUTS") return sendResponse({ success: true, shortcuts: await getShortcutsConfig() });
    if (message.type === "SAVE_SHORTCUTS") {
      const shortcuts = await saveShortcutsConfig(message.shortcuts || {});
      await notifyActiveTabShortcutsChanged(shortcuts);
      return sendResponse({ success: true, shortcuts });
    }
    if (message.type === "TOGGLE_LISTEN_MODE") return sendResponse({ success: true, shortcuts: await toggleListenMode() });
    sendResponse({ success: false, error: "Mensaje no soportado por background." });
  })().catch((error) => {
    console.error("Error en background.onMessage:", error);
    sendResponse({ success: false, error: error.message });
  });
  return true;
});
