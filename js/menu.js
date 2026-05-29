/**
 * menu.js — Dynamic menu from Supabase
 *
 * Table : Menu_items
 * Columns used:
 *   nom_item         text    — dish or wine name
 *   description_item text    — short note, e.g. "sauce chien" (nullable)
 *   prix_item        numeric — price, e.g. 13.5
 *   categorie_item   text    — "MENU MATIN" | "MENU MIDI" | "MENU SOIR" | "MENU ENFANTS" | "NOS VINS"
 *   type_item        text    — "food" | "wine"
 *   index_item       int     — sort order (ASC)
 *
 * Wine columns convention (no rouge/blanc field in DB):
 *   Put Rouges at index 1-10, Blancs at 11-20.
 *   The array is split at its midpoint — first half → left col, second half → right col.
 *
 * Admin dashboard hook (future):
 *   Any INSERT / UPDATE / DELETE on Menu_items will be reflected on next tab load
 *   because each tab fetches fresh from Supabase (with a cache that clears on admin save).
 */

import { supabase } from './supabase.js';

// ── Constants ─────────────────────────────────────────────────────────────────

const TABLE = 'Menu_items';

// Maps the HTML data-tab value → Supabase categorie_item value
const TAB_CATEGORY = {
  matin:  'MENU MATIN',
  midi:   'MENU MIDI',
  soir:   'MENU SOIR',
  enfant: 'MENU ENFANTS',
};

// ── Price formatter ───────────────────────────────────────────────────────────

// 13.5  → "13,50€"
// 7     → "7€"
// 48    → "48€"
function formatPrice(value) {
  const n = Number(value);
  return n === Math.floor(n)
    ? n + '€'
    : n.toFixed(2).replace('.', ',') + '€';
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function menuItemHTML(item) {
  return `
    <div class="menu-item">
      <div>
        <div class="menu-item-name">${item.nom_item}</div>
        ${item.description_item
          ? `<div class="menu-item-desc">${item.description_item}</div>`
          : ''}
      </div>
      <div class="menu-item-price">${formatPrice(item.prix_item)}</div>
    </div>`;
}

function loadingHTML() {
  return `
    <div style="padding:4rem;text-align:center">
      <p class="f-logo" style="font-size:0.68rem;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.25);animation:scrollPulse 1.5s ease-in-out infinite">
        Chargement du menu…
      </p>
    </div>`;
}

function errorHTML(msg) {
  return `
    <div style="padding:4rem;text-align:center">
      <p class="f-logo" style="font-size:0.68rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(196,30,58,0.7)">
        ${msg}
      </p>
    </div>`;
}

function emptyHTML() {
  return `
    <div style="padding:4rem;text-align:center">
      <p class="f-display" style="font-size:1.2rem;font-style:italic;color:rgba(255,255,255,0.3)">
        Menu en cours de mise à jour…
      </p>
    </div>`;
}

// The "Nos Offres" + "Formule du Jour" + "Menu Enfant" cards are kept
// hardcoded for now (not yet in the DB). Move them to a `formules` table later.
function formulesHTML() {
  return `
    <div class="formule-card">
      <p class="f-logo" style="font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1.2rem">Nos Offres</p>
      <div class="menu-item"><div class="menu-item-name">Entrée · Plat · Dessert</div><div class="menu-item-price">19,50€</div></div>
      <div class="menu-item"><div class="menu-item-name">Entrée · Plat</div><div class="menu-item-price">17,50€</div></div>
      <div class="menu-item"><div class="menu-item-name">Plat · Dessert</div><div class="menu-item-price">17,50€</div></div>
      <div class="menu-item">
        <div><div class="menu-item-name">Plat du Jour</div><div class="menu-item-desc">Sauf jours fériés</div></div>
        <div class="menu-item-price">15,50€</div>
      </div>
    </div>

    <div class="formule-card" style="margin-top:1.2rem">
      <p class="f-logo" style="font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem">Formule du Jour</p>
      <p class="f-display" style="font-size:1.1rem;font-style:italic;color:var(--gold);margin-bottom:0.5rem">Entrée</p>
      <p style="font-size:0.83rem;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:0.9rem">
        Couteaux grillés persillés <em>ou</em> Poêlée de Moules et coquillages
      </p>
      <p class="f-display" style="font-size:1.1rem;font-style:italic;color:var(--gold);margin-bottom:0.5rem">Plat</p>
      <p style="font-size:0.83rem;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:0.9rem">
        Aïoli du midi <em>ou</em> Veau Fermier d'ici — Frites fraîches Maison
        <span style="color:var(--gold)">+3€</span>
      </p>
      <p class="f-display" style="font-size:1.1rem;font-style:italic;color:var(--gold);margin-bottom:0.5rem">Dessert</p>
      <p style="font-size:0.83rem;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:0.6rem">
        Dessert du jour <em>ou</em> 1 boule Glace Maison <em>ou</em> Mini Café Gourmand
        <span style="color:var(--gold)">+3€</span>
      </p>
      <div class="menu-item" style="border-top:1px solid rgba(212,175,55,0.15);margin-top:0.6rem">
        <div class="menu-item-name">Panier de Frites</div>
        <div class="menu-item-price">6€</div>
      </div>
    </div>

    <div class="formule-card" style="margin-top:1.2rem">
      <p class="f-logo" style="font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem">
        Menu Enfant
        <span class="f-price" style="margin-left:0.5rem;color:var(--gold)">13,50€</span>
      </p>
      <p style="font-size:0.78rem;color:rgba(255,255,255,0.4);font-style:italic;margin-bottom:0.8rem">Pour les moins de 12 ans</p>
      <p style="font-size:0.83rem;color:rgba(255,255,255,0.6);line-height:1.7">
        Entrée : Sirop ou Diabolo<br>
        Plat : Poisson Pané Maison ou Moules Frites Maison<br>
        Dessert : Glaces maison
      </p>
    </div>`;
}

// Full tab panel: items left, formules right (2-col grid)
function tabPanelHTML(items) {
  if (!items.length) return emptyHTML();

  return `
    <div class="menu-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:2.5rem 4rem">
      <div class="menu-items-col">
        ${items.map(menuItemHTML).join('')}
      </div>
      <div class="menu-formules-col">
        ${formulesHTML()}
      </div>
    </div>`;
}

// ── Supabase fetches ──────────────────────────────────────────────────────────

async function fetchTabItems(tabName) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('nom_item, description_item, prix_item, index_item')
    .eq('categorie_item', TAB_CATEGORY[tabName])
    .order('index_item', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function fetchWineItems() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('nom_item, description_item, prix_item, index_item')
    .eq('categorie_item', 'NOS VINS')
    .order('index_item', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ── Tab rendering ─────────────────────────────────────────────────────────────

// Simple in-memory cache — cleared when admin saves (future hook)
const tabCache = {};

async function loadTab(tabName) {
  const container = document.getElementById('menuContent-' + tabName);
  if (!container) return;

  // Serve from cache if available
  if (tabCache[tabName]) {
    container.innerHTML = tabCache[tabName];
    applyMenuGridResponsive(container);
    return;
  }

  container.innerHTML = loadingHTML();

  try {
    const items   = await fetchTabItems(tabName);
    const html    = tabPanelHTML(items);
    tabCache[tabName] = html;
    container.innerHTML = html;
    applyMenuGridResponsive(container);
  } catch (err) {
    console.error(`[menu] Error loading tab "${tabName}":`, err.message);
    container.innerHTML = errorHTML('Impossible de charger ce menu. Veuillez réessayer.');
  }
}

function applyMenuGridResponsive(container) {
  const grid = container?.querySelector('.menu-grid');
  if (grid) {
    grid.style.gridTemplateColumns = window.innerWidth < 900 ? '1fr' : '1fr 1fr';
  }
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function switchTab(tabName, clickedBtn) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.getElementById('panel-' + tabName)?.classList.add('active');
  clickedBtn.classList.add('active');
  clickedBtn.setAttribute('aria-selected', 'true');
}

// ── Wine section ──────────────────────────────────────────────────────────────

function wineItemHTML(wine) {
  return `
    <div class="vin-item">
      <div class="vin-name">
        ${wine.nom_item}
        ${wine.description_item ? `<small>${wine.description_item}</small>` : ''}
      </div>
      <div class="vin-price">${formatPrice(wine.prix_item)}</div>
    </div>`;
}

async function loadWines() {
  const vinsGrid = document.getElementById('vinsGrid');
  if (!vinsGrid) return;

  // Show loading state
  vinsGrid.innerHTML = `<div style="grid-column:span 2">${loadingHTML()}</div>`;

  try {
    const wines = await fetchWineItems();

    if (!wines.length) {
      vinsGrid.innerHTML = `
        <div style="grid-column:span 2">
          ${emptyHTML()}
        </div>`;
      return;
    }

    // Split at midpoint: first half → left col (Rouges), second half → right col (Blancs)
    // Control which wines appear in which column by assigning index_item values:
    // Rouges → index 1–10, Blancs → index 11–20
    const half       = Math.ceil(wines.length / 2);
    const leftWines  = wines.slice(0, half);
    const rightWines = wines.slice(half);

    vinsGrid.innerHTML = `
      <div class="vins-col">
        <p class="vins-col-title">Vins Rouges</p>
        ${leftWines.map(wineItemHTML).join('')}
      </div>
      <div class="vins-col">
        <p class="vins-col-title">Vins Blancs</p>
        ${rightWines.map(wineItemHTML).join('')}
      </div>`;

    // Re-apply responsive columns
    if (window.innerWidth < 640) {
      vinsGrid.style.gridTemplateColumns = '1fr';
    }

  } catch (err) {
    console.error('[menu] Error loading wines:', err.message);
    vinsGrid.innerHTML = `
      <div style="grid-column:span 2">
        ${errorHTML('Impossible de charger la carte des vins.')}
      </div>`;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

// Called by admin dashboard after saving a menu change
export function clearMenuCache() {
  Object.keys(tabCache).forEach(k => delete tabCache[k]);
}

export async function initMenu() {
  // Wire up tab button clicks
  document.querySelectorAll('.menu-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', async () => {
      switchTab(btn.dataset.tab, btn);
      await loadTab(btn.dataset.tab);
    });
  });

  // Responsive resize handler for menu grids
  window.addEventListener('resize', () => {
    document.querySelectorAll('.menu-grid').forEach(g => {
      g.style.gridTemplateColumns = window.innerWidth < 900 ? '1fr' : '1fr 1fr';
    });
  });

  // Load default active tab (matin) immediately
  await loadTab('matin');

  // Load wines in the background (non-blocking)
  loadWines();
}
