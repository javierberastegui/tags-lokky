const DEFAULT_SHORTCUTS = {
  listenModeEnabled: false,
  listenModeShortcut: "F8"
};

let shortcutsState = { ...DEFAULT_SHORTCUTS };

document.addEventListener("DOMContentLoaded", async () => {
  setupShortcutsPanel();
  await loadShortcutsPanelState();
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
