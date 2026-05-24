const DEFAULT_SHORTCUTS = {
  listenModeEnabled: false,
  listenModeShortcut: "F8"
};

let shortcutsState = { ...DEFAULT_SHORTCUTS };
let lastConsumedListenResultKey = "";
let lastDiagnosticSnapshot = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupShortcutsPanel();
  setupDiagnosticPanel();
  await loadShortcutsPanelState();
  setupListenResultInboxBridge();
  setTimeout(checkListenResultInbox, 250);
  setTimeout(refreshDiagnosticPanel, 450);
});

function normalizeShortcutKey(value) {
  return String(value || "F8").trim().toUpperCase();
}

function isShortcutInputTarget(target) {
  return target && target.id === "listenShortcutInput";
}

function setupShortcutsPanel() {
  const toggleBtn = document.getElementById("toggleListenModeBtn");
  const saveBtn = document.getElementById("saveShortcutBtn");
  const resetBtn = document.getElementById("resetShortcutBtn");
  const shortcutInput = document.getElementById("listenShortcutInput");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      await toggleListenModeFromPanel();
      await refreshDiagnosticPanel();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const nextShortcut = normalizeShortcutKey(shortcutInput?.value || DEFAULT_SHORTCUTS.listenModeShortcut);
      await saveShortcutsPanelState({
        ...shortcutsState,
        listenModeShortcut: nextShortcut
      });
      showShortcutsToast();
      await refreshDiagnosticPanel();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      await saveShortcutsPanelState({ ...DEFAULT_SHORTCUTS });
      showShortcutsToast("Atajo restablecido a F8.");
      await refreshDiagnosticPanel();
    });
  }

  if (shortcutInput) {
    shortcutInput.addEventListener("keydown", (event) => {
      if (event.key === "Tab") return;
      event.preventDefault();
      shortcutInput.value = normalizeShortcutKey(event.key);
    });

    shortcutInput.addEventListener("blur", () => {
      shortcutInput.value = normalizeShortcutKey(shortcutInput.value);
    });
  }

  document.addEventListener("keydown", async (event) => {
    if (isShortcutInputTarget(event.target)) return;

    const configuredShortcut = normalizeShortcutKey(shortcutsState.listenModeShortcut);
    const pressedKey = normalizeShortcutKey(event.key);

    if (pressedKey === configuredShortcut) {
      event.preventDefault();
      event.stopPropagation();
      await toggleListenModeFromPanel();
      await refreshDiagnosticPanel();
    }
  }, true);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SHORTCUTS_UPDATED" && message.shortcuts) {
      shortcutsState = { ...DEFAULT_SHORTCUTS, ...message.shortcuts };
      renderShortcutsPanelState();
      refreshDiagnosticPanel();
      return;
    }

    if (message.type === "LISTEN_RESULT_READY" && message.payload) {
      consumeListenResult(message.payload);
      refreshDiagnosticPanel();
    }
  });
}

function setupDiagnosticPanel() {
  const refreshBtn = document.getElementById("refreshDiagnosticBtn");
  const copyBtn = document.getElementById("copyDiagnosticBtn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await refreshDiagnosticPanel();
      showDiagnosticToast("Diagnóstico actualizado.");
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      await copyDiagnosticToClipboard();
    });
  }
}

async function loadShortcutsPanelState() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_SHORTCUTS" });
    if (response && response.success && response.shortcuts) {
      shortcutsState = { ...DEFAULT_SHORTCUTS, ...response.shortcuts };
    }
  } catch (error) {
    console.error("Error al cargar atajos:", error);
  }

  renderShortcutsPanelState();
}

async function toggleListenModeFromPanel() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "TOGGLE_LISTEN_MODE" });
    if (response && response.success && response.shortcuts) {
      shortcutsState = { ...DEFAULT_SHORTCUTS, ...response.shortcuts };
      renderShortcutsPanelState();
    }
  } catch (error) {
    console.error("Error al alternar Modo escucha:", error);
  }
}

async function saveShortcutsPanelState(nextState) {
  const normalizedState = {
    listenModeEnabled: Boolean(nextState.listenModeEnabled),
    listenModeShortcut: normalizeShortcutKey(nextState.listenModeShortcut)
  };

  try {
    const response = await chrome.runtime.sendMessage({
      type: "SAVE_SHORTCUTS",
      shortcuts: normalizedState
    });

    if (response && response.success && response.shortcuts) {
      shortcutsState = { ...DEFAULT_SHORTCUTS, ...response.shortcuts };
    } else {
      shortcutsState = normalizedState;
    }
  } catch (error) {
    console.error("Error al guardar atajos:", error);
    shortcutsState = normalizedState;
  }

  renderShortcutsPanelState();
}

function renderShortcutsPanelState() {
  const statePill = document.getElementById("listenModeStatePill");
  const toggleBtn = document.getElementById("toggleListenModeBtn");
  const shortcutInput = document.getElementById("listenShortcutInput");

  if (shortcutInput) {
    shortcutInput.value = shortcutsState.listenModeShortcut || DEFAULT_SHORTCUTS.listenModeShortcut;
  }

  if (statePill) {
    statePill.textContent = shortcutsState.listenModeEnabled ? "Activo" : "Inactivo";
    statePill.classList.toggle("active", shortcutsState.listenModeEnabled);
  }

  if (toggleBtn) {
    toggleBtn.textContent = shortcutsState.listenModeEnabled ? "Desactivar" : "Activar";
    toggleBtn.classList.toggle("btn-primary", shortcutsState.listenModeEnabled);
    toggleBtn.classList.toggle("btn-secondary", !shortcutsState.listenModeEnabled);
  }
}

function showShortcutsToast(message) {
  const toast = document.getElementById("shortcutsToast");
  if (!toast) return;

  toast.textContent = message || "Atajo guardado con éxito.";
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function showDiagnosticToast(message) {
  const toast = document.getElementById("diagnosticToast");
  if (!toast) return;

  toast.textContent = message || "Diagnóstico copiado.";
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function setupListenResultInboxBridge() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.listenResultInbox?.newValue) {
      consumeListenResult(changes.listenResultInbox.newValue);
      refreshDiagnosticPanel();
    }

    if (areaName === "local" && (changes.lastError || changes.solveHistory || changes.shortcuts)) {
      refreshDiagnosticPanel();
    }

    if (areaName === "session" && changes.pendingAnalysis) {
      refreshDiagnosticPanel();
    }
  });

  setInterval(checkListenResultInbox, 1200);
  setInterval(refreshDiagnosticPanel, 2500);
}

async function checkListenResultInbox() {
  try {
    const local = await chrome.storage.local.get("listenResultInbox");
    if (local.listenResultInbox) {
      await consumeListenResult(local.listenResultInbox);
    }
  } catch (error) {
    console.error("Error al leer listenResultInbox:", error);
  }
}

async function consumeListenResult(payload) {
  if (!payload || payload.type !== "listen_quick_result") return;

  const questionData = normalizePendingQuestion(payload.questionData);
  const result = normalizePendingResult(payload.result);
  const key = `${payload.timestamp || ""}-${questionData.id || ""}-${result.answerLetter || result.recommendedAnswer || ""}`;

  if (key && key === lastConsumedListenResultKey) return;
  lastConsumedListenResultKey = key;

  renderListenResultInPanel(questionData, result);

  try {
    await chrome.storage.local.remove("listenResultInbox");
  } catch (error) {
    console.warn("No se pudo limpiar listenResultInbox:", error.message);
  }
}

function normalizePendingQuestion(questionData) {
  const safeQuestion = questionData || {};
  return {
    id: safeQuestion.id || `listen-panel-${Date.now()}`,
    text: stripDetectedOptionsBlock(safeQuestion.text || "Pregunta sin texto."),
    options: Array.isArray(safeQuestion.options) ? safeQuestion.options : [],
    sourceUrl: safeQuestion.sourceUrl || ""
  };
}

function normalizePendingResult(result) {
  const safeResult = result || {};
  const answerLetter = cleanPanelLetter(safeResult.answerLetter || safeResult.recommendedAnswer || safeResult.iconAnswer);
  const optionIndex = answerLetter ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(answerLetter) : -1;

  return {
    answerLetter,
    recommendedAnswer: answerLetter ? `Opción ${answerLetter}` : (safeResult.recommendedAnswer || "Respuesta rápida recibida"),
    explanation: safeResult.explanation || "Resultado recibido desde Modo escucha. Se guarda en la bandeja interna listenResultInbox para que el panel lo consuma al abrirse.",
    confidence: safeResult.confidence ?? "rápida",
    keyConcepts: Array.isArray(safeResult.keyConcepts) ? safeResult.keyConcepts : [],
    recommendedOptionIndex: Number.isInteger(safeResult.recommendedOptionIndex) ? safeResult.recommendedOptionIndex : optionIndex
  };
}

function cleanPanelLetter(value) {
  const match = String(value || "").trim().match(/^[A-D]$/i);
  return match ? match[0].toUpperCase() : "";
}

function stripDetectedOptionsBlock(text) {
  return String(text || "").split("\n\nOpciones detectadas:")[0].trim();
}

function renderListenResultInPanel(questionData, result) {
  switchSolveTabForListenResult();
  renderListenQuestion(questionData);
  renderListenAnswer(questionData, result);
}

function switchSolveTabForListenResult() {
  document.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.add("hidden"));

  const solveTab = document.querySelector('.nav-tab[data-tab="solve"]');
  const solvePanel = document.getElementById("panelSolve");

  if (solveTab) solveTab.classList.add("active");
  if (solvePanel) solvePanel.classList.remove("hidden");
}

function renderListenQuestion(questionData) {
  document.getElementById("solveEmptyState")?.classList.add("hidden");
  document.getElementById("solveLoadingState")?.classList.add("hidden");
  document.getElementById("solveResultContainer")?.classList.remove("hidden");

  const questionEl = document.getElementById("resultQuestionText");
  if (questionEl) questionEl.textContent = questionData.text;

  const optionsCard = document.getElementById("resultOptionsCard");
  const optionsList = document.getElementById("resultOptionsList");
  if (!optionsCard || !optionsList) return;

  optionsList.innerHTML = "";

  if (!questionData.options.length) {
    optionsCard.classList.add("hidden");
    return;
  }

  optionsCard.classList.remove("hidden");
  questionData.options.forEach((option, index) => {
    const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index] || String(index + 1);
    const optionEl = document.createElement("div");
    optionEl.className = "option-item";
    optionEl.id = `listen-opt-item-${index}`;
    optionEl.innerHTML = `
      <div class="option-badge">${letter}</div>
      <div class="option-text">${escapePanelHtml(option.text || "")}</div>
    `;
    optionsList.appendChild(optionEl);
  });
}

function renderListenAnswer(questionData, result) {
  const recommendedAnswerEl = document.getElementById("resultRecommendedAnswer");
  const confidenceEl = document.getElementById("resultConfidence");
  const explanationEl = document.getElementById("resultExplanation");
  const conceptsEl = document.getElementById("resultConcepts");

  if (recommendedAnswerEl) recommendedAnswerEl.textContent = result.recommendedAnswer;
  if (confidenceEl) confidenceEl.textContent = result.confidence === "rápida" ? "rápida" : `${result.confidence}%`;
  if (explanationEl) explanationEl.textContent = result.explanation;
  if (conceptsEl) conceptsEl.innerHTML = "";

  document.querySelectorAll(".option-item").forEach((item) => {
    item.classList.remove("recommended");
    const oldBtn = item.querySelector(".select-action-btn");
    if (oldBtn) oldBtn.remove();
  });

  const targetIndex = result.recommendedOptionIndex;
  if (targetIndex >= 0) {
    const targetOption = document.getElementById(`listen-opt-item-${targetIndex}`) || document.getElementById(`opt-item-${targetIndex}`);
    if (targetOption) targetOption.classList.add("recommended");
  }
}

async function refreshDiagnosticPanel() {
  const outputEl = document.getElementById("listenDiagnosticOutput");
  const statusPill = document.getElementById("diagnosticStatusPill");
  if (!outputEl) return;

  try {
    lastDiagnosticSnapshot = await buildDiagnosticSnapshot();
    outputEl.textContent = JSON.stringify(lastDiagnosticSnapshot, null, 2);

    if (statusPill) {
      const hasError = Boolean(lastDiagnosticSnapshot.lastError);
      const hasInbox = Boolean(lastDiagnosticSnapshot.listenResultInbox);
      const hasHistory = Boolean(lastDiagnosticSnapshot.lastHistoryItem);
      statusPill.textContent = hasError ? "Error" : hasInbox || hasHistory ? "Con datos" : "Sin datos";
      statusPill.classList.toggle("active", hasInbox || hasHistory);
      statusPill.classList.toggle("error", hasError);
    }
  } catch (error) {
    outputEl.textContent = JSON.stringify({ diagnosticError: error.message }, null, 2);
    if (statusPill) {
      statusPill.textContent = "Error";
      statusPill.classList.add("error");
    }
  }
}

async function buildDiagnosticSnapshot() {
  const [localData, sessionData] = await Promise.all([
    chrome.storage.local.get(["shortcuts", "listenResultInbox", "lastError", "solveHistory", "config"]),
    chrome.storage.session.get(["pendingAnalysis"])
  ]);

  const config = sanitizeConfig(localData.config || {});
  const lastHistoryItem = Array.isArray(localData.solveHistory) && localData.solveHistory.length
    ? summarizeHistoryItem(localData.solveHistory[0])
    : null;

  return {
    generatedAt: new Date().toISOString(),
    shortcuts: { ...DEFAULT_SHORTCUTS, ...(localData.shortcuts || shortcutsState || {}) },
    config,
    lastError: localData.lastError || null,
    listenResultInbox: summarizeListenPayload(localData.listenResultInbox || null),
    pendingAnalysis: summarizeListenPayload(sessionData.pendingAnalysis || null),
    lastHistoryItem,
    panelState: {
      lastConsumedListenResultKey,
      activeTab: document.querySelector(".nav-tab.active")?.dataset?.tab || null,
      solveResultVisible: !document.getElementById("solveResultContainer")?.classList.contains("hidden")
    }
  };
}

function sanitizeConfig(config) {
  const safe = { ...config };
  const secretKeys = ["geminiKey", "openaiKey", "claudeKey", "gatewayToken"];

  secretKeys.forEach((key) => {
    if (safe[key]) {
      safe[key] = `[REDACTED:${String(safe[key]).length} chars]`;
    } else {
      safe[key] = "";
    }
  });

  return safe;
}

function summarizeListenPayload(payload) {
  if (!payload) return null;

  const questionData = payload.questionData || {};
  const result = payload.result || payload.analysis || {};

  return {
    type: payload.type || null,
    source: payload.source || null,
    timestamp: payload.timestamp || null,
    event: payload.event || null,
    question: {
      id: questionData.id || null,
      text: truncateDiagnosticText(stripDetectedOptionsBlock(questionData.text || payload.text || ""), 600),
      optionsCount: Array.isArray(questionData.options) ? questionData.options.length : 0,
      options: Array.isArray(questionData.options)
        ? questionData.options.slice(0, 6).map((option, index) => ({
            letter: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index] || String(index + 1),
            text: truncateDiagnosticText(option.text || "", 220)
          }))
        : []
    },
    result: {
      answerLetter: result.answerLetter || null,
      recommendedAnswer: result.recommendedAnswer || null,
      recommendedOptionIndex: Number.isInteger(result.recommendedOptionIndex) ? result.recommendedOptionIndex : null,
      confidence: result.confidence ?? null,
      explanation: truncateDiagnosticText(result.explanation || "", 350)
    }
  };
}

function summarizeHistoryItem(item) {
  if (!item) return null;
  return summarizeListenPayload({
    type: "history_item",
    timestamp: item.timestamp,
    questionData: item.question,
    result: item.analysis,
    source: "solveHistory[0]"
  });
}

function truncateDiagnosticText(value, maxLength) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

async function copyDiagnosticToClipboard() {
  if (!lastDiagnosticSnapshot) {
    await refreshDiagnosticPanel();
  }

  const text = JSON.stringify(lastDiagnosticSnapshot || {}, null, 2);

  try {
    await navigator.clipboard.writeText(text);
    showDiagnosticToast("Diagnóstico copiado.");
  } catch (error) {
    const outputEl = document.getElementById("listenDiagnosticOutput");
    if (outputEl) outputEl.textContent = text;
    showDiagnosticToast("No se pudo copiar; selecciona el texto manualmente.");
  }
}

function escapePanelHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
