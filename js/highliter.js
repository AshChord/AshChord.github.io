// highlighter.js
import { createHighlighter } from "https://esm.sh/shiki";
// 언어 로딩 상태 저장
const languageCache = new Map();

// Shiki 초기화 Promise
const highlighterPromise = createHighlighter({
  themes: ["github-light"],
  langs: ["plaintext"]
});


// 전역 API 등록
window.Highlighter = {

  async get() {
    return await highlighterPromise;
  },

  async loadLanguage(lang) {
    const highlighter = await highlighterPromise;

    if (!languageCache.has(lang)) {
      const loading = highlighter.loadLanguage(lang);
      languageCache.set(lang, loading);
    }

    await languageCache.get(lang);
  }
};