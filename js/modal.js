/**
 * modal.js — Reservation Modal
 *
 * Responsibilities:
 *  - Open/close the reservation modal overlay
 *  - Basic client-side form validation
 *  - Submit handler (currently shows success state — replace with Supabase call)
 *
 * Supabase hooks (future):
 *  - submitReservation() → insert row into `reservations` table
 *  - Add real-time availability check before confirming
 */

export function initModal() {
  const modal = document.getElementById('reserveModal');
  if (!modal) return;

  // ── Open ────────────────────────────────────────────────────
  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Set minimum bookable date to today
    const dateInput = document.getElementById('resDate');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    // Focus first field for accessibility
    setTimeout(() => document.getElementById('resNom')?.focus(), 100);
  }

  // ── Close ───────────────────────────────────────────────────
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── Triggers ────────────────────────────────────────────────
  // All elements with [data-open-modal] open the reservation modal
  document.querySelectorAll('[data-open-modal]').forEach(el => {
    el.addEventListener('click', openModal);
  });

  // Custom event from nav.js (mobile reserve button)
  document.addEventListener('openReservationModal', openModal);

  // Close button inside modal
  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);

  // Click on the dark backdrop closes modal
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Escape key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ── Form submission ─────────────────────────────────────────
  const form = document.getElementById('reserveForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const nom = document.getElementById('resNom')?.value.trim();
    const tel = document.getElementById('resTel')?.value.trim();

    if (!nom || !tel) {
      alert('Veuillez remplir les champs obligatoires (Nom et Téléphone).');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    // ── TODO (Supabase): replace the block below with a real insert ──
    // const { error } = await supabase.from('reservations').insert([{
    //   nom, prenom: ..., telephone: tel, email: ...,
    //   date: ..., service: ..., personnes: ..., message: ...
    // }]);
    // if (error) { alert('Erreur lors de la réservation.'); return; }
    // ────────────────────────────────────────────────────────────────

    // Temporary success feedback
    submitBtn.textContent = 'Demande envoyée ✓';
    submitBtn.style.background = '#2a9d5c';
    setTimeout(() => {
      closeModal();
      submitBtn.textContent = 'Envoyer ma Demande';
      submitBtn.style.background = '';
    }, 2500);
  });
}
