const DEFAULT_SHORTCUTS = {
  listenModeEnabled: false,
  listenModeShortcut: "F8"
};

let shortcutsState = { ...DEFAULT_SHORTCUTS };
let lastConsumedListenResultKey = "";

document.addEventListener("DOMContentLoaded", async () => {
  setupShortcutsPanel();
  await loadShortcutsPanelState();
  setupPendingListenResultBridge();
  setTimeout(checkPendingListenResult, 350);
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
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      await saveShortcutsPanelState({ ...DEFAULT_SHORTCUTS });
      showShortcutsToast("Atajo restablecido a F8.");
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
    }
  }, true);

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SHORTCUTS_UPDATED" && message.shortcuts) {
      shortcutsState = { ...DEFAULT_SHORTCUTS, ...message.shortcuts };
      renderShortcutsPanelState();
    }
  });
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

  if (message) {
    toast.textContent = message;
  } else {
    toast.textContent = "Atajo guardado con éxito.";
  }

  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function setupPendingListenResultBridge() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "session" && changes.pendingAnalysis?.newValue) {
      consumePendingListenResult(changes.pendingAnalysis.newValue);
    }
  });

  setInterval(checkPendingListenResult, 1200);
}

async function checkPendingListenResult() {
  try {
    const session = await chrome.storage.session.get("pendingAnalysis");
    if (session.pendingAnalysis) {
      await consumePendingListenResult(session.pendingAnalysis);
    }
  } catch (error) {
    console.error("Error al leer resultado pendiente de Modo escucha:", error);
  }
}

async function consumePendingListenResult(pendingAnalysis) {
  if (!pendingAnalysis) return;

  const validTypes = new Set(["listen_quick_result", "analysis_result"]);
  if (!validTypes.has(pendingAnalysis.type)) return;

  const questionData = normalizePendingQuestion(pendingAnalysis.questionData);
  const result = normalizePendingResult(pendingAnalysis.result);
  const key = `${pendingAnalysis.timestamp || ""}-${questionData.id || ""}-${result.answerLetter || result.recommendedAnswer || ""}`;

  if (key && key === lastConsumedListenResultKey) return;
  lastConsumedListenResultKey = key;

  renderListenResultInPanel(questionData, result);

  try {
    await chrome.storage.session.remove("pendingAnalysis");
  } catch (error) {
    console.warn("No se pudo limpiar pendingAnalysis:", error.message);
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
    explanation: safeResult.explanation || "Resultado recibido desde Modo escucha. Para una explicación más completa, vuelve a analizar la pregunta desde el panel.",
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
    if (targetOption) {
      targetOption.classList.add("recommended");
    }
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
