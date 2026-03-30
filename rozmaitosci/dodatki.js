document.addEventListener('DOMContentLoaded', () => {
  const fullscreen = document.getElementById('fullscreen');
  const fullscreenImg = document.getElementById('fullscreen-img');
  const fullscreenCaption = document.getElementById('fullscreen-caption');
  const closeTargets = fullscreen?.querySelectorAll('[data-lightbox-close]');

  let lastFocusedEl = null;
  let lightboxItems = [];
  let currentIndex = -1;

  const isLightboxOpen = () => fullscreen && !fullscreen.classList.contains('hidden');

  const setLightboxHidden = (hidden) => {
    if (!fullscreen) return;
    fullscreen.classList.toggle('hidden', hidden);
    document.body.classList.toggle('modal-open', !hidden);
  };

  const openAt = (idx) => {
    if (!fullscreen || !fullscreenImg) return;
    const item = lightboxItems[idx];
    if (!item) return;

    currentIndex = idx;
    lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    fullscreenImg.src = item.src;
    fullscreenImg.alt = item.alt || item.caption || 'Podgląd obrazu';
    if (fullscreenCaption) fullscreenCaption.textContent = item.caption || item.alt || '';

    setLightboxHidden(false);

    const closeBtn = fullscreen.querySelector('.lightbox__close');
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
    else fullscreen.focus();
  };

  const closeLightbox = () => {
    if (!fullscreen) return;
    setLightboxHidden(true);
    if (lastFocusedEl) lastFocusedEl.focus();
  };

  // Lightbox: obrazy w figure + legacy .thumb
  const imgs = Array.from(document.querySelectorAll('.content-card figure img, img.thumb'));
  lightboxItems = imgs.map((img) => {
    const fig = img.closest('figure');
    const cap = fig?.querySelector('figcaption')?.textContent?.trim() ?? '';
    return { el: img, src: img.currentSrc || img.src, alt: img.alt || '', caption: cap };
  });

  imgs.forEach((img, idx) => {
    img.addEventListener('click', () => openAt(idx));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAt(idx);
      }
    });
    if (!img.hasAttribute('tabindex')) img.tabIndex = 0;
  });

  closeTargets?.forEach((el) => el.addEventListener('click', closeLightbox));

  document.addEventListener('keydown', (e) => {
    if (!isLightboxOpen()) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      openAt((currentIndex + 1) % lightboxItems.length);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      openAt((currentIndex - 1 + lightboxItems.length) % lightboxItems.length);
    }
  });

  // Wideo: nie przycinaj napisów na miniaturach (poster),
  // ale podczas odtwarzania wypełnij kadr.
  document.querySelectorAll('.video-wrapper video').forEach((video) => {
    const wrapper = video.closest('.video-wrapper');
    if (!wrapper) return;

    const setPlaying = (isPlaying) => {
      wrapper.classList.toggle('is-playing', isPlaying);
    };

    // Jeśli przeglądarka przywraca odtwarzanie z cache
    setPlaying(!video.paused && !video.ended);

    video.addEventListener('play', () => setPlaying(true));
    video.addEventListener('pause', () => setPlaying(false));
    video.addEventListener('ended', () => setPlaying(false));
  });
});
