/**
 * responsive.js — Responsive Layout Adjustments
 *
 * Handles CSS grid column collapses that can't be done in CSS alone
 * because grid items have inline styles from JS-rendered content.
 *
 * All listeners use { passive: true } where possible.
 */

export function initResponsive() {
  // ── Vins section — 2-col grid ────────────────────────────
  const vinsGrid = document.getElementById('vinsGrid');
  function checkVins() {
    if (!vinsGrid) return;
    vinsGrid.style.gridTemplateColumns = window.innerWidth < 640 ? '1fr' : '1fr 1fr';
  }

  // ── Horaires section — 2-col grid ───────────────────────
  const horairesGrid = document.getElementById('horairesGrid');
  function checkHoraires() {
    if (!horairesGrid) return;
    horairesGrid.style.gridTemplateColumns = window.innerWidth < 640 ? '1fr' : '1fr 1fr';
  }

  // ── À Propos contact form — inner 2-col ─────────────────
  // Targets the name/email row inside the contact form
  const contactFormGrid = document.querySelector('#apropos .faq-contact-grid > div:last-child [style*="grid-template-columns:1fr 1fr"]');
  function checkContactInner() {
    if (!contactFormGrid) return;
    contactFormGrid.style.gridTemplateColumns = window.innerWidth < 480 ? '1fr' : '1fr 1fr';
  }

  // ── Run all on load and resize ───────────────────────────
  function runAll() {
    checkVins();
    checkHoraires();
    checkContactInner();
  }

  runAll();
  window.addEventListener('resize', runAll);
}
