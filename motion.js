/* GSAP reveals enhance a fully visible, usable page. No scroll interception. */
(() => {
  // The supplied artwork is decorative and stays complete without animation support.
  const botanicalTemplate = document.querySelector('#patio-botanical-template');
  document.querySelectorAll('[data-botanical]').forEach(branch => {
    if (botanicalTemplate && !branch.querySelector('svg')) branch.append(botanicalTemplate.content.cloneNode(true));
  });
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-ready');

  const headings = [...document.querySelectorAll('[data-animate-title]')];
  headings.forEach(heading => {
    const masks = [...heading.children].filter(child => child.matches('span, em'));
    heading.setAttribute('aria-label', masks.map(mask => mask.textContent.trim()).join(' '));
    masks.forEach(mask => {
      mask.classList.add('type-mask');
      mask.setAttribute('aria-hidden', 'true');
      const line = document.createElement('span');
      line.className = 'type-line';
      while (mask.firstChild) line.append(mask.firstChild);
      mask.append(line);
    });
  });

  // Navigation state follows the section even when the visitor reduces motion.
  document.querySelectorAll('.desktop-nav a').forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 35%', end: 'bottom 35%',
      onToggle: self => self.isActive ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current')
    });
  });

  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', context => {
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const duration = mobile ? .85 : 1.25;
    const open = 'inset(0% 0% 0% 0%)';
    const closed = 'inset(0% 0% 100% 0%)';
    const lines = heading => [...heading.querySelectorAll('.type-line')];
    const titleStart = { yPercent: 108, autoAlpha: 0 };
    const titleEnd = { yPercent: 0, autoAlpha: 1, duration: mobile ? .8 : 1.1, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity,visibility' };

    // Reveal the light-green watermark from the stem upward, without leaf outlines.
    const drawBotanical = (branch, paused = true) => {
      const stem = branch.querySelector('.botanical-stem');
      const leaves = [...branch.querySelectorAll('.botanical-leaf')].sort((a, b) => a.dataset.leafOrder - b.dataset.leafOrder);
      const paths = [stem, ...leaves];
      const fill = Number.parseFloat(getComputedStyle(branch).getPropertyValue('--botanical-fill')) || 1;
      gsap.set(stem, { strokeDasharray: '1 1', strokeDashoffset: 1 });
      gsap.set(leaves, { fillOpacity: 0 });
      // Normalized path lengths need fractional offsets, without CSS pixel rounding.
      const drawing = gsap.timeline({ id: `patio-branch-${branch.dataset.botanical}`, paused, defaults: { autoRound: false } });
      drawing.to(stem, { strokeDashoffset: 0, duration: 2.1, ease: 'power1.inOut' }, 0);
      leaves.forEach((leaf, index) => {
        const start = .35 + index * .17;
        drawing.to(leaf, { fillOpacity: fill, duration: 1, ease: 'sine.inOut' }, start);
      });
      drawing.set(paths, { clearProps: 'strokeDasharray,strokeDashoffset,fillOpacity' });
      return drawing;
    };
    document.querySelectorAll('[data-botanical]:not(.botanical--menu)').forEach(branch => {
      const drawing = drawBotanical(branch);
      ScrollTrigger.create({ trigger: branch, start: 'top 82%', once: true, onEnter: () => drawing.play() });
    });

    const opening = gsap.timeline({ defaults: { ease: 'power3.out' } });
    opening
      .fromTo('.hero-film', { autoAlpha: 0, scale: 1.025 }, { autoAlpha: 1, scale: 1, duration: duration + .25, clearProps: 'transform,opacity,visibility' }, 0)
      .fromTo('.hero-copy > .eyebrow', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .65, clearProps: 'transform,opacity,visibility' }, .1)
      .fromTo(lines(document.querySelector('#hero-title')), titleStart, titleEnd, .2)
      .fromTo('.hero-intro > p, .hero-cta', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .08, clearProps: 'transform,opacity,visibility' }, .45);

    headings.filter(heading => !heading.closest('.hero, .journey-panel, .contact-scene')).forEach(heading => {
      gsap.fromTo(lines(heading), titleStart, {
        ...titleEnd,
        scrollTrigger: { trigger: heading, start: 'top 88%', once: true }
      });
    });

    document.querySelectorAll('.intro-photo-window, .intro-satellite, .detail-video-wrap').forEach((frame, index) => {
      const fromClip = index === 1 ? 'inset(0% 100% 0% 0%)' : closed;
      gsap.fromTo(frame, { clipPath: fromClip }, {
        clipPath: open, duration, ease: 'power3.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: frame, start: 'top 88%', once: true }
      });
    });
    document.querySelectorAll('.section-top, .intro-text, .occasion-list, .contact-info > div').forEach(block => {
      gsap.fromTo(block, { y: mobile ? 18 : 30, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: block, start: 'top 91%', once: true }
      });
    });

    // The closing spread unfolds as one composition, with room between each entrance.
    const invitation = document.querySelector('.contact-scene');
    gsap.timeline({ scrollTrigger: { trigger: invitation, start: 'top 78%', once: true } })
      .fromTo(invitation.querySelector('.contact-portrait'), { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: open, duration: mobile ? 1.05 : 1.6, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
      .fromTo(invitation.querySelector('.contact-detail'), { clipPath: closed }, { clipPath: open, duration: mobile ? .95 : 1.35, ease: 'power3.inOut', clearProps: 'clipPath' }, .2)
      .fromTo(lines(invitation.querySelector('h2')), titleStart, { ...titleEnd, duration: mobile ? .9 : 1.25, stagger: .18 }, .38)
      .fromTo(invitation.querySelectorAll('.contact-note, .contact-cta'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .14, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, .9);

    // Observing the full cards handles both transformed desktop chapters and native swipes.
    const cardAnimations = new Map();
    document.querySelectorAll('.journey-panel').forEach((panel, index) => {
      const photo = panel.querySelector('.journey-photo');
      const detail = panel.querySelector('.journey-detail');
      const titleLines = lines(panel.querySelector('.journey-title'));
      const copy = panel.querySelector('.journey-copy');
      const photoClosed = index === 1 ? 'inset(0% 100% 0% 0%)' : closed;
      gsap.set(photo, { clipPath: photoClosed });
      gsap.set(detail, { clipPath: closed });
      gsap.set(titleLines, titleStart);
      gsap.set(copy, { y: 18, autoAlpha: 0 });
      const timeline = gsap.timeline({ paused: true });
      timeline
        .to(photo, { clipPath: open, duration, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
        .to(titleLines, titleEnd, .13)
        .to(detail, { clipPath: open, duration: duration * .9, ease: 'power3.inOut', clearProps: 'clipPath' }, .25)
        .to(copy, { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, .35);
      cardAnimations.set(panel, timeline);
    });
    document.querySelectorAll('.gallery-item').forEach(card => {
      const frame = card.querySelector('.gallery-image');
      const caption = card.querySelector('.gallery-caption');
      gsap.set(frame, { clipPath: closed });
      gsap.set(caption, { y: 16, autoAlpha: 0 });
      cardAnimations.set(card, gsap.timeline({ paused: true })
        .to(frame, { clipPath: open, duration, ease: 'power3.inOut', clearProps: 'clipPath' })
        .to(caption, { y: 0, autoAlpha: 1, duration: .65, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, .3));
    });
    let cardObserver;
    if ('IntersectionObserver' in window) {
      cardObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            cardAnimations.get(entry.target)?.play();
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: .16 });
      cardAnimations.forEach((animation, card) => cardObserver.observe(card));
    } else cardAnimations.forEach(animation => animation.play());

    const menu = document.querySelector('#menu-dialog');
    const inquiry = document.querySelector('#inquiry-dialog');
    const menuBranch = menu.querySelector('[data-botanical]');
    let menuOpening, menuClosing, formOpening, formClosing, finishMenuClose, finishFormClose;
    const resetMenu = () => gsap.set([menu, menu.querySelector('.dialog-top'), ...menu.querySelectorAll('nav a'), menu.querySelector('.menu-image'), menuBranch], { clearProps: 'transform,opacity,visibility,clipPath' });
    const formFields = inquiry.querySelectorAll('form label, .form-note, .submit-button');
    const formHeading = inquiry.querySelectorAll('.dialog-top, h2, :scope > p');
    const resetForm = () => gsap.set([inquiry, ...formHeading, ...formFields], { clearProps: 'transform,opacity,visibility,clipPath' });
    context.add('openMenu', () => {
      menuOpening?.kill();
      menuClosing?.kill();
      resetMenu();
      menuOpening = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: open, duration: mobile ? .65 : .85, ease: 'power3.inOut', clearProps: 'clipPath' })
        .fromTo(menu.querySelectorAll('nav a'), { y: 45, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .8, stagger: .065, clearProps: 'transform,opacity,visibility' }, .2)
        .fromTo(menu.querySelector('.menu-image'), { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: open, duration: .9, ease: 'power3.inOut', clearProps: 'clipPath' }, .25)
        .add(drawBotanical(menuBranch, false), .3);
    });
    context.add('closeMenu', event => {
      event.preventDefault();
      menuOpening?.kill();
      menuClosing?.kill();
      finishMenuClose = event.detail.complete;
      menu.classList.add('is-closing');
      menuClosing = gsap.timeline({
        id: 'patio-menu-close',
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          const complete = finishMenuClose;
          finishMenuClose = null;
          complete?.();
          resetMenu();
        }
      })
        .to(menu.querySelectorAll('nav a'), { y: -18, autoAlpha: 0, duration: .24, stagger: { each: .025, from: 'end' } }, 0)
        .to(menu.querySelector('.menu-image'), { clipPath: 'inset(0% 50% 0% 50%)', duration: .42 }, .04)
        .to(menuBranch, { autoAlpha: 0, duration: .32 }, 0)
        .to(menu.querySelector('.dialog-top'), { y: -8, autoAlpha: 0, duration: .2 }, .08)
        .to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: mobile ? .45 : .55, ease: 'power3.inOut' }, .12);
    });
    context.add('openForm', () => {
      formOpening?.kill();
      formClosing?.kill();
      resetForm();
      formOpening = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(inquiry, { y: 32, autoAlpha: 0, clipPath: 'inset(6% 0% 6% 0%)' }, { y: 0, autoAlpha: 1, clipPath: open, duration: .7, clearProps: 'transform,opacity,visibility,clipPath' })
        .fromTo(inquiry.querySelector('h2'), { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .65, clearProps: 'transform,opacity,visibility' }, .12)
        .fromTo(formFields, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .025, clearProps: 'transform,opacity,visibility' }, .2);
    });
    context.add('closeForm', event => {
      event.preventDefault();
      formOpening?.kill();
      formClosing?.kill();
      finishFormClose = event.detail.complete;
      inquiry.classList.add('is-closing');
      formClosing = gsap.timeline({
        id: 'patio-form-close',
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
          const complete = finishFormClose;
          finishFormClose = null;
          complete?.();
          resetForm();
        }
      })
        .to(formFields, { y: 10, autoAlpha: 0, duration: .24, stagger: { each: .012, from: 'end' } }, 0)
        .to(formHeading, { y: -6, autoAlpha: 0, duration: .26 }, .05)
        .to(inquiry, { y: mobile ? 18 : 24, autoAlpha: 0, clipPath: 'inset(6% 0% 6% 0%)', duration: mobile ? .45 : .55 }, .1);
    });
    menu.addEventListener('patio:dialogopen', context.openMenu);
    menu.addEventListener('patio:dialogclose', context.closeMenu);
    inquiry.addEventListener('patio:dialogopen', context.openForm);
    inquiry.addEventListener('patio:dialogclose', context.closeForm);
    return () => {
      cardObserver?.disconnect();
      menu.removeEventListener('patio:dialogopen', context.openMenu);
      menu.removeEventListener('patio:dialogclose', context.closeMenu);
      finishMenuClose?.();
      finishMenuClose = null;
      inquiry.removeEventListener('patio:dialogopen', context.openForm);
      inquiry.removeEventListener('patio:dialogclose', context.closeForm);
      finishFormClose?.();
      finishFormClose = null;
    };
  });

  let refreshFrame;
  const refresh = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.addEventListener('patio:layout', refresh);
  window.addEventListener('load', refresh, { once: true });
  if (document.fonts) document.fonts.ready.then(refresh);
})();
