/**
 * faq.js — FAQ Accordion
 *
 * Responsibilities:
 *  - Toggle open/close state on FAQ items with smooth animation
 *  - Update ARIA attributes and the +/− icon
 *
 * Supabase hooks (future):
 *  - FAQ items could be managed from the admin dashboard
 *    via a `faq_items` table (question, answer, order, active)
 */

export function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const icon   = btn.querySelector('.faq-icon');
      const isOpen = answer.classList.toggle('open');

      icon.textContent = isOpen ? '−' : '+';
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}
