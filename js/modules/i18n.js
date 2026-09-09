/* =========================================================
   INTERNATIONALIZATION MODULE (VI / EN)
========================================================= */

export function initI18n() {
    const savedLang = localStorage.getItem('cv_lang') || 'vi';
    applyLanguage(savedLang);

    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentLang = localStorage.getItem('cv_lang') || 'vi';
            const newLang = currentLang === 'vi' ? 'en' : 'vi';
            applyLanguage(newLang);
        });
    }
}

export function applyLanguage(lang) {
    const dict = window.translations;
    if (!dict || !dict[lang]) return;

    localStorage.setItem('cv_lang', lang);
    document.documentElement.lang = lang;

    // Update toggle button text (showing the next alternative)
    const langText = document.getElementById('langText');
    if (langText) {
        langText.textContent = lang === 'vi' ? 'EN' : 'VI';
    }

    // Update all i18n DOM elements
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (dict[lang][key] !== undefined) {
            element.innerHTML = dict[lang][key];
        }
    });

    // Update document title
    if (dict[lang]['page-title']) {
        document.title = dict[lang]['page-title'];
    }
}
