/**
 * main.js — Application Entry Point
 *
 * Imports and initialises all feature modules.
 * This file is loaded as `type="module"` so it is automatically
 * deferred — the DOM is fully built before any code here runs.
 *
 * Module map:
 *  nav.js        → sticky navbar, mobile menu, scroll behaviour
 *  menu.js       → tab switching, menu data rendering
 *  modal.js      → reservation modal (open/close/submit)
 *  faq.js        → FAQ accordion
 *  responsive.js → grid-column breakpoint overrides
 *
 * Supabase integration plan:
 *  1. npm install @supabase/supabase-js  (or use CDN)
 *  2. Create js/supabase.js — initialise the client with anon key
 *  3. Import the client in modal.js and menu.js where DB calls are needed
 *  4. Add js/admin.js for the dashboard (protected by Supabase Auth)
 *
 * Table schema suggestions:
 *  reservations  (id, nom, prenom, telephone, email, date, service, personnes, message, created_at, status)
 *  menu_items    (id, category, tab, name, description, price, position, active)
 *  events        (id, title, image_url, description, date, active)
 *  faq_items     (id, question, answer, position, active)
 */

import { initNav        } from './nav.js';
import { initMenu       } from './menu.js';
import { initModal      } from './modal.js';
import { initFaq        } from './faq.js';
import { initResponsive } from './responsive.js';

// Hero background scale-in animation (requires full page load for images)
window.addEventListener('load', () => {
  document.getElementById('heroBg')?.classList.add('ready');
});

// Initialise all modules after DOM is ready
// (ES modules are deferred, so DOM is already available here)
initNav();
initMenu();
initModal();
initFaq();
initResponsive();
