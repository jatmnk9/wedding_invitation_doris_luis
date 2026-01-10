document.addEventListener('DOMContentLoaded', () => {
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
    const copyBtn = modal ? document.getElementById('copy-account') : null;

    const openModal = (data) => {
        if (!modal) return;
        holderEl.textContent = `Titular: ${data.holder || '—'}`;
        bankEl.textContent = `Banco: ${data.bank || '—'}`;
        numberEl.textContent = data.account || '—';
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
                holder: btn.getAttribute('data-holder')
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
    }

    if (copyBtn && numberEl) {
        copyBtn.addEventListener('click', async () => {
            const text = numberEl.textContent.trim();
            try {
                await navigator.clipboard.writeText(text);
                copyBtn.textContent = 'Copiado!';
                setTimeout(() => copyBtn.textContent = 'Copiar', 2000);
            } catch (err) {
                console.error('Clipboard error', err);
            }
        });
    }

    // --- Wish Modal ---
    const wishModal = document.getElementById('wish-modal');
    const wishClose = wishModal ? wishModal.querySelector('.modal-close') : null;
    const wishBtn = document.querySelector('.wish-btn');
    const wishTextarea = wishModal ? document.getElementById('wish-textarea') : null;
    const copyWishBtn = wishModal ? document.getElementById('copy-wish') : null;

    const openWish = () => {
        if (!wishModal) return;
        wishModal.classList.add('open');
        wishModal.setAttribute('aria-hidden', 'false');
        if (wishTextarea) wishTextarea.focus();
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

    if (copyWishBtn && wishTextarea) {
        copyWishBtn.addEventListener('click', async () => {
            const text = wishTextarea.value.trim();
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
                copyWishBtn.textContent = 'Copiado!';
                setTimeout(() => copyWishBtn.textContent = 'Copiar', 2000);
            } catch (err) {
                console.error('Clipboard error', err);
            }
        });
    }
});
