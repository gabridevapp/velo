/* Velo — script.js */

(function () {
  'use strict';

  // ── Nav scroll state ──────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Fallback: IntersectionObserver reveal for browsers
  //    without scroll-driven animations support ──────────────
  const supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()');

  if (!supportsScrollTimeline) {
    const style = document.createElement('style');
    style.textContent = `
      .reveal-fade { opacity: 0; transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1); }
      .reveal-fade.visible { opacity: 1; }
    `;
    document.head.appendChild(style);

    const reveals = document.querySelectorAll('.reveal-fade');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Respect animation-delay set inline
          const delay = parseFloat(e.target.style.animationDelay) || 0;
          setTimeout(() => e.target.classList.add('visible'), delay * 1000);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => observer.observe(el));
  }

  // ── Smooth scroll for anchor links ────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── App toggle interactivity (demo) ───────────────────────
  document.querySelectorAll('.app-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isOn = toggle.classList.contains('app-toggle--on');
      toggle.classList.toggle('app-toggle--on', !isOn);
      toggle.classList.toggle('app-toggle--off', isOn);
      toggle.setAttribute('aria-checked', String(!isOn));

      // Grey out mic source select if mic toggle is off
      const row = toggle.closest('.app-toggles');
      if (row) {
        const card = toggle.closest('.app-card__body');
        if (card) {
          const label = toggle.closest('.app-toggle-row')?.querySelector('.app-toggle-label');
          if (label && label.textContent.includes('Microphone')) {
            const micField = card.querySelectorAll('.app-field');
            micField.forEach(f => {
              if (f.querySelector('.app-label')?.textContent.includes('MIC')) {
                f.querySelector('.app-select')?.classList.toggle('app-select--disabled', isOn);
              }
            });
          }
        }
      }
    });
  });

  // ── Modal system (download / privacy / terms) ─────────────
  const modals = document.querySelectorAll('[data-modal-overlay]');
  let activeModal = null;
  let lastFocused = null;

  function openModal(id) {
    const overlay = document.getElementById(id + 'Modal');
    if (!overlay) return;

    lastFocused = document.activeElement;
    overlay.hidden = false;
    // Force reflow so the transition runs
    void overlay.offsetHeight;
    overlay.setAttribute('data-open', '');
    document.body.style.overflow = 'hidden';
    activeModal = overlay;

    // Reset the download modal back to step 1 each time it opens
    if (id === 'download') {
      showStep(overlay, 'os');
      const status = overlay.querySelector('#downloadStatus');
      if (status) status.textContent = '\u00A0';
    }

    const focusable = overlay.querySelector('.modal__close');
    if (focusable) focusable.focus();
  }

  function closeModal(overlay) {
    if (!overlay) return;
    overlay.removeAttribute('data-open');
    document.body.style.overflow = '';
    activeModal = null;
    setTimeout(() => { overlay.hidden = true; }, 220);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function showStep(overlay, stepName) {
    overlay.querySelectorAll('.modal__step').forEach(step => {
      step.hidden = step.getAttribute('data-step') !== stepName;
    });
  }

  // Open triggers
  document.querySelectorAll('[data-modal-open]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.getAttribute('data-modal-open'));
    });
  });

  // Close triggers: close button, overlay background click, Escape key
  modals.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(overlay));
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) closeModal(activeModal);
  });

  // Download modal: OS selection → package step
  const downloadModal = document.getElementById('downloadModal');
  if (downloadModal) {
    downloadModal.querySelectorAll('[data-os]').forEach(osBtn => {
      osBtn.addEventListener('click', () => {
        const os = osBtn.getAttribute('data-os');
        showStep(downloadModal, os);
      });
    });

    const backBtn = downloadModal.querySelector('[data-step-back]');
    if (backBtn) {
      backBtn.addEventListener('click', () => showStep(downloadModal, 'os'));
    }

    const status = downloadModal.querySelector('#downloadStatus');
    downloadModal.querySelectorAll('.pkg-card').forEach(pkg => {
      pkg.addEventListener('click', () => {
        if (status) {
          const label = pkg.getAttribute('data-pkg-label') || 'file';
          status.textContent = `Downloading Velo (${label})…`;
        }
      });
    });
  }

  // ── Live recording timer demo on recording bars ───────────
  const timers = document.querySelectorAll('.app-bar__time');
  if (timers.length) {
    let seconds = [12, 47];
    timers.forEach((el, i) => {
      seconds[i] = seconds[i] || 0;
    });

    setInterval(() => {
      timers.forEach((el, i) => {
        seconds[i] = (seconds[i] + 1) % 3600;
        const m = String(Math.floor(seconds[i] / 60)).padStart(2, '0');
        const s = String(seconds[i] % 60).padStart(2, '0');
        el.textContent = `${m}:${s}`;
      });
    }, 1000);
  }

})();