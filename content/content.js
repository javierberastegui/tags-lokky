// Script de Contenido para Canvas
(function() {
  console.log("Canvas Study Partner: Script de contenido cargado.");

  const DEFAULT_SHORTCUTS = {
    listenModeEnabled: false,
    listenModeShortcut: "F8"
  };

  let shortcuts = { ...DEFAULT_SHORTCUTS };
  let lastListenSelection = "";
  let listenSelectionTimer = null;

  async function loadShortcutsConfig() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_SHORTCUTS" });
      if (response && response.success && response.shortcuts) {
        shortcuts = { ...DEFAULT_SHORTCUTS, ...response.shortcuts };
      }
    } catch (error) {
      console.warn("No se pudo cargar la configuración de atajos:", error.message);
    }
  }

  function normalizeShortcutKey(value) {
    return String(value || "F8").trim().toUpperCase();
  }

  function isEditableTarget(target) {
    if (!target) return false;
    const tagName = (target.tagName || "").toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
  }

  function getSelectionText() {
    const selection = window.getSelection();
    if (!selection) return "";
    return selection.toString().trim();
  }

  async function toggleListenModeFromPage() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "TOGGLE_LISTEN_MODE" });
      if (response && response.success && response.shortcuts) {
        shortcuts = { ...DEFAULT_SHORTCUTS, ...response.shortcuts };
        showListenModeFeedback(shortcuts.listenModeEnabled);
      }
    } catch (error) {
      console.warn("No se pudo alternar el modo escucha:", error.message);
    }
  }

  function showListenModeFeedback(isEnabled) {
    const old = document.getElementById("lokky-listen-mode-feedback");
    if (old) old.remove();

    const badge = document.createElement("div");
    badge.id = "lokky-listen-mode-feedback";
    badge.textContent = isEnabled ? "Modo escucha activado" : "Modo escucha desactivado";
    badge.style.position = "fixed";
    badge.style.right = "18px";
    badge.style.bottom = "18px";
    badge.style.zIndex = "2147483647";
    badge.style.padding = "10px 14px";
    badge.style.borderRadius = "10px";
    badge.style.background = isEnabled ? "rgba(16, 185, 129, 0.95)" : "rgba(244, 63, 94, 0.95)";
    badge.style.color = "#ffffff";
    badge.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    badge.style.fontSize = "13px";
    badge.style.fontWeight = "700";
    badge.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
    badge.style.pointerEvents = "none";
    document.documentElement.appendChild(badge);

    setTimeout(() => badge.remove(), 1400);
  }

  function scheduleListenSelectionSend() {
    if (!shortcuts.listenModeEnabled) return;

    if (listenSelectionTimer) {
      clearTimeout(listenSelectionTimer);
    }

    listenSelectionTimer = setTimeout(async () => {
      const selectedText = getSelectionText();
      if (!selectedText || selectedText.length < 2) return;
      if (selectedText === lastListenSelection) return;

      lastListenSelection = selectedText;

      try {
        await chrome.runtime.sendMessage({
          type: "LISTEN_SELECTION",
          text: selectedText
        });
      } catch (error) {
        console.warn("No se pudo enviar la selección en modo escucha:", error.message);
      }
    }, 220);
  }

  function setupListenModeListeners() {
    document.addEventListener("mouseup", scheduleListenSelectionSend, true);
    document.addEventListener("keyup", scheduleListenSelectionSend, true);

    document.addEventListener("keydown", (event) => {
      const configuredShortcut = normalizeShortcutKey(shortcuts.listenModeShortcut);
      const pressedKey = normalizeShortcutKey(event.key);

      if (isEditableTarget(event.target) && pressedKey !== "F8") {
        return;
      }

      if (pressedKey === configuredShortcut) {
        event.preventDefault();
        event.stopPropagation();
        toggleListenModeFromPage();
      }
    }, true);
  }

  // Función principal para escanear e inyectar botones en las preguntas
  function scanAndInject() {
    // Canvas Classic Quizzes utiliza .question.display_question
    const questions = document.querySelectorAll('.question.display_question');
    
    questions.forEach((qEl) => {
      // Evitar duplicaciones
      if (qEl.classList.contains('gemini-injected')) return;
      qEl.classList.add('gemini-injected');

      const header = qEl.querySelector('.header');
      if (!header) return;

      const questionId = qEl.getAttribute('id') || `q-${Math.random().toString(36).substring(2, 11)}`;
      
      // Extraer texto de la pregunta (suele ser el div .question_text)
      const questionTextEl = qEl.querySelector('.question_text');
      const questionText = questionTextEl ? questionTextEl.innerText.trim() : "No se pudo extraer el texto de la pregunta.";

      // Extraer opciones si es de opción múltiple
      const answerEls = qEl.querySelectorAll('.answers .answer');
      const options = [];
      
      answerEls.forEach((ansEl, idx) => {
        const textEl = ansEl.querySelector('.answer_text') || ansEl.querySelector('.answer_label') || ansEl.querySelector('label');
        const text = textEl ? textEl.innerText.trim() : ansEl.innerText.trim();
        
        const input = ansEl.querySelector('input[type="radio"], input[type="checkbox"]');
        const inputId = input ? input.id : null;
        
        if (text) {
          options.push({
            id: inputId,
            index: idx,
            text: text
          });
        }
      });

      // Crear el botón elegante de Gemini
      const btn = document.createElement('button');
      btn.className = 'gemini-solve-btn';
      btn.innerHTML = `
        <svg class="gemini-sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 00-7 7c0 1.5.5 3 1.5 4.5L12 21l5.5-4.5c1-1.5 1.5-3 1.5-4.5a7 7 0 00-7-7z"/>
        </svg>
        <span>Estudiar con Gemini</span>
      `;

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        btn.classList.add('loading');
        btn.disabled = true;

        try {
          // Enviar los datos de la pregunta al panel lateral
          await chrome.runtime.sendMessage({
            type: "ANALYZE_QUESTION",
            data: {
              id: questionId,
              text: questionText,
              options: options,
              sourceUrl: window.location.href
            }
          });

          // Animación de éxito
          btn.innerHTML = `
            <svg class="gemini-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Enviado al Panel</span>
          `;
          btn.classList.add('success');

          setTimeout(() => {
            btn.innerHTML = `
              <svg class="gemini-sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 00-7 7c0 1.5.5 3 1.5 4.5L12 21l5.5-4.5c1-1.5 1.5-3 1.5-4.5a7 7 0 00-7-7z"/>
              </svg>
              <span>Estudiar con Gemini</span>
            `;
            btn.classList.remove('success');
            btn.disabled = false;
          }, 3000);

        } catch (error) {
          console.error("Error al enviar pregunta a la extensión:", error);
          btn.innerHTML = `<span>❌ Reabre el panel</span>`;
          btn.classList.add('error');
          setTimeout(() => {
            btn.innerHTML = `
              <svg class="gemini-sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 5a7 7 0 00-7 7c0 1.5.5 3 1.5 4.5L12 21l5.5-4.5c1-1.5 1.5-3 1.5-4.5a7 7 0 00-7-7z"/>
              </svg>
              <span>Estudiar con Gemini</span>
            `;
            btn.classList.remove('error');
            btn.disabled = false;
          }, 4000);
        } finally {
          btn.classList.remove('loading');
        }
      });

      // Añadir el botón al header del contenedor de la pregunta
      header.appendChild(btn);
    });
  }

  // Escuchar mensajes desde el panel lateral/background.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHORTCUTS_UPDATED") {
      shortcuts = { ...DEFAULT_SHORTCUTS, ...(message.shortcuts || {}) };
      sendResponse({ success: true });
      return true;
    }

    if (message.type === "SELECT_OPTION") {
      const { questionId, optionId, optionIndex } = message;
      
      const questionEl = document.getElementById(questionId);
      if (!questionEl) {
        sendResponse({ success: false, error: "Contenedor de pregunta no encontrado en el DOM" });
        return true;
      }

      let inputEl = null;
      if (optionId) {
        inputEl = questionEl.querySelector(`#${optionId}`);
      }
      
      if (!inputEl && optionIndex !== undefined) {
        const answerEls = questionEl.querySelectorAll('.answers .answer');
        const targetAns = answerEls[optionIndex];
        if (targetAns) {
          inputEl = targetAns.querySelector('input[type="radio"], input[type="checkbox"]');
        }
      }

      if (inputEl) {
        // Ejecutar clic nativo
        inputEl.click();
        
        // Dar feedback visual de selección resaltando temporalmente la opción
        const answerContainer = inputEl.closest('.answer') || inputEl.parentElement;
        if (answerContainer) {
          const originalStyle = answerContainer.style.transition;
          answerContainer.style.transition = 'background-color 0.3s ease';
          answerContainer.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; // Verde semitransparente
          
          setTimeout(() => {
            answerContainer.style.backgroundColor = '';
            setTimeout(() => {
              answerContainer.style.transition = originalStyle;
            }, 300);
          }, 1500);
        }
        
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "Input de la opción no encontrado" });
      }
    }
    return true; // Mantener canal abierto para respuestas asíncronas
  });

  // Ejecución inicial y escaneo periódico para manejar reactividad y páginas dinámicas
  loadShortcutsConfig().finally(() => {
    setupListenModeListeners();
    scanAndInject();
    setInterval(scanAndInject, 1500);
  });

})();
