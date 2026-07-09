document.addEventListener('DOMContentLoaded', () => {
  const reel = document.getElementById('hero-reel');
  if (!reel) return;

  const f1 = document.querySelector('[data-frame="f1"]');
  const f2 = document.querySelector('[data-frame="f2"]');
  const f3 = document.querySelector('[data-frame="f3"]');
  const f4 = document.querySelector('[data-frame="f4"]');
  const f5 = document.querySelector('[data-frame="f5"]');
  const f6 = document.querySelector('[data-frame="f6"]');
  const rises = [...document.querySelectorAll('[data-rise]')];
  const cue = document.getElementById('hero-cue');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyStatic() {
    if (f1) f1.style.opacity = '1';
    rises.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    if (cue) cue.style.opacity = '1';
  }

  if (reduce) { applyStatic(); return; }

  const E = 'cubic-bezier(.76,0,.24,1)';

  // Six-frame reel loops forever as the hero background, each frame holding
  // for ~1/6 of the cycle. Each later frame fades IN on top of the one
  // before it (which stays fully opaque underneath, per DOM stacking
  // order) — a true crossfade with nothing ever dropping to 0
  // mid-transition, so the black reel background never shows through.
  // iterations:Infinity keeps it running as a loop.
  const D = 7400;
  if (f2) f2.animate([
    { opacity: 0 },
    { opacity: 0, offset: .147 },
    { opacity: 1, offset: .167 },
    { opacity: 1, offset: .97 },
    { opacity: 0 },
  ], { duration: D, iterations: Infinity });
  if (f3) f3.animate([
    { opacity: 0 },
    { opacity: 0, offset: .313 },
    { opacity: 1, offset: .333 },
    { opacity: 1, offset: .97 },
    { opacity: 0 },
  ], { duration: D, iterations: Infinity });
  if (f4) f4.animate([
    { opacity: 0 },
    { opacity: 0, offset: .48 },
    { opacity: 1, offset: .50 },
    { opacity: 1, offset: .97 },
    { opacity: 0 },
  ], { duration: D, iterations: Infinity });
  if (f5) f5.animate([
    { opacity: 0 },
    { opacity: 0, offset: .647 },
    { opacity: 1, offset: .667 },
    { opacity: 1, offset: .97 },
    { opacity: 0 },
  ], { duration: D, iterations: Infinity });
  if (f6) f6.animate([
    { opacity: 0 },
    { opacity: 0, offset: .813 },
    { opacity: 1, offset: .833 },
    { opacity: 1, offset: .97 },
    { opacity: 0 },
  ], { duration: D, iterations: Infinity });

  // Text overlay fades in once, right away — it doesn't wait on the reel.
  rises.forEach((el, i) => el.animate([
    { opacity: 0, transform: 'translateY(28px)' },
    { opacity: 1, transform: 'translateY(0px)' },
  ], { duration: 800, delay: 200 + i * 120, easing: E, fill: 'both' }));

  if (cue) cue.animate([
    { opacity: 0 },
    { opacity: 1 },
  ], { duration: 700, delay: 700, easing: E, fill: 'both' });
});
