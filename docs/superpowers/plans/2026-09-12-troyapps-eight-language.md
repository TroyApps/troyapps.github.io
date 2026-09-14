# TroyApps Eight-Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish-ready static TroyApps home and Morse Flash pages for `tr`, `en`, `es-419`, `pt-BR`, `hi`, `id`, `ar`, and `de`, while keeping daily Radar AI summaries limited to Turkish and English.

**Architecture:** Keep Turkish and English HTML as the authored sources. A locale manifest and deterministic generator transform the English home and Morse Flash sources into the six additional locale folders, update every language menu and SEO cluster, and produce a complete sitemap. Troy dialogue uses the same locale manifest keys and falls back to English only for unknown locales.

**Tech Stack:** Static HTML/CSS, browser JavaScript ES modules, Node.js 20 scripts, Node's built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-12-troyapps-eight-language-design.md`

## Global Constraints

- Public locale set is exactly `tr`, `en`, `es-419`, `pt-BR`, `hi`, `id`, `ar`, and `de`.
- Display labels are exactly `TR`, `EN`, `ES`, `PT-BR`, `HI`, `ID`, `AR`, and `DE`.
- Public folders are `/`, `/en/`, `/es/`, `/pt-br/`, `/hi/`, `/id/`, `/ar/`, and `/de/`.
- `TroyApps`, `Troy`, `Morse Flash`, and `Radar` are never translated.
- Arabic pages use `<html lang="ar" dir="rtl">`; all other pages use left-to-right flow.
- Daily Radar summaries and generated Radar pages remain Turkish and English only.
- Existing social, email, Google Play, Troy model, cache-busting, and Radar marker references must survive generation unchanged.
- Do not commit, push, deploy, or change `.github/workflows/radar.yml`.

---

### Task 1: Locale manifest and route contracts

**Files:**
- Create: `assets/js/locales.js`
- Create: `tests/locales.test.mjs`

**Interfaces:**
- Produces: `SITE_LOCALES`, `resolveSiteLocale(language)`, `localePath(locale, page)`, and `languageMenu(locale, page)`.
- `page` is one of `home`, `morse`, or `radar`.
- `localePath()` returns root-relative URLs; Radar returns `/radar/` for Turkish and `/en/radar/` for every other locale.

- [ ] **Step 1: Write the failing locale behavior tests**

```js
assert.deepEqual(SITE_LOCALES.map(({ language }) => language),
  ["tr", "en", "es-419", "pt-BR", "hi", "id", "ar", "de"]);
assert.equal(resolveSiteLocale("es-MX").language, "es-419");
assert.equal(resolveSiteLocale("xx").language, "en");
assert.equal(localePath("pt-BR", "morse"), "/pt-br/morse-flash/");
assert.equal(localePath("ar", "radar"), "/en/radar/");
assert.equal((languageMenu("de", "home").match(/<a\b/g) || []).length, 8);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/locales.test.mjs`

Expected: FAIL because `assets/js/locales.js` does not exist.

- [ ] **Step 3: Implement the locale manifest and pure route/menu helpers**

```js
export const SITE_LOCALES = Object.freeze([
  { language: "tr", folder: "", label: "TR", name: "Türkçe", dir: "ltr" },
  { language: "en", folder: "en", label: "EN", name: "English", dir: "ltr" },
  { language: "es-419", folder: "es", label: "ES", name: "Español", dir: "ltr" },
  { language: "pt-BR", folder: "pt-br", label: "PT-BR", name: "Português (Brasil)", dir: "ltr" },
  { language: "hi", folder: "hi", label: "HI", name: "हिन्दी", dir: "ltr" },
  { language: "id", folder: "id", label: "ID", name: "Bahasa Indonesia", dir: "ltr" },
  { language: "ar", folder: "ar", label: "AR", name: "العربية", dir: "rtl" },
  { language: "de", folder: "de", label: "DE", name: "Deutsch", dir: "ltr" },
]);
```

Implement `resolveSiteLocale()` with exact language matching plus `es-*` to `es-419` and `pt-*` to `pt-BR`. Build the menu from the manifest and add `aria-current="page"` only to the selected locale.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test tests/locales.test.mjs`

Expected: PASS.

- [ ] **Step 5: Review checkpoint without committing**

Run: `git diff -- assets/js/locales.js tests/locales.test.mjs`

### Task 2: Deterministic static-page generator and translations

**Files:**
- Create: `scripts/locale-copy.mjs`
- Create: `scripts/generate-locales.mjs`
- Create: `tests/generate-locales.test.mjs`
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `morse-flash/index.html`
- Modify: `en/morse-flash/index.html`
- Create generated pages: `es/index.html`, `es/morse-flash/index.html`, `pt-br/index.html`, `pt-br/morse-flash/index.html`, `hi/index.html`, `hi/morse-flash/index.html`, `id/index.html`, `id/morse-flash/index.html`, `ar/index.html`, `ar/morse-flash/index.html`, `de/index.html`, `de/morse-flash/index.html`

**Interfaces:**
- Consumes: `SITE_LOCALES`, `localePath()`, and `languageMenu()` from Task 1.
- Produces: `PAGE_COPY`, `translatePage(sourceHtml, locale, page)`, and `writeLocalizedPages(rootUrl)`.
- `translatePage()` returns one complete HTML document and throws when a required source phrase is absent.

- [ ] **Step 1: Write failing generator integration tests**

Use a temporary output directory, copy the four authored source pages into it, call `writeLocalizedPages()`, and assert literal observable output:

```js
const ar = await readFile(join(output, "ar/index.html"), "utf8");
assert.match(ar, /<html lang="ar" dir="rtl">/);
assert.match(ar, /<title>[^<]*TroyApps[^<]*<\/title>/);
assert.match(ar, /href="\/ar\/morse-flash\/"/);
assert.equal((ar.match(/<div class="language-options">[\s\S]*?<\/div>/)?.[0].match(/<a\b/g) || []).length, 8);

const es = await readFile(join(output, "es/morse-flash/index.html"), "utf8");
assert.match(es, /<html lang="es-419">/);
assert.match(es, /CONVIERTE LA LUZ EN CÓDIGO/);
assert.match(es, /href="\/en\/radar\/"/);
```

Also compare every local asset URL in generated pages with the source file so the generator cannot silently drop Troy or social assets.

- [ ] **Step 2: Run the focused generator test and verify RED**

Run: `node --test tests/generate-locales.test.mjs`

Expected: FAIL because the generator and dictionaries do not exist.

- [ ] **Step 3: Add complete home and Morse Flash dictionaries**

`PAGE_COPY` contains explicit `home` and `morse` maps for all eight language keys. Translate visible copy, title, description, Open Graph text, accessibility labels, `data-*` UI strings, section IDs used by locale command links, and footer text. Keep brand/product names and external URLs byte-for-byte identical.

- [ ] **Step 4: Implement strict source transformation**

`translatePage()` starts from the English authored source for non-Turkish locales, replaces the HTML language/direction, canonical URL, complete alternate cluster, language menu, internal locale routes, metadata, IDs, and every dictionary phrase. A helper records replacement counts and throws if a required phrase is missing or replaced more than its declared count.

- [ ] **Step 5: Generate all locale pages**

Run: `node scripts/generate-locales.mjs`

Expected: twelve generated HTML files plus refreshed menus/SEO clusters in the four authored pages.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run: `node --test tests/generate-locales.test.mjs`

Expected: PASS with no warnings.

- [ ] **Step 7: Review checkpoint without committing**

Run: `git diff --stat -- index.html en/index.html morse-flash/index.html en/morse-flash/index.html es pt-br hi id ar de scripts/locale-copy.mjs scripts/generate-locales.mjs tests/generate-locales.test.mjs`

### Task 3: Troy dialogue for every locale

**Files:**
- Modify: `assets/js/troy/troy-copy.js`
- Modify: `assets/js/troy/troy-controller.js`
- Modify: `tests/troy-actions.test.mjs`

**Interfaces:**
- Consumes: document `<html lang>`.
- Produces: `getTroyCopy(language)` resolving all eight public locale languages, regional aliases, and an English fallback.
- Every locale returns the existing `tools`, `commands`, and complete `dialogue` shape.

- [ ] **Step 1: Extend Troy tests and verify they fail**

```js
for (const language of ["tr", "en", "es-419", "pt-BR", "hi", "id", "ar", "de"]) {
  const copy = getTroyCopy(language);
  assert.equal(Object.keys(copy.tools).length, 4);
  assert.equal(Object.keys(copy.commands).length, 4);
  for (const key of requiredDialogueKeys) assert.ok(copy.dialogue[key]?.length > 0);
}
assert.equal(getTroyCopy("es-MX"), getTroyCopy("es-419"));
assert.equal(getTroyCopy("unknown"), getTroyCopy("en"));
```

Run: `node --test tests/troy-actions.test.mjs`

Expected: FAIL because non-English languages currently resolve to Turkish.

- [ ] **Step 2: Add culturally natural Troy dictionaries**

Add complete Spanish, Brazilian Portuguese, Hindi, Indonesian, Arabic, and German objects with the exact same shape as Turkish and English. Preserve the sarcastic/playful intent, including bazooka impact, scattered-pixel requests, poke escalation, whip escalation, acknowledgements, and recovery.

- [ ] **Step 3: Replace the binary language branch**

In `troy-controller.js`, pass `document.documentElement.lang` directly to `getTroyCopy()`. In `troy-copy.js`, normalize case and regional aliases before selecting the dictionary; default to English.

- [ ] **Step 4: Run Troy tests and verify GREEN**

Run: `node --test tests/troy-actions.test.mjs tests/troy-animation.test.mjs tests/troy-dialogue-visuals.test.mjs`

Expected: PASS.

- [ ] **Step 5: Regenerate pages so visible control labels match Troy dictionaries**

Run: `node scripts/generate-locales.mjs`

Expected: generated home controls and command links use the same translated labels returned by `getTroyCopy()`.

### Task 4: RTL presentation and complete SEO map

**Files:**
- Modify: `assets/css/theme-v3.css`
- Modify: `assets/css/home-v3.css`
- Modify: `assets/css/product-v3.css`
- Modify: `sitemap.xml`
- Create: `tests/locale-pages.test.mjs`

**Interfaces:**
- Consumes: generated HTML from Task 2.
- Produces: usable Arabic layout and complete localized sitemap/hreflang clusters.

- [ ] **Step 1: Write failing public-page contract tests**

For every locale and for `home` and `morse`, assert the file exists, has the correct `lang`/`dir`, exactly one canonical URL, all eight alternates plus `x-default`, eight menu links, preserved local assets, preserved social/email/Google Play links, and the agreed Radar fallback. Parse `sitemap.xml` and assert sixteen localized URLs with matching alternate clusters.

- [ ] **Step 2: Run the contract test and verify RED**

Run: `node --test tests/locale-pages.test.mjs`

Expected: FAIL because RTL rules and the expanded sitemap are absent.

- [ ] **Step 3: Add narrowly scoped RTL rules**

Use logical CSS properties and `[dir="rtl"]` selectors. Right-align Arabic prose and navigation flow, mirror directional spacing and menu placement, and keep `.command-brand`, `.troy-stage`, `.troy-tools`, `.social-links`, email addresses, URLs, and code samples left-to-right where visual or technical order matters.

- [ ] **Step 4: Generate the full sitemap**

Extend `generate-locales.mjs` to produce `sitemap.xml` from `SITE_LOCALES` for home and Morse Flash. Every URL receives the eight locale alternates and `x-default` pointing to Turkish. Preserve the existing TR/EN Radar URLs with daily metadata and do not add duplicate non-English Radar URLs.

- [ ] **Step 5: Regenerate and verify GREEN**

Run: `node scripts/generate-locales.mjs`

Run: `node --test tests/locale-pages.test.mjs`

Expected: PASS.

### Task 5: Regression and browser verification

**Files:**
- Modify only files required to fix failures found by the checks.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a verified local implementation ready for user review.

- [ ] **Step 1: Run the complete automated suite**

Run: `node --test tests/*.test.mjs`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Serve the static tree locally**

Run: `python -m http.server 4173 --bind 127.0.0.1`

Expected: existing or new local server responds at `http://127.0.0.1:4173/`.

- [ ] **Step 3: Inspect representative pages**

Check `/`, `/es/`, `/pt-br/morse-flash/`, `/hi/`, `/id/morse-flash/`, `/ar/`, `/ar/morse-flash/`, and `/de/` at desktop and mobile widths. Verify selector overflow, menu navigation, localized internal links, no clipped German/Hindi text, RTL direction, Troy controls/dialogue, and console errors.

- [ ] **Step 4: Confirm the release boundary**

Run: `git status --short`

Expected: local changes only. Do not commit or push.
