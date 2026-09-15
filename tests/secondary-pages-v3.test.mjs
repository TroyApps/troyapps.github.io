import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const root = new URL("../", import.meta.url); const read=(path)=>readFile(new URL(path,root),"utf8");
for(const file of ["morse-flash/index.html","en/morse-flash/index.html"]) test(`${file} uses premium product shell`,async()=>{const html=await read(file);assert.match(html,/<body class="product-v3 theme-command">/);assert.match(html,/theme-v3\.css\?v=20260914-adrails1/);assert.match(html,/product-v3\.css\?v=20260913-header1/);assert.match(html,/class="[^"]*product-hero-v3[^"]*"/);assert.match(html,/class="[^"]*product-feature-grid[^"]*"/);assert.match(html,/class="[^"]*product-gallery[^"]*"/);assert.equal((html.match(/assets\/img\/shots\//g)||[]).length,4);assert.doesNotMatch(html,/data-troy-canvas|troy-controller\.js/);});
for(const file of ["radar/index.html","en/radar/index.html"]) test(`${file} preserves Radar injection shell`,async()=>{const html=await read(file);assert.match(html,/<body class="radar-v3 theme-command">/);assert.match(html,/radar-v3\.css\?v=20260912-radar2/);assert.match(html,/class="brand command-brand"/);assert.match(html,/<summary aria-label="[^"]+"><img class="language-flag"/);assert.doesNotMatch(html,/(?:mascot|tilt)\.js/);assert.equal((html.match(/<!-- RADAR:START -->/g)||[]).length,1);assert.equal((html.match(/<!-- RADAR:END -->/g)||[]).length,1);assert.match(html,/class="rd-grid"/);});

test("Radar overrides the legacy pixel shell with the premium command-center theme", async () => {
  const css = await read("assets/css/radar-v3.css");
  assert.match(css, /\.radar-v3\s*\{[^}]*font-family:\s*var\(--cmd-font-body/s);
  assert.match(css, /\.radar-v3 \.radar-command-hero h1\s*\{[^}]*font-family:\s*var\(--cmd-font-display/s);
  assert.match(css, /\.radar-v3 \.rd-card\s*\{[^}]*border:\s*1px solid rgba\(255, 255, 255, \.12\)/s);
  assert.match(css, /\.radar-v3 \.rd-sigil\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(max-width:\s*760px\)/);
});
for(const file of ["morse-flash-policy/index.html","airmousehand-policy/index.html"]) test(`${file} is themed and static`,async()=>{const html=await read(file);assert.match(html,/<body class="policy-v3 theme-command">/);assert.match(html,/class="policy-document"/);assert.doesNotMatch(html,/data-troy-|troy-controller|<canvas\b|bg\.js/);});

test("shared command theme keeps lightweight policy pages visually consistent and hides the skip link until focus", async () => {
  const css = await read("assets/css/theme-v3.css");
  assert.match(css, /\.theme-command\s*\{[^}]*font-family:\s*var\(--cmd-font-body\)/s);
  assert.match(css, /\.theme-command \.command-header \.nav-bar\s*\{[^}]*display:\s*flex[^}]*align-items:\s*center/s);
  assert.match(css, /\.theme-command \.command-brand\s*\{[^}]*text-decoration:\s*none/s);
  assert.match(css, /\.theme-command \.skip-link\s*\{[^}]*transform:\s*translateY\(-150%\)/s);
  assert.match(css, /\.theme-command \.skip-link:focus\s*\{[^}]*transform:\s*translateY\(0\)/s);
});

test("every public command page loads the cache-busted shared theme", async () => {
  const pages = [
    "index.html", "en/index.html", "es/index.html", "pt-br/index.html", "hi/index.html", "id/index.html", "ar/index.html", "de/index.html",
    "morse-flash/index.html", "en/morse-flash/index.html", "es/morse-flash/index.html", "pt-br/morse-flash/index.html", "hi/morse-flash/index.html", "id/morse-flash/index.html", "ar/morse-flash/index.html", "de/morse-flash/index.html",
    "radar/index.html", "en/radar/index.html", "morse-flash-policy/index.html", "airmousehand-policy/index.html", "404.html",
  ];
  for (const file of pages) {
    assert.match(await read(file), /theme-v3\.css\?v=20260914-adrails1/, `${file} still exposes a stale shared theme URL`);
  }
});
test("404 is lightweight branded shell",async()=>{const html=await read("404.html");assert.match(html,/<body class="not-found-v3 theme-command">/);assert.match(html,/class="[^"]*not-found-panel[^"]*"/);assert.doesNotMatch(html,/data-troy-|troy-controller|<canvas\b/);});
for(const file of ["morse-flash/index.html","en/morse-flash/index.html","radar/index.html","en/radar/index.html"]) test(`${file} exposes shared premium navigation and footer links`,async()=>{const html=await read(file);assert.match(html,/class="[^"]*command-header[^"]*"/);assert.match(html,/<details class="language-menu"/);assert.match(html,/class="[^"]*command-footer[^"]*"/);for(const href of ["mailto:info@troyapps.app","mailto:support@troyapps.app","https://play.google.com/store/apps/developer?id=Troy+Apps","https://www.youtube.com/channel/UC2PncaDQ9wSXYqY5IaffuJw","https://www.instagram.com/troyappsofficial/","https://www.tiktok.com/@troyappsofficial","https://www.facebook.com/troyappsofficial"]){assert.ok(html.includes(href),href);}});
for(const [file,jump] of [["radar/index.html","#repolar"],["en/radar/index.html","#repos"]])test(`${file} has locale Radar command hero`,async()=>{const html=await read(file);assert.match(html,/class="[^"]*radar-command-hero[^"]*"/);assert.ok(html.includes(`href="${jump}"`));});

test("product and Radar pages use the approved three-item site navigation", async () => {
  const cases = [
    ["morse-flash/index.html", ["Anasayfa", "Uygulamalar", "İletişim"]],
    ["en/morse-flash/index.html", ["Home", "Apps", "Contact"]],
    ["radar/index.html", ["Anasayfa", "Uygulamalar", "İletişim"]],
    ["en/radar/index.html", ["Home", "Apps", "Contact"]],
  ];
  for (const [file, expected] of cases) {
    const html = await read(file);
    const nav = html.match(/<nav class="nav-menu command-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const labels = [...nav.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map((match) => match[1].replace(/<[^>]+>/g, "").trim());
    assert.deepEqual(labels, expected);
  }
});

test("every Morse Flash page inherits the shared command header without product-only overrides", async () => {
  const pages = [
    "morse-flash/index.html",
    "en/morse-flash/index.html",
    "es/morse-flash/index.html",
    "pt-br/morse-flash/index.html",
    "hi/morse-flash/index.html",
    "id/morse-flash/index.html",
    "ar/morse-flash/index.html",
    "de/morse-flash/index.html",
  ];

  for (const file of pages) {
    const html = await read(file);
    assert.match(html, /<a class="brand command-brand"/);
    assert.match(html, /<button class="nav-toggle" type="button"/);
  }

  const css = await read("assets/css/product-v3.css");
  assert.doesNotMatch(css, /\.product-v3 \.site-header\b/);
  assert.doesNotMatch(css, /\.product-v3 \.command-nav\b/);
  assert.doesNotMatch(css, /\.product-v3 \.language-menu\b/);
  assert.doesNotMatch(css, /\.product-v3 \.language-options\b/);

  const sharedCss = await read("assets/css/theme-v3.css");
  assert.match(sharedCss, /\.theme-command \.command-nav a\s*\{[^}]*font-family:var\(--cmd-font-body\)[^}]*text-transform:none/);
});

test("Morse Flash pages mount the shared pixel background as a module", async () => {
  for (const file of ["morse-flash/index.html", "en/morse-flash/index.html"]) {
    const html = await read(file);
    assert.match(html, /<script type="module" src="\/assets\/js\/bg\.js\?v=20260910-product1"><\/script>/);
    assert.doesNotMatch(html, /assets\/js\/mascot\.js/);
  }
});

test("Radar pages mount the shared pixel background as a module", async () => {
  for (const file of ["radar/index.html", "en/radar/index.html"]) {
    const html = await read(file);
    assert.match(html, /<script type="module" src="\/assets\/js\/bg\.js\?v=20260912-radar3"><\/script>/);
    assert.doesNotMatch(html, /<script src="\/assets\/js\/bg\.js" defer><\/script>/);
  }
});

test("Morse Flash policy exposes the correctly spelled Turkish page title", async () => {
  const html = await read("morse-flash-policy/index.html");
  assert.match(html, /<title>Morse Flash - Gizlilik Politikası<\/title>/);
  assert.match(html, /<h1>Morse Flash Gizlilik Politikası<\/h1>/);
});

test("the product hero grid belongs to the inner split instead of shrinking the page wrap", async () => {
  const css = await read("assets/css/product-v3.css");
  assert.match(css, /\.product-v3\s+\.product-hero-v3\s*>\s*\.wrap\s*\{[^}]*width:\s*100%/s);
  assert.match(css, /\.product-v3\s+\.product-hero-v3\s+\.hero-split\s*\{[^}]*grid-template-columns:/s);
  assert.doesNotMatch(css, /\.product-v3\s+\.product-hero-v3\s*\{[^}]*grid-template-columns:/s);
});

test("Morse Flash pages omit the retired mini-game without removing the hero signal", async () => {
  const cases = [
    ["morse-flash/index.html", "canli-sinyal", "Mini Oyunu Dene"],
    ["en/morse-flash/index.html", "live-signal", "Try the Mini-Game"],
  ];

  for (const [file, sectionId, heroLabel] of cases) {
    const html = await read(file);
    assert.doesNotMatch(html, new RegExp(`<section\\s+id="${sectionId}"`));
    assert.ok(!html.includes(`href="#${sectionId}"`), `${file} still links to the retired mini-game`);
    assert.ok(!html.includes(heroLabel), `${file} still exposes the retired mini-game CTA`);
    assert.match(html, /id="hero-lamp"/);
    assert.match(html, /assets\/js\/morse\.js/);
  }
});

test("every public content footer exposes the five platforms as accessible icon links", async () => {
  const pages = ["index.html", "en/index.html", "morse-flash/index.html", "en/morse-flash/index.html", "radar/index.html", "en/radar/index.html"];
  const platforms = ["google-play", "youtube", "instagram", "tiktok", "facebook"];

  for (const file of pages) {
    const html = await read(file);
    const platformBar = html.match(/<nav class="footer-platforms"[\s\S]*?<\/nav>/)?.[0] ?? "";
    assert.ok(platformBar, `${file} has no footer platform icon bar`);
    const anchors = [...platformBar.matchAll(/<a\b[^>]*data-platform="([^"]+)"[^>]*>[\s\S]*?<\/a>/g)];
    assert.deepEqual(anchors.map((match) => match[1]), platforms, `${file} platform order`);

    for (const match of anchors) {
      const anchor = match[0];
      const platform = match[1];
      assert.match(anchor, /aria-label="[^"]+"/);
      assert.match(anchor, /title="[^"]+"/);
      assert.match(anchor, /target="_blank"/);
      assert.match(anchor, /rel="noopener"/);
      assert.match(anchor, new RegExp(`<img\\s+src="/assets/img/social/${platform}\\.svg"\\s+alt=""\\s+aria-hidden="true">`));
    }
  }
});
