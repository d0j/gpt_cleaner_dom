// ==UserScript==
// @name         ChatGPT DOM Pruner (Optimized)
// @namespace    https://example.com/chatgpt-pruner
// @version      1.1
// @description  Убирает лишние <article>-сообщения, чтобы ChatGPT не лагал.
//               Настройте «KEEP_MESSAGES», если нужно хранить больше/меньше.
// @match        *://chat.openai.com/*
// @match        *://chatgpt.com/*
// @run-at       document-end          // запускаемся, когда DOM уже собран
// @grant        none                  // AdGuard / Greasemonkey совместимы
// ==/UserScript==

(() => {
  'use strict';

  /* ---------- КОНФИГ ---------- */
  const KEEP_MESSAGES = 30;                           // Сколько последних сообщений оставлять
  const SELECTOR      = 'article[data-testid^="conversation-turn-"]';

  /* ---------- ВНУТРЕННЕЕ СОСТОЯНИЕ ---------- */
  let rafScheduled = false;                           // флаг для throttling MutationObserver

  /* ---------- ФУНКЦИЯ ОЧИСТКИ ---------- */
  function pruneDom() {
    const nodes = document.querySelectorAll(SELECTOR);   // статический NodeList
    const extra = nodes.length - KEEP_MESSAGES;          // сколько нужно убрать
    if (extra <= 0) return;                              // всё ок

    for (let i = 0; i < extra; i++) {                    // удаляем самые старые
      const n = nodes[i];
      if (n?.isConnected) n.remove();
    }
    // Обновляем заголовок вкладки — видно, сколько осталось
    document.title = `[${KEEP_MESSAGES}] ChatGPT`;
  }

  /* ---------- НАБЛЮДАТЕЛЬ С ТРОТТЛИНГОМ ---------- */
  const observer = new MutationObserver(() => {
    if (!rafScheduled) {                                // не чаще одного кадра
      rafScheduled = true;
      requestAnimationFrame(() => {
        rafScheduled = false;
        pruneDom();
      });
    }
  });

  /* ---------- ИНИЦИАЛИЗАЦИЯ ---------- */
  observer.observe(document.body, { childList: true, subtree: true });
  pruneDom();                                           // «первый проход» после загрузки
})();
