document.addEventListener('DOMContentLoaded', () => {

  const audio        = document.getElementById('letter-audio');
  const listenBtn     = document.getElementById('listen-btn');
  const listenBtnText = document.getElementById('listen-btn-text');
  const seek          = document.getElementById('audio-seek');
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl   = document.getElementById('total-time');
  const volumeSeek    = document.getElementById('volume-seek');
  const volumeIcon    = document.getElementById('volume-icon');
  const letterScreen  = document.getElementById('letter-screen');
  const heartScreen   = document.getElementById('heart-screen');
  const spacer        = document.querySelector('.spacer');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     0) Control de volumen del audio, disponible desde el
        inicio (no hace falta reproducir para ajustarlo).
     ===================================================== */
  function iconForVolume(v) {
    if (v <= 0) return '🔇';
    if (v < 0.5) return '🔉';
    return '🔊';
  }

  if (volumeSeek) {
    audio.volume = volumeSeek.value / 100;
    updateSeekFill(volumeSeek);

    volumeSeek.addEventListener('input', () => {
      const level = volumeSeek.value / 100;
      audio.volume = level;
      volumeIcon.textContent = iconForVolume(level);
      updateSeekFill(volumeSeek);
    });
  }

  /* =====================================================
     1) Reproductor de audio con control de tiempo (scrubber)
     ===================================================== */
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateSeekFill(el) {
    const target = el || seek;
    const max = parseFloat(target.max) || 1;
    const pct = max > 0 ? (target.value / max) * 100 : 0;
    target.style.setProperty('--seek-progress', pct + '%');
  }

  audio.addEventListener('loadedmetadata', () => {
    seek.max = audio.duration || 0;
    totalTimeEl.textContent = formatTime(audio.duration);
    updateSeekFill();
  });

  listenBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play()
        .then(() => { listenBtnText.textContent = 'Pausar audio'; })
        .catch(() => { listenBtnText.textContent = 'Toca de nuevo para escuchar'; });
    } else {
      audio.pause();
      listenBtnText.textContent = 'Escúchame leer esta carta';
    }
  });

  audio.addEventListener('timeupdate', () => {
    seek.value = audio.currentTime;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    updateSeekFill();
  });

  audio.addEventListener('ended', () => {
    listenBtnText.textContent = 'Escúchame leer esta carta';
  });

  // Al mover el control, el usuario elige desde qué minuto escuchar.
  seek.addEventListener('input', () => {
    audio.currentTime = parseFloat(seek.value);
    currentTimeEl.textContent = formatTime(seek.value);
    updateSeekFill();
  });

  /* =====================================================
     2) Pétalos cayendo mientras la carta o el corazón
        están en pantalla (igual que en la carta principal)
     ===================================================== */
  function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = Math.random() * 10 + 14;
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);

    const duration = Math.random() * 3 + 4;
    petal.style.animationDuration = duration + 's';

    petal.style.background = Math.random() > 0.5
      ? 'linear-gradient(135deg, var(--lily-blue-light), var(--lily-blue))'
      : 'linear-gradient(135deg, var(--lily-blue), var(--lily-blue-deep))';

    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 100);
  }

  let petalTimer = null;
  const visibleSections = new Set();

  const petalObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.add(entry.target);
      } else {
        visibleSections.delete(entry.target);
      }
    });

    const anyVisible = visibleSections.size > 0;

    if (anyVisible && !petalTimer && !prefersReducedMotion) {
      petalTimer = setInterval(createPetal, 380);
    } else if (!anyVisible && petalTimer) {
      clearInterval(petalTimer);
      petalTimer = null;
    }
  }, { threshold: 0.05 });

  if (letterScreen) petalObserver.observe(letterScreen);
  if (spacer) petalObserver.observe(spacer);
  if (heartScreen) petalObserver.observe(heartScreen);

  /* =====================================================
     3) Revelado suave del corazón
     ===================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

});