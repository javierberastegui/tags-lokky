// Script de Contenido para Canvas
(function() {
  console.log("Canvas Study Partner: Script de contenido cargado.");

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

  // Escuchar mensajes desde el panel lateral (p. ej. para auto-seleccionar una opción)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SELECT_OPTION") {
      const { questionId, optionId, optionIndex } = message;
      
      const questionEl = document.getElementById(questionId);
      if (!questionEl) {
        sendResponse({ success: false, error: "Contenedor de pregunta no encontrado en el DOM" });
        return;
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
  scanAndInject();
  setInterval(scanAndInject, 1500);

})();
