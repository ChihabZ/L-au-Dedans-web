/**
 * modal.js — Reservation Modal
 *
 * Fixes applied:
 *  - Heure cards removed → service select + precise time input
 *  - "terrasse" renamed to "exterieur" everywhere
 *  - Date: min = today, max = 3 months ahead
 *  - Phone: exactly 10 digits (French format), strips spaces/dots
 *  - Date: blocks Mon (1) and Tue (2)
 *  - resetModal resets all fields including service/heure
 *
 * Table: reservation
 * Columns: nom_res, tel_res, date_res, heure_res, preference_res, statut_res
 */

import { supabase } from './supabase.js';

// ── Service hours config ──────────────────────────────────────
const SERVICE = {
  midi: { min: '12:00', max: '13:30', hint: 'Entre 12h00 et 13h30' },
  soir: { min: '19:30', max: '21:00', hint: 'Entre 19h30 et 21h00' },
};

// ── Selections: only preference uses card UI now ──────────────
const selections = { preference: null };

// ── Helpers ───────────────────────────────────────────────────

function showResError(msg) {
  const el = document.getElementById('resFormError');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function clearResError() {
  const el = document.getElementById('resFormError');
  if (el) el.style.display = 'none';
}

function setSubmitLoading(on) {
  const btn = document.getElementById('resSubmitBtn');
  if (!btn) return;
  btn.textContent = on ? 'Envoi en cours…' : 'Réserver ma Table';
  btn.disabled = on;
  btn.style.opacity = on ? '0.65' : '1';
}

function showSuccess() {
  document.getElementById('reserveForm').style.display = 'none';
  document.getElementById('resSuccess').style.display  = 'block';
}

// Strip all non-digit characters then check length = 10
function isValidPhone(raw) {
  return /^[0-9]{10}$/.test(raw.replace(/[\s.\-()]/g, ''));
}

// ── Open / Close ──────────────────────────────────────────────

export function openModal() {
  const modal = document.getElementById('reserveModal');
  if (!modal) return;

  resetForm();
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Date constraints: today → +90 days
  const dateInput = document.getElementById('res_date');
  if (dateInput) {
    const today  = new Date().toISOString().split('T')[0];
    const maxDay = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.max = maxDay;
  }

  setTimeout(() => document.getElementById('res_date')?.focus(), 100);
}

function closeModal() {
  document.getElementById('reserveModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function resetForm() {
  document.getElementById('reserveForm').reset();
  document.getElementById('reserveForm').style.display = 'block';
  document.getElementById('resSuccess').style.display  = 'none';

  // Reset preference cards
  selections.preference = null;
  document.querySelectorAll('.res-card').forEach(c => c.classList.remove('active'));

  // Reset heure section
  const heureWrapper = document.getElementById('heureWrapper');
  const heureInput   = document.getElementById('res_heure');
  const heureHint    = document.getElementById('heureHint');
  if (heureWrapper) heureWrapper.style.display = 'none';
  if (heureInput)   { heureInput.value = ''; heureInput.disabled = true; }
  if (heureHint)    heureHint.textContent = '';

  clearResError();
  const warn = document.getElementById('dateWarning');
  if (warn) warn.style.display = 'none';
}

// ── Init ──────────────────────────────────────────────────────

export function initModal() {
  const modal = document.getElementById('reserveModal');
  if (!modal) return;

  // Close triggers
  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Open triggers
  document.querySelectorAll('[data-open-modal]').forEach(el => {
    el.addEventListener('click', openModal);
  });
  document.addEventListener('openReservationModal', openModal);

  // ── Date validation: block Mon + Tue ─────────────────────
  document.getElementById('res_date')?.addEventListener('change', e => {
    // Add T12:00:00 to avoid timezone shifts on day boundary
    const day = new Date(e.target.value + 'T12:00:00').getDay();
    const closed = day === 1 || day === 2;
    const warn = document.getElementById('dateWarning');
    if (warn) warn.style.display = closed ? 'block' : 'none';
  });

  // ── Service select → show/update time input ───────────────
  document.getElementById('res_service')?.addEventListener('change', e => {
    const key          = e.target.value;
    const heureWrapper = document.getElementById('heureWrapper');
    const heureInput   = document.getElementById('res_heure');
    const heureHint    = document.getElementById('heureHint');

    if (key && SERVICE[key]) {
      const { min, max, hint } = SERVICE[key];
      heureInput.min      = min;
      heureInput.max      = max;
      heureInput.value    = min;   // pre-fill with service start time
      heureInput.disabled = false;
      heureWrapper.style.display = 'block';
      if (heureHint) heureHint.textContent = hint;
    } else {
      heureInput.value    = '';
      heureInput.disabled = true;
      heureWrapper.style.display = 'none';
      if (heureHint) heureHint.textContent = '';
    }
  });

  // ── Time input: enforce min/max on manual change ──────────
  document.getElementById('res_heure')?.addEventListener('change', e => {
    const key = document.getElementById('res_service')?.value;
    if (!key || !SERVICE[key]) return;
    const { min, max } = SERVICE[key];
    if (e.target.value < min) e.target.value = min;
    if (e.target.value > max) e.target.value = max;
  });

  // ── Preference card selection ──────────────────────────────
  document.querySelectorAll('.res-card[data-group="preference"]').forEach(card => {
    card.addEventListener('click', () => {
      selections.preference = card.dataset.value;
      document.querySelectorAll('.res-card[data-group="preference"]').forEach(c => {
        c.classList.toggle('active', c === card);
      });
    });
  });

  // ── Form submission ────────────────────────────────────────
  document.getElementById('reserveForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    clearResError();

    // Read values
    const date       = document.getElementById('res_date')?.value;
    const service    = document.getElementById('res_service')?.value;
    const heure      = document.getElementById('res_heure')?.value;
    const nom        = document.getElementById('res_nom')?.value.trim();
    const telRaw     = document.getElementById('res_tel')?.value;
    const preference = selections.preference;

    // Validate — in order of the form fields
    if (!date) return showResError('Veuillez choisir une date.');

    // Range check (novalidate disables browser enforcement of min/max)
    const today   = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    if (date < today)   return showResError('La date ne peut pas être dans le passé.');
    if (date > maxDate) return showResError('Réservation possible jusqu\'à 3 mois à l\'avance.');

    const day = new Date(date + 'T12:00:00').getDay();
    if (day === 1 || day === 2)
      return showResError('Le restaurant est fermé le lundi et mardi.');

    if (!service) return showResError('Veuillez choisir un service (Midi ou Soir).');
    if (!heure)   return showResError('Veuillez choisir une heure précise.');

    // Enforce heure within service range (extra safety)
    const { min, max } = SERVICE[service];
    if (heure < min || heure > max)
      return showResError(`L'heure doit être entre ${min.replace(':', 'h')} et ${max.replace(':', 'h')}.`);

    if (!preference)
      return showResError('Veuillez choisir une préférence (Intérieur ou Extérieur).');

    if (!nom) return showResError('Veuillez entrer votre nom.');

    if (!telRaw || !isValidPhone(telRaw))
      return showResError('Numéro de téléphone invalide — 10 chiffres requis (ex: 0612345678).');

    const tel = telRaw.replace(/[\s.\-()]/g, ''); // clean digits only

    setSubmitLoading(true);

    // INSERT into Supabase
    const { error } = await supabase.from('reservation').insert([{
      nom_res:        nom,
      tel_res:        tel,
      date_res:       date,
      heure_res:      heure + ':00',   // HH:MM → HH:MM:SS for Supabase time type
      preference_res: preference,
      statut_res:     'nouveau',
    }]);

    setSubmitLoading(false);

    if (error) {
      console.error('[modal] Reservation error:', error.message);
      showResError('Une erreur est survenue. Appelez-nous au 05 63 78 84 26.');
      return;
    }

    showSuccess();
  });
}
