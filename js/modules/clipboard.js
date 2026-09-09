/* =========================================================
   CLIPBOARD MODULE (1-TOUCH COPY & ACCESSIBILITY)
========================================================= */

let toastTimeout;

export function initClipboard() {
    const copyTriggers = document.querySelectorAll('.copy-trigger, .contact-chip[data-copy]');
    const toast = document.getElementById('copyToast');

    copyTriggers.forEach((trigger) => {
        // Ensure accessibility keyboard interaction
        if (!trigger.hasAttribute('tabindex')) {
            trigger.setAttribute('tabindex', '0');
        }
        if (!trigger.hasAttribute('role')) {
            trigger.setAttribute('role', 'button');
        }

        const handleCopy = () => {
            const textToCopy = trigger.getAttribute('data-copy');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(toast);
            }).catch((err) => {
                console.error('Lỗi khi sao chép:', err);
            });
        };

        // Click listener
        trigger.addEventListener('click', handleCopy);

        // Keyboard listener (Enter & Space)
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopy();
            }
        });
    });
}

function showToast(toast) {
    if (!toast) return;
    clearTimeout(toastTimeout);
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}
