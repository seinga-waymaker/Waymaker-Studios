// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.nav-hamburger');

  if (header && hamburger) {
    hamburger.addEventListener('click', () => {
      header.classList.toggle('nav-open');
    });

    document.querySelectorAll('.mobile-menu .nav-link, .mobile-menu .nav-cta').forEach((link) => {
      link.addEventListener('click', () => header.classList.remove('nav-open'));
    });
  }

  // Services accordion (services.html only)
  document.querySelectorAll('.service-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.service-item');
      const isOpen = item.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
});
