// Background/service worker de Tags Lokky.
// Responsabilidades: estado del Modo escucha, icono, bandeja de resultados y llamadas ligeras a IA.

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error("Error al configurar sidePanel:", error));

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

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

async function getAppConfig() {
  const saved = await chrome.storage.local.get("config");
  return { ...DEFAULT_CONFIG, ...(saved.config || {}) };
}

async function resetListenModeOnBoot() {
  const current = await getShortcutsConfig();
  const shortcuts = { ...current, listenModeEnabled: false };
  await chrome.storage.local.set({ shortcuts });
  await chrome.storage.local.remove("listenResultInbox");
  await chrome.storage.session.remove("pendingAnalysis").catch(() => {});
  await updateActionIcon(false);
}

function createActionIcon(isListening, size, letterToShow = "") {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  // Background is transparent. (No solid fill)

  if (letterToShow === "...") {
    // Tres puntos de pensando horizontales
    ctx.fillStyle = "#363636";
    const space = size * 0.22;
    const radius = size * 0.075;
    ctx.beginPath();
    ctx.arc(size / 2 - space, size / 2, radius, 0, Math.PI * 2);
    ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
    ctx.arc(size / 2 + space, size / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    return ctx.getImageData(0, 0, size, size);
  }

  if (letterToShow && letterToShow !== "") {
    // Letra de respuesta sugerida
    ctx.fillStyle = "#363636";
    ctx.font = `bold ${Math.floor(size * 0.7)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letterToShow, size / 2, size / 2);
    return ctx.getImageData(0, 0, size, size);
  }

  if (isListening) {
    // Modo escucha activo: punto
    ctx.fillStyle = "#363636";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    return ctx.getImageData(0, 0, size, size);
  }

  // Modo escucha inactivo: emoji de etiqueta
  ctx.font = `${Math.floor(size * 0.88)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏷️", size / 2, size / 2);
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

async function updateActionIcon(isListening, letterToShow = "", titleSuffix = "") {
  const cleanLetter = String(letterToShow || "").trim().slice(0, 4).toUpperCase();

  try {
    await chrome.action.setIcon({
      imageData: {
        16: createActionIcon(isListening, 16, cleanLetter),
        32: createActionIcon(isListening, 32, cleanLetter)
      }
    });
  } catch (error) {
    console.warn("No se pudo pintar icono dinámico:", error.message);
  }

  // Dejamos la insignia sin texto para evitar que Chrome pinte el cuadro de fondo verde/rojo
  await setActionBadge("");

  await chrome.action.setTitle({
    title: isListening
      ? titleSuffix
        ? titleSuffix
        : cleanLetter
          ? `Canvas Study — Respuesta sugerida: ${cleanLetter}`
          : "Canvas Study — Modo escucha activo"
      : "Canvas Study"
  });

  // Cuando hay una respuesta (y se está escuchando), se muestra la letra durante 1 segundo,
  // y después vuelve automáticamente al punto del mismo color en el centro.
  if (isListening && cleanLetter && cleanLetter !== "...") {
    setTimeout(async () => {
      const currentShortcuts = await getShortcutsConfig();
      if (currentShortcuts.listenModeEnabled) {
        try {
          await chrome.action.setIcon({
            imageData: {
              16: createActionIcon(true, 16, ""),
              32: createActionIcon(true, 32, "")
            }
          });
        } catch (error) {
          console.warn("No se pudo restaurar el icono de escucha:", error.message);
        }
      }
    }, 1000);
  }
}

async function ensureContentScriptInActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;

    await chrome.scripting.insertCSS({ target: { tabId: tab.id, allFrames: true }, files: ["content/content.css"] }).catch(() => {});
    await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, files: ["content/content.js"] }).catch(() => {});
  } catch (error) {
    console.warn("No se pudo asegurar content script:", error.message);
  }
}

async function notifyShortcutsChanged(shortcuts) {
  await ensureContentScriptInActiveTab();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) await chrome.tabs.sendMessage(tab.id, { type: "SHORTCUTS_UPDATED", shortcuts });
  } catch (error) {
    // No bloqueante: algunas páginas no admiten content scripts.
  }

  try {
    await chrome.runtime.sendMessage({ type: "SHORTCUTS_UPDATED", shortcuts });
  } catch (error) {
    // No bloqueante: el panel puede estar cerrado.
  }
}

function normalizeQuestionData(payload) {
  const data = payload?.data || payload || {};
  return {
    id: data.id || `listen-${Date.now()}`,
    text: String(data.text || payload?.text || "").trim(),
    options: Array.isArray(data.options) ? data.options : [],
    sourceUrl: data.sourceUrl || "",
    quizId: data.quizId || payload?.quizId || "",
    quizTitle: data.quizTitle || payload?.quizTitle || ""
  };
}

function cleanAnswerLetter(value) {
  const match = String(value || "").trim().match(/^[A-D]$/i);
  return match ? match[0].toUpperCase() : "";
}

function extractLetterFromText(value) {
  const raw = String(value || "").trim();
  const direct = cleanAnswerLetter(raw);
  if (direct) return direct;

  const labeled = raw.match(/(?:respuesta|opci[oó]n|letra|correcta)\s*[:\-]?\s*([A-D])/i);
  if (labeled) return labeled[1].toUpperCase();

  const anyLetter = raw.match(/\b([A-D])\b/i);
  return anyLetter ? anyLetter[1].toUpperCase() : "";
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

function findLetterByOptionText(questionData, rawAnswer) {
  const answerText = normalizeTextForMatch(rawAnswer);
  if (!answerText || !Array.isArray(questionData.options)) return "";

  const exactIndex = questionData.options.findIndex((option) => normalizeTextForMatch(option.text) === answerText);
  if (exactIndex >= 0) return ALPHABET[exactIndex] || "";

  const partialIndex = questionData.options.findIndex((option) => {
    const optionText = normalizeTextForMatch(option.text);
    return optionText && (optionText.includes(answerText) || answerText.includes(optionText));
  });
  return partialIndex >= 0 ? ALPHABET[partialIndex] || "" : "";
}

function buildLetterPrompt(questionData) {
  let prompt = "Responde SOLO con una letra: A, B, C o D. No expliques nada. No uses JSON.\n\n";
  prompt += `Pregunta:\n${questionData.text}\n\n`;

  if (questionData.options.length > 0) {
    prompt += "Opciones:\n";
    questionData.options.slice(0, 4).forEach((option, index) => {
      prompt += `${ALPHABET[index]}. ${option.text}\n`;
    });
  }

  prompt += "\nDevuelve únicamente la letra correcta.";
  return prompt;
}

async function resolveAnswerLetter(questionData) {
  const config = await getAppConfig();
  const prompt = buildLetterPrompt(questionData);
  let rawAnswer = "";

  if (config.connectionMode === "api" && config.apiProvider === "gemini") {
    rawAnswer = await callGeminiLetter(prompt, config);
  } else if (config.connectionMode === "api" && config.apiProvider === "openai") {
    rawAnswer = await callOpenAILetter(prompt, config.openaiKey, config.openaiModel, "https://api.openai.com/v1");
  } else if (config.connectionMode === "api" && config.apiProvider === "claude") {
    rawAnswer = await callClaudeLetter(prompt, config);
  } else if (config.connectionMode === "gateway") {
    if (config.gatewayProvider === "hermes") {
      rawAnswer = await callHermesLocalLetter(prompt, config.gatewayUrl);
    } else {
      rawAnswer = await callOpenAILetter(prompt, config.gatewayToken, config.gatewayModel, config.gatewayUrl);
    }
  } else if (config.connectionMode === "local") {
    rawAnswer = await callOllamaLetter(prompt, config.localUrl, config.localModel);
  } else {
    throw new Error("Modo de conexión no soportado o mal configurado.");
  }

  return extractLetterFromText(rawAnswer) || findLetterByOptionText(questionData, rawAnswer) || "?";
}

async function callHermesLocalLetter(prompt, url) {
  const cleanUrl = String(url || "").replace(/\/+$/, "");
  const endpoint = `${cleanUrl}/api/companion/chat`;
  
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: prompt
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en Hermes local: HTTP ${response.status} - ${text}`);
  }

  const data = await response.json();
  if (!data.ok || !data.response) {
    throw new Error(`Hermes respondió con error o vacío: ${JSON.stringify(data)}`);
  }

  return data.response;
}

async function callGeminiLetter(prompt, config) {
  if (!config.geminiKey) throw new Error("API Key de Gemini no configurada.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 8 }
    })
  });

  if (!response.ok) throw new Error(`Error en API de Gemini: ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callOpenAILetter(prompt, apiKey, model, baseUrl) {
  if (!apiKey && String(baseUrl).includes("openai.com")) throw new Error("API Key de OpenAI no configurada.");

  const endpoint = `${String(baseUrl || "").replace(/\/+$/, "")}/chat/completions`;
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 4,
      messages: [
        { role: "system", content: "Responde exclusivamente con una letra: A, B, C o D." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`Error en llamada OpenAI/Gateway: HTTP ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callClaudeLetter(prompt, config) {
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
      max_tokens: 4,
      temperature: 0,
      system: "Responde exclusivamente con una letra: A, B, C o D.",
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) throw new Error(`Error en llamada Claude: HTTP ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callOllamaLetter(prompt, localUrl, model) {
  const endpoint = `${String(localUrl || "").replace(/\/+$/, "")}/api/chat`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      options: { temperature: 0 },
      messages: [
        { role: "system", content: "Responde exclusivamente con una letra: A, B, C o D." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`Error en Ollama local: HTTP ${response.status} - ${await response.text()}`);
  const data = await response.json();
  return data.message?.content || "";
}

function buildListenResultPayload(questionData, answerLetter) {
  return {
    type: "listen_quick_result",
    event: {
      type: "listen_result_ready",
      source: "background",
      timestamp: Date.now(),
      answerLetter
    },
    questionData,
    result: {
      answerLetter,
      recommendedAnswer: answerLetter ? `Opción ${answerLetter}` : "Respuesta rápida no disponible",
      explanation: "Resultado rápido generado desde Modo escucha. El panel lo recibe desde la bandeja interna listenResultInbox.",
      confidence: "rápida",
      keyConcepts: [],
      recommendedOptionIndex: Math.max(0, "ABCD".indexOf(answerLetter))
    },
    timestamp: Date.now(),
    source: "listen_mode"
  };
}

async function publishListenResult(payload) {
  await chrome.storage.local.set({ listenResultInbox: payload });
  await chrome.storage.session.set({ pendingAnalysis: payload }).catch(() => {});

  try {
    await chrome.runtime.sendMessage({ type: "LISTEN_RESULT_READY", payload });
  } catch (error) {
    // El panel puede estar cerrado; listenResultInbox queda como fuente de verdad.
  }
}

async function saveListenResultToHistory(questionData, result) {
  try {
    const timestamp = Date.now();

    // 1. Historial general (plano)
    const historyObj = await chrome.storage.local.get("solveHistory");
    let history = historyObj.solveHistory || [];
    history = history.filter((item) => item.question?.text !== questionData.text);
    history.unshift({ id: questionData.id, timestamp: timestamp, question: questionData, analysis: result });
    if (history.length > 30) history = history.slice(0, 30);
    await chrome.storage.local.set({ solveHistory: history });

    // 2. Historial agrupado por Cuestionario
    const quizId = questionData.quizId || "cuestionario-general";
    const quizTitle = questionData.quizTitle || "Consultas Generales";

    const sessionsObj = await chrome.storage.local.get("quizSessions");
    let quizSessions = sessionsObj.quizSessions || {};

    if (!quizSessions[quizId]) {
      quizSessions[quizId] = {
        quizId: quizId,
        title: quizTitle,
        startedAt: timestamp,
        updatedAt: timestamp,
        questions: []
      };
    }

    let session = quizSessions[quizId];
    session.updatedAt = timestamp;
    session.questions = session.questions.filter(q => q.text !== questionData.text);
    session.questions.push({
      id: questionData.id,
      text: questionData.text,
      options: questionData.options,
      analysis: result,
      timestamp: timestamp
    });

    await chrome.storage.local.set({ quizSessions });
  } catch (error) {
    console.error("Error al guardar resultado rápido en historial:", error);
  }
}

async function handleListenSelection(message) {
  // 1. Extrae y limpia la pregunta y la primera palabra
  const questionData = normalizeQuestionData(message);
  const firstWord = (questionData?.text || "").trim().split(/\s+/)[0] || "...";
  
  // 2. Muestra la primera palabra leída y cambia de inmediato a pensando "..."
  await updateActionIcon(true, firstWord);
  await updateActionIcon(true, "...");

  try {
    const answerLetter = await resolveAnswerLetter(questionData);
    const payload = buildListenResultPayload(questionData, answerLetter);

    await saveListenResultToHistory(questionData, payload.result);
    await publishListenResult(payload);
    
    // 3. Responde con la letra A/B/C/D (dura 1 segundo y vuelve al punto por sí sola mediante updateActionIcon)
    let titleDetails = "";
    if (questionData.text) {
      const optionIndex = "ABCD".indexOf(answerLetter);
      const optText = (optionIndex >= 0 && questionData.options && questionData.options[optionIndex])
        ? questionData.options[optionIndex].text
        : "";
      titleDetails = `${questionData.text}\n${answerLetter}${optText ? ` ${optText}` : ""}`.trim();
    }
    await updateActionIcon(true, answerLetter, titleDetails);

    return { success: true, questionData, iconAnswer: answerLetter, payload };
  } catch (error) {
    const safeError = `[${new Date().toLocaleTimeString()}] Error en Modo escucha: ${error.message}`;
    await chrome.storage.local.set({ lastError: safeError });
    await updateActionIcon(true, "!", error.message.slice(0, 80));
    throw error;
  }
}

async function toggleListenMode() {
  const current = await getShortcutsConfig();
  const nextEnabled = !current.listenModeEnabled;
  const shortcuts = await saveShortcutsConfig({ listenModeEnabled: nextEnabled });
  await updateActionIcon(nextEnabled);
  await notifyShortcutsChanged(shortcuts);
  return shortcuts;
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
  } catch (error) {
    // El panel puede estar cerrado.
  }
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

chrome.action.onClicked.addListener(() => {
  toggleListenMode().catch((error) => console.error("Error al alternar Modo escucha:", error));
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-listen-mode") return;
  toggleListenMode().catch((error) => console.error("Error en atajo nativo:", error));
});

getShortcutsConfig()
  .then((shortcuts) => updateActionIcon(shortcuts.listenModeEnabled))
  .catch((error) => console.error("Error al restaurar icono:", error));

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "solve-selection" && tab) {
    await setPendingAnalysisFromSelection(info.selectionText, tab, "context_menu");
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
      await notifyShortcutsChanged(shortcuts);
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
