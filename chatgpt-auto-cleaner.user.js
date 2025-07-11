// ==UserScript==
// @name         ChatGPT DOM Pruner
// @namespace    https://example.com/chatgpt-pruner
// @version      1.2
// @description  Удаляет старые сообщения в ChatGPT, снижая нагрузку на DOM.
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  /* ======== ПАРАМЕТРЫ ======== */
  const KEEP_MESSAGES = 30;                       // сколько последних сообщений оставляем
  const NODE_SELECTOR = 'article[data-testid^="conversation-turn-"]';

  /* ======== ВНУТРЕННЕЕ ======= */
  let rafLock = false;
  let originalTitle = document.title;
  let currentPath   = location.pathname;

  /* ======== ГЛАВНАЯ ФУНКЦИЯ ======== */
  function pruneDom() {
    const nodes = document.querySelectorAll(NODE_SELECTOR);
    const surplus = nodes.length - KEEP_MESSAGES;
    if (surplus <= 0) return;

    for (let i = 0; i < surplus; i++) nodes[i].remove();
    console.log(`[DOM-Pruner] removed ${surplus}, left ${nodes.length - surplus}`);

    document.title = `[${nodes.length - surplus}] ${originalTitle}`;
    window.dispatchEvent(new Event('resize'));
  }

  /* ======== НАБЛЮДАТЕЛЬ ======== */
  new MutationObserver(() => {
    if (!rafLock) {
      rafLock = true;
      requestAnimationFrame(() => { rafLock = false; pruneDom(); });
    }
  }).observe(document.body, { childList: true, subtree: true });

  pruneDom();   // «первый проход»

  /* ======== ОТСЛЕЖИВАЕМ URL SPA-навигации ======== */
  setInterval(() => {
    if (location.pathname !== currentPath) {
      currentPath = location.pathname;
      setTimeout(pruneDom, 1000); // ждём, пока React дорисует новый чат
    }
  }, 3000);
})();
