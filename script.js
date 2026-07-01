document.addEventListener('DOMContentLoaded', () => {

  const startBtn      = document.getElementById('start-btn');
  const welcomeScreen = document.getElementById('welcome-screen');
  const mainContent    = document.getElementById('main-content');
  const music          = document.getElementById('bg-music');
  const surpriseBtn    = document.getElementById('surprise-btn');
  const letterScreen   = document.getElementById('letter-screen');
  const heartScreen    = document.getElementById('heart-screen');
  const spacer         = document.querySelector('.spacer');
  const volumeSeek     = document.getElementById('volume-seek');
  const volumeIcon     = document.getElementById('volume-icon');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     0) Control de volumen de la música de fondo
     ===================================================== */
  function updateSliderFill(el) {
    const max = parseFloat(el.max) || 100;
    const pct = max > 0 ? (el.value / max) * 100 : 0;
    el.style.setProperty('--seek-progress', pct + '%');
  }

  function iconForVolume(v) {
    if (v <= 0) return '🔇';
    if (v < 0.5) return '🔉';
    return '🔊';
  }

  if (volumeSeek) {
    music.volume = volumeSeek.value / 100;
    updateSliderFill(volumeSeek);

    volumeSeek.addEventListener('input', () => {
      const level = volumeSeek.value / 100;
      music.volume = level;
      volumeIcon.textContent = iconForVolume(level);
      updateSliderFill(volumeSeek);
    });
  }

  /* =====================================================
     1) Botón "Leer carta": muestra el contenido, intenta
        reproducir la música y lanza un primer estallido
        de pétalos.
     ===================================================== */
  startBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('fade-out');

    setTimeout(() => {
      welcomeScreen.classList.add('hidden');
      mainContent.classList.remove('hidden');
      window.scrollTo(0, 0);
    }, 550);

    // El click ya cuenta como interacción del usuario, así que
    // en iOS Safari esto normalmente puede reproducirse.
    music.play().catch(() => {
      // Si el navegador aún así lo bloquea, se reintenta con el
      // primer toque en la pantalla.
      const retry = () => music.play().catch(() => {});
      document.body.addEventListener('touchstart', retry, { once: true });
      document.body.addEventListener('click', retry, { once: true });
    });

    if (!prefersReducedMotion) {
      burstPetals(14);
    }
  });

  /* =====================================================
     2) Pétalos cayendo
     ===================================================== */
  function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = Math.random() * 10 + 14; // 14–24px
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);

    const duration = Math.random() * 3 + 4; // 4–7s
    petal.style.animationDuration = duration + 's';

    petal.style.background = Math.random() > 0.5
      ? 'linear-gradient(135deg, var(--rose-red-light), var(--rose-red))'
      : 'linear-gradient(135deg, var(--rose-red), var(--rose-red-deep))';

    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 100);
  }

  function burstPetals(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(createPetal, i * 90);
    }
  }

  // Los pétalos solo caen mientras la carta, el espacio de
  // transición o el corazón final están visibles en pantalla.
  // Se guarda el estado de CADA sección observada (no solo el del
  // último aviso) para que un cambio en una no apague por error
  // los pétalos mientras otra sigue visible.
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
     3) Revelado suave del corazón y el botón final
     ===================================================== */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.35 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* =====================================================
     4) Botón "Sorpresa para ti": lleva a otra página del
        mismo sitio (carta2.html) con la segunda carta.
     ===================================================== */
  surpriseBtn.addEventListener('click', () => {
    surpriseBtn.querySelector('span').textContent = 'Abriendo tu sorpresa...';
    surpriseBtn.disabled = true;
    setTimeout(() => {
      window.location.href = 'carta2.html';
    }, 450);
  });

});