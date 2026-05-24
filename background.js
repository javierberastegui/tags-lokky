// Configurar el panel lateral para que se abra al hacer clic en el icono de la extensión
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error al configurar el comportamiento del panel lateral:", error));

const DEFAULT_SHORTCUTS = {
  listenModeEnabled: false,
  listenModeShortcut: "F8"
};

async function getShortcutsConfig() {
  const saved = await chrome.storage.local.get("shortcuts");
  return { ...DEFAULT_SHORTCUTS, ...(saved.shortcuts || {}) };
}

async function saveShortcutsConfig(nextConfig) {
  const current = await getShortcutsConfig();
  const shortcuts = { ...current, ...nextConfig };
  await chrome.storage.local.set({ shortcuts });
  return shortcuts;
}

async function setPendingAnalysisFromSelection(selectedText, tab, source) {
  const cleanText = (selectedText || "").trim();
  if (!cleanText || !tab) return;

  await chrome.storage.session.set({
    pendingAnalysis: {
      text: cleanText,
      timestamp: Date.now(),
      type: "free_text",
      source: source || "selection"
    }
  });

  if (tab.windowId !== undefined) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }

  try {
    await chrome.runtime.sendMessage({
      type: "ANALYZE_TEXT",
      text: cleanText,
      source: source || "selection"
    });
  } catch (err) {
    console.log("El panel lateral aún no está escuchando. Datos guardados en almacenamiento de sesión.");
  }
}

async function notifyActiveTabShortcutsChanged(shortcuts) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: "SHORTCUTS_UPDATED",
        shortcuts
      });
    }
  } catch (error) {
    // Algunas páginas no aceptan content scripts; no es un error bloqueante.
  }
}

// Crear el menú contextual al instalar la extensión
chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "solve-selection",
    title: "Analizar con Gemini",
    contexts: ["selection"]
  });

  const shortcuts = await getShortcutsConfig();
  await saveShortcutsConfig(shortcuts);

  console.log("Menú contextual 'Analizar con Gemini' registrado con éxito.");
});

// Mantener valores por defecto también al arrancar el service worker.
getShortcutsConfig()
  .then((shortcuts) => saveShortcutsConfig(shortcuts))
  .catch((error) => console.error("Error al inicializar atajos:", error));

// Manejar los clics en el menú contextual
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "solve-selection" && tab) {
    try {
      await setPendingAnalysisFromSelection(info.selectionText, tab, "context_menu");
    } catch (error) {
      console.error("Error al manejar la selección del menú contextual:", error);
    }
  }
});

// Mensajería central desde content script y sidepanel.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "LISTEN_SELECTION") {
      const tab = sender.tab || (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
      await setPendingAnalysisFromSelection(message.text, tab, "listen_mode");
      sendResponse({ success: true });
      return;
    }

    if (message.type === "GET_SHORTCUTS") {
      const shortcuts = await getShortcutsConfig();
      sendResponse({ success: true, shortcuts });
      return;
    }

    if (message.type === "SAVE_SHORTCUTS") {
      const shortcuts = await saveShortcutsConfig(message.shortcuts || {});
      await notifyActiveTabShortcutsChanged(shortcuts);
      sendResponse({ success: true, shortcuts });
      return;
    }

    if (message.type === "TOGGLE_LISTEN_MODE") {
      const current = await getShortcutsConfig();
      const shortcuts = await saveShortcutsConfig({
        listenModeEnabled: !current.listenModeEnabled
      });
      await notifyActiveTabShortcutsChanged(shortcuts);
      sendResponse({ success: true, shortcuts });
      return;
    }

    sendResponse({ success: false, error: "Mensaje no soportado por background." });
  })().catch((error) => {
    console.error("Error en background.onMessage:", error);
    sendResponse({ success: false, error: error.message });
  });

  return true;
});
