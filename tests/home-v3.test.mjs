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

test("inventory keyboard navigation skips placeholders as the dock grows", async () => {
  const { nextEnabledInventoryIndex } = await import(homeModule);
  const disabled = [false, true, false, true];

  assert.equal(nextEnabledInventoryIndex(0, "ArrowRight", disabled), 2);
  assert.equal(nextEnabledInventoryIndex(2, "ArrowRight", disabled), 0);
  assert.equal(nextEnabledInventoryIndex(0, "ArrowLeft", disabled), 2);
  assert.equal(nextEnabledInventoryIndex(2, "Home", disabled), 0);
  assert.equal(nextEnabledInventoryIndex(0, "End", disabled), 2);
});

for (const file of ["index.html", "en/index.html"]) {
  test(`${file} exposes the approved home dashboard`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="home-v2 home-v3 theme-command">/);
    assert.match(html, /home-v3\.css\?v=20260914-ticker-loop1/);
    assert.match(html, /class="[^"]*command-hero[^"]*"/);
    assert.match(html, /class="[^"]*signal-ticker[^"]*"/);
    assert.match(html, /class="[^"]*home-command-grid[^"]*"/);
    assert.match(html, /data-inventory-tab/);
    assert.match(html, /data-inventory-detail/);
    assert.match(html, /https:\/\/play\.google\.com\/store\/apps\/developer\?id=Troy\+Apps/);
    assert.doesNotMatch(html, /auth-preview|data-auth-status/i);
  });
}

test("signal ticker repeats two identical viewport-wide groups without a loop gap", async () => {
  const [tr, en, css] = await Promise.all([
    read("index.html"),
    read("en/index.html"),
    read("assets/css/home-v3.css"),
  ]);

  for (const html of [tr, en]) {
    const ticker = html.match(/<section class="signal-ticker"[\s\S]*?<\/section>/)?.[0] ?? "";
    const groups = [...ticker.matchAll(/<div class="signal-ticker__group">([\s\S]*?)<\/div>/g)]
      .map((match) => match[1]);
    assert.equal(groups.length, 2);
    assert.equal(groups[0], groups[1]);
    assert.equal((groups[0].match(/<span>/g) || []).length, 3);
  }

  assert.match(css, /\.signal-ticker__track\s*\{[^}]*gap:\s*0/s);
  assert.match(css, /\.signal-ticker__group\s*\{[^}]*min-width:\s*100vw/s);
  assert.match(css, /\.signal-ticker__group\s*\{[^}]*flex:\s*0\s+0\s+auto/s);
});

test("home CSS carries the 40/35/25 layout and motion fallback", async () => {
  const css = await read("assets/css/home-v3.css");
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*40fr\)\s+minmax\(0,\s*35fr\)\s+minmax\(0,\s*25fr\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.home-v3\s+\.troy-tools[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.home-v3\s+\.troy-tools[\s\S]*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});

test("the old Troy poster stays hidden during normal 3D loading", async () => {
  const css = await read("assets/css/home-v2.css");
  assert.match(css, /(?:^|\})\s*\.home-v2\s+\[data-troy-renderer="loading"\]\s+\.troy-poster\s*\{[^}]*opacity:\s*0[^}]*visibility:\s*hidden/s);
  assert.doesNotMatch(css, /\.js\s+\.home-v2\s+\[data-troy-renderer="loading"\]/);
  assert.match(css, /\[data-troy-renderer="fallback"\]\s+\.troy-poster\s*\{[^}]*opacity:\s*1[^}]*visibility:\s*visible/s);
});

test("the rocket flame animation stops as soon as the engine stalls", async () => {
  const css = await read("assets/css/home-v2.css");
  assert.match(css, /\[data-rocket-phase="stall"\]\s+\.troy-site-rocket__flame[\s\S]*?animation:\s*none[\s\S]*?opacity:\s*0/);
  assert.match(css, /\[data-rocket-phase="fall"\]\s+\.troy-site-rocket__flame/);
});
test("v3 motion stops decorative movement without disabling Troy globally", async()=>{const css=await read("assets/css/home-v3.css");assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*signal-ticker__track[\s\S]*animation:\s*none/);assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*command-hero::after/);assert.doesNotMatch(css,/\*\s*\{[^}]*animation:\s*none/i);});
test("hero wordmark traces only the SVG glyph outlines", async () => {
  const [tr, en, css] = await Promise.all([read("index.html"), read("en/index.html"), read("assets/css/home-v3.css")]);
  for (const html of [tr, en]) {
    assert.match(html, /class="command-wordmark" data-wordmark="TROYAPPS"/);
    assert.match(html, /class="command-wordmark__graphic"/);
    assert.match(html, /class="[^"]*command-wordmark__edge[^"]*"/);
    assert.match(html, /home-v3\.css\?v=20260914-ticker-loop1/);
  }
  assert.match(css, /\.command-wordmark__edge\s*\{[^}]*fill:\s*none[^}]*stroke-dasharray:/s);
  assert.match(css, /\.command-wordmark__edge\s*\{[^}]*animation:\s*wordmark-edge-trace/s);
  assert.match(css, /@keyframes wordmark-edge-trace/);
  assert.doesNotMatch(css, /\.command-wordmark::(?:before|after)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.command-wordmark__edge[\s\S]*animation:\s*none/);
});
test("auth is absent while the Troy compatibility token remains",async()=>{const [tr,en,css,js]=await Promise.all([read("index.html"),read("en/index.html"),read("assets/css/home-v3.css"),read("assets/js/home-v3.js")]);assert.doesNotMatch(`${tr}\n${en}\n${css}\n${js}`,/auth-preview|data-auth-status/i);assert.match(tr,/home-v2\.css\?v=20260912-drop7/);assert.match(en,/troy-controller\.js\?v=20260914-lookdown1/);});
for(const file of ["index.html","en/index.html","morse-flash/index.html","en/morse-flash/index.html","radar/index.html","en/radar/index.html"])test(`${file} has one native language control`,async()=>{const html=await read(file);assert.equal((html.match(/class="language-menu"/g)||[]).length,1);assert.doesNotMatch(html,/class="lang-item"|class="lang-switch"/);});
test("home inventory is one top-level panel without legacy duplicate",async()=>{const [tr,en,css]=await Promise.all([read("index.html"),read("en/index.html"),read("assets/css/home-v3.css")]);for(const html of [tr,en]){assert.doesNotMatch(html,/class="apps-grid"/);assert.match(html,/class="[^"]*command-panel[^"]*inventory-panel[^"]*"/);assert.match(html,/radar-summary/);assert.match(html,/about-summary/);}assert.match(css,/\.home-v3\s+\.home-command-grid\s*\{[^}]*display:\s*block/);});

test("v3 owns the compact premium home shell instead of leaking retro layout", async () => {
  const css = await read("assets/css/home-v3.css");
  assert.match(css, /\.home-v3\s+\.page-rails\s*>\s*main\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*40fr\)\s+minmax\(0,\s*35fr\)\s+minmax\(0,\s*25fr\)/s);
  assert.match(css, /\.home-v3\s+\.command-hero\s*\{[^}]*min-height:\s*clamp\(430px,\s*34vw,\s*520px\)/s);
  assert.match(css, /\.home-v3\s+:is\(\.command-nav,\s*\.command-panel,\s*\.command-footer\)\s*\{[^}]*font-family:\s*var\(--cmd-font-body\)/s);
  assert.match(css, /\.home-v3\s+:is\(\.command-panel h2,\s*\.command-panel h3\)\s*\{[^}]*font-family:\s*var\(--cmd-font-body\)/s);
});

test("home navigation exposes only the approved primary destinations", async () => {
  const cases = [
    ["index.html", ["Anasayfa", "Uygulamalar", "İletişim"]],
    ["en/index.html", ["Home", "Apps", "Contact"]],
  ];

  for (const [file, expected] of cases) {
    const html = await read(file);
    const nav = html.match(/<nav class="nav-menu command-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const labels = [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((match) =>
      match[1].replace(/<[^>]+>/g, "").trim(),
    );
    assert.deepEqual(labels, expected);
  }
});
