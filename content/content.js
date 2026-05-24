// Script de Contenido para Canvas
(function() {
  if (window.__canvasStudyPartnerLoaded) return;
  window.__canvasStudyPartnerLoaded = true;

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

  function getSelection() {
    return window.getSelection ? window.getSelection() : null;
  }

  function getSelectionText() {
    const selection = getSelection();
    if (!selection) return "";
    return selection.toString().trim();
  }

  function getSelectionViewportRect() {
    const selection = getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
    return rects[0] || range.getBoundingClientRect();
  }

  function isVisibleElement(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function cleanOptionText(text) {
    return String(text || "")
      .replace(/^[A-D][).:\-\s]+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getInputOptionText(input) {
    if (!input) return "";

    if (input.id) {
      const labelFor = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
      const labelText = cleanOptionText(labelFor?.innerText || labelFor?.textContent || "");
      if (labelText) return labelText;
    }

    const closestLabel = input.closest("label");
    const closestLabelText = cleanOptionText(closestLabel?.innerText || closestLabel?.textContent || "");
    if (closestLabelText) return closestLabelText;

    const optionContainer = input.closest('.answer, [class*="answer"], [class*="option"], li, div');
    const optionText = cleanOptionText(optionContainer?.innerText || optionContainer?.textContent || "");
    if (optionText) return optionText;

    return "";
  }

  function findQuestionContainerFromSelection(selectionRect) {
    const selection = getSelection();
    let node = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).commonAncestorContainer : null;
    let element = node && node.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;

    const centerX = selectionRect ? selectionRect.left + selectionRect.width / 2 : window.innerWidth / 2;
    const centerY = selectionRect ? selectionRect.top + selectionRect.height / 2 : window.innerHeight / 2;
    const pointElement = document.elementFromPoint(centerX, centerY);
    if (!element && pointElement) element = pointElement;

    const hardSelectors = [
      '.question.display_question',
      '[data-testid*="question"]',
      '[class*="question"]',
      '[class*="Question"]',
      '[class*="exercise"]',
      '[class*="quiz"]',
      '[class*="card"]',
      'fieldset',
      'form',
      'article',
      'section'
    ];

    for (const selector of hardSelectors) {
      const container = element?.closest?.(selector);
      if (container && countVisibleChoiceInputs(container) >= 2) return container;
    }

    let current = element;
    while (current && current !== document.body && current !== document.documentElement) {
      if (countVisibleChoiceInputs(current) >= 2) return current;
      current = current.parentElement;
    }

    return element?.parentElement || document.body;
  }

  function countVisibleChoiceInputs(container) {
    return Array.from(container?.querySelectorAll?.('input[type="radio"], input[type="checkbox"]') || [])
      .filter(isVisibleElement)
      .length;
  }

  function extractOptionsFromChoiceInputs(container) {
    const inputs = Array.from(container?.querySelectorAll?.('input[type="radio"], input[type="checkbox"]') || [])
      .filter(isVisibleElement);

    const options = [];
    const seen = new Set();

    inputs.forEach((input) => {
      const text = getInputOptionText(input);
      if (!text || text.length > 500 || seen.has(text)) return;
      seen.add(text);
      options.push({
        id: input.id || null,
        index: options.length,
        text
      });
    });

    return options.slice(0, 10);
  }

  function extractOptionsFromVisibleRows(container, selectionRect) {
    const selectors = [
      '.answers .answer',
      '[class*="answer"]',
      '[class*="option"]',
      '[role="radio"]',
      '[role="checkbox"]'
    ];
    const candidates = selectors.flatMap((selector) => Array.from(container?.querySelectorAll?.(selector) || []));
    const options = [];
    const seen = new Set();

    candidates.forEach((candidate) => {
      if (!isVisibleElement(candidate)) return;
      const text = cleanOptionText(candidate.innerText || candidate.textContent || "");
      if (!text || text.length > 500 || seen.has(text)) return;
      seen.add(text);
      options.push({ id: null, index: options.length, text });
    });

    if (options.length >= 2) return options.slice(0, 10);

    const centerY = selectionRect ? selectionRect.bottom : 0;
    const textBlocks = Array.from(document.querySelectorAll("label, li, div, button"))
      .filter(isVisibleElement)
      .map((el) => ({ el, rect: el.getBoundingClientRect(), text: cleanOptionText(el.innerText || el.textContent || "") }))
      .filter((item) => item.text && item.text.length <= 250 && item.rect.top >= centerY - 20 && item.rect.top <= centerY + 520)
      .sort((a, b) => a.rect.top - b.rect.top);

    for (const item of textBlocks) {
      if (options.length >= 4) break;
      if (seen.has(item.text)) continue;
      seen.add(item.text);
      options.push({ id: null, index: options.length, text: item.text });
    }

    return options.slice(0, 10);
  }

  function extractOptionsNearSelection(selectionRect) {
    const container = findQuestionContainerFromSelection(selectionRect);
    const byInputs = extractOptionsFromChoiceInputs(container);
    if (byInputs.length >= 2) return byInputs;

    const byRows = extractOptionsFromVisibleRows(container, selectionRect);
    if (byRows.length >= 2) return byRows;

    return [];
  }

  async function toggleListenModeFromPage() {
    try {
      const response = await chrome.runtime.sendMessage({ type: "TOGGLE_LISTEN_MODE" });
      if (response && response.success && response.shortcuts) {
        shortcuts = { ...DEFAULT_SHORTCUTS, ...response.shortcuts };
      }
    } catch (error) {
      console.warn("No se pudo alternar el modo escucha:", error.message);
    }
  }

  function buildListenPayload(selectedText, selectionRect) {
    const options = extractOptionsNearSelection(selectionRect);
    const optionText = options.length
      ? `\n\nOpciones detectadas:\n${options.map((option) => `${String.fromCharCode(65 + option.index)}. ${option.text}`).join("\n")}`
      : "";

    return {
      id: `listen-${Date.now()}`,
      text: `${selectedText}${optionText}`,
      options,
      sourceUrl: window.location.href
    };
  }

  function scheduleListenSelectionSend() {
    if (!shortcuts.listenModeEnabled) return;

    if (listenSelectionTimer) {
      clearTimeout(listenSelectionTimer);
    }

    listenSelectionTimer = setTimeout(async () => {
      const selectedText = getSelectionText();
      const selectionRect = getSelectionViewportRect();
      if (!selectedText || selectedText.length < 2) return;
      if (selectedText === lastListenSelection) return;

      lastListenSelection = selectedText;

      try {
        const response = await chrome.runtime.sendMessage({
          type: "LISTEN_SELECTION",
          data: buildListenPayload(selectedText, selectionRect)
        });

        if (!response || !response.success) {
          throw new Error(response?.error || "No se pudo analizar la selección.");
        }
      } catch (error) {
        console.warn("No se pudo procesar la selección en modo escucha:", error.message);
      }
    }, 260);
  }

  function setupListenModeListeners() {
    document.addEventListener("mouseup", scheduleListenSelectionSend, true);
    document.addEventListener("keyup", scheduleListenSelectionSend, true);
    document.addEventListener("selectionchange", scheduleListenSelectionSend, true);

    document.addEventListener("keydown", (event) => {
      const configuredShortcut = normalizeShortcutKey(shortcuts.listenModeShortcut);
      const pressedKey = normalizeShortcutKey(event.key);

      if (isEditableTarget(event.target) && pressedKey !== "F8") return;

      if (pressedKey === configuredShortcut) {
        event.preventDefault();
        event.stopPropagation();
        toggleListenModeFromPage();
      }
    }, true);
  }

  function scanAndInject() {
    const questions = document.querySelectorAll('.question.display_question');
    
    questions.forEach((qEl) => {
      if (qEl.classList.contains('gemini-injected')) return;
      qEl.classList.add('gemini-injected');

      const header = qEl.querySelector('.header');
      if (!header) return;

      const questionId = qEl.getAttribute('id') || `q-${Math.random().toString(36).substring(2, 11)}`;
      const questionTextEl = qEl.querySelector('.question_text');
      const questionText = questionTextEl ? questionTextEl.innerText.trim() : "No se pudo extraer el texto de la pregunta.";
      const answerEls = qEl.querySelectorAll('.answers .answer');
      const options = [];
      
      answerEls.forEach((ansEl, idx) => {
        const textEl = ansEl.querySelector('.answer_text') || ansEl.querySelector('.answer_label') || ansEl.querySelector('label');
        const text = textEl ? textEl.innerText.trim() : ansEl.innerText.trim();
        const input = ansEl.querySelector('input[type="radio"], input[type="checkbox"]');
        const inputId = input ? input.id : null;
        if (text) options.push({ id: inputId, index: idx, text });
      });

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
          await chrome.runtime.sendMessage({
            type: "ANALYZE_QUESTION",
            data: { id: questionId, text: questionText, options, sourceUrl: window.location.href }
          });

          btn.innerHTML = `<span>Enviado al Panel</span>`;
          btn.classList.add('success');
          setTimeout(() => {
            btn.innerHTML = `<span>Estudiar con Gemini</span>`;
            btn.classList.remove('success');
            btn.disabled = false;
          }, 3000);
        } catch (error) {
          console.error("Error al enviar pregunta a la extensión:", error);
          btn.innerHTML = `<span>❌ Reabre el panel</span>`;
          btn.classList.add('error');
          setTimeout(() => {
            btn.innerHTML = `<span>Estudiar con Gemini</span>`;
            btn.classList.remove('error');
            btn.disabled = false;
          }, 4000);
        } finally {
          btn.classList.remove('loading');
        }
      });

      header.appendChild(btn);
    });
  }

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
      if (optionId) inputEl = questionEl.querySelector(`#${optionId}`);
      if (!inputEl && optionIndex !== undefined) {
        const answerEls = questionEl.querySelectorAll('.answers .answer');
        const targetAns = answerEls[optionIndex];
        if (targetAns) inputEl = targetAns.querySelector('input[type="radio"], input[type="checkbox"]');
      }

      if (inputEl) {
        inputEl.click();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "Input de la opción no encontrado" });
      }
    }
    return true;
  });

  loadShortcutsConfig().finally(() => {
    setupListenModeListeners();
    scanAndInject();
    setInterval(scanAndInject, 1500);
  });
})();
