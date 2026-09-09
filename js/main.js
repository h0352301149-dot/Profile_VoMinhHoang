/* =========================================================
   APPLICATION MAIN CONTROLLER & MODULE BOOTSTRAPPER
========================================================= */

import { initTheme } from './modules/theme.js';
import { initI18n } from './modules/i18n.js';
import { initClipboard } from './modules/clipboard.js';
import { initScrollReveal } from './modules/scroll-reveal.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme (Light / Dark)
    initTheme();

    // 2. Initialize Internationalization (VI / EN)
    initI18n();

    // 3. Initialize 1-Touch Copy to Clipboard with Accessible Controls
    initClipboard();

    // 4. Initialize Smooth Scroll Reveal Animations (IntersectionObserver)
    initScrollReveal();
});
