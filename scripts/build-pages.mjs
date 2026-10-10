#!/usr/bin/env node
/* TroyApps — sayfa uretici
   content/site.json + content/{tr,en}.json + content/policy/*.html  ->
   index.html, en/index.html, 404.html, politika sayfalari, yonlendirme
   sayfalari ve sitemap.xml.
   Calistir: node scripts/build-pages.mjs        (kontrol: --check) */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const site = JSON.parse(readFileSync(join(ROOT, "content/site.json"), "utf8"));
const LANGS = ["tr", "en"].map((l) => JSON.parse(readFileSync(join(ROOT, `content/${l}.json`), "utf8")));

/* CSS/JS degisince HTML'deki ?v= otomatik yenilensin (GitHub Pages onbellegi) */
function ver(rel) {
  return createHash("sha1").update(readFileSync(join(ROOT, rel))).digest("hex").slice(0, 8);
}
const CSS = `/assets/css/site.css?v=${ver("assets/css/site.css")}`;
const JS = `/assets/js/site.js?v=${ver("assets/js/site.js")}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ROTS = [-3, 2, -1.5, 2.5, -2, 1, -2.5, 2];

const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00a173" d="M3.6 2.4 13 12l-9.4 9.6c-.4-.2-.6-.7-.6-1.2V3.6c0-.5.2-1 .6-1.2z"/><path fill="#ffcc00" d="M16.7 15.7 13 12l3.7-3.7 4 2.3c1 .6 1 1.6 0 2.2z"/><path fill="#ff3a44" d="M13 12l3.7 3.7L5 22.6c-.5.3-1 .3-1.4.2z"/><path fill="#00c3ff" d="M3.6 2.4c.4-.1.9-.1 1.4.2l11.7 6.7L13 12z"/></svg>';

const INK_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <filter id="ink" x="-10%" y="-20%" width="120%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="ink2" x="-10%" y="-20%" width="120%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.031" numOctaves="3" seed="19" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>`;

const wordmarkMini = () => `<svg class="wordmark" viewBox="0 0 860 190" aria-hidden="true"><text x="10" y="150" filter="url(#ink)">TROYAPPS</text></svg>`;

const wordmarkHero = () => `<svg class="wordmark" viewBox="0 0 860 190" role="img" aria-label="TroyApps">
      <text class="ghost" x="14" y="153" filter="url(#ink2)">TROYAPPS</text>
      <text x="10" y="150" filter="url(#ink)">TROYAPPS</text>
      <g class="marks">
        <text x="228" y="52">5</text><text x="262" y="40">6</text><text x="296" y="58">7</text>
        <text x="540" y="46">8</text><text x="574" y="60">9</text>
        <text x="650" y="172">10</text><text x="700" y="184">11</text><text x="748" y="176">12</text>
      </g>
    </svg>`;

/* Dil icin gorsel: en-1.webp varsa onu, yoksa tr-1.webp kullan */
function shotPath(app, lang, i) {
  const pref = join(ROOT, app.shots_dir, `${lang}-${i}.webp`);
  const file = existsSync(pref) ? `${lang}-${i}.webp` : `tr-${i}.webp`;
  return `/${app.shots_dir}/${file}`;
}

/* Ana sayfa dil yonlendirmesi. Statik sitede ulke bilgisi yok; tarayicinin
   ilk dili kullanilir: Turkce ise "/", degilse "/en/". Ziyaretci TR/EN
   dugmesiyle secim yaparsa (?lang=tr|en) bu tercih saklanir ve bir daha
   yonlendirilmez. Arama motoru botlari yonlendirilmez (TR sayfasi da
   dizinlensin). Depolama kapaliysa ?lang yine o anki gecis icin calisir. */
function langScript(t) {
  return `<script>(function(){var K="troyapps-lang",q=/[?&]lang=(tr|en)(?:&|$)/.exec(location.search),p=null;
try{if(q){localStorage.setItem(K,q[1]);}p=localStorage.getItem(K);}catch(e){}
if(q){p=q[1];try{history.replaceState(null,"",location.pathname+location.hash);}catch(e){}}
if(${JSON.stringify(t.lang)}!=="tr")return;
if(/bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit|embedly|whatsapp|telegram/i.test(navigator.userAgent))return;
if(!p){var l=((navigator.languages&&navigator.languages[0])||navigator.language||"").toLowerCase();p=l.indexOf("tr")===0?"tr":"en";}
if(p==="en")location.replace("/en/"+location.hash);})();</script>`;
}

function head(t, { title, description, path, noindex = false, ogImage = site.og_image }) {
  const url = site.domain + path;
  const isHome = path === "/" || path === "/en/";
  const alt = LANGS.map((l) => `  <link rel="alternate" hreflang="${l.lang}" href="${site.domain}${samePath(l, path)}">`).join("\n");
  return `<!doctype html>
<html lang="${t.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="google-site-verification" content="${site.google_site_verification}">${isHome ? "\n  " + langScript(t) : ""}
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
${noindex ? "" : alt + `\n  <link rel="alternate" hreflang="x-default" href="${site.domain}${samePath(LANGS.find((l) => l.lang === "en") || LANGS[0], path)}">`}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="TroyApps">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site.domain}${ogImage}">
  <meta property="og:locale" content="${t.og_locale}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#050506">
  <link rel="icon" href="/assets/img/favicon.svg?v=${ver("assets/img/favicon.svg")}" type="image/svg+xml">
  <link rel="icon" href="/assets/img/favicon-32.png?v=${ver("assets/img/favicon-32.png")}" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png?v=${ver("assets/img/apple-touch-icon.png")}">
  <link rel="preload" href="/assets/fonts/archivo-black-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/space-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${CSS}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsense_client}" crossorigin="anonymous"></script>
</head>`;
}

/* Ayni sayfanin diger dildeki adresi: "/" <-> "/en/", "/privacy/" her dilde ayni */
function samePath(l, path) {
  const isHome = path === "/" || path === "/en/";
  return isHome ? l.path : path;
}

function topbar(t, { home, alwaysBrand = false, path = t.path }) {
  const socials = site.socials.filter((s) => s.top).map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join("\n      ");
  const langs = LANGS.map((l) => `<a href="${samePath(l, path)}${home ? `?lang=${l.lang}` : ""}" hreflang="${l.lang}" lang="${l.lang}"${l.lang === t.lang ? ' class="on" aria-current="page"' : ""}>${l.lang.toUpperCase()}</a>`).join("");
  const nav = home
    ? `<nav class="pill" aria-label="${esc(t.nav.menu_label)}">
    <a href="#top" class="on" data-nav="top">${t.nav.top}</a>
    <a href="#${t.ids.apps}" data-nav="apps">${t.nav.apps}</a>
    <a href="#${t.ids.contact}" data-nav="contact">${t.nav.contact}</a>
  </nav>`
    : `<nav class="pill" aria-label="${esc(t.nav.menu_label)}">
    <a href="${t.path}" data-nav="top">${t.policy_back}</a>
  </nav>`;
  return `<header class="top">
  <a href="${home ? "#top" : t.path}" class="brand-mini${alwaysBrand ? " always" : ""}" aria-label="TroyApps">
    ${wordmarkMini()}
  </a>
  ${nav}
  <div class="right">
    <div class="socials">
      ${socials}
    </div>
${home ? `    <nav class="lang" aria-label="${esc(t.lang_switch_label)}">${langs}</nav>\n` : ""}  </div>
</header>`;
}

function appButton(t, app, figFrom, figTo) {
  const ta = t.apps[app.id];
  return `    <button class="app-btn" type="button" role="tab" aria-selected="false" aria-controls="p-${app.id}" data-app="${app.id}" data-open-text="${esc(t.tap_open)}" data-closed-text="${esc(t.tap_closed)}" style="--r:${app.rot}deg">
      <span class="sticker"><img src="${app.icon}" alt="" width="192" height="192"></span>
      <span class="name">${app.name}</span>
      <span class="fig">${t.fig} ${figFrom}–${figTo} · ${t.android}</span>
      <span class="tap">${t.tap_closed}</span>
    </button>`;
}

function appPanel(t, app, figFrom, figTo, idx) {
  const ta = t.apps[app.id];
  const thumbs = [];
  for (let i = 0; i < app.shots; i++) {
    const n = figFrom + 1 + i;
    const cap = ta.caps[i] || "";
    thumbs.push(`        <figure class="thumb" style="--r:${ROTS[i % ROTS.length]}deg" data-cap="${esc(`${t.fig} ${n} · ${cap}`)}"><img src="${shotPath(app, t.lang, i + 1)}" alt="${esc(cap)}" loading="lazy" width="720" height="1562"><figcaption>${t.fig} ${n}</figcaption></figure>`);
  }
  const feats = ta.feats.map((f) => `        <li>${esc(f)}</li>`).join("\n");
  return `  <div class="panel" id="p-${app.id}" role="tabpanel" data-panel="${app.id}">
    <div><div class="panel-in">
      <p class="lead${idx % 2 ? " w" : ""}">${esc(ta.lead)}</p>
      <ul class="feats">
${feats}
      </ul>
      <div class="meta">
        <span class="figrange">${t.fig} ${figFrom}–${figTo} · ${t.live}</span>
        <a class="play" href="${app.play}" target="_blank" rel="noopener">${PLAY_SVG}${esc(ta.get)}</a>
      </div>
      <div class="strip" data-group="${app.id}">
${thumbs.join("\n")}
      </div>
    </div></div>
  </div>`;
}

function homePage(t) {
  /* Fig numaralari: her uygulama = ikon (1) + gorseller */
  let fig = 1;
  const ranges = site.apps.map((app) => { const from = fig; const to = fig + app.shots; fig = to + 1; return [from, to]; });
  const contactFig = fig;
  const c = t.contact;
  const links = [`<a href="${site.play_developer}" target="_blank" rel="noopener">${c.play}</a>`]
    .concat(site.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`)).join("\n      ");
  const legal = [`<a href="/privacy/">${t.legal.privacy}</a>`].concat(site.apps.map((a) => `<a href="${a.policy}">${t.legal[a.id]}</a>`)).join("\n      ");

  return `${head(t, { title: t.title, description: t.description, path: t.path })}
<body>
<a class="skip" href="#${t.ids.apps}">${t.skip}</a>
${INK_DEFS}

${topbar(t, { home: true })}

<main>
<section class="hero" id="top">
  <div class="hero-in">
    ${wordmarkHero()}
    <div class="tags">
      <span class="tag y"><s>${t.hero.struck}</s> ✕ &nbsp;${t.hero.tag}</span>
      <div class="row">
        <span class="tag r">${t.hero.row[0]}</span>
        <span class="tag g">${t.hero.row[1]}</span>
        <span class="tag d">${t.hero.row[2]}</span>
        <span class="tag g">${t.hero.row[3]}</span>
      </div>
    </div>
  </div>
  <div class="scroll-hint mono"><em>${t.hero.scroll}</em><span>↓</span></div>
</section>

<!-- ============ ${t.apps_title} ============ -->
<section class="apps" id="${t.ids.apps}" data-index="apps">
  <svg class="apps-bg" viewBox="0 0 1300 220" aria-hidden="true"><text x="20" y="180" filter="url(#ink2)">${t.apps_title}</text></svg>

  <div class="dock" role="tablist" aria-label="${t.nav.apps}">
${site.apps.map((app, i) => appButton(t, app, ranges[i][0], ranges[i][1])).join("\n")}
  </div>

  <a class="dev-link" href="${site.play_developer}" target="_blank" rel="noopener">${PLAY_SVG}${t.dev_link}</a>

${site.apps.map((app, i) => appPanel(t, app, ranges[i][0], ranges[i][1], i)).join("\n\n")}
</section>

<!-- ============ ${t.nav.contact.toUpperCase()} ============ -->
<section class="contact" id="${t.ids.contact}" data-index="contact">
  <div class="contact-in">
    <span class="tag y" style="transform:rotate(-2deg)">${c.tag}</span>
    <a class="mail" href="mailto:${site.mail}">${site.mail.toUpperCase()}</a>
    <button class="copy" type="button" data-copy="${site.mail}" data-done="${esc(c.copied)}">${c.copy}</button>
    <div class="links">
      ${links}
    </div>
  </div>
  <div class="foot">
    <div>${esc(t.footer.replace("{year}", site.year))}</div>
    <div class="legal">
      ${legal}
    </div>
  </div>
</section>
</main>

<nav class="index" aria-label="${esc(t.index_label)}">
  <a href="#${t.ids.apps}" data-for="apps"><span>${t.fig} 1–${contactFig - 1}</span><span>${t.nav.apps}</span></a>
  <a href="#${t.ids.contact}" data-for="contact"><span>${t.fig} ${contactFig}</span><span>${t.nav.contact}</span></a>
</nav>

<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="${esc(t.lightbox.label)}">
  <img alt="">
  <div class="cap"></div>
  <button class="prev" type="button" aria-label="${esc(t.lightbox.prev)}">‹</button>
  <button class="next" type="button" aria-label="${esc(t.lightbox.next)}">›</button>
  <button class="close" type="button" aria-label="${esc(t.lightbox.close)}">✕</button>
</div>

<script src="${JS}" defer></script>
</body>
</html>
`;
}

/* Politika sayfalari: content/policy/<ad>.html icindeki <article> govdesi sarilir.
   Ilk satir:  <!-- title: ... | description: ... -->  */
function policyPage(name) {
  const src = readFileSync(join(ROOT, `content/policy/${name}.html`), "utf8");
  const m = src.match(/^<!--\s*title:\s*(.*?)\s*\|\s*description:\s*(.*?)\s*-->\s*\n/);
  if (!m) throw new Error(`content/policy/${name}.html basinda title/description yorumu yok`);
  const [, title, description] = m;
  const body = src.slice(m[0].length).trim();
  const t = LANGS[0]; /* politika sayfalari TR+EN tek sayfa; kabuk TR */
  const path = `/${name}/`;
  const legal = [`<a href="/privacy/">${t.legal.privacy}</a>`].concat(site.apps.map((a) => `<a href="${a.policy}">${t.legal[a.id]}</a>`)).join("\n  ");
  return `${head(t, { title, description, path })}
<body>
<a class="skip" href="#icerik">${t.skip}</a>
${INK_DEFS}

${topbar(t, { home: false, alwaysBrand: true, path })}

<main id="icerik" class="doc">
${body}
</main>
<footer class="doc-foot">
  <a href="/">TroyApps</a>
  <a href="mailto:${site.mail}">${site.mail}</a>
  ${legal}
</footer>
</body>
</html>
`;
}

function notFoundPage() {
  const [tr, en] = LANGS;
  return `${head(tr, { title: tr.notfound.title, description: tr.notfound.p, path: "/404.html", noindex: true })}
<body>
${INK_DEFS}
${topbar(tr, { home: false, alwaysBrand: true, path: "/" })}
<main class="notfound">
  <div class="notfound-in">
    <div class="big" aria-hidden="true">404</div>
    <span class="tag y" style="transform:rotate(-2deg)">${tr.notfound.h} · ${en.notfound.h}</span>
    <p class="mono" style="color:#9a9893;margin:0">${tr.notfound.p}<br>${en.notfound.p}</p>
    <div class="links">
      <a href="/">${tr.notfound.home}</a>
      <a href="/en/">${en.notfound.home}</a>
    </div>
  </div>
</main>
</body>
</html>
`;
}

function redirectPage(to) {
  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0; url=${to}">
  <link rel="canonical" href="${site.domain}${to.split("#")[0]}">
  <title>TroyApps</title>
</head>
<body>
  <p><a href="${to}">TroyApps</a></p>
  <script>location.replace(${JSON.stringify(to)});</script>
</body>
</html>
`;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = LANGS.map((l) => l.path).concat(["/privacy/"], site.apps.map((a) => a.policy));
  const items = urls.map((u) => {
    const alts = (u === "/" || u === "/en/")
      ? LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.lang}" href="${site.domain}${l.path}"/>`).join("\n") + "\n"
      : "";
    return `  <url>\n    <loc>${site.domain}${u}</loc>\n${alts}    <lastmod>${today}</lastmod>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${items.join("\n")}\n</urlset>\n`;
}

/* ---- yaz ---- */
const out = new Map();
for (const t of LANGS) out.set(t.path === "/" ? "index.html" : `${t.path.replace(/^\/|\/$/g, "")}/index.html`, homePage(t));
for (const f of readdirSync(join(ROOT, "content/policy"))) if (f.endsWith(".html")) out.set(`${f.replace(/\.html$/, "")}/index.html`, policyPage(f.replace(/\.html$/, "")));
out.set("404.html", notFoundPage());
for (const [file, to] of Object.entries(site.redirects)) out.set(file, redirectPage(to));
out.set("sitemap.xml", sitemap());

let changed = 0;
for (const [rel, html] of out) {
  const abs = join(ROOT, rel);
  const old = existsSync(abs) ? readFileSync(abs, "utf8") : null;
  /* sitemap'te sadece tarih degistiyse dokunma */
  const same = old !== null && (old === html || (rel === "sitemap.xml" && old.replace(/<lastmod>.*?<\/lastmod>/g, "") === html.replace(/<lastmod>.*?<\/lastmod>/g, "")));
  if (same) continue;
  changed++;
  if (CHECK) { console.log("degisecek:", rel); continue; }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, html);
  console.log("yazildi:", rel);
}
if (CHECK && changed) { console.error(`${changed} dosya guncel degil — node scripts/build-pages.mjs calistir`); process.exit(1); }
if (!changed) console.log("hepsi guncel");
