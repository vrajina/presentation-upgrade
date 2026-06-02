(function(){
  const track = document.querySelector('.slides-track');
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  const counter = document.querySelector('.nav-counter-current');
  const counterTotal = document.querySelector('.nav-counter-total');
  const progress = document.querySelector('.nav-progress');
  const prevBtn = document.querySelector('.nav-prev');
  const nextBtn = document.querySelector('.nav-next');

  let current = 0;
  let isAnimating = false;

  // Init counter
  if (counterTotal) counterTotal.textContent = totalSlides;

  // Read hash
  const hash = window.location.hash.match(/^#slide-(\d+)$/);
  if (hash) {
    const n = parseInt(hash[1], 10) - 1;
    if (n >= 0 && n < totalSlides) current = n;
  }

  function goTo(index, pushHash) {
    if (index < 0 || index >= totalSlides || isAnimating) return;
    isAnimating = true;
    current = index;
    track.style.transform = 'translateX(-' + (current * 100) + 'vw)';
    if (counter) counter.textContent = current + 1;
    if (progress) progress.style.width = ((current + 1) / totalSlides * 100) + '%';
    if (prevBtn) prevBtn.classList.toggle('hidden', current === 0);
    if (nextBtn) nextBtn.classList.toggle('hidden', current === totalSlides - 1);
    if (pushHash !== false) {
      history.replaceState(null, '', '#slide-' + (current + 1));
    }
    setTimeout(function(){ isAnimating = false; }, 600);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(totalSlides - 1); }
  });

  // Mouse wheel
  var wheelTimeout = null;
  document.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (wheelTimeout) return;
    wheelTimeout = setTimeout(function(){ wheelTimeout = null; }, 800);
    if (e.deltaY > 0 || e.deltaX > 0) next();
    else prev();
  }, { passive: false });

  // Touch swipe
  var touchStartX = 0;
  document.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; });
  document.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  });

  // Nav buttons
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Hash change
  window.addEventListener('hashchange', function() {
    var m = window.location.hash.match(/^#slide-(\d+)$/);
    if (m) goTo(parseInt(m[1], 10) - 1, false);
  });

  // Init
  goTo(current, true);
})();
