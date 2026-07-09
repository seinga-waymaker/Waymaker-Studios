document.addEventListener('DOMContentLoaded', () => {
  const reel = document.getElementById('hero-reel');
  if (!reel) return;

  const f1 = document.querySelector('[data-frame="f1"]');
  const f2 = document.querySelector('[data-frame="f2"]');
  const f3 = document.querySelector('[data-frame="f3"]');
  const f4 = document.querySelector('[data-frame="f4"]');
  const f5 = document.querySelector('[data-frame="f5"]');
  const flash = document.querySelector('[data-frame="flash"]');
  const rises = [...document.querySelectorAll('[data-rise]')];
  const cue = document.getElementById('hero-cue');
  const section = document.getElementById('top');

  let revealed = false;
  let played = false;
  let anims = [];
  let morph = null;

  function cardGeo() {
    const mob = window.innerWidth < 760;
    return mob
      ? { top: '56px', left: '5%', width: '90%', height: '32%', borderRadius: '0px', boxShadow: 'none' }
      : { top: '0px', left: '0px', width: '50%', height: '100%', borderRadius: '0px', boxShadow: 'none' };
  }

  function killAnims(el) {
    if (!el || !el.getAnimations) return;
    el.getAnimations().forEach((a) => { try { a.cancel(); } catch (e) {} });
  }

  function applyFinal() {
    anims.forEach((a) => { try { a.cancel(); } catch (e) {} });
    [reel, f1, f2, f3, f4, f5, flash, ...rises, cue].forEach(killAnims);

    if (reel) Object.assign(reel.style, cardGeo());
    [f1, f2, f3, f4, f5].forEach((f) => { if (f) f.style.opacity = '1'; });
    if (flash) flash.style.opacity = '0';
    rises.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    if (cue) cue.style.opacity = '0';

    setTimeout(() => {
      [reel, f1, f2, f3, f4, f5, flash, ...rises, cue].forEach(killAnims);
      if (reel) Object.assign(reel.style, cardGeo());
      [f1, f2, f3, f4, f5].forEach((f) => { if (f) f.style.opacity = '1'; });
      if (flash) flash.style.opacity = '0';
      rises.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      if (cue) cue.style.opacity = '0';
    }, 60);

    revealed = true;
  }

  function syncFinalGeometry() {
    if (!revealed) return;
    if (morph) { try { morph.cancel(); } catch (e) {} }
    Object.assign(reel.style, cardGeo());
  }

  function playIntro() {
    if (played) return;
    played = true;
    anims = [];
    const E = 'cubic-bezier(.76,0,.24,1)';
    const g = cardGeo();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) { applyFinal(); return; }

    if (f4) { const v = f4.querySelector('video'); if (v) v.play().catch(() => {}); }
    if (f5) { const v = f5.querySelector('video'); if (v) v.play().catch(() => {}); }

    const track = (a) => { anims.push(a); return a; };
    const D = 6200;

    if (f2) track(f2.animate([
      { opacity: 0 }, { opacity: 0, offset: .16 }, { opacity: 1, offset: .18 }, { opacity: 1 },
    ], { duration: D, fill: 'forwards' }));
    if (f3) track(f3.animate([
      { opacity: 0 }, { opacity: 0, offset: .32 }, { opacity: 1, offset: .34 }, { opacity: 1 },
    ], { duration: D, fill: 'forwards' }));
    if (f4) track(f4.animate([
      { opacity: 0 }, { opacity: 0, offset: .48 }, { opacity: 1, offset: .50 }, { opacity: 1 },
    ], { duration: D, fill: 'forwards' }));
    if (f5) track(f5.animate([
      { opacity: 0 }, { opacity: 0, offset: .615 }, { opacity: 1, offset: .62 }, { opacity: 1 },
    ], { duration: D, fill: 'forwards' }));
    if (flash) track(flash.animate([
      { opacity: 0 }, { opacity: 0, offset: .60 }, { opacity: 1, offset: .62 },
      { opacity: 1, offset: .65 }, { opacity: 0, offset: .67 }, { opacity: 0 },
    ], { duration: D, fill: 'forwards' }));

    morph = track(reel.animate([
      { top: '0px', left: '0px', width: '100%', height: '100%', borderRadius: '0px', boxShadow: '0 0 0 rgba(0,0,0,0)' },
      { top: g.top, left: g.left, width: g.width, height: g.height, borderRadius: g.borderRadius, boxShadow: g.boxShadow },
    ], { duration: 1350, delay: 4300, easing: E, fill: 'both' }));
    morph.onfinish = () => { revealed = true; Object.assign(reel.style, g); };

    rises.forEach((el, i) => track(el.animate([
      { opacity: 0, transform: 'translateY(28px)' },
      { opacity: 1, transform: 'translateY(0px)' },
    ], { duration: 900, delay: 4450 + i * 140, easing: E, fill: 'both' })));

    if (cue) track(cue.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 4250, fill: 'forwards' }));

    if (section) section.addEventListener('click', () => {
      if (revealed) return;
      anims.forEach((a) => { try { a.finish(); } catch (e) {} });
    });

    let rafOk = false;
    requestAnimationFrame(() => { rafOk = true; });
    setTimeout(() => { if (!rafOk) applyFinal(); }, 300);
    setTimeout(() => { if (!revealed) applyFinal(); }, 6000);
  }

  setTimeout(playIntro, 0);
  window.addEventListener('resize', syncFinalGeometry);
});
