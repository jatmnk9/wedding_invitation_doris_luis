document.addEventListener('DOMContentLoaded', () => {
    // --- Force Scroll to Top Logic ---
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);


    // --- Countdown Logic ---
    const weddingDate = new Date('February 28, 2026 00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "<div>¡Es el gran día!</div>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days;
        document.getElementById('hours').innerText = hours;
        document.getElementById('minutes').innerText = minutes;
        document.getElementById('seconds').innerText = seconds;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- Background Music & Entry Screen ---
    const bgAudio = new Audio('assets/background_song.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.5;

    const entryOverlay = document.getElementById('entry-overlay');
    const enterBtn = document.getElementById('enter-btn');

    if (enterBtn && entryOverlay) {
        enterBtn.addEventListener('click', () => {
            // Force play on user interaction
            bgAudio.play().then(() => {
                console.log("Audio playing");
            }).catch(err => {
                console.error("Audio play failed even after click:", err);
            });

            // Hide overlay
            entryOverlay.classList.add('hidden');
        });
    } else {
        // Fallback if overlay is missing
        bgAudio.play().catch(() => {
            const enableAudio = () => { bgAudio.play(); document.removeEventListener('click', enableAudio); };
            document.addEventListener('click', enableAudio);
        });
    }

    // --- Spotify Button Handler ---
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Pause background music before opening Spotify
            bgAudio.pause();
            window.open('https://open.spotify.com/track/1tMRh8jiYlmatpVeWWesCe?si=dd9fb913c6a84ef3', '_blank');
        });
    }

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Account Modal ---
    const modal = document.getElementById('account-modal');
    const modalClose = modal ? modal.querySelector('.modal-close') : null;
    const holderEl = modal ? document.getElementById('modal-holder') : null;
    const bankEl = modal ? document.getElementById('modal-bank') : null;

    const numberEl = modal ? document.getElementById('modal-account-number') : null;
    const cciEl = modal ? document.getElementById('modal-cci-number') : null;
    const swiftEl = modal ? document.getElementById('modal-swift-code') : null;

    const cciContainer = modal ? document.getElementById('cci-container') : null;
    const swiftContainer = modal ? document.getElementById('swift-container') : null;


    const openModal = (data) => {
        if (!modal) return;
        holderEl.textContent = `Titular: ${data.holder || '—'}`;
        bankEl.textContent = `Banco: ${data.bank || '—'}`;

        if (numberEl) numberEl.textContent = data.account || '—';

        if (cciEl && cciContainer) {
            if (data.cci) {
                cciEl.textContent = data.cci;
                cciContainer.style.display = 'block';
            } else {
                cciContainer.style.display = 'none';
            }
        }

        if (swiftEl && swiftContainer) {
            if (data.swift) {
                swiftEl.textContent = data.swift;
                swiftContainer.style.display = 'block';
            } else {
                swiftContainer.style.display = 'none';
            }
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    };

    document.querySelectorAll('.account-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const data = {
                bank: btn.getAttribute('data-bank'),
                account: btn.getAttribute('data-account'),
                holder: btn.getAttribute('data-holder'),
                cci: btn.getAttribute('data-cci'),
                swift: btn.getAttribute('data-swift')
            };
            openModal(data);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Generic Copy Logic
        modal.querySelectorAll('.modal-copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = btn.getAttribute('data-copy-target');
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                const text = targetEl.textContent.trim();
                try {
                    await navigator.clipboard.writeText(text);
                    const originalText = btn.textContent;
                    btn.textContent = 'Copiado!';
                    setTimeout(() => btn.textContent = originalText, 2000);
                } catch (err) {
                    console.error('Clipboard error', err);
                }
            });
        });
    }

    // --- Wish Modal & Google Sheet Integration ---
    const wishModal = document.getElementById('wish-modal');
    const wishClose = wishModal ? wishModal.querySelector('.modal-close') : null;
    const wishBtn = document.querySelector('.wish-btn');

    // Updated IDs
    const wishNameInput = document.getElementById('wish-name');
    const wishTextarea = document.getElementById('wish-textarea');
    const sendWishBtn = document.getElementById('send-wish-btn');

    // !!! IMPORTANT: REPLACE THIS URL WITH YOUR GOOGLE APPS SCRIPT WEB APP URL !!!
    // Instructions:
    // 1. Open Google Sheet -> Extensions -> Apps Script
    // 2. Paste the provided code.
    // 3. Deploy -> New Deployment -> Select "Web app"
    // 4. Description: "Wish API", Execute as: "Me", Who has access: "Anyone"
    // 5. Copy the URL and paste it below inside the quotes.
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZls9mMRpmXVWbVmrSoZ0avRqknNttUnuKEYRnb1ch8zm5XDRUopaTgVhDHIIuU2_M/exec";

    const openWish = () => {
        if (!wishModal) return;
        wishModal.classList.add('open');
        wishModal.setAttribute('aria-hidden', 'false');
        if (wishNameInput) wishNameInput.focus();
    };

    const closeWish = () => {
        if (!wishModal) return;
        wishModal.classList.remove('open');
        wishModal.setAttribute('aria-hidden', 'true');
    };

    if (wishBtn) {
        wishBtn.addEventListener('click', openWish);
    }

    if (wishClose) {
        wishClose.addEventListener('click', closeWish);
    }

    if (wishModal) {
        wishModal.addEventListener('click', (e) => { if (e.target === wishModal) closeWish(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeWish(); });
    }

    if (sendWishBtn && wishTextarea && wishNameInput) {
        sendWishBtn.addEventListener('click', async () => {
            const name = wishNameInput.value.trim();
            const message = wishTextarea.value.trim();

            if (!name || !message) {
                alert('Por favor, escribe tu nombre y tu mensaje.');
                return;
            }

            if (GOOGLE_SCRIPT_URL.includes("REPLACE_ME")) {
                alert("Error: Falta configurar la URL del Google Script en script.js");
                console.error("Please deploy the Google Apps Script and update GOOGLE_SCRIPT_URL in script.js");
                return;
            }

            const originalText = sendWishBtn.textContent;
            sendWishBtn.textContent = 'Enviando...';
            sendWishBtn.disabled = true;

            try {
                // Using 'no-cors' mode is standard for opaque Google Apps Script requests depending on returned headers,
                // BUT simple POST requests often work better if we send form data or JSON.
                // However, CORS issues are common with GAS.
                // Best practice for simple text: use URL parameters or application/x-www-form-urlencoded
                // Note: fetch with 'no-cors' treats response as opaque (cant read JSON), so we assume success if no network error.

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Important for Google Apps Script to avoid CORS errors in browser
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, message, date: new Date().toISOString() })
                });

                sendWishBtn.textContent = '¡Mensaje Enviado!';
                wishNameInput.value = '';
                wishTextarea.value = '';

                setTimeout(() => {
                    closeWish();
                    sendWishBtn.textContent = originalText;
                    sendWishBtn.disabled = false;
                }, 2000);

            } catch (err) {
                console.error('Error sending wish:', err);
                sendWishBtn.textContent = 'Error. Intenta de nuevo.';
                setTimeout(() => {
                    sendWishBtn.textContent = originalText;
                    sendWishBtn.disabled = false;
                }, 3000);
            }
        });
    }
});
