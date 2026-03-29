document.addEventListener('DOMContentLoaded', () => {
  const thumbs = document.querySelectorAll('.thumb');
  const fullscreen = document.getElementById('fullscreen');
  const fullscreenImg = document.getElementById('fullscreen-img');
  if (!fullscreen || !fullscreenImg) return;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      if (fullscreen.classList.contains('hidden')) {
        fullscreenImg.src = thumb.src;
        fullscreen.classList.remove('hidden');
      } else {
        fullscreen.classList.add('hidden');
      }
    });
  });

  fullscreen.addEventListener('click', () => {
    fullscreen.classList.add('hidden');
  });
});
