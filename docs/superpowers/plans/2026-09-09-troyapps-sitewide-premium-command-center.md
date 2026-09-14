# TroyApps Sitewide Premium Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every public TroyApps page around the approved black/red “Premium Command Center” system while preserving Troy’s working 3D interactions, Radar injection, locale parity, policy content, and static GitHub Pages delivery.

**Architecture:** Keep the existing static HTML, CSS, vanilla JavaScript, local Three.js, and Node test/runtime structure. Layer `theme-v3.css` and page-specific v3 styles over the proven `site.css` and `home-v2.css` compatibility layers; keep Troy’s controller and renderer modules untouched unless a failing regression test proves a change is necessary. Use duplicated but contract-tested TR/EN semantic HTML because there is no build step.

**Tech Stack:** Static HTML5, CSS custom properties and media queries, vanilla ES modules, Three.js 0.185.1 from the repository, Node.js built-in test runner, existing Radar Node scripts, headless Chrome plus FFmpeg for one-time GLB-to-WebP control renders.

**Spec:** `docs/superpowers/specs/2026-09-09-troyapps-sitewide-premium-command-center-design.md`

## Global Constraints

- Work only in `C:\Users\darkl\Documents\ChatGPT\mobil uygulama projeleri\troyapps.github.io` on `codex/troyapps-premium-redesign`.
- Do not commit or push until the user has completed the final visual review and explicitly authorizes publication.
- Keep the site framework-free and directly publishable by GitHub Pages; do not add a package manager, bundler, framework, account system, analytics, or remote runtime dependency.
- Preserve exactly one `<!-- RADAR:START -->`, `<!-- RADAR:END -->`, `<!-- RADARBOX:START -->`, and `<!-- RADARBOX:END -->` boundary in each applicable locale page.
- Preserve the existing `scripts/radar.mjs` generation flow and the generated `.rd-*` HTML class contract.
- Preserve Troy’s current GLB files, controller state machine, animation clips, rocket path, whip behavior, dialogue sequence, pixel-scatter behavior, tail spring, poster fallback, and `data-troy-*` attributes.
- Keep `assets/css/home-v2.css` loaded before `home-v3.css`; it is the tested compatibility layer for Troy’s visual/effect states. The new file owns layout and theme overrides.
- Keep `<body class="home-v2 home-v3 theme-command">` on both homepages so existing `.home-v2 .troy-*` selectors remain valid.
- Load only one live Three.js Troy scene per homepage. Bazooka and whip command icons must be static transparent WebP files rendered from the existing GLBs.
- Remove the auth preview completely. No sign-in card, Google Auth control, email input, disabled fake login button, form, or user-data collection code may remain.
- Keep the Google Play developer showcase URL exact: `https://play.google.com/store/apps/developer?id=Troy+Apps`.
- Keep these social URLs exact: YouTube `https://www.youtube.com/channel/UC2PncaDQ9wSXYqY5IaffuJw`, Instagram `https://www.instagram.com/troyappsofficial/`, TikTok `https://www.tiktok.com/@troyappsofficial`, Facebook `https://www.facebook.com/troyappsofficial`.
- Keep `info@troyapps.app` and `support@troyapps.app` in the shared footer. Do not alter policy-body contact text while restyling the policy shell.
- Keep policy pages directly accessible and readable without JavaScript; do not load Troy or decorative canvas animation on them.
- Keep TR and EN pages structurally equivalent while using native localized labels and destination URLs.
- Use one new cache token, `20260909-command1`, for `theme-v3.css`, `home-v3.css`, `product-v3.css`, `radar-v3.css`, and `home-v3.js`. Do not change the existing `20260908-mascot32` token in Troy modules.
- Treat `prefers-reduced-motion: reduce` as a hard stop for ticker, circuit pulse, hover tilt, reveal motion, and decorative particle animation.
- Preserve `app-ads.txt` byte-for-byte, including CRLF and absence of BOM.

---

## File Responsibility Map

**Create**

- `assets/css/theme-v3.css` — shared tokens, site shell, navigation, language picker, buttons, panels, footer, focus states, and shared responsive rules.
- `assets/css/home-v3.css` — Premium Command Center hero, circuit pulse, ticker, 40/35/25 dashboard, app dock, and Troy panel overrides.
- `assets/css/product-v3.css` — Morse Flash product layouts plus restrained policy and 404 layouts.
- `assets/css/radar-v3.css` — Radar hero, generated `.rd-*` content, and responsive dashboard presentation.
- `assets/js/home-v3.js` — app-inventory selection and keyboard movement only; it does not own Troy state.
- `assets/img/troy/controls/bazooka.webp` — transparent control thumbnail rendered from `assets/models/troy/bazooka.glb`.
- `assets/img/troy/controls/whip.webp` — transparent control thumbnail rendered from `assets/models/troy/whip.glb`.
- `tests/premium-shell.test.mjs` — cross-page shell, link, locale, policy, and no-auth contracts.
- `tests/home-v3.test.mjs` — pure inventory-selection and home markup/CSS contracts.
- `tests/troy-control-icons.test.mjs` — WebP signature, source model, and control markup contracts.
- `tests/secondary-pages-v3.test.mjs` — Morse, Radar, policy, and 404 theme contracts.

**Modify**

- `index.html` and `en/index.html` — new home shell, hero, ticker, dashboard, inventory dock, CTA destinations, and themed Troy control markup.
- `morse-flash/index.html` and `en/morse-flash/index.html` — shared shell and premium product hierarchy without altering current product facts or screenshots.
- `radar/index.html` and `en/radar/index.html` — shared shell and Radar presentation around untouched injection boundaries.
- `morse-flash-policy/index.html` and `airmousehand-policy/index.html` — shared restrained policy shell while preserving policy paragraphs.
- `404.html` — branded compact error page with no Troy runtime.
- `assets/js/site.js` — shared mobile menu and native language `<details>` dismissal behavior; retain decode and reveal behavior.
- `tests/site-contract.test.mjs` — replace obsolete auth/home-v2-only assertions with the approved v3 contract while retaining all Troy, Radar, social, and app-ads protections.

**Keep unchanged unless a regression demands otherwise**

- `assets/js/troy/*.js`
- `assets/models/troy/*.glb`
- `scripts/radar*.mjs`
- `assets/data/radar*.json`
- `app-ads.txt`
- Existing Morse Flash screenshot assets and policy-body copy

---

### Task 1: Shared Premium Command Center Shell

**Files:**
- Create: `assets/css/theme-v3.css`
- Create: `tests/premium-shell.test.mjs`
- Modify: `assets/js/site.js:1-177`
- Modify: `index.html:28-75,278-320`
- Modify: `en/index.html:27-74,277-319`
- Test: `tests/premium-shell.test.mjs`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: existing `.wrap`, `.site-header`, `.nav-toggle`, `#nav-menu`, `.site-footer`, and `.btn` markup contracts.
- Produces: CSS tokens `--cmd-*`; shared classes `.theme-command`, `.command-header`, `.command-nav`, `.language-menu`, `.command-button`, `.command-panel`, `.command-footer`; `bindLanguageMenus(root)` in `site.js`.

- [ ] **Step 1: Record the clean behavioral baseline**

Run:

```powershell
node --test
node scripts\radar.mjs --dry --input assets\data\radar.json
```

Expected: 64 tests pass and Radar reports both locale page/box injections without writing files because `--dry` is active.

- [ ] **Step 2: Write failing shared-shell tests**

Create `tests/premium-shell.test.mjs` with this contract:

```js
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const playUrl = "https://play.google.com/store/apps/developer?id=Troy+Apps";
const socials = [
  "https://www.youtube.com/channel/UC2PncaDQ9wSXYqY5IaffuJw",
  "https://www.instagram.com/troyappsofficial/",
  "https://www.tiktok.com/@troyappsofficial",
  "https://www.facebook.com/troyappsofficial",
];

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

for (const file of ["index.html", "en/index.html"]) {
  test(`${file} exposes the shared command shell without auth`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="home-v2 theme-command">/);
    assert.match(html, /theme-v3\.css\?v=20260909-command1/);
    assert.match(html, /class="[^"]*command-header[^"]*"/);
    assert.match(html, /<details class="language-menu"/);
    assert.match(html, /class="[^"]*command-footer[^"]*"/);
    assert.ok(html.includes(playUrl));
    assert.ok(html.includes("mailto:info@troyapps.app"));
    assert.ok(html.includes("mailto:support@troyapps.app"));
    for (const href of socials) assert.ok(html.includes(`href="${href}"`));
    assert.doesNotMatch(html, /auth-preview|data-auth-status|Google ile Giriş|Google Sign-In/i);
    assert.doesNotMatch(html, /<form\b|<input\b/i);
  });
}

test("the shared theme file exists and defines the stable token contract", async () => {
  await access(new URL("assets/css/theme-v3.css", root));
  const css = await read("assets/css/theme-v3.css");
  for (const token of [
    "--cmd-bg", "--cmd-surface", "--cmd-red", "--cmd-red-bright",
    "--cmd-ink", "--cmd-muted", "--cmd-line", "--cmd-focus",
  ]) assert.ok(css.includes(token), `missing ${token}`);
  assert.match(css, /:focus-visible/);
});
```

- [ ] **Step 3: Run the shared-shell test and verify the intended failure**

Run:

```powershell
node --test tests\premium-shell.test.mjs
```

Expected: FAIL because `theme-v3.css`, `.theme-command`, and `.language-menu` do not exist and auth preview is still present.

- [ ] **Step 4: Create the shared theme contract**

Create `assets/css/theme-v3.css`. Begin with these exact shared variables and base components, then keep every shared selector under `.theme-command` to prevent accidental policy or legacy leakage before each page opts in:

```css
:root {
  --cmd-bg: #070708;
  --cmd-bg-warm: #0d0809;
  --cmd-surface: #101013;
  --cmd-surface-strong: #17171b;
  --cmd-red: #c92b26;
  --cmd-red-bright: #f0443c;
  --cmd-red-dark: #651512;
  --cmd-ink: #f3ece8;
  --cmd-muted: #aaa1a0;
  --cmd-line: rgba(244, 232, 226, .16);
  --cmd-line-red: rgba(240, 68, 60, .36);
  --cmd-focus: #ff766f;
  --cmd-radius-sm: 8px;
  --cmd-radius: 14px;
  --cmd-shadow: 0 22px 70px rgba(0, 0, 0, .42);
}

.theme-command {
  color: var(--cmd-ink);
  background:
    radial-gradient(circle at 52% -10%, rgba(201, 43, 38, .16), transparent 34rem),
    var(--cmd-bg);
}

.theme-command .command-panel {
  border: 1px solid var(--cmd-line);
  border-radius: var(--cmd-radius);
  background: linear-gradient(155deg, rgba(23, 23, 27, .96), rgba(9, 9, 11, .96));
  box-shadow: var(--cmd-shadow);
}

.theme-command .command-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  min-height: 48px;
  border: 1px solid var(--cmd-line);
  border-radius: var(--cmd-radius-sm);
  background: linear-gradient(155deg, #1b1b20, #0d0d10);
  box-shadow: 0 5px 0 #020203;
  color: var(--cmd-ink);
  font-weight: 700;
  transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
}

.theme-command .command-button--primary {
  border-color: var(--cmd-red-bright);
  background: linear-gradient(155deg, var(--cmd-red-bright), #8c1915);
  box-shadow: 0 5px 0 #4b0d0b, 0 0 24px rgba(240, 68, 60, .18);
}

.theme-command .command-button:hover { transform: translateY(-2px); }
.theme-command .command-button:active { transform: translateY(3px); box-shadow: 0 1px 0 #020203; }
.theme-command :focus-visible { outline: 3px solid var(--cmd-focus); outline-offset: 3px; }
```

Add shared rules for `.command-header`, `.command-nav`, `.language-menu`, `.command-footer`, `.footer-socials`, `.skip-link`, and the existing `.nav-toggle`. Use `currentColor` for the red logo mark. At `max-width: 820px`, keep the language summary visible beside the mobile-menu toggle rather than burying it inside the collapsed link list.

- [ ] **Step 5: Replace the homepage header and language switch with the shared shell**

In both homepage heads, load shared/new CSS after `site.css` and before the existing Troy compatibility stylesheet:

```html
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/theme-v3.css?v=20260909-command1">
<link rel="stylesheet" href="/assets/css/home-v2.css?v=20260908-mascot32">
```

Use this structure in both locales; translate only labels and map the page URLs listed below:

```html
<header class="site-header command-header">
  <div class="wrap nav-bar">
    <a class="brand command-brand" href="/" aria-label="TroyApps ana sayfa">
      <svg class="command-brand__mark" width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="6" fill="#09090b"/>
        <rect x="2" y="2" width="60" height="60" rx="4" fill="none" stroke="currentColor" stroke-width="3"/>
        <rect x="13" y="15" width="38" height="9" fill="currentColor"/>
        <rect x="27" y="24" width="10" height="27" fill="currentColor"/>
        <rect x="44" y="24" width="8" height="8" fill="#f3ece8"/>
      </svg>
      <span>TROY<strong>APPS</strong></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Menüyü aç/kapat"><span class="bars"></span></button>
    <nav class="nav-menu command-nav" id="nav-menu" aria-label="Ana menü">
      <a href="/" aria-current="page">Anasayfa</a>
      <a href="#uygulamalar">Uygulamalar</a>
      <a href="/radar/">Radar</a>
      <a href="#iletisim">İletişim</a>
    </nav>
    <details class="language-menu">
      <summary aria-label="Dil seç"><span aria-hidden="true">◎</span><span>TR</span><span aria-hidden="true">⌄</span></summary>
      <div class="language-options">
        <a href="/" lang="tr" hreflang="tr" aria-current="page">Türkçe</a>
        <a href="/en/" lang="en" hreflang="en">English</a>
      </div>
    </details>
  </div>
</header>
```

Locale mapping:

| Locale | Home | Apps | Radar | Contact | Summary |
|---|---|---|---|---|---|
| TR | `/` | `#uygulamalar` | `/radar/` | `#iletisim` | `TR` |
| EN | `/en/` | `#apps` | `/en/radar/` | `#contact` | `EN` |

Set the body on both pages exactly to:

```html
<body class="home-v2 theme-command">
```

- [ ] **Step 6: Remove auth preview and install the compact shared footer**

Delete the entire `.auth-preview-card` aside from both homepages. Keep the hero’s Troy column in its place; do not insert a replacement card.

Use `.site-footer.command-footer` with exact links for both email addresses, Google Play, YouTube, Instagram, TikTok, Facebook, and one small localized `/morse-flash-policy/` privacy link. Keep the footer section IDs `iletisim` and `contact`, respectively.

- [ ] **Step 7: Add native language-menu dismissal without changing Troy code**

Append this behavior inside the existing `site.js` IIFE after mobile-menu setup:

```js
  function bindLanguageMenus(root) {
    var menus = root.querySelectorAll(".language-menu");
    if (!menus.length) return;

    root.addEventListener("click", function (event) {
      menus.forEach(function (menu) {
        if (!menu.contains(event.target)) menu.removeAttribute("open");
      });
    });

    root.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      menus.forEach(function (menu) {
        if (!menu.open) return;
        menu.removeAttribute("open");
        var summary = menu.querySelector("summary");
        if (summary) summary.focus();
      });
    });
  }

  bindLanguageMenus(document);
```

- [ ] **Step 8: Update obsolete homepage assertions**

In `tests/site-contract.test.mjs`, replace the auth-preview test with assertions that auth markup is absent and update the homepage shell assertion to require:

```js
assert.match(html, /<body class="home-v2 theme-command">/);
assert.match(html, /\/assets\/css\/theme-v3\.css\?v=20260909-command1/);
assert.match(html, /\/assets\/css\/home-v2\.css\?v=20260908-mascot32/);
assert.doesNotMatch(html, /auth-preview|data-auth-status|<form\b|<input\b/i);
```

Retain all current Troy canvas/model/control, Radar marker, social URL, runtime-version, app-ads, and state-machine tests.

- [ ] **Step 9: Verify Task 1 and stop at a local checkpoint**

Run:

```powershell
node --check assets\js\site.js
node --test tests\premium-shell.test.mjs tests\site-contract.test.mjs
git diff --check
git status --short
```

Expected: the two test files pass, no whitespace error appears, and the working tree remains uncommitted.

---

### Task 2: Premium Homepage, Signal Ticker, and App Inventory

**Files:**
- Create: `assets/css/home-v3.css`
- Create: `assets/js/home-v3.js`
- Create: `tests/home-v3.test.mjs`
- Modify: `tests/premium-shell.test.mjs`
- Modify: `index.html:87-277,317-320`
- Modify: `en/index.html:86-276,316-319`
- Test: `tests/home-v3.test.mjs`
- Test: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: `--cmd-*`, `.command-button`, `.command-panel`, home-v2 Troy selectors, `RADARBOX` markers, and locale anchor IDs.
- Produces: `resolveInventoryItem(items, id)`, `nextInventoryIndex(current, key, count)`, `initInventory(root)`; `.command-hero`, `.signal-ticker`, `.home-command-grid`, `.inventory-dock`, and `data-inventory-*` markup.

- [ ] **Step 1: Write failing home state and markup tests**

Create `tests/home-v3.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const homeModule = new URL("assets/js/home-v3.js", root);

async function read(path) { return readFile(new URL(path, root), "utf8"); }

test("inventory selection falls back deterministically", async () => {
  const { resolveInventoryItem } = await import(homeModule);
  const items = [{ id: "morse" }, { id: "airmouse" }];
  assert.equal(resolveInventoryItem(items, "airmouse"), items[1]);
  assert.equal(resolveInventoryItem(items, "missing"), items[0]);
  assert.equal(resolveInventoryItem([], "missing"), null);
});

test("inventory keyboard movement stays within a wrapping dock", async () => {
  const { nextInventoryIndex } = await import(homeModule);
  assert.equal(nextInventoryIndex(0, "ArrowRight", 3), 1);
  assert.equal(nextInventoryIndex(2, "ArrowRight", 3), 0);
  assert.equal(nextInventoryIndex(0, "ArrowLeft", 3), 2);
  assert.equal(nextInventoryIndex(2, "Home", 3), 0);
  assert.equal(nextInventoryIndex(0, "End", 3), 2);
});

for (const file of ["index.html", "en/index.html"]) {
  test(`${file} exposes the approved home dashboard`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="home-v2 home-v3 theme-command">/);
    assert.match(html, /home-v3\.css\?v=20260909-command1/);
    assert.match(html, /class="[^"]*command-hero[^"]*"/);
    assert.match(html, /class="[^"]*signal-ticker[^"]*"/);
    assert.match(html, /class="[^"]*home-command-grid[^"]*"/);
    assert.match(html, /data-inventory-tab/);
    assert.match(html, /data-inventory-detail/);
    assert.match(html, /https:\/\/play\.google\.com\/store\/apps\/developer\?id=Troy\+Apps/);
    assert.doesNotMatch(html, /auth-preview|data-auth-status/i);
  });
}

test("home CSS carries the 40/35/25 layout and motion fallback", async () => {
  const css = await read("assets/css/home-v3.css");
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*40fr\)\s+minmax\(0,\s*35fr\)\s+minmax\(0,\s*25fr\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.home-v3\s+\.troy-tools[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.home-v3\s+\.troy-tools[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});
```

- [ ] **Step 2: Run the home tests and confirm the missing-module failure**

Run:

```powershell
node --test tests\home-v3.test.mjs
```

Expected: FAIL because `home-v3.js`, `home-v3.css`, and the v3 markup do not exist.

- [ ] **Step 3: Create the testable inventory module**

Create `assets/js/home-v3.js` with browser-independent exports and a guarded browser mount:

```js
export function resolveInventoryItem(items, id) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.find((item) => item.id === id) || items[0];
}

export function nextInventoryIndex(current, key, count) {
  if (count < 1) return -1;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowRight" || key === "ArrowDown") return (current + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp") return (current - 1 + count) % count;
  return current;
}

function dataFromButton(button) {
  return {
    id: button.dataset.appId,
    title: button.dataset.appTitle,
    copy: button.dataset.appCopy,
    href: button.dataset.appHref,
    linkLabel: button.dataset.appLinkLabel,
    status: button.dataset.appStatus,
  };
}

export function initInventory(root = document) {
  const dock = root.querySelector("[data-inventory-dock]");
  const detail = root.querySelector("[data-inventory-detail]");
  if (!dock || !detail) return;

  const buttons = [...dock.querySelectorAll("[data-inventory-tab]")];
  const items = buttons.map(dataFromButton);

  function activate(button, moveFocus) {
    const item = resolveInventoryItem(items, button.dataset.appId);
    buttons.forEach((entry) => {
      const selected = entry === button;
      entry.setAttribute("aria-selected", String(selected));
      entry.tabIndex = selected ? 0 : -1;
    });
    detail.querySelector("[data-inventory-title]").textContent = item.title;
    detail.querySelector("[data-inventory-copy]").textContent = item.copy;
    detail.querySelector("[data-inventory-status]").textContent = item.status;
    const link = detail.querySelector("[data-inventory-link]");
    link.href = item.href;
    link.textContent = item.linkLabel;
    if (moveFocus) button.focus();
  }

  dock.addEventListener("click", (event) => {
    const button = event.target.closest("[data-inventory-tab]");
    if (button && !button.disabled) activate(button, false);
  });

  dock.addEventListener("keydown", (event) => {
    const current = buttons.indexOf(event.target.closest("[data-inventory-tab]"));
    if (current < 0) return;
    const next = nextInventoryIndex(current, event.key, buttons.length);
    if (next === current) return;
    event.preventDefault();
    const enabled = buttons[next].disabled ? buttons.find((button) => !button.disabled) : buttons[next];
    if (enabled) activate(enabled, true);
  });
}

if (typeof document !== "undefined") initInventory(document);
```

- [ ] **Step 4: Activate the final homepage layer and replace both hero shells**

Add this stylesheet after `home-v2.css` and change both body classes to the final contract. Update the matching body assertion in `tests/premium-shell.test.mjs` at the same time:

```html
<link rel="stylesheet" href="/assets/css/home-v3.css?v=20260909-command1">
```

```html
<body class="home-v2 home-v3 theme-command">
```

Keep the complete existing `.troy-stage` subtree and all `data-troy-*` values. Move it into the right `.command-hero__troy` column. The left column must include:

```html
<p class="system-status"><span aria-hidden="true"></span>TroyApps sistemi çevrimiçi</p>
<h1 id="hero-baslik" class="command-wordmark"><span>TROY</span><strong>APPS</strong></h1>
<p class="lead">Günlük hayatın araçlarını kolaylaştırıyoruz: <b>kullanışlı, hızlı</b> ve <b>herkese açık</b> mobil çözümler.</p>
<div class="hero-actions">
  <a class="command-button command-button--primary" href="#uygulamalar"><span aria-hidden="true">▦</span><span>Uygulama Envanteri</span></a>
  <a class="command-button" href="https://play.google.com/store/apps/developer?id=Troy+Apps" target="_blank" rel="noopener"><span aria-hidden="true">▶</span><span>Google Play'de Gör</span></a>
</div>
```

English labels are `TroyApps system online`, `Useful, fast, and accessible mobile tools for everyday life.`, `App Inventory`, and `View on Google Play`. Keep the same Play URL and `rel="noopener" target="_blank"`.

- [ ] **Step 5: Install the continuous signal ticker**

Place one `.signal-ticker` directly after the hero. Use two identical `aria-hidden="true"` tracks and one screen-reader-only text node:

```html
<section class="signal-ticker" aria-label="Sistem durumu">
  <p class="sr-only">Sinyal akışı aktif. Yeni araçlar yükleniyor. Radar çevrimiçi.</p>
  <div class="signal-ticker__track" aria-hidden="true">
    <span>SİNYAL AKIŞI AKTİF</span><span>•—•</span><span>YENİ ARAÇLAR YÜKLENİYOR</span><span>⌁</span><span>RADAR ÇEVRİMİÇİ</span>
    <span>SİNYAL AKIŞI AKTİF</span><span>•—•</span><span>YENİ ARAÇLAR YÜKLENİYOR</span><span>⌁</span><span>RADAR ÇEVRİMİÇİ</span>
  </div>
</section>
```

Use localized English text on `/en/`. CSS must pause the track under reduced motion and leave the first copy fully readable.

- [ ] **Step 6: Build the 40/35/25 dashboard and inventory dock**

Use this structural contract around the existing Radar box and About content:

```html
<section class="wrap home-command-grid" aria-label="TroyApps komuta merkezi">
  <section class="command-panel inventory-panel" id="uygulamalar" aria-labelledby="envanter-baslik">
    <p class="panel-kicker">01 · Envanter</p>
    <h2 id="envanter-baslik">Uygulama Envanteri</h2>
    <div class="inventory-dock" role="tablist" aria-label="Uygulamalar" data-inventory-dock></div>
    <article class="inventory-detail" data-inventory-detail aria-live="polite"></article>
  </section>
  <section class="command-panel radar-summary" aria-labelledby="radar-ozet-baslik">
    <p class="panel-kicker">02 · Radar</p>
    <h2 id="radar-ozet-baslik">Radar</h2>
    <!-- RADARBOX:START -->
    <!-- scripts/radar.mjs owns and replaces the current generated block between these two markers. -->
    <!-- RADARBOX:END -->
  </section>
  <section class="command-panel about-summary" id="hakkimizda" aria-labelledby="hakkimizda-baslik">
    <p class="panel-kicker">03 · Biz Kimiz</p>
    <h2 id="hakkimizda-baslik">Sade, hızlı, erişilebilir.</h2>
    <p>Karmaşık değil, yalın çözümler. Hızlı çalışan araçlar. Herkes için tasarlanan ürünler.</p>
  </section>
</section>
```

Inside the inventory panel, use a `role="tablist"` dock. Morse Flash is selected and future slots are visually present without a false download action:

```html
<div class="inventory-dock" role="tablist" aria-label="Uygulamalar" data-inventory-dock>
  <button type="button" role="tab" aria-selected="true" tabindex="0" data-inventory-tab data-app-id="morse-flash" data-app-title="Morse Flash" data-app-copy="Metni Morse koduna çevir, ışıkla gönder ve görünen sinyalleri oku." data-app-href="/morse-flash/" data-app-link-label="Detayları Gör" data-app-status="Android · Yakında">
    <img src="/assets/img/morse-flash-icon-96.png" width="54" height="54" alt=""><span>Morse Flash</span>
  </button>
  <button type="button" role="tab" aria-selected="false" tabindex="-1" data-inventory-tab data-app-id="future" data-app-title="Yeni araç" data-app-copy="TroyApps envanterine eklenecek sıradaki araç hazırlanıyor." data-app-href="#" data-app-link-label="Yakında" data-app-status="Geliştiriliyor" disabled>
    <span class="inventory-placeholder" aria-hidden="true">+</span><span>Yakında</span>
  </button>
</div>
<article class="inventory-detail" data-inventory-detail aria-live="polite">
  <p data-inventory-status>Android · Yakında</p>
  <h3 data-inventory-title>Morse Flash</h3>
  <p data-inventory-copy>Metni Morse koduna çevir, ışıkla gönder ve görünen sinyalleri oku.</p>
  <a class="command-button" data-inventory-link href="/morse-flash/">Detayları Gör</a>
</article>
```

Translate all visible text and use `/en/morse-flash/` on `/en/`. The generated Radar content must remain entirely between its markers.

- [ ] **Step 7: Create the homepage visual and responsive rules**

Create `assets/css/home-v3.css` with these ownership boundaries:

```css
.home-v3 .command-hero { position: relative; overflow: clip; }
.home-v3 .command-hero__grid { display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(420px, .98fr); align-items: center; }
.home-v3 .command-hero::before { content: ""; position: absolute; inset: 0; opacity: .28; background-image: linear-gradient(rgba(240,68,60,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(240,68,60,.08) 1px, transparent 1px); background-size: 48px 48px; }
.home-v3 .command-hero::after { content: ""; position: absolute; inset: 42% -20% auto; height: 2px; background: linear-gradient(90deg, transparent, var(--cmd-red-bright), transparent); filter: drop-shadow(0 0 8px var(--cmd-red)); animation: command-pulse 5.6s linear infinite; }
.home-v3 .signal-ticker__track { display: flex; width: max-content; gap: 2rem; animation: signal-flow 24s linear infinite; }
.home-v3 .home-command-grid { display: grid; grid-template-columns: minmax(0, 40fr) minmax(0, 35fr) minmax(0, 25fr); gap: 12px; }
.home-v3 .inventory-dock { display: flex; gap: .65rem; overflow-x: auto; scrollbar-width: thin; }
.home-v3 .troy-tools { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }

@keyframes command-pulse { from { transform: translateX(-45%); } to { transform: translateX(45%); } }
@keyframes signal-flow { to { transform: translateX(-50%); } }

@media (max-width: 920px) {
  .home-v3 .command-hero__grid { grid-template-columns: 1fr; }
  .home-v3 .home-command-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .home-v3 .about-summary { grid-column: 1 / -1; }
}

@media (max-width: 640px) {
  .home-v3 .home-command-grid { grid-template-columns: 1fr; }
  .home-v3 .about-summary { grid-column: auto; }
  .home-v3 .troy-tools { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .home-v3 .command-hero::after,
  .home-v3 .signal-ticker__track { animation: none; transform: none; }
}
```

Add layout/typography styles for hero actions, Troy placement, inventory tabs, selected states, Radar summary, and About rows. Existing Troy effects must continue to win for animation states; limit v3 selectors to positioning, panel skins, and control appearance.

- [ ] **Step 8: Load the new homepage module after the existing Troy module**

Add to both homepages:

```html
<script type="module" src="/assets/js/home-v3.js?v=20260909-command1"></script>
```

Do not remove the existing `troy-controller.js?v=20260908-mascot32` module.

- [ ] **Step 9: Verify home state, markup, and full Troy regression suite**

Run:

```powershell
node --check assets\js\home-v3.js
node --test tests\home-v3.test.mjs tests\site-contract.test.mjs tests\troy-actions.test.mjs tests\troy-animation.test.mjs tests\troy-bazooka-impact.test.mjs tests\troy-site-rocket-path.test.mjs tests\troy-tail-spring.test.mjs
git diff --check
```

Expected: all selected tests pass and no Troy runtime file changed.

---

### Task 3: GLB-Derived Bazooka and Whip Control Icons

**Files:**
- Create: `assets/img/troy/controls/bazooka.webp`
- Create: `assets/img/troy/controls/whip.webp`
- Create: `tests/troy-control-icons.test.mjs`
- Modify: `index.html:116-120`
- Modify: `en/index.html:115-119`
- Modify: `assets/css/home-v3.css`
- Temporary, never stage: `.superpowers/icon-render/troy-control-icons.html`

**Interfaces:**
- Consumes: `bazooka.glb`, `whip.glb`, local Three.js/GLTFLoader, `.troy-tool`, and `data-troy-tool-option`.
- Produces: two `RIFF/WEBP` assets and `.troy-tool__icon` markup. No extra live WebGL context is added.

- [ ] **Step 1: Write the failing icon asset contract**

Create `tests/troy-control-icons.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

for (const name of ["bazooka", "whip"]) {
  test(`${name} control icon is a non-empty WebP`, async () => {
    const bytes = await readFile(new URL(`assets/img/troy/controls/${name}.webp`, root));
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
    assert.ok(bytes.byteLength > 1500);
    assert.ok(bytes.byteLength < 180000);
  });
}

for (const file of ["index.html", "en/index.html"]) {
  test(`${file} uses static model-derived control icons`, async () => {
    const html = await readFile(new URL(file, root), "utf8");
    assert.match(html, /data-troy-tool-option="bazooka"[\s\S]*?\/assets\/img\/troy\/controls\/bazooka\.webp/);
    assert.match(html, /data-troy-tool-option="whip"[\s\S]*?\/assets\/img\/troy\/controls\/whip\.webp/);
    assert.equal((html.match(/data-troy-canvas/g) || []).length, 1);
  });
}
```

- [ ] **Step 2: Run the icon test and confirm both assets are missing**

Run:

```powershell
node --test tests\troy-control-icons.test.mjs
```

Expected: FAIL with missing `bazooka.webp` and `whip.webp`.

- [ ] **Step 3: Create a temporary transparent renderer using the approved model angles**

Create `.superpowers/icon-render/troy-control-icons.html` with one 512×392 canvas. Read `model` from the query string and render exactly one of the two configurations per page load. Reuse the approved preview settings exactly:

```js
const config = {
  bazooka: { url: "/assets/models/troy/bazooka.glb", rotation: [-0.22, -0.8, 0.12] },
  whip: { url: "/assets/models/troy/whip.glb", rotation: [0.2, -0.55, -0.18] },
};

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(1);
renderer.setSize(512, 392, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

const camera = new THREE.PerspectiveCamera(28, 512 / 392, 0.01, 20);
camera.position.set(0, 0.05, 3.2);
scene.add(new THREE.HemisphereLight(0xffe6df, 0x190302, 2.4));
const key = new THREE.DirectionalLight(0xff8a76, 4.2);
key.position.set(2.5, 3, 4);
scene.add(key);
const rim = new THREE.DirectionalLight(0xff241d, 3.1);
rim.position.set(-3, 1, -2);
scene.add(rim);
```

Center with `THREE.Box3`, scale the longest dimension to `1.75`, apply the rotation triplet, render once after loading, and set `document.body.dataset.ready = "true"`. Give each canvas a separate route using `?model=bazooka` or `?model=whip` so Chrome captures only one transparent canvas.

- [ ] **Step 4: Capture lossless transparent source PNGs**

Start `python -m http.server 4173 --bind 127.0.0.1` from the repository root. In another PowerShell process, run Chrome headlessly with transparent default background:

```powershell
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --enable-webgl --ignore-gpu-blocklist --hide-scrollbars --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --default-background-color=00000000 --window-size=512,392 --screenshot="$env:TEMP\troy-bazooka.png" 'http://127.0.0.1:4173/.superpowers/icon-render/troy-control-icons.html?model=bazooka'
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --enable-webgl --ignore-gpu-blocklist --hide-scrollbars --run-all-compositor-stages-before-draw --virtual-time-budget=5000 --default-background-color=00000000 --window-size=512,392 --screenshot="$env:TEMP\troy-whip.png" 'http://127.0.0.1:4173/.superpowers/icon-render/troy-control-icons.html?model=whip'
```

Open both PNGs for visual inspection. Confirm the full prop is inside the frame, the bazooka barrel reads clearly, the whip curve remains visible, and the background is transparent.

- [ ] **Step 5: Convert the accepted renders to WebP**

Create the output directory, then convert with the installed FFmpeg:

```powershell
New-Item -ItemType Directory -Force 'assets\img\troy\controls'
ffmpeg -y -i "$env:TEMP\troy-bazooka.png" -c:v libwebp -lossless 1 -compression_level 6 'assets\img\troy\controls\bazooka.webp'
ffmpeg -y -i "$env:TEMP\troy-whip.png" -c:v libwebp -lossless 1 -compression_level 6 'assets\img\troy\controls\whip.webp'
```

- [ ] **Step 6: Replace placeholder glyphs with the real rendered assets**

Keep each button’s `data-troy-tool-option` and `aria-pressed` attributes unchanged. Replace only the visual child:

```html
<button class="troy-tool" type="button" data-troy-tool-option="bazooka" aria-pressed="false">
  <span class="troy-tool__icon" aria-hidden="true"><img src="/assets/img/troy/controls/bazooka.webp" width="72" height="55" alt=""></span>
  <span>Bazuka</span>
</button>
<button class="troy-tool" type="button" data-troy-tool-option="whip" aria-pressed="false">
  <span class="troy-tool__icon" aria-hidden="true"><img src="/assets/img/troy/controls/whip.webp" width="72" height="55" alt=""></span>
  <span>Kırbaç</span>
</button>
```

English visible labels are `Bazooka` and `Whip`; asset paths remain identical.

- [ ] **Step 7: Skin all four Troy controls as physical command buttons**

In `home-v3.css`, add the exact four-column/two-column grid contract and style `.troy-tool__icon`, selected `[aria-pressed="true"]`, hover, active, disabled, and focus states. The image must use `object-fit: contain`, must not capture pointer events, and must remain visible when a neighboring label wraps.

- [ ] **Step 8: Verify assets and the complete Troy suite**

Run:

```powershell
node --test
git diff --check
git status --short
```

Expected: all icon and Troy tests pass; there is still exactly one `data-troy-canvas` per homepage; `.superpowers/` remains uncommitted.

---

### Task 4: Morse Flash Product Pages

**Files:**
- Create: `assets/css/product-v3.css`
- Modify: `morse-flash/index.html:27-263`
- Modify: `en/morse-flash/index.html:27-263`
- Modify: `tests/secondary-pages-v3.test.mjs`
- Test: `tests/secondary-pages-v3.test.mjs`

**Interfaces:**
- Consumes: shared command shell, existing Morse screenshot paths, current locked Google Play status, `assets/js/morse.js`, and current section copy.
- Produces: `.product-v3`, `.product-hero-v3`, `.product-feature-grid`, `.product-gallery`, and `.product-trust` layouts.

- [ ] **Step 1: Add failing product-page contracts**

Create `tests/secondary-pages-v3.test.mjs` with the initial product assertions:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
async function read(path) { return readFile(new URL(path, root), "utf8"); }

for (const file of ["morse-flash/index.html", "en/morse-flash/index.html"]) {
  test(`${file} uses the premium product shell without losing content`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="product-v3 theme-command">/);
    assert.match(html, /theme-v3\.css\?v=20260909-command1/);
    assert.match(html, /product-v3\.css\?v=20260909-command1/);
    assert.match(html, /class="[^"]*product-hero-v3[^"]*"/);
    assert.match(html, /class="[^"]*product-feature-grid[^"]*"/);
    assert.match(html, /class="[^"]*product-gallery[^"]*"/);
    assert.equal((html.match(/assets\/img\/shots\//g) || []).length, 4);
    assert.match(html, /morse-flash-policy/);
    assert.match(html, /class="[^"]*command-footer[^"]*"/);
    assert.doesNotMatch(html, /data-troy-canvas|troy-controller\.js/);
  });
}
```

- [ ] **Step 2: Confirm the product contract fails on the old shell**

Run:

```powershell
node --test tests\secondary-pages-v3.test.mjs
```

Expected: FAIL because the v3 body class and CSS are missing.

- [ ] **Step 3: Apply the shared header, language routes, and footer**

Load `theme-v3.css` and `product-v3.css` after `site.css`; set `<body class="product-v3 theme-command">`.

Use these language mappings:

| Page | Current | Alternate |
|---|---|---|
| `/morse-flash/` | `TR` → `/morse-flash/` | `English` → `/en/morse-flash/` |
| `/en/morse-flash/` | `EN` → `/en/morse-flash/` | `Türkçe` → `/morse-flash/` |

Mark `Uygulamalar` or `Apps` as current in the shared nav. Install the full shared footer links and keep the app-specific privacy URL `/morse-flash-policy/`.

- [ ] **Step 4: Apply product classes without rewriting product claims**

Keep the current section order, IDs, headings, feature cards, mini-game controls, gallery figures, and text nodes. Make only these class additions:

| Existing element | Final class value |
|---|---|
| `<main id="icerik">` / `<main id="content">` | `class="product-main"` |
| `<section class="hero">` | `class="hero product-hero-v3"` |
| TR `<section id="canli-sinyal">` / EN `<section id="live-signal">` | add `class="product-trust"` |
| Feature section’s `<div class="card-grid">` | `class="card-grid product-feature-grid"` |
| Gallery section’s `<div class="gallery-grid">` | `class="gallery-grid product-gallery"` |

This produces the approved hierarchy using existing content rather than copying or rewording product facts.

Keep the current locked/coming-soon wording and non-clickable store state. Do not fabricate a public app listing URL.

- [ ] **Step 5: Create the product stylesheet**

Create `product-v3.css` around this layout contract:

```css
.product-v3 .product-hero-v3 { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr); align-items: center; gap: clamp(2rem, 6vw, 5rem); }
.product-v3 .product-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.product-v3 .product-gallery { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.product-v3 .product-gallery img { width: 100%; height: auto; border: 1px solid var(--cmd-line); border-radius: var(--cmd-radius); }
.product-v3 .product-trust { max-width: 860px; margin-inline: auto; }

@media (max-width: 820px) {
  .product-v3 .product-hero-v3 { grid-template-columns: 1fr; }
  .product-v3 .product-feature-grid { grid-template-columns: 1fr 1fr; }
  .product-v3 .product-gallery { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 520px) {
  .product-v3 .product-feature-grid { grid-template-columns: 1fr; }
}
```

Apply the shared panel and button language. Keep screenshots uncropped and do not animate them under reduced motion.

- [ ] **Step 6: Verify both locales and the current Morse script**

Run:

```powershell
node --check assets\js\morse.js
node --test tests\secondary-pages-v3.test.mjs
git diff --check
```

Expected: product tests pass, both pages still reference four locale-specific screenshots, and no Troy runtime loads.

---

### Task 5: Radar Command Dashboard Without Breaking Injection

**Files:**
- Create: `assets/css/radar-v3.css`
- Modify: `radar/index.html:28-88,324-373`
- Modify: `en/radar/index.html:28-88,324-373`
- Modify: `tests/secondary-pages-v3.test.mjs`
- Test: `tests/secondary-pages-v3.test.mjs`

**Interfaces:**
- Consumes: existing generated `.rd-*` classes and all four Radar markers.
- Produces: `.radar-v3`, `.radar-command-hero`, and visual rules for `.rd-stamp`, `.rd-block`, `.rd-grid`, `.rd-card`, `.rd-cmd`, and news cards.

- [ ] **Step 1: Extend the secondary-page test with Radar invariants**

Append:

```js
for (const file of ["radar/index.html", "en/radar/index.html"]) {
  test(`${file} uses the Radar v3 shell and one injection boundary`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="radar-v3 theme-command">/);
    assert.match(html, /theme-v3\.css\?v=20260909-command1/);
    assert.match(html, /radar-v3\.css\?v=20260909-command1/);
    assert.equal((html.match(/<!-- RADAR:START -->/g) || []).length, 1);
    assert.equal((html.match(/<!-- RADAR:END -->/g) || []).length, 1);
    assert.ok(html.indexOf("<!-- RADAR:START -->") < html.indexOf("<!-- RADAR:END -->"));
    assert.match(html, /class="rd-grid"/);
  });
}
```

- [ ] **Step 2: Confirm the Radar shell test fails before markup changes**

Run:

```powershell
node --test tests\secondary-pages-v3.test.mjs
```

Expected: product tests pass and Radar v3 assertions fail.

- [ ] **Step 3: Apply the shared shell outside the injection boundary**

Load `theme-v3.css` and `radar-v3.css`; set `<body class="radar-v3 theme-command">`. Replace the header/footer with their localized shared versions and use these language routes:

| Page | Current | Alternate |
|---|---|---|
| `/radar/` | `TR` → `/radar/` | `English` → `/en/radar/` |
| `/en/radar/` | `EN` → `/en/radar/` | `Türkçe` → `/radar/` |

Keep the entire generated region byte-for-byte between `RADAR:START` and `RADAR:END`. Mark Radar as current in the nav.

- [ ] **Step 4: Rebuild only the Radar hero wrapper**

Use:

```html
<section class="radar-command-hero" aria-labelledby="radar-baslik">
  <div class="wrap radar-command-hero__grid">
    <div>
      <p class="system-status"><span aria-hidden="true"></span>Tarama tamamlandı</p>
      <h1 id="radar-baslik">RADAR</h1>
      <p class="lead">Her sabah kendiliğinden çalışır: GitHub'da o gün öne çıkan depoları bulur, ne işe yaradıklarını anlatır, yapay zeka gündemini toplar. Elle hazırlanmaz, robot yazar.</p>
    </div>
    <nav class="radar-jump command-panel" aria-label="Bölümler">
      <a href="#repolar">&gt; Günün Depoları</a>
      <a href="#haberler">&gt; Yapay Zeka Haberleri</a>
    </nav>
  </div>
</section>
```

For English, retain the current complete introduction and use the exact generated jump targets `#repos` and `#news`, with visible labels `> Today's Repos` and `> AI News`.

Do not rename the existing destination IDs `repolar` and `haberler` or their English equivalents already emitted by the renderer.

- [ ] **Step 5: Create Radar-specific visual rules against generated classes**

Create `radar-v3.css` with this stable core:

```css
.radar-v3 .radar-command-hero__grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, .34fr); gap: 18px; align-items: end; }
.radar-v3 .radar-body { position: relative; z-index: 1; }
.radar-v3 .rd-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.radar-v3 .rd-card { border: 1px solid var(--cmd-line); border-radius: var(--cmd-radius); background: linear-gradient(155deg, rgba(21,21,25,.97), rgba(8,8,10,.97)); box-shadow: 0 18px 44px rgba(0,0,0,.28); }
.radar-v3 .rd-card:hover { border-color: var(--cmd-line-red); }
.radar-v3 .rd-cmd { overflow-x: auto; border-left: 3px solid var(--cmd-red); }

@media (max-width: 780px) {
  .radar-v3 .radar-command-hero__grid,
  .radar-v3 .rd-grid { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .radar-v3 .rd-card { transition: none; transform: none; }
}
```

Style ranks, language badges, install commands, external links, avatars, timestamps, source labels, and news metadata without relying on inline generated accent colors for readability.

- [ ] **Step 6: Prove the Radar generator still recognizes every page**

Run:

```powershell
node scripts\radar.mjs --dry --input assets\data\radar.json
node --test tests\secondary-pages-v3.test.mjs tests\site-contract.test.mjs
git diff --check
```

Expected: Radar reports both full pages and both homepage boxes; all marker tests pass; no generated file is written.

---

### Task 6: Restrained Policy Pages and Branded 404

**Files:**
- Modify: `morse-flash-policy/index.html:1-79`
- Modify: `airmousehand-policy/index.html:1-83`
- Modify: `404.html:1-28`
- Modify: `assets/css/product-v3.css`
- Modify: `tests/secondary-pages-v3.test.mjs`
- Test: `tests/secondary-pages-v3.test.mjs`

**Interfaces:**
- Consumes: policy paragraphs exactly as they currently exist, shared shell tokens, and static navigation.
- Produces: `.policy-v3`, `.policy-document`, `.not-found-v3`, and `.not-found-panel`; no required JavaScript.

- [ ] **Step 1: Extend the secondary-page contract for policies and 404**

Append:

```js
for (const file of ["morse-flash-policy/index.html", "airmousehand-policy/index.html"]) {
  test(`${file} is readable, themed, and animation-free`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="policy-v3 theme-command">/);
    assert.match(html, /theme-v3\.css\?v=20260909-command1/);
    assert.match(html, /product-v3\.css\?v=20260909-command1/);
    assert.match(html, /class="policy-document"/);
    assert.doesNotMatch(html, /data-troy-|troy-controller|<canvas\b|bg\.js/);
  });
}

test("404 uses the compact branded shell without heavy animation", async () => {
  const html = await read("404.html");
  assert.match(html, /<body class="not-found-v3 theme-command">/);
  assert.match(html, /class="[^"]*not-found-panel[^"]*"/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/en\/"/);
  assert.doesNotMatch(html, /data-troy-|troy-controller|<canvas\b/);
});
```

- [ ] **Step 2: Save hashes of policy content before editing the shell**

Use a read-only extraction command that captures each existing `<main>` block:

```powershell
$policyFiles = @('morse-flash-policy\index.html','airmousehand-policy\index.html')
foreach ($file in $policyFiles) {
  $html = Get-Content -Raw $file
  $nodes = [regex]::Matches($html, '<(h1|h2|p)\b[^>]*>[\s\S]*?</\1>') | ForEach-Object { $_.Value }
  $bodyContract = $nodes -join "`n"
  $bytes = [Text.Encoding]::UTF8.GetBytes($bodyContract)
  [pscustomobject]@{ File=$file; Sha256=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)) }
}
```

Record the two hashes in the task log. Run the same command after the markup move and require an exact hash match for each file.

- [ ] **Step 3: Replace inline policy CSS with the restrained shared shell**

Remove each inline `<style>`, load `theme-v3.css` and `product-v3.css`, and set `<body class="policy-v3 theme-command">`. Add `<a class="skip-link" href="#icerik">İçeriğe geç</a>` immediately after `<body>`. Change the existing `<main>` start tag to `<main id="icerik" class="policy-main"><article class="policy-document">`, then insert `</article>` immediately before the existing closing `</main>`. Every heading, paragraph, date, and link between those tags must stay byte-for-byte unchanged.

Add the compact shared brand header and footer outside `<main>`. Do not load `bg.js`, `tilt.js`, `mascot.js`, `home-v3.js`, or Troy modules.

- [ ] **Step 4: Restyle 404 as a lightweight branded signal-loss panel**

Set `<body class="not-found-v3 theme-command">`, remove `#bg-signal`, load `theme-v3.css` and `product-v3.css`, add `<a class="skip-link" href="#icerik">İçeriğe geç</a>` after `<body>`, and use:

```html
<main id="icerik" class="page-404">
  <section class="command-panel not-found-panel">
    <p class="system-status"><span aria-hidden="true"></span>404 · Sinyal kayboldu / Signal lost</p>
    <h1>Yanlış frekans.</h1>
    <p>Aradığın sayfa bu komuta merkezinde yok.<br><span lang="en">This page is not in the command center.</span></p>
    <div class="not-found-actions">
      <a class="command-button command-button--primary" href="/">Ana Üsse Dön</a>
      <a class="command-button" href="/en/" lang="en">English Base</a>
    </div>
  </section>
</main>
```

Do not load the full Troy scene or animated signal canvas.

- [ ] **Step 5: Add policy and 404 layout rules**

Append to `product-v3.css`:

```css
.policy-v3 .policy-main { width: min(820px, calc(100% - 32px)); margin-inline: auto; padding: clamp(2rem, 6vw, 5rem) 0; }
.policy-v3 .policy-document { padding: clamp(1.25rem, 4vw, 3rem); border: 1px solid var(--cmd-line); border-radius: var(--cmd-radius); background: var(--cmd-surface); line-height: 1.75; }
.policy-v3 .policy-document h1 { max-width: 18ch; }
.policy-v3 .policy-document h2 { margin-top: 2.5rem; color: var(--cmd-red-bright); }
.policy-v3 .policy-document a { color: var(--cmd-focus); text-underline-offset: .2em; }
.not-found-v3 .page-404 { min-height: 75vh; display: grid; place-items: center; padding: 2rem 1rem; }
.not-found-v3 .not-found-panel { width: min(680px, 100%); padding: clamp(1.5rem, 5vw, 3.5rem); text-align: center; }
.not-found-v3 .not-found-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .8rem; }
```

- [ ] **Step 6: Verify policy integrity and lightweight runtime**

Run:

```powershell
node --test tests\secondary-pages-v3.test.mjs
rg -n "data-troy-|troy-controller|<canvas|bg\.js|home-v3\.js" morse-flash-policy\index.html airmousehand-policy\index.html 404.html
git diff --check
```

Expected: tests pass and `rg` returns no matches. Manually compare every policy heading and paragraph against the pre-edit extraction before continuing.

---

### Task 7: Cross-Page Parity, Accessibility, Reduced Motion, and Cleanup

**Files:**
- Modify: `tests/premium-shell.test.mjs`
- Modify: `tests/home-v3.test.mjs`
- Modify: `tests/secondary-pages-v3.test.mjs`
- Modify: `assets/css/theme-v3.css`
- Modify: `assets/css/home-v3.css`
- Modify: `assets/css/product-v3.css`
- Modify: `assets/css/radar-v3.css`
- Modify: all nine HTML documents only where a failing contract identifies a gap

**Interfaces:**
- Consumes: every v3 class and data contract established in Tasks 1–6.
- Produces: one passing automated release gate for structure, accessibility essentials, local assets, locale parity, and fallbacks.

- [ ] **Step 1: Add a complete page matrix to the shared-shell test**

Use this exact matrix:

```js
const publicPages = [
  { file: "index.html", lang: "tr", kind: "home" },
  { file: "en/index.html", lang: "en", kind: "home" },
  { file: "morse-flash/index.html", lang: "tr", kind: "product" },
  { file: "en/morse-flash/index.html", lang: "en", kind: "product" },
  { file: "radar/index.html", lang: "tr", kind: "radar" },
  { file: "en/radar/index.html", lang: "en", kind: "radar" },
  { file: "morse-flash-policy/index.html", lang: "tr", kind: "policy" },
  { file: "airmousehand-policy/index.html", lang: "tr", kind: "policy" },
  { file: "404.html", lang: "tr", kind: "not-found" },
];
```

For every page assert one `<main>`, one `h1`, a skip link, shared theme CSS, an exact `<html lang>`, and no auth terms. For home/product/Radar pages assert header/footer, both official emails, Google Play, and all four social URLs. For policy and 404 pages allow the compact footer but still require a visible home link.

- [ ] **Step 2: Add local-asset resolution tests**

Extract every root-relative `src` and stylesheet/module `href` from all pages. Ignore fragment-only anchors and public `https://` links. For each path beginning with `/assets/`, remove the query string and call `access(new URL(relativePath, root))`; fail with `missing local asset referenced by ${file}: ${path}`.

```js
function localAssets(html) {
  return [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => value.startsWith("/assets/"))
    .map((value) => value.split("?")[0].slice(1));
}

for (const pageInfo of publicPages) {
  test(`${pageInfo.file} references only existing local assets`, async () => {
    const html = await read(pageInfo.file);
    for (const asset of localAssets(html)) {
      const exists = await access(new URL(asset, root)).then(() => true, () => false);
      assert.ok(exists, `missing local asset referenced by ${pageInfo.file}: ${asset}`);
    }
  });
}
```

- [ ] **Step 3: Add locale structural parity tests**

For the home, Morse, and Radar pairs, compare counts for these stable elements:

```js
const structuralSelectors = [
  /<header\b/g,
  /<main\b/g,
  /<footer\b/g,
  /class="[^"]*command-button/g,
  /data-inventory-tab/g,
  /data-troy-tool-option/g,
  /class="rd-card/g,
];
```

The count for each pattern must match between TR and EN. Also assert the three language-route pairs from Tasks 1, 4, and 5.

```js
const localePairs = [
  ["index.html", "en/index.html"],
  ["morse-flash/index.html", "en/morse-flash/index.html"],
  ["radar/index.html", "en/radar/index.html"],
];

for (const [trFile, enFile] of localePairs) {
  test(`${trFile} and ${enFile} keep structural parity`, async () => {
    const [tr, en] = await Promise.all([read(trFile), read(enFile)]);
    for (const pattern of structuralSelectors) {
      assert.equal((tr.match(pattern) || []).length, (en.match(pattern) || []).length, pattern.source);
    }
  });
}
```

- [ ] **Step 4: Strengthen accessible control contracts**

Add assertions for:

- Every `.nav-toggle` has `type="button"`, `aria-expanded="false"`, and `aria-controls="nav-menu"`.
- Every language picker is a native `<details>` with a `<summary>` and two valid language links.
- Inventory tabs expose `role="tab"`, `aria-selected`, and a single `tabindex="0"` initially.
- Troy retains `aria-pressed` on tools, `aria-live="polite"` dialogue, poster fallback, and noscript command links.
- Decorative canvases/images have `aria-hidden="true"` or empty `alt` where appropriate.
- External Google Play/social links use both `target="_blank"` and `rel="noopener"`.

Implement these assertions by extracting the relevant start tags and matching attributes independent of order:

```js
function startTags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) || [];
}

test("homepage controls expose keyboard and state attributes", async () => {
  const html = await read("index.html");
  const toggles = startTags(html, "button").filter((tag) => tag.includes("nav-toggle"));
  assert.equal(toggles.length, 1);
  assert.match(toggles[0], /type="button"/);
  assert.match(toggles[0], /aria-expanded="false"/);
  assert.match(toggles[0], /aria-controls="nav-menu"/);
  const inventoryTabs = startTags(html, "button").filter((tag) => tag.includes("data-inventory-tab"));
  assert.equal(inventoryTabs.filter((tag) => tag.includes('role="tab"')).length, inventoryTabs.length);
  assert.equal(inventoryTabs.filter((tag) => tag.includes('tabindex="0"')).length, 1);
  assert.match(html, /class="troy-intro"[^>]*aria-live="polite"/);
});
```

- [ ] **Step 5: Complete reduced-motion and small-screen CSS coverage**

Across all four v3 stylesheets, ensure the final reduced-motion rule disables:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
  }
  .signal-ticker__track,
  .command-hero::after,
  .reveal,
  [data-tilt] {
    animation: none !important;
    transition-duration: .01ms !important;
    transform: none !important;
  }
}
```

Do not globally set every animation to `none`; Troy’s controller already chooses its poster fallback using `troy-preferences.js`. Preserve that tested responsibility split.

- [ ] **Step 6: Remove only dead references, not proven compatibility files**

Search:

```powershell
rg -n "auth-preview|data-auth-status|Google ile Giriş|Sign in to your account" index.html en\index.html assets\css assets\js tests
rg -n "home-v2\.css|20260908-mascot32" index.html en\index.html assets\js\troy tests
```

Expected: the first search has no production markup or active test expectation; the second confirms `home-v2.css` and Troy’s existing cache token are still present. Do not delete `home-v2.css`, `site.css`, or any Troy module in this redesign.

- [ ] **Step 7: Run the complete automated gate**

Run:

```powershell
node --check assets\js\site.js
node --check assets\js\home-v3.js
node --test
node scripts\radar.mjs --dry --input assets\data\radar.json
git diff --check
```

Expected: all tests pass, Radar recognizes all four injection targets, and the diff has no whitespace errors.

---

### Task 8: Live Browser Verification and User Approval Gate

**Files:**
- Modify: only files tied to a specific defect observed during this task
- Review: all public pages and responsive breakpoints

**Interfaces:**
- Consumes: the complete local v3 site.
- Produces: visual evidence, a defect-free local preview, and the user’s explicit decision about commit/push.

- [ ] **Step 1: Start the local static server without publishing**

Run:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/?revision=command1`. This is local only.

- [ ] **Step 2: Verify desktop homepage behavior at 1440×900**

Check both `/` and `/en/`:

- Header, current nav state, visible `TR/EN` dropdown, and compact footer.
- Two-column hero with no auth card.
- Inventory and Google Play CTAs.
- Heartbeat/circuit pulse and continuously flowing signal ticker.
- 40/35/25 dashboard balance.
- Morse app selection and keyboard arrows/Home/End.
- Troy Dürt, Bazuka, Kırbaç, Komut Ver; real WebP prop icons; dialogue visibility; command links.
- No browser console error or warning caused by project code.

- [ ] **Step 3: Verify the bazooka’s site-wide flight has not regressed**

Fire Bazuka and confirm the rocket crosses page controls, leaves the viewport, returns to Troy, sparks/flinch/dialogue occur, explosion and pixel scatter synchronize, the pixel ghost remains interactive, and clicking Troy reassembles him. Scroll during flight and confirm the rocket stays in viewport coordinates rather than drifting with document scroll.

- [ ] **Step 4: Verify responsive layouts**

At 1024×768, 768×1024, 390×844, and 360×800, check:

- No horizontal page overflow.
- Mobile nav opens/closes and Escape restores focus.
- Language control remains visible.
- Home dashboard stacks Inventory → Radar → About.
- Troy controls use a readable 2×2 grid.
- Dialogue does not cover Troy’s face.
- App dock scrolls horizontally without expanding page width.
- Product screenshots stay uncropped.
- Radar cards and installation commands remain readable.

- [ ] **Step 5: Verify reduced motion and fallbacks**

Emulate `prefers-reduced-motion: reduce`, reload both homepages, and confirm:

- Troy uses the tested poster fallback.
- Ticker and circuit pulse are static.
- Tilt and reveal motion stop.
- All content and controls remain usable.

Disable JavaScript and confirm native navigation, language links, first inventory detail/link, generated Radar content, policy copy, and 404 actions remain accessible.

- [ ] **Step 6: Verify every secondary page**

Open:

```text
/morse-flash/
/en/morse-flash/
/radar/
/en/radar/
/morse-flash-policy/
/airmousehand-policy/
/404.html
```

Confirm common shell consistency, localized routes, readable long-form copy, preserved screenshots/Radar cards, no Troy runtime on secondary pages, and no missing asset request.

- [ ] **Step 7: Re-run the automated gate after any visual fix**

Run:

```powershell
node --check assets\js\site.js
node --check assets\js\home-v3.js
node --test
node scripts\radar.mjs --dry --input assets\data\radar.json
git diff --check
git status --short
```

Expected: the full test suite passes and every intended production file is visible as an uncommitted change.

- [ ] **Step 8: Present the final local preview to the user**

Give the user the local URL and summarize only:

- What visibly changed.
- Which automated and browser checks passed.
- Any intentionally deferred item: real auth remains excluded.
- That no commit or push has occurred.

Wait for explicit user approval. If the user requests corrections, apply and repeat Steps 2–7. If the user approves publication, then and only then prepare the exact staged-file list and ask for/act on the user’s commit/push instruction.

---

## Final Completion Gate

The implementation is ready for publication only when all of these are true:

- `node --test` passes completely.
- `node scripts\radar.mjs --dry --input assets\data\radar.json` recognizes all four injection targets.
- `git diff --check` is clean.
- Both home locales show the approved hero, Google Play CTA, signal system, dashboard, inventory, and Troy controls.
- All seven secondary URLs use the appropriate v3 theme and remain readable.
- Policy content is unchanged in meaning and paragraph sequence.
- No auth UI or data-collection control exists.
- Reduced-motion, JavaScript-off, poster, and missing-asset fallbacks retain access to core content.
- The user has visually reviewed the local site and explicitly approved commit/push.
