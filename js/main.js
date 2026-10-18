(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  // Hero slider
  const hero = document.querySelector('.hero-slides');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero-slide')];
    let current = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer;
    const showSlide = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    };
    document.querySelector('.slide-previous')?.addEventListener('click', () => showSlide(current - 1));
    document.querySelector('.slide-next')?.addEventListener('click', () => showSlide(current + 1));
    const startSlideshow = () => {
      window.clearInterval(timer);
      if (!reducedMotion && !document.hidden) timer = window.setInterval(() => showSlide(current + 1), 5500);
    };
    document.addEventListener('visibilitychange', startSlideshow);
    startSlideshow();
  }
  // Theme switcher
  const savedTheme = localStorage.getItem('orbit-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') root.dataset.theme = savedTheme;

  function updateThemeControl() {
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.append(themeMeta);
    }
    themeMeta.content = root.dataset.theme === 'dark' ? '#101827' : '#FAF7F0';
    if (!themeButton) return;
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    themeButton.querySelector('.theme-icon').textContent = dark ? '☼' : '◐';
  }
  updateThemeControl();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('orbit-theme', root.dataset.theme);
    updateThemeControl();
  });

  // Mobile menu
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }));

  // Back to top
  const backTop = document.querySelector('.back-top');
  const setBackTop = () => backTop?.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', setBackTop, { passive: true });
  setBackTop();
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Portfolio filters
  const filters = document.querySelectorAll('.filter-button');
  const projects = document.querySelectorAll('.portfolio-project');
  function applyProjectFilter(category, writeUrl = false) {
    const button = [...filters].find(filter => filter.dataset.filter === category) || [...filters].find(filter => filter.dataset.filter === 'all');
    if (!button) return;
    filters.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    projects.forEach(project => {
      project.hidden = button.dataset.filter !== 'all' && !project.dataset.category.split(' ').includes(button.dataset.filter);
    });
    if (writeUrl) {
      const params = new URLSearchParams(window.location.search);
      if (button.dataset.filter === 'all') params.delete('work');
      else params.set('work', button.dataset.filter);
      const query = params.toString();
      history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    }
  }
  const requestedFilter = new URLSearchParams(window.location.search).get('work');
  applyProjectFilter(requestedFilter || 'all');
  filters.forEach(button => button.addEventListener('click', () => applyProjectFilter(button.dataset.filter, true)));

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = Number(entry.target.dataset.count);
        const start = performance.now();
        const duration = 1000;
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          entry.target.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else counters.forEach(counter => { counter.textContent = counter.dataset.count; });

  // Contact form
  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const checks = [
      ['name', value => value.trim().length >= 2, 'Please enter at least two characters.'],
      ['email', value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()), 'Enter a valid email address.'],
      ['project', value => Boolean(value), 'Choose the closest project type.'],
      ['message', value => value.trim().length >= 12, 'Please add a little more detail (12 characters minimum).']
    ];
    let firstInvalid = null;
    checks.forEach(([name, validate, message]) => {
      const field = form.elements.namedItem(name);
      const error = document.getElementById(`${name}-error`);
      const valid = validate(field.value);
      field.setAttribute('aria-invalid', String(!valid));
      error.textContent = valid ? '' : message;
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    form.querySelector('.form-success').hidden = false;
    form.querySelector('.form-submit').textContent = 'Note ready ✓';
  });
  form?.querySelectorAll('input,textarea,select').forEach(field => {
    ['input', 'change'].forEach(eventName => field.addEventListener(eventName, () => {
      if (field.getAttribute('aria-invalid') === 'true') {
        field.setAttribute('aria-invalid', 'false');
        const error = document.getElementById(`${field.name}-error`);
        if (error) error.textContent = '';
      }
    }));
  });
})();
