# TroyApps Premium Home Redesign Implementation Plan

> **For Codex:** Implement each task in order with a red-green verification checkpoint. Do not push until the user approves the local preview.

**Goal:** Rebuild the Turkish and English TroyApps homepages as a dark red/black premium dashboard, preserve the automated Radar feed and existing URLs, add official social links, and prepare a safe renderer boundary for the future 3D mascot Troy.

**Architecture:** Keep the existing static GitHub Pages architecture. Add a homepage-only stylesheet and a small Troy controller module so the redesign does not disturb Radar, Morse Flash, or policy pages. Keep the current Radar injection markers unchanged. The first pass uses an illustrated Troy poster as a progressive-enhancement fallback; Three.js and the GLB model arrive in a later phase behind the same DOM contract.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript ES modules, Node.js built-in test runner, GitHub Pages, existing Radar Node scripts.

---

## Task 1: Lock the homepage contract

- [ ] Add `tests/site-contract.test.mjs` with behavior checks for both locales.
- [ ] Require the premium homepage shell, Troy stage, explicitly inactive auth preview, Radar markers, and all official social destinations.
- [ ] Run `node --test tests/site-contract.test.mjs` and confirm the new homepage tests fail for missing markup.

## Task 2: Build the Turkish homepage shell

- [ ] Add the homepage-only `home-v2` body class and stylesheet.
- [ ] Replace the hero with the three-part dashboard: copy, Troy stage, auth preview.
- [ ] Recompose inventory, Radar, about, and footer while retaining current URLs and Radar marker comments.
- [ ] Remove the legacy Bit/Bug mascot script from the homepage.
- [ ] Run the contract tests and confirm Turkish requirements pass.

## Task 3: Mirror the English homepage

- [ ] Apply the identical semantic structure to `en/index.html` with English copy.
- [ ] Preserve canonical, alternate-language, app, Radar, and policy links.
- [ ] Run the contract tests and confirm both locales pass.

## Task 4: Add scoped premium styling

- [ ] Create `assets/css/home-v2.css` with the black/red design tokens and dashboard layout.
- [ ] Implement desktop, tablet, and mobile layouts without changing shared subpage styles.
- [ ] Add reduced-motion and high-contrast/focus behavior.
- [ ] Keep the static Troy fallback legible when scripts, WebGL, or motion are unavailable.

## Task 5: Add the Troy interaction boundary

- [ ] Create `assets/js/troy/troy-controller.js` as a tiny state controller for idle, talk, point, annoyed, hit, and recover.
- [ ] Keep speech bubbles in accessible DOM content and make character reactions decorative/non-blocking.
- [ ] Ensure the controller is optional: the page remains usable if the module fails.
- [ ] Add controller behavior tests before implementation and complete their red-green cycle.

## Task 6: Protect automated and static contracts

- [ ] Run the Radar renderer against a temporary copy/fixture or dry path and ensure its homepage injection still succeeds.
- [ ] Verify `app-ads.txt` remains one BOM-free line with the exact publisher record.
- [ ] Verify no real form submission, account creation, storage, analytics, or authentication code exists.
- [ ] Run all Node tests and inspect `git diff --check`.

## Task 7: Local preview checkpoint

- [ ] Start a local static server and confirm Turkish/English pages and linked static assets return HTTP 200.
- [ ] Open the first meaningful local preview for user review.
- [ ] Do not commit or push until the user approves the design.

## Deferred phases

- [ ] Produce Troy turnaround references, Tripo base mesh, Blender cleanup/rig/animations, and optimized GLB.
- [ ] Add Three.js behind the existing Troy stage/controller boundary.
- [ ] Redesign shared navigation and secondary pages after homepage approval.
- [ ] Define the account product, threat model, privacy requirements, abuse controls, recovery flow, and security tests before implementing real authentication.
