/**
 * menu.js — Menu Tabs & Content Rendering
 *
 * Responsibilities:
 *  - Store static menu data (carte-midi for all tabs currently)
 *  - Render menu HTML into each tab panel
 *  - Handle tab switching with ARIA
 *
 * Supabase hooks (future):
 *  - Replace `MENU_DATA` with fetchMenuFromSupabase(tabName)
 *  - Admin dashboard writes to `menus` table; this module reads it
 *  - Each tab (matin/midi/soir/enfant) maps to a separate DB record/category
 */

// ── Static menu data (carte-midi placeholder for all tabs) ──
// TODO (Supabase): fetch this from `menu_items` table filtered by category
const MENU_DATA = {
  entrees: [
    { name: 'Couteaux grillés persillés',         desc: '',                                                                          price: '13,50€' },
    { name: 'Crevettes marinées au Combava',       desc: '',                                                                          price: '11,50€' },
    { name: 'Tataki de Thon rouge',                desc: 'Sauce chien',                                                               price: '17,50€' },
    { name: 'Grosse Gambas Crispy',                desc: 'Sauce épicée',                                                              price: '16,50€' },
    { name: 'Shish Andaz',                         desc: "Caviar d'aubergine Iranien",                                                price: '11,50€' },
    { name: 'Seiche à la romaine',                 desc: 'Croustillante',                                                             price: '14,50€' },
    { name: 'Gravlax de Saumon',                   desc: 'Condiment citron',                                                          price: '13,50€' },
  ],
  plats: [
    { name: 'Moules Marinières AOP Bouchot',       desc: 'Frites fraîches maison',                                                    price: '21,50€' },
    { name: "L'Aïoli du Midi",                     desc: 'Poisson blanc, légumes de Provence cuits vapeur, œuf dur Grenailles, Aïoli, salicorne — Servi frais', price: '21,50€' },
    { name: 'Tartare de Thon Rouge',               desc: 'Frites fraîches maison et salade',                                          price: '27,50€' },
    { name: 'Seiche Croustillante et persillée',   desc: 'Frites fraîches maison et salade',                                          price: '26,50€' },
    { name: 'Tartare de Veau Fermier Poêlé',       desc: 'Frites fraîches maison et salade',                                          price: '24,50€' },
    { name: 'Brochette poulet citron & safran',    desc: 'Riz Basmati, tomate grillée — Djoudjeh Kabab (Iran)',                       price: '22,50€' },
    { name: 'Poisson Entier Découpé à Table',      desc: 'Selon arrivage : Daurade, Bar, Sole, Turbot… (~800g, 2 pers.)',             price: '48€' },
  ],
  desserts: [
    { name: 'Glaces maison — 1 boule',             desc: '', price: '3,50€' },
    { name: 'Glaces maison — 2 boules',            desc: '', price: '7€' },
    { name: 'Le Coulant en Dedans',                desc: '', price: '9,50€' },
    { name: 'Dessert aux Fruits frais',            desc: '', price: '8,50€' },
    { name: 'Le Choc Dedans',                      desc: '', price: '13,50€' },
    { name: 'Dessert du Chef',                     desc: '', price: '14,50€' },
    { name: 'Mini Café Gourmand',                  desc: '', price: '7,50€' },
    { name: 'Café ou Thé et Gourmandises',         desc: '', price: '16,50€' },
  ],
};

// ── Helpers ─────────────────────────────────────────────────
function renderItems(items) {
  return items.map(item => `
    <div class="menu-item">
      <div>
        <div class="menu-item-name">${item.name}</div>
        ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ''}
      </div>
      <div class="menu-item-price">${item.price}</div>
    </div>
  `).join('');
}

function buildMenuHTML() {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2.5rem 4rem" class="menu-grid">
      <div>
        <p class="menu-category-label">Entrées</p>
        ${renderItems(MENU_DATA.entrees)}
        <p class="menu-category-label" style="margin-top:2.5rem">Plats</p>
        ${renderItems(MENU_DATA.plats)}
      </div>
      <div>
        <p class="menu-category-label">Desserts</p>
        ${renderItems(MENU_DATA.desserts)}

        <div class="formule-card" style="margin-top:2.5rem">
          <p class="f-logo" style="font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1.2rem">Nos Offres</p>
          <div class="menu-item"><div class="menu-item-name">Entrée · Plat · Dessert</div><div class="menu-item-price">19,50€</div></div>
          <div class="menu-item"><div class="menu-item-name">Entrée · Plat</div><div class="menu-item-price">17,50€</div></div>
          <div class="menu-item"><div class="menu-item-name">Plat · Dessert</div><div class="menu-item-price">17,50€</div></div>
          <div class="menu-item"><div><div class="menu-item-name">Plat du Jour</div><div class="menu-item-desc">Sauf jours fériés</div></div><div class="menu-item-price">15,50€</div></div>
        </div>

        <div class="formule-card" style="margin-top:1.2rem">
          <p class="f-logo" style="font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem">Formule du Jour</p>
          <p class="f-display" style="font-size:1.1rem;font-style:italic;color:var(--gold);margin-bottom:0.5rem">Entrée</p>
          <p style="font-size:0.83rem;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:0.9rem">Couteaux grillés persillés <em>ou</em> Poêlée de Moules et coquillages</p>
          <p class="f-display" style="font-size:1.1rem;font-style:italic;color:var(--gold);margin-bottom:0.5rem">Plat</p>
          <p style="font-size:0.83rem;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:0.9rem">Aïoli du midi <em>ou</em> Veau Fermier d'ici — Frites fraîches Maison <span style="color:var(--gold)">+3€</span></p>
          <p class="f-display" style="font-size:1.1rem;font-style:italic;color:var(--gold);margin-bottom:0.5rem">Dessert</p>
          <p style="font-size:0.83rem;color:rgba(255,255,255,0.55);line-height:1.65;margin-bottom:0.6rem">Dessert du jour <em>ou</em> 1 boule Glace Maison <em>ou</em> Mini Café Gourmand <span style="color:var(--gold)">+3€</span></p>
          <div class="menu-item" style="border-top:1px solid rgba(212,175,55,0.15);margin-top:0.6rem"><div class="menu-item-name">Panier de Frites</div><div class="menu-item-price">6€</div></div>
        </div>

        <div class="formule-card" style="margin-top:1.2rem">
          <p class="f-logo" style="font-size:0.6rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem">Menu Enfant <span class="f-price" style="margin-left:0.5rem;color:var(--gold)">13,50€</span></p>
          <p style="font-size:0.78rem;color:rgba(255,255,255,0.4);font-style:italic;margin-bottom:0.8rem">Pour les moins de 12 ans</p>
          <p style="font-size:0.83rem;color:rgba(255,255,255,0.6);line-height:1.7">Entrée : Sirop ou Diabolo<br>Plat : Poisson Pané Maison ou Moules Frites Maison<br>Dessert : Glaces maison</p>
        </div>
      </div>
    </div>
  `;
}

// ── Tab switching ────────────────────────────────────────────
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

// ── Init ─────────────────────────────────────────────────────
export function initMenu() {
  const html = buildMenuHTML();

  // Inject content into all four tab panels
  // (all use carte-midi for now — replace per-tab when other menus are ready)
  ['matin', 'midi', 'soir', 'enfant'].forEach(tab => {
    const container = document.getElementById('menuContent-' + tab);
    if (container) container.innerHTML = html;
  });

  // Wire up tab buttons using [data-tab] attribute
  document.querySelectorAll('.menu-tab[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab, btn));
  });

  // Responsive: collapse 2-col menu grid on small screens
  function checkMenuGrid() {
    document.querySelectorAll('.menu-grid').forEach(g => {
      g.style.gridTemplateColumns = window.innerWidth < 900 ? '1fr' : '1fr 1fr';
    });
  }
  checkMenuGrid();
  window.addEventListener('resize', checkMenuGrid);
}
