# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

---

## JS–HTML Contract (READ BEFORE TOUCHING index.html OR dashboard.html)

The site uses ES modules (`js/main.js` and files it imports). The HTML and JS are coupled through specific IDs and class names. **Never rename or remove any of the following without also updating the corresponding JS file.**

### index.html — protected anchors

| Element / attribute | Used by | Purpose |
|---|---|---|
| `<script type="module" src="js/main.js">` at bottom | everything | Boots all JS modules — do not remove |
| `id="eventPoster"` on the Événements `<img>` | `js/actualites.js` | Swapped with Supabase poster URL |
| `id="nlToggle"` | `js/newsletter.js` | Toggle newsletter form open/close |
| `id="nlFormWrap"` | `js/newsletter.js` | The expandable form container |
| `id="nlFormEl"` | `js/newsletter.js` | Form submit handler |
| `id="nlEmail"` | `js/newsletter.js` | Email input value |
| `id="nlMsg"` | `js/newsletter.js` | Success/error message display |
| `id="reserveModal"` | `js/modal.js` | Reservation modal open/close |
| `id="hamburger"` | `js/nav.js` | Mobile menu toggle button |
| `id="mobileMenu"` | `js/nav.js` | Full-screen mobile menu overlay |
| `id="mobileClose"` | `js/nav.js` | Close button inside mobile menu |
| `id="mobileReserveBtn"` | `js/nav.js` | Reserve button inside mobile menu |
| `id="navReserveBtn"` | `js/nav.js` | Desktop reserve button visibility |
| `id="vinsGrid"` | `js/responsive.js` | 1-col collapse on mobile |
| `id="horairesGrid"` | `js/responsive.js` | 1-col collapse on mobile |
| class `menu-tab` on menu buttons | `js/menu.js` | Tab switching logic |
| class `menu-panel` on menu content divs | `js/menu.js` | Panel show/hide |
| class `faq-question` on FAQ buttons | `js/faq.js` | Accordion toggle |
| class `faq-answer` on FAQ answer divs | `js/faq.js` | Accordion open/close |
| class `faq-icon` on FAQ `+` spans | `js/faq.js` | Icon toggle +/− |

### admin/dashboard.html — protected anchors

The dashboard has a large inline `<script type="module">` that queries DOM elements by ID. If you rename any element used in that script, its section will silently break.

Key IDs: `tableContainer`, `statsBar`, `categoryFilters`, `formModal`, `itemForm`, `deleteModal`, `confirmDeleteBtn`, `deleteItemName`, `toastContainer`, `pageTitle`, `pageSubtitle`, `addBtn`, `resTableContainer`, `resDateFilters`, `resStats`, `page-menu`, `page-reservations`, `page-actualites`, `page-newsletter`, `nav-menu`, `nav-reservations`, `nav-actualites`, `nav-newsletter`, `sidebar`, `sidebarToggle`, `sidebarOverlay`, `currentPosterArea`, `posterHistoryContainer`, `uploadBtn`, `posterFileInput`, `dropZone`, `uploadPreviewWrap`, `nlSubject`, `nlBody`, `nlSubscriberList`, `nlStats`, `nlRefreshBtn`.

### Safe to edit freely
- Visual styles in `css/main.css` — colors, spacing, fonts, shadows
- Text content (headings, paragraphs, labels) in index.html
- Image `src` attributes (other than `id="eventPoster"` which is overridden by JS anyway)
- Adding new HTML sections that don't overlap with the above IDs
- The brand tokens (CSS variables in `:root`)

### Before any UI edit session
1. Read this section
2. If you must rename a protected ID, search the corresponding JS file and update it there too
3. Never remove the `<script type="module" src="js/main.js">` line from index.html
