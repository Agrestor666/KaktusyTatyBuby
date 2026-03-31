(() => {
  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Podgląd zdjęcia">
        <div class="lightbox-toolbar">
          <button type="button" class="lightbox-btn" data-lb="close" aria-label="Zamknij (Esc)">Zamknij</button>
        </div>
        <div class="lightbox-stage">
          <img class="lightbox-image" alt="">
          <div class="lightbox-nav" aria-hidden="true">
            <button type="button" class="lightbox-hit" data-lb="prev" tabindex="-1"></button>
            <button type="button" class="lightbox-hit" data-lb="next" tabindex="-1"></button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function getImageAlt(img) {
    const alt = (img.getAttribute("alt") || "").trim();
    return alt || "Zdjęcie";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const sections = qsa(document, "#kolekcja-prywatna");
    if (!sections.length) return;

    const overlay = buildOverlay();
    const dialog = overlay.querySelector(".lightbox-dialog");
    const imageEl = overlay.querySelector(".lightbox-image");
    const closeBtn = overlay.querySelector('[data-lb="close"]');
    const prevHit = overlay.querySelector('[data-lb="prev"]');
    const nextHit = overlay.querySelector('[data-lb="next"]');

    let currentImages = [];
    let currentIndex = 0;
    let lastActiveEl = null;

    function setIndex(nextIndex) {
      if (!currentImages.length) return;
      currentIndex = (nextIndex + currentImages.length) % currentImages.length;
      const img = currentImages[currentIndex];
      imageEl.src = img.currentSrc || img.src;
      imageEl.alt = getImageAlt(img);
    }

    function openAt(images, index) {
      currentImages = images;
      lastActiveEl = document.activeElement;
      overlay.hidden = false;
      document.documentElement.style.overflow = "hidden";
      setIndex(index);
      closeBtn.focus();
    }

    function close() {
      overlay.hidden = true;
      document.documentElement.style.overflow = "";
      imageEl.removeAttribute("src");
      if (lastActiveEl && typeof lastActiveEl.focus === "function") lastActiveEl.focus();
    }

    function onKeyDown(e) {
      if (overlay.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setIndex(currentIndex + 1);
      }
    }

    // Close on backdrop click (but not inside dialog)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    closeBtn.addEventListener("click", close);
    prevHit.addEventListener("click", () => setIndex(currentIndex - 1));
    nextHit.addEventListener("click", () => setIndex(currentIndex + 1));
    document.addEventListener("keydown", onKeyDown);

    // Prevent clicks inside dialog from closing.
    dialog.addEventListener("click", (e) => e.stopPropagation());

    sections.forEach((section) => {
      const imgs = qsa(section, "img");
      if (!imgs.length) return;

      imgs.forEach((img, index) => {
        img.addEventListener("click", (e) => {
          e.preventDefault();
          openAt(imgs, index);
        });

        img.addEventListener("keydown", (e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          openAt(imgs, index);
        });

        if (!img.hasAttribute("tabindex")) img.tabIndex = 0;
      });
    });
  });
})();

