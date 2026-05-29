/**
 * nav.js — Navbar & Mobile Menu
 *
 * Responsibilities:
 *  - Show/hide the desktop "Réserver" button based on viewport
 *  - Toggle the full-screen mobile overlay menu
 *  - Apply a more opaque background to the navbar when user scrolls
 *
 * Supabase hooks (future):
 *  - None planned for this module
 */

export function initNav() {
  // ── Desktop reserve button visibility ──────────────────────
  const navReserveBtn = document.getElementById('navReserveBtn');
  if (navReserveBtn) {
    const updateBtn = () => {
      navReserveBtn.style.display = window.innerWidth >= 768 ? 'block' : 'none';
    };
    updateBtn();
    window.addEventListener('resize', updateBtn);
  }

  // ── Mobile menu toggle ──────────────────────────────────────
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMobileMenu() {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  }

  hamburger?.addEventListener('click', toggleMobileMenu);

  // Close button inside the mobile menu
  document.getElementById('mobileClose')?.addEventListener('click', closeMobileMenu);

  // Nav links inside mobile menu auto-close on click
  mobileMenu?.querySelectorAll('.mob-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Mobile "Réserver" button → open modal then close menu
  document.getElementById('mobileReserveBtn')?.addEventListener('click', () => {
    closeMobileMenu();
    // modal.js listens for [data-open-modal] clicks; dispatch a custom event instead
    document.dispatchEvent(new CustomEvent('openReservationModal'));
  });

  // ── Navbar scroll effect ────────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.style.background = window.scrollY > 80
      ? 'rgba(17,24,32,0.96)'
      : 'rgba(17,24,32,0.88)';
  }, { passive: true });
}
