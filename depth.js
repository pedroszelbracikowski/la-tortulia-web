/* Scroll keeps its native behavior. Desktop reveals a horizontal editorial track;
   touch and reduced-motion layouts use an ordinary, swipeable horizontal region. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = window.matchMedia('(min-width: 1024px) and (min-height: 720px) and (hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const intro = document.querySelector('.intro');
  const run = document.querySelector('.journey-run');
  const pin = document.querySelector('.journey-pin');
  const viewport = document.querySelector('.journey-viewport');
  const track = document.querySelector('.journey-track');
  const panels = [...document.querySelectorAll('.journey-panel')];
  const links = [...document.querySelectorAll('[data-scene-target]')];
  const steps = [...document.querySelectorAll('[data-journey-step]')];
  const contact = document.querySelector('.contact');
  const brand = document.querySelector('[data-fit-brand]');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const set = (el, name, value) => el.style.setProperty(name, value);
  let enhanced = false, scheduled = false, active = -1, metrics = {};
  let navigationY = Math.max(0, window.scrollY);
  const followScrollDirection = () => {
    // Ignore tiny movements and elastic overscroll so the header never flickers.
    const y = clamp(window.scrollY, 0, Math.max(0, root.scrollHeight - window.innerHeight));
    if (document.body.classList.contains('dialog-open')) { navigationY = y; return; }
    const distance = y - navigationY;
    if (y <= 16) {
      root.classList.remove('header-hidden');
      navigationY = y;
    } else if (Math.abs(distance) >= 8) {
      root.classList.toggle('header-hidden', distance > 0);
      navigationY = y;
    }
  };
  window.addEventListener('scroll', followScrollDirection, { passive: true });

  function fitBrand() {
    if (!brand) return;
    const available = brand.parentElement.clientWidth - 4;
    if (available <= 0) return;
    brand.style.fontSize = '100px';
    const width = brand.getBoundingClientRect().width;
    if (width <= 0) return;
    const size = 100 * available / width;
    brand.style.fontSize = `${size}px`;
    // Verify the final size too, allowing for font rounding and fallback metrics.
    const fittedWidth = brand.getBoundingClientRect().width;
    if (fittedWidth > available) brand.style.fontSize = `${size * available / fittedWidth}px`;
  }
  function measure() {
    enhanced = wide.matches && !reduced.matches;
    root.classList.toggle('horizontal-journey', enhanced);
    root.classList.toggle('depth-motion', !reduced.matches);
    fitBrand();
    const top = el => el.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, track.scrollWidth - viewport.clientWidth);
    if (enhanced) {
      run.style.setProperty('--journey-run-height', `${pin.offsetHeight + travel}px`);
      viewport.scrollLeft = 0;
    } else {
      run.style.removeProperty('--journey-run-height');
      track.style.removeProperty('--journey-x');
      intro.style.removeProperty('--intro-photo-y');
      contact.style.removeProperty('--contact-photo-y');
      panels.forEach(panel => panel.style.removeProperty('--photo-zoom'));
    }
    metrics = {
      vh: window.innerHeight, travel, starts: panels.map(panel => panel.offsetLeft),
      introTop: top(intro), introHeight: intro.offsetHeight, runTop: top(run) - header.offsetHeight, runHeight: run.offsetHeight,
      contactTop: top(contact), contactHeight: contact.offsetHeight,
      pageRange: Math.max(1, root.scrollHeight - window.innerHeight)
    };
    queue();
    document.dispatchEvent(new CustomEvent('patio:layout'));
  }
  function updateChapter(x) {
    let next = 0;
    metrics.starts.forEach((start, index) => { if (x + viewport.clientWidth * .48 >= start) next = index; });
    if (next !== active) {
      active = next;
      links.forEach((link, index) => index === active ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current'));
    }
    steps.forEach(button => { button.disabled = Number(button.dataset.journeyStep) < 0 ? x < 2 : x > metrics.travel - 2; });
  }
  function draw() {
    scheduled = false;
    const y = window.scrollY, m = metrics;
    if (!m.vh) return;
    header.classList.toggle('is-scrolled', y > 16);
    set(root, '--read-progress', clamp(y / m.pageRange).toFixed(4));
    const x = enhanced ? clamp(y - m.runTop, 0, m.travel) : viewport.scrollLeft;
    if (enhanced) set(track, '--journey-x', `${-x.toFixed(2)}px`);
    updateChapter(x);
    if (!enhanced) return;
    if (y + m.vh >= m.introTop - 100 && y <= m.introTop + m.introHeight + 100) {
      const p = clamp((y + m.vh - m.introTop) / (m.introHeight + m.vh));
      set(intro, '--intro-photo-y', `${lerp(-25, 25, p).toFixed(1)}px`);
    }
    if (y + m.vh >= m.runTop - 100 && y <= m.runTop + m.runHeight + 100) {
      panels.forEach((panel, index) => {
        const p = clamp((x - m.starts[index]) / viewport.clientWidth, -1, 1);
        set(panel, '--photo-zoom', (1.02 + Math.abs(p) * .025).toFixed(4));
      });
    }
    const cp = clamp((y + m.vh - m.contactTop) / (m.contactHeight + m.vh));
    set(contact, '--contact-photo-y', `${lerp(-50, 50, cp).toFixed(1)}px`);
  }
  function queue() { if (!scheduled) { scheduled = true; requestAnimationFrame(draw); } }
  function visit(index, smooth = true) {
    index = clamp(index, 0, panels.length - 1);
    const x = Math.min(metrics.starts[index], metrics.travel);
    const behavior = smooth && !reduced.matches ? 'smooth' : 'auto';
    if (enhanced) {
      viewport.scrollLeft = 0;
      window.scrollTo({top:metrics.runTop + x, behavior});
    } else viewport.scrollTo({left:x, behavior});
  }
  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    visit(Number(link.dataset.sceneTarget));
    history.replaceState(null, '', link.getAttribute('href'));
  }));
  steps.forEach(button => button.addEventListener('click', () => visit(active + Number(button.dataset.journeyStep))));
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport) return;
    const targets = {ArrowLeft:active - 1, ArrowRight:active + 1, Home:0, End:panels.length - 1};
    if (!(event.key in targets)) return;
    event.preventDefault();visit(targets[event.key]);
  });
  panels.forEach((panel, index) => panel.addEventListener('focusin', () => { if (enhanced && active !== index) visit(index, false); }));
  viewport.addEventListener('scroll', () => { if (!enhanced) queue(); }, {passive:true});
  window.addEventListener('scroll', queue, {passive:true});
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,120); }, {passive:true});
  const followHash = () => { const i=panels.findIndex(panel => `#${panel.id}`===location.hash);if(i>=0){visit(i,false);if(!enhanced)run.scrollIntoView({block:'start',behavior:'instant'});} };
  window.addEventListener('load', () => {measure();followHash();});
  window.addEventListener('hashchange', followHash);
  reduced.addEventListener('change', measure);
  wide.addEventListener('change', measure);
  if (document.fonts) {
    document.fonts.ready.then(measure);
    document.fonts.addEventListener('loadingdone', measure);
  }
  measure();

  // Silent background films pause offscreen and respect reduced motion and data saving.
  const videos = [...document.querySelectorAll('.ambient-video')];
  const states = new WeakMap();
  const saveData = navigator.connection?.saveData === true;
  function loadVideo(video) {if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}}
  function play(video) {loadVideo(video);const pending=video.play();if(pending)pending.catch(()=>{});}
  function autoplay(video) {
    const state=states.get(video);
    if (state.visible && !document.hidden && !document.body.classList.contains('dialog-open') && !state.failed && !reduced.matches && !saveData) play(video);
    else video.pause();
  }
  const videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry=>{const state=states.get(entry.target);state.visible=entry.isIntersecting&&entry.intersectionRatio>=.25;autoplay(entry.target);});
  },{threshold:[0,.25,.5]}) : null;
  videos.forEach(video=>{
    states.set(video,{visible:false,failed:false});
    video.muted=true;
    video.addEventListener('error',()=>{states.get(video).failed=true;video.pause();});
    if(videoObserver)videoObserver.observe(video);
  });
  document.addEventListener('visibilitychange',()=>videos.forEach(autoplay));
  reduced.addEventListener('change',()=>videos.forEach(autoplay));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('patio:dialogopen', () => videos.forEach(autoplay));
    dialog.addEventListener('close', () => videos.forEach(autoplay));
  });
})();
