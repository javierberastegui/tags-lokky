// Estado global de la configuración
let config = {
  connectionMode: "api",
  apiProvider: "gemini",
  // Claves y modelos de API
  geminiKey: "",
  geminiModel: "gemini-2.5-flash",
  openaiKey: "",
  openaiModel: "gpt-4o-mini",
  claudeKey: "",
  claudeModel: "claude-3-5-sonnet-latest",
  // Gateway
  gatewayProvider: "hermes",
  gatewayUrl: "http://127.0.0.1:9119",
  gatewayToken: "",
  gatewayModel: "hermes-agent-v1",
  // Local (Ollama)
  localUrl: "http://localhost:11434",
  localModel: "llama3",
  // Generales
  language: "es"
};

let activeQuestionData = null; // Pregunta cargada actualmente

// Inicialización
document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  await loadSettings();
  setupSettingsForm();
  setupHistoryControls();
  checkPendingAnalysis();
  
  // Escuchar mensajes desde content.js o background.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ANALYZE_QUESTION") {
      handleIncomingQuestion(message.data);
      switchTab("solve");
    } else if (message.type === "ANALYZE_TEXT") {
      handleIncomingFreeText(message.text);
      switchTab("solve");
    }
  });
});

// --- NAVEGACIÓN DE PESTAÑAS ---
function setupTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
  
  const targetTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
  const targetPanel = document.getElementById(`panel${capitalizeFirstLetter(tabName)}`);
  
  if (targetTab && targetPanel) {
    targetTab.classList.add("active");
    targetPanel.classList.remove("hidden");
  }
  
  if (tabName === "history") {
    loadHistoryList();
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// --- CARGAR Y GUARDAR AJUSTES ---
async function loadSettings() {
  try {
    const saved = await chrome.storage.local.get(["config", "lastError"]);
    if (saved.config) {
      config = { ...config, ...saved.config };
    }
    
    // Rellenar valores en el DOM basándose en la configuración cargada
    document.getElementById("connectionModeSelect").value = config.connectionMode;
    document.getElementById("apiProviderSelect").value = config.apiProvider;
    document.getElementById("languageSelect").value = config.language;

    // Campos Gateway
    document.getElementById("gatewayProviderSelect").value = config.gatewayProvider;
    document.getElementById("gatewayUrlInput").value = config.gatewayUrl;
    document.getElementById("gatewayTokenInput").value = config.gatewayToken;
    document.getElementById("gatewayModelInput").value = config.gatewayModel;

    // Campos Local
    document.getElementById("localUrlInput").value = config.localUrl;
    document.getElementById("localModelManualInput").value = config.localModel;

    // Cargar error anterior si existe
    if (saved.lastError) {
      showErrorLog(saved.lastError);
    }

    // Actualizar campos condicionales
    updateFormVisibility();
    updateApiFields();
    updateApiBadge();
    
    // Intentar buscar los modelos de Ollama si el modo local está configurado
    if (config.connectionMode === "local") {
      fetchOllamaModels(config.localUrl, config.localModel);
    }
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
}

function updateFormVisibility() {
  const mode = document.getElementById("connectionModeSelect").value;
  
  // Ocultar todas las secciones de conexión
  document.querySelectorAll(".connection-section").forEach(sec => sec.classList.add("hidden"));
  
  // Mostrar la sección correspondiente
  if (mode === "api") {
    document.getElementById("sectionApi").classList.remove("hidden");
  } else if (mode === "gateway") {
    document.getElementById("sectionGateway").classList.remove("hidden");
  } else if (mode === "local") {
    document.getElementById("sectionLocal").classList.remove("hidden");
  }
}

function updateApiFields() {
  const provider = document.getElementById("apiProviderSelect").value;
  const keyLabel = document.getElementById("apiKeyLabel");
  const keyHelp = document.getElementById("apiKeyHelp");
  const keyInput = document.getElementById("apiKeyInput");
  const modelInput = document.getElementById("apiModelInput");
  
  if (provider === "gemini") {
    keyLabel.textContent = "Gemini API Key";
    keyInput.placeholder = "AIzaSy...";
    keyInput.value = config.geminiKey;
    modelInput.value = config.geminiModel;
    keyHelp.innerHTML = 'Consigue una gratis en <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a>.';
  } else if (provider === "openai") {
    keyLabel.textContent = "OpenAI API Key";
    keyInput.placeholder = "sk-proj-...";
    keyInput.value = config.openaiKey;
    modelInput.value = config.openaiModel;
    keyHelp.innerHTML = 'Consigue tu clave en la consola de <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI</a>.';
  } else if (provider === "claude") {
    keyLabel.textContent = "Claude API Key";
    keyInput.placeholder = "sk-ant-...";
    keyInput.value = config.claudeKey;
    modelInput.value = config.claudeModel;
    keyHelp.innerHTML = 'Consigue tu clave en la consola de <a href="https://console.anthropic.com/" target="_blank">Anthropic</a>.';
  }
}

function setupSettingsForm() {
  // Manejadores de cambios visuales dinámicos
  document.getElementById("connectionModeSelect").addEventListener("change", () => {
    updateFormVisibility();
    const mode = document.getElementById("connectionModeSelect").value;
    if (mode === "local") {
      const localUrl = document.getElementById("localUrlInput").value.trim();
      fetchOllamaModels(localUrl, config.localModel);
    }
  });

  document.getElementById("apiProviderSelect").addEventListener("change", updateApiFields);

  document.getElementById("gatewayProviderSelect").addEventListener("change", () => {
    const provider = document.getElementById("gatewayProviderSelect").value;
    const urlInput = document.getElementById("gatewayUrlInput");
    if (provider === "hermes") {
      urlInput.value = "http://127.0.0.1:9119";
    }
  });

  // Mostrar/Ocultar contraseñas
  setupPasswordToggle("togglePasswordBtn", "apiKeyInput");
  setupPasswordToggle("toggleGatewayTokenBtn", "gatewayTokenInput");

  // Buscar modelos Ollama
  document.getElementById("refreshLocalModelsBtn").addEventListener("click", () => {
    const url = document.getElementById("localUrlInput").value.trim();
    fetchOllamaModels(url, "");
  });

  // Guardar Configuración
  document.getElementById("saveSettingsBtn").addEventListener("click", async () => {
    await saveFormSettings();
    showToast();
  });

  // Probar Conexión
  document.getElementById("testConnectionBtn").addEventListener("click", runConnectionTest);
}

function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (btn && input) {
    btn.addEventListener("click", () => {
      const isPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", isPassword ? "text" : "password");
    });
  }
}

async function saveFormSettings() {
  const mode = document.getElementById("connectionModeSelect").value;
  config.connectionMode = mode;
  config.language = document.getElementById("languageSelect").value;

  if (mode === "api") {
    const provider = document.getElementById("apiProviderSelect").value;
    config.apiProvider = provider;
    
    const keyValue = document.getElementById("apiKeyInput").value.trim();
    const modelValue = document.getElementById("apiModelInput").value.trim();
    
    if (provider === "gemini") {
      config.geminiKey = keyValue;
      config.geminiModel = modelValue;
    } else if (provider === "openai") {
      config.openaiKey = keyValue;
      config.openaiModel = modelValue;
    } else if (provider === "claude") {
      config.claudeKey = keyValue;
      config.claudeModel = modelValue;
    }
  } else if (mode === "gateway") {
    config.gatewayProvider = document.getElementById("gatewayProviderSelect").value;
    config.gatewayUrl = document.getElementById("gatewayUrlInput").value.trim();
    config.gatewayToken = document.getElementById("gatewayTokenInput").value.trim();
    config.gatewayModel = document.getElementById("gatewayModelInput").value.trim();
  } else if (mode === "local") {
    config.localUrl = document.getElementById("localUrlInput").value.trim();
    
    // Obtener modelo preferido del dropdown o de la entrada manual
    const dropdownModel = document.getElementById("localModelSelect").value;
    const manualModel = document.getElementById("localModelManualInput").value.trim();
    config.localModel = dropdownModel || manualModel || "llama3";
    
    // Sincronizar campo manual por consistencia
    document.getElementById("localModelManualInput").value = config.localModel;
  }

  try {
    await chrome.storage.local.set({ config });
    updateApiBadge();
  } catch (error) {
    console.error("Error al guardar ajustes:", error);
  }
}

function updateApiBadge() {
  const badge = document.getElementById("apiStatusBadge");
  const dot = badge.querySelector(".status-dot");
  const text = document.getElementById("apiStatusText");
  
  if (config.connectionMode === "api") {
    let key = "";
    let providerName = "Gemini";
    if (config.apiProvider === "gemini") { key = config.geminiKey; providerName = "Gemini"; }
    else if (config.apiProvider === "openai") { key = config.openaiKey; providerName = "OpenAI"; }
    else if (config.apiProvider === "claude") { key = config.claudeKey; providerName = "Claude"; }
    
    if (key) {
      dot.className = "status-dot green";
      text.textContent = `${providerName} Activo`;
    } else {
      dot.className = "status-dot red";
      text.textContent = `Sin Key (${providerName})`;
    }
  } else if (config.connectionMode === "gateway") {
    const providerName = config.gatewayProvider === "hermes" ? "Hermes" : "OpenClaw";
    if (config.gatewayUrl) {
      dot.className = "status-dot green";
      text.textContent = `${providerName} Activo`;
    } else {
      dot.className = "status-dot red";
      text.textContent = `Sin URL (${providerName})`;
    }
  } else if (config.connectionMode === "local") {
    dot.className = "status-dot green";
    text.textContent = "Ollama Activo";
  }
}

function showToast() {
  const toast = document.getElementById("settingsToast");
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// --- VISOR DE ERRORES ---
function showErrorLog(errorText) {
  const container = document.getElementById("errorLoggerContainer");
  const pre = document.getElementById("errorLogContent");
  pre.textContent = errorText;
  container.classList.remove("hidden");
}

function hideErrorLog() {
  const container = document.getElementById("errorLoggerContainer");
  container.classList.add("hidden");
}

function setupHistoryControls() {
  document.getElementById("clearHistoryBtn").addEventListener("click", async () => {
    if (confirm("¿Estás seguro de que deseas borrar todo tu historial de estudio?")) {
      try {
        await chrome.storage.local.set({ solveHistory: [] });
        loadHistoryList();
      } catch (error) {
        console.error("Error al borrar historial:", error);
      }
    }
  });

  document.getElementById("clearErrorLogBtn").addEventListener("click", async () => {
    try {
      await chrome.storage.local.remove("lastError");
      hideErrorLog();
    } catch (error) {
      console.error(error);
    }
  });
}

// --- BUSCAR MODELOS OLLAMA ---
async function fetchOllamaModels(url, selectedModel) {
  const select = document.getElementById("localModelSelect");
  select.innerHTML = '<option value="">Cargando modelos...</option>';
  
  try {
    // Si la URL no termina en barra, no hay problema, fetch maneja la ruta absoluta
    const endpoint = `${url.replace(/\/+$/, "")}/api/tags`;
    const response = await fetch(endpoint);
    
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    const data = await response.json();
    select.innerHTML = "";
    
    if (data.models && data.models.length > 0) {
      data.models.forEach(m => {
        const option = document.createElement("option");
        option.value = m.name;
        option.textContent = m.name;
        if (m.name === selectedModel) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    } else {
      select.innerHTML = '<option value="">Ollama responde sin modelos</option>';
    }
  } catch (error) {
    console.warn("No se pudo conectar a Ollama para listar modelos:", error.message);
    select.innerHTML = '<option value="">No se pudo conectar a Ollama</option>';
  }
}

// --- DIAGNÓSTICO: PROBAR CONEXIÓN ---
async function runConnectionTest() {
  const indicator = document.getElementById("testResultIndicator");
  const text = document.getElementById("testResultText");
  
  indicator.className = "test-result-indicator";
  indicator.classList.remove("hidden");
  text.textContent = "Probando conexión...";
  
  // Guardar configuración del formulario actual primero antes del test
  await saveFormSettings();
  
  // Pregunta ficticia para validar
  const testQuestion = {
    text: "Hola, responde brevemente con la palabra 'OK'",
    options: []
  };
  
  try {
    const result = await makeApiCall(testQuestion);
    
    // Si la llamada no lanzó una excepción, validamos que la respuesta esté estructurada
    if (result && result.recommendedAnswer) {
      indicator.classList.add("success");
      text.textContent = "¡Conexión Exitosa!";
      await chrome.storage.local.remove("lastError");
      hideErrorLog();
    } else {
      throw new Error("La respuesta de la IA no está formateada en JSON de acuerdo al esquema esperado.");
    }
  } catch (error) {
    indicator.classList.add("error");
    text.textContent = "Fallo en la conexión";
    
    const errorDetails = `[${new Date().toLocaleTimeString()}] Error de conexión:
Modo: ${config.connectionMode}
Proveedor: ${config.connectionMode === "api" ? config.apiProvider : (config.connectionMode === "gateway" ? config.gatewayProvider : "ollama")}
Detalles: ${error.message}
Stack trace: ${error.stack || "N/A"}`;
    
    await chrome.storage.local.set({ lastError: errorDetails });
    showErrorLog(errorDetails);
  }
}

// --- CHEQUEO DE TEXTO PENDIENTE AL ABRIR ---
async function checkPendingAnalysis() {
  try {
    const session = await chrome.storage.session.get("pendingAnalysis");
    if (session.pendingAnalysis) {
      await chrome.storage.session.remove("pendingAnalysis");
      const { text, type } = session.pendingAnalysis;
      if (type === "free_text") {
        handleIncomingFreeText(text);
      }
    }
  } catch (error) {
    console.error("Error al comprobar análisis pendiente:", error);
  }
}

// --- PROCESAMIENTO E INTEGRACIÓN ---
function handleIncomingQuestion(questionData) {
  activeQuestionData = questionData;
  renderQuestion(questionData);
  runAIAnalysis(questionData);
}

function handleIncomingFreeText(selectedText) {
  const questionData = {
    id: `txt-${Date.now()}`,
    text: selectedText,
    options: [],
    sourceUrl: ""
  };
  activeQuestionData = questionData;
  renderQuestion(questionData);
  runAIAnalysis(questionData);
}

function renderQuestion(questionData) {
  document.getElementById("solveEmptyState").classList.add("hidden");
  document.getElementById("solveLoadingState").classList.add("hidden");
  document.getElementById("solveResultContainer").classList.remove("hidden");
  
  document.getElementById("resultQuestionText").textContent = questionData.text;
  
  const optionsCard = document.getElementById("resultOptionsCard");
  const optionsList = document.getElementById("resultOptionsList");
  optionsList.innerHTML = "";
  
  if (questionData.options && questionData.options.length > 0) {
    optionsCard.classList.remove("hidden");
    questionData.options.forEach((opt) => {
      const optionEl = document.createElement("div");
      optionEl.className = "option-item";
      optionEl.id = `opt-item-${opt.index}`;
      
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const letter = alphabet[opt.index] || opt.index;
      
      optionEl.innerHTML = `
        <div class="option-badge">${letter}</div>
        <div class="option-text">${escapeHtml(opt.text)}</div>
      `;
      
      optionsList.appendChild(optionEl);
    });
  } else {
    optionsCard.classList.add("hidden");
  }
  
  document.getElementById("resultConfidence").textContent = "...";
  document.getElementById("resultRecommendedAnswer").textContent = "Generando respuesta...";
  document.getElementById("resultExplanation").textContent = "Un momento, por favor...";
  document.getElementById("resultConcepts").innerHTML = "";
}

async function runAIAnalysis(questionData) {
  const emptyState = document.getElementById("solveEmptyState");
  const loadingState = document.getElementById("solveLoadingState");
  const resultContainer = document.getElementById("solveResultContainer");
  
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden");
  resultContainer.classList.add("hidden");
  
  // Texto dinámico en la pantalla de carga dependiendo del proveedor
  let providerName = "Gemini";
  if (config.connectionMode === "api") {
    providerName = config.apiProvider === "gemini" ? "Google Gemini" : (config.apiProvider === "openai" ? "OpenAI" : "Claude");
  } else if (config.connectionMode === "gateway") {
    providerName = config.gatewayProvider === "hermes" ? "Gateway Hermes" : "Gateway OpenClaw";
  } else {
    providerName = `Ollama (${config.localModel})`;
  }
  
  document.getElementById("loadingStatusText").textContent = `Conectando con ${providerName}...`;
  
  try {
    const result = await makeApiCall(questionData);
    
    await saveToHistory(questionData, result);
    displayAnalysisResult(questionData, result);
    
  } catch (error) {
    console.error("Error al procesar la llamada de análisis:", error);
    loadingState.classList.add("hidden");
    resultContainer.classList.remove("hidden");
    
    document.getElementById("resultRecommendedAnswer").innerHTML = "<span style='color: var(--color-accent)'>Error al conectar con la IA</span>";
    document.getElementById("resultExplanation").textContent = `Detalles del error: ${error.message}. Por favor, comprueba tus credenciales o el registro del último error en Ajustes.`;
    document.getElementById("resultConfidence").textContent = "0%";
    
    // Guardar error en log
    const errorDetails = `[${new Date().toLocaleTimeString()}] Error al analizar pregunta:
Modo: ${config.connectionMode}
Detalles: ${error.message}
Stack: ${error.stack || "N/A"}`;
    await chrome.storage.local.set({ lastError: errorDetails });
  }
}

// --- CLIENTES DE CONEXIÓN A LLMs ---
async function makeApiCall(questionData) {
  const mode = config.connectionMode;
  
  // Prompt base pidiendo formato estructurado
  let prompt = `Analiza la siguiente pregunta académica y determina la respuesta correcta.
  
Pregunta:
"${questionData.text}"

`;

  if (questionData.options && questionData.options.length > 0) {
    prompt += "Opciones de respuesta disponibles:\n";
    questionData.options.forEach(opt => {
      prompt += `${opt.index}: ${opt.text}\n`;
    });
    prompt += `\nInstrucciones adicionales:
1. Analiza las opciones y selecciona la opción recomendada exacta en 'recommendedAnswer'.
2. Indica el índice numérico (de 0 a ${questionData.options.length - 1}) correspondiente a la opción correcta en 'recommendedOptionIndex'. Si la respuesta correcta no está listada, devuelve -1.
`;
  } else {
    prompt += "\nInstrucciones adicionales:\n1. Resuelve la pregunta directamente en 'recommendedAnswer'.\n2. Pon 'recommendedOptionIndex' como -1.\n";
  }

  prompt += `
3. Explica paso a paso de forma educativa y clara el porqué de la respuesta en 'explanation' (en el idioma: ${config.language}).
4. Devuelve de 2 a 3 conceptos clave vinculados a la pregunta en 'keyConcepts'.
5. Asigna un nivel de confianza (entero entre 0 y 100) en 'confidence'.`;

  if (mode === "api") {
    const provider = config.apiProvider;
    if (provider === "gemini") {
      return callGemini(prompt);
    } else if (provider === "openai") {
      return callOpenAI(prompt, config.openaiKey, config.openaiModel, "https://api.openai.com/v1");
    } else if (provider === "claude") {
      return callClaude(prompt);
    }
  } else if (mode === "gateway") {
    const url = config.gatewayUrl;
    const token = config.gatewayToken;
    const model = config.gatewayModel;
    if (config.gatewayProvider === "hermes") {
      return callHermesLocal(prompt, url);
    } else {
      return callOpenAI(prompt, token, model, url);
    }
  } else if (mode === "local") {
    return callOllama(prompt, config.localUrl, config.localModel);
  }
  
  throw new Error("Modo de conexión no soportado o mal configurado.");
}

// Cliente Hermes Local (Usa la API de companion/chat expuesta en el puerto 9119)
async function callHermesLocal(prompt, url) {
  const cleanUrl = url.replace(/\/+$/, "");
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
  
  const rawText = data.response;
  
  // Limpiar bloques de código Markdown que el agente pueda añadir a su respuesta de texto
  const jsonStartIndex = rawText.indexOf("{");
  const jsonEndIndex = rawText.lastIndexOf("}");
  
  if (jsonStartIndex === -1 || jsonEndIndex === -1) {
    throw new Error("Hermes no devolvió un bloque JSON estructurado.");
  }
  
  const cleanJson = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
  return JSON.parse(cleanJson);
}

// Cliente Google Gemini (Usa Response Schema estructurado de fábrica)
async function callGemini(prompt) {
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
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en API de Gemini: ${response.status} - ${text}`);
  }
  
  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawText);
}

// Cliente OpenAI (Emulado también por Gateways como OpenClaw / Hermes)
async function callOpenAI(prompt, apiKey, model, baseUrl) {
  if (!apiKey && baseUrl.includes("openai.com")) {
    throw new Error("API Key de OpenAI no configurada.");
  }
  
  // Limpiar y estructurar URL
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const endpoint = `${cleanBaseUrl}/chat/completions`;
  
  const headers = {
    "Content-Type": "application/json"
  };
  
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  
  const systemPrompt = `Eres un asistente de estudio para Canvas. Debes responder estrictamente en formato JSON válido con la siguiente estructura y sin ningún texto adicional:
{
  "recommendedAnswer": "La respuesta sugerida escrita de manera concisa.",
  "explanation": "Explicación educativa detallada del razonamiento.",
  "confidence": 95,
  "keyConcepts": ["Concepto 1", "Concepto 2"],
  "recommendedOptionIndex": 0
}`;

  const body = {
    model: model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ]
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en llamada OpenAI/Gateway: HTTP ${response.status} - ${text}`);
  }

  const data = await response.json();
  const rawText = data.choices[0].message.content;
  return JSON.parse(rawText);
}

// Cliente Anthropic Claude
async function callClaude(prompt) {
  if (!config.claudeKey) throw new Error("API Key de Claude no configurada.");
  
  const url = "https://api.anthropic.com/v1/messages";
  const headers = {
    "content-type": "application/json",
    "x-api-key": config.claudeKey,
    "anthropic-version": "2023-06-01",
    "dangerously-allow-browser": "true"
  };
  
  const systemPrompt = `Eres un asistente de estudio para Canvas. Debes responder estrictamente en formato JSON válido con la siguiente estructura y absolutamente ningún otro texto antes ni después del bloque JSON:
{
  "recommendedAnswer": "La respuesta sugerida escrita de manera concisa.",
  "explanation": "Explicación educativa detallada del razonamiento.",
  "confidence": 90,
  "keyConcepts": ["Concepto 1", "Concepto 2"],
  "recommendedOptionIndex": 0
}`;

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      model: config.claudeModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en llamada Claude: HTTP ${response.status} - ${text}`);
  }

  const data = await response.json();
  const rawText = data.content[0].text;
  
  // Limpiar posibles preámbulos que Claude pueda añadir a veces (por seguridad)
  const jsonStartIndex = rawText.indexOf("{");
  const jsonEndIndex = rawText.lastIndexOf("}");
  if (jsonStartIndex === -1 || jsonEndIndex === -1) {
    throw new Error("Claude no devolvió un JSON estructurado.");
  }
  const cleanJson = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
  return JSON.parse(cleanJson);
}

// Cliente Ollama Local
async function callOllama(prompt, localUrl, model) {
  const cleanUrl = localUrl.replace(/\/+$/, "");
  const endpoint = `${cleanUrl}/api/chat`;
  
  const systemPrompt = `Eres un asistente de estudio para Canvas. Debes responder estrictamente en formato JSON válido con la siguiente estructura y sin ningún texto adicional:
{
  "recommendedAnswer": "La respuesta sugerida escrita de manera concisa.",
  "explanation": "Explicación educativa detallada del razonamiento.",
  "confidence": 85,
  "keyConcepts": ["Concepto 1", "Concepto 2"],
  "recommendedOptionIndex": 0
}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      format: "json",
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error en Ollama local: HTTP ${response.status} - ${text}`);
  }

  const data = await response.json();
  const rawText = data.message.content;
  return JSON.parse(rawText);
}

// --- DESPLIEGUE DE RESULTADOS EN UI ---
function displayAnalysisResult(questionData, result) {
  document.getElementById("solveLoadingState").classList.add("hidden");
  document.getElementById("solveResultContainer").classList.remove("hidden");
  
  document.getElementById("resultRecommendedAnswer").textContent = result.recommendedAnswer;
  document.getElementById("resultConfidence").textContent = `${result.confidence}%`;
  document.getElementById("resultExplanation").textContent = result.explanation;
  
  const conceptsUl = document.getElementById("resultConcepts");
  conceptsUl.innerHTML = "";
  if (result.keyConcepts && result.keyConcepts.length > 0) {
    result.keyConcepts.forEach(concept => {
      const li = document.createElement("li");
      li.textContent = concept;
      conceptsUl.appendChild(li);
    });
  }
  
  if (questionData.options && questionData.options.length > 0) {
    const recommendedIdx = result.recommendedOptionIndex;
    
    document.querySelectorAll(".option-item").forEach(item => {
      item.classList.remove("recommended");
      const oldBtn = item.querySelector(".select-action-btn");
      if (oldBtn) oldBtn.remove();
    });
    
    if (recommendedIdx !== undefined && recommendedIdx >= 0 && recommendedIdx < questionData.options.length) {
      const targetOptionEl = document.getElementById(`opt-item-${recommendedIdx}`);
      if (targetOptionEl) {
        targetOptionEl.classList.add("recommended");
        
        const targetOpt = questionData.options[recommendedIdx];
        if (targetOpt && (targetOpt.id || targetOpt.index !== undefined) && questionData.id && !questionData.id.startsWith("txt-")) {
          const selectBtn = document.createElement("button");
          selectBtn.className = "select-action-btn";
          selectBtn.textContent = "Seleccionar en Canvas";
          selectBtn.title = "Hace clic automáticamente en esta opción de la página.";
          
          selectBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (tab) {
                const response = await chrome.tabs.sendMessage(tab.id, {
                  type: "SELECT_OPTION",
                  questionId: questionData.id,
                  optionId: targetOpt.id,
                  optionIndex: targetOpt.index
                });
                
                if (response && response.success) {
                  selectBtn.textContent = "✓ Seleccionado";
                  selectBtn.style.background = "var(--color-success)";
                  selectBtn.style.color = "white";
                } else {
                  console.warn("Fallo al seleccionar en Canvas:", response?.error);
                  selectBtn.textContent = "Error al marcar";
                }
              }
            } catch (err) {
              console.error("Error al enviar mensaje para seleccionar opción:", err);
            }
          });
          
          targetOptionEl.appendChild(selectBtn);
        }
      }
    }
  }
}

// --- HISTORIAL (STORAGE LOCAL) ---
async function saveToHistory(questionData, result) {
  try {
    const historyObj = await chrome.storage.local.get("solveHistory");
    let history = historyObj.solveHistory || [];
    
    const historyItem = {
      id: questionData.id,
      timestamp: Date.now(),
      question: questionData,
      analysis: result
    };
    
    history = history.filter(item => item.question.text !== questionData.text);
    history.unshift(historyItem);
    
    if (history.length > 30) {
      history = history.slice(0, 30);
    }
    
    await chrome.storage.local.set({ solveHistory: history });
  } catch (error) {
    console.error("Error al guardar historial:", error);
  }
}

async function loadHistoryList() {
  const historyList = document.getElementById("historyList");
  const emptyState = document.getElementById("historyEmptyState");
  
  historyList.innerHTML = "";
  
  try {
    const historyObj = await chrome.storage.local.get("solveHistory");
    const history = historyObj.solveHistory || [];
    
    if (history.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }
    
    emptyState.classList.add("hidden");
    
    history.forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = "history-item";
      
      const dateStr = new Date(item.timestamp).toLocaleString("es-ES", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      
      itemEl.innerHTML = `
        <div class="history-item-header">
          <span>${dateStr}</span>
          <span>Confianza: ${item.analysis.confidence}%</span>
        </div>
        <div class="history-item-question">${escapeHtml(item.question.text)}</div>
        <div class="history-item-answer">Respuesta: ${escapeHtml(item.analysis.recommendedAnswer)}</div>
      `;
      
      itemEl.addEventListener("click", () => {
        activeQuestionData = item.question;
        renderQuestion(item.question);
        displayAnalysisResult(item.question, item.analysis);
        switchTab("solve");
      });
      
      historyList.appendChild(itemEl);
    });
  } catch (error) {
    console.error("Error al cargar lista del historial:", error);
  }
}

// --- UTILS ---
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
