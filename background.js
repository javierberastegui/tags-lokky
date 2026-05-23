// Configurar el panel lateral para que se abra al hacer clic en el icono de la extensión
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error al configurar el comportamiento del panel lateral:", error));

// Crear el menú contextual al instalar la extensión
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "solve-selection",
    title: "Analizar con Gemini",
    contexts: ["selection"]
  });
  console.log("Menú contextual 'Analizar con Gemini' registrado con éxito.");
});

// Manejar los clics en el menú contextual
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "solve-selection" && tab) {
    const selectedText = info.selectionText;
    if (!selectedText) return;

    try {
      // Intentar abrir el panel lateral en la ventana actual
      await chrome.sidePanel.open({ windowId: tab.windowId });
      
      // Guardar el texto seleccionado en el almacenamiento de sesión
      // Esto asegura que si el panel lateral se está abriendo por primera vez,
      // pueda leer la pregunta al iniciarse.
      await chrome.storage.session.set({
        pendingAnalysis: {
          text: selectedText,
          timestamp: Date.now(),
          type: "free_text"
        }
      });

      // Intentar enviar un mensaje directo en caso de que el panel ya esté abierto
      try {
        await chrome.runtime.sendMessage({
          type: "ANALYZE_TEXT",
          text: selectedText
        });
      } catch (err) {
        // Ignorar error si el panel lateral aún no se ha cargado por completo.
        // El script del panel lateral comprobará chrome.storage.session al cargarse.
        console.log("El panel lateral aún no está escuchando. Datos guardados en almacenamiento de sesión.");
      }
    } catch (error) {
      console.error("Error al manejar la selección del menú contextual:", error);
    }
  }
});
