/**
 * main.js — Application entry point
 *
 * Imports and initialises all feature modules.
 * Loaded as `type="module"` — automatically deferred, DOM is ready on execute.
 *
 * Module map:
 *   nav.js        → sticky navbar, mobile menu, scroll behaviour
 *   menu.js       → Supabase-driven menu tabs + wine section
 *   modal.js      → reservation modal (open / close / submit)
 *   faq.js        → FAQ accordion
 *   responsive.js → grid-column breakpoint overrides
 *
 * Supabase integration:
 *   supabase.js   → shared client (imported by menu.js, modal.js, future admin.js)
 *   config.js     → credentials (gitignored — never committed)
 *
 * Planned next modules:
 *   js/admin.js   → admin dashboard (Supabase Auth + menu CRUD)
 */

import { initNav        } from './nav.js';
import { initMenu       } from './menu.js';
import { initModal      } from './modal.js';
import { initFaq        } from './faq.js';
import { initResponsive } from './responsive.js';

// Hero background scale-in (needs images loaded)
window.addEventListener('load', () => {
  document.getElementById('heroBg')?.classList.add('ready');
});

// Boot all modules
// initMenu is async (fetches from Supabase) — we await it so the first tab
// renders before the page is considered fully interactive.
(async () => {
  initNav();
  initModal();
  initFaq();
  initResponsive();
  await initMenu();   // fetches matin tab + wines from Supabase
})();
