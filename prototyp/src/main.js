// @ts-check
/**
 * Vstup Vite aplikace: hot-seat UI nad v3 slotovým enginem (fáze 2.1).
 * Bez API klíče je hra plně hratelná — protokoly jedou na fallback šablonách
 * (ADR-004); LLM adaptér přijde ve fázi 3.
 */
import './ui/style.css';
import { initApp } from './ui/app.js';

const app = document.querySelector('#app');
if (app) initApp(/** @type {HTMLElement} */ (app));
