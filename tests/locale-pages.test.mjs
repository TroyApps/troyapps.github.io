import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const locales = [
  { language: "tr", folder: "", dir: "ltr", flag: "tr" },
  { language: "en", folder: "en", dir: "ltr", flag: "us" },
  { language: "es-419", folder: "es", dir: "ltr", flag: "mx" },
  { language: "pt-BR", folder: "pt-br", dir: "ltr", flag: "br" },
  { language: "hi", folder: "hi", dir: "ltr", flag: "in" },
  { language: "id", folder: "id", dir: "ltr", flag: "id" },
  { language: "ar", folder: "ar", dir: "rtl", flag: "sa" },
  { language: "de", folder: "de", dir: "ltr", flag: "de" },
  { language: "fr", folder: "fr", dir: "ltr", flag: "fr" },
  { language: "it", folder: "it", dir: "ltr", flag: "it" },
];
const playUrls = {
  morse: "https://play.google.com/store/apps/details?id=com.troyapps.morseflash",
  airmouse: "https://play.google.com/store/apps/details?id=com.troyapps.airmousehand",
};
const pageDirs = { morse: "morse-flash", airmouse: "airmousehand" };
const liveStatuses = {
  tr: "Android · Yayında",
  en: "Android · Available",
  "es-419": "Android · Disponible",
  "pt-BR": "Android · Disponível",
  hi: "Android · उपलब्ध",
  id: "Android · Tersedia",
  ar: "Android · متاح",
  de: "Android · Verfügbar",
  fr: "Android · Disponible",
  it: "Android · Disponibile",
};
const requiredExternal = [
  "https://play.google.com/store/apps/developer?id=Troy+Apps",
  "https://www.youtube.com/channel/UC2PncaDQ9wSXYqY5IaffuJw",
  "https://www.instagram.com/troyappsofficial/",
  "https://www.tiktok.com/@troyappsofficial",
  "https://www.facebook.com/troyappsofficial",
  "mailto:info@troyapps.app",
  "mailto:support@troyapps.app",
];

function route(locale, page) {
  const prefix = locale.folder ? `/${locale.folder}` : "";
  return page === "home" ? (prefix ? `${prefix}/` : "/") : `${prefix}/${pageDirs[page]}/`;
}

function file(locale, page) {
  return `${locale.folder ? `${locale.folder}/` : ""}${page === "home" ? "index.html" : `${pageDirs[page]}/index.html`}`;
}

for (const locale of locales) {
  for (const page of ["home", "morse", "airmouse"]) {
    test(`${locale.language} ${page} page keeps the multilingual public contract`, async () => {
      const html = await readFile(new URL(file(locale, page), root), "utf8");
      const htmlTag = locale.dir === "rtl"
        ? `<html lang="${locale.language}" dir="rtl">`
        : `<html lang="${locale.language}">`;
      assert.ok(html.includes(htmlTag));
      assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1);
      assert.ok(html.includes(`href="https://troyapps.app${route(locale, page)}"`));

      const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((match) => match[1]);
      assert.deepEqual(alternates, ["tr", "en", "es-419", "pt-BR", "hi", "id", "ar", "de", "fr", "it", "x-default"]);

      const menu = html.match(/<div class="language-options">[\s\S]*?<\/div>/)?.[0] || "";
      assert.equal((menu.match(/<a\b/g) || []).length, 10);
      assert.equal((menu.match(/<img class="language-flag"/g) || []).length, 10);
      assert.equal((menu.match(/aria-current="page"/g) || []).length, 1);
      if (page === "home") {
        assert.ok(html.includes(locale.language === "tr" ? 'href="/radar/"' : 'href="/en/radar/"'));
        assert.ok(html.includes(`data-app-status="${liveStatuses[locale.language]}"`));
        assert.ok(html.includes(`data-app-href="${route(locale, "airmouse")}"`));
        assert.ok(html.includes('href="/airmousehand-policy/"'));
      } else {
        const heroCta = html.match(/<div class="hero-cta">[\s\S]*?<\/div>/)?.[0] || "";
        assert.ok(heroCta.includes(`<a class="btn btn-primary" href="${playUrls[page]}"`));
        assert.ok(heroCta.includes('target="_blank" rel="noopener"'));
        assert.doesNotMatch(heroCta, /btn-soon|role="status"/);
      }

      for (const href of requiredExternal) assert.ok(html.includes(href), `missing ${href}`);
      for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)/g)) {
        assert.ok(await access(new URL(match[1].slice(1), root)).then(() => true, () => false), match[1]);
      }
    });
  }
}

test("sitemap publishes every locale home, Morse and AirMouseHand page once", async () => {
  const xml = await readFile(new URL("sitemap.xml", root), "utf8");
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const localized = locales.flatMap((locale) => ["home", "morse", "airmouse"].map((page) => `https://troyapps.app${route(locale, page)}`));
  for (const url of localized) assert.equal(locations.filter((item) => item === url).length, 1, url);
  assert.ok(locations.includes("https://troyapps.app/radar/"));
  assert.ok(locations.includes("https://troyapps.app/en/radar/"));
  assert.ok(locations.includes("https://troyapps.app/morse-flash-policy/"));
  assert.ok(locations.includes("https://troyapps.app/airmousehand-policy/"));
  assert.equal(locations.length, 34);
});

test("shared command theme gives Arabic a deliberate RTL layout", async () => {
  const css = await readFile(new URL("assets/css/theme-v3.css", root), "utf8");
  assert.match(css, /\[dir="rtl"\] \.theme-command/);
  assert.match(css, /\.language-options\s*\{[^}]*inset-inline-end:/);
  assert.match(css, /\[dir="rtl"\][\s\S]*?direction:\s*ltr/);
});

test("Arabic Troy dialogue opens on the visual right without changing LTR placement", async () => {
  const baseCss = await readFile(new URL("assets/css/home-v3.css", root), "utf8");
  const rtlCss = await readFile(new URL("assets/css/theme-v3.css", root), "utf8");

  assert.match(baseCss, /\.home-v3 \.troy-intro\s*\{[^}]*left:\s*-12%/);
  assert.match(rtlCss, /\[dir="rtl"\] \.home-v3 \.troy-intro\s*\{[^}]*left:\s*auto;[^}]*right:\s*-12%;[^}]*text-align:\s*right;[^}]*transform-origin:\s*18% 100%;/);
  assert.match(rtlCss, /@media\s*\(max-width:\s*760px\)[\s\S]*?\[dir="rtl"\] \.home-v3 \.troy-intro\s*\{[^}]*right:\s*0;/);
});

for (const [fileName, language] of [["radar/index.html", "tr"], ["en/radar/index.html", "en"]]) {
  test(`${fileName} exposes the complete language selector without inventing translated Radar pages`, async () => {
    const html = await readFile(new URL(fileName, root), "utf8");
    const menu = html.match(/<div class="language-options">[\s\S]*?<\/div>/)?.[0] || "";
    assert.equal((menu.match(/<a\b/g) || []).length, 10);
    assert.equal((menu.match(/<img class="language-flag"/g) || []).length, 10);
    assert.equal((menu.match(/aria-current="page"/g) || []).length, 1);
    assert.equal((html.match(/<link rel="alternate" hreflang=/g) || []).length, 3);
    assert.ok(menu.includes(language === "tr" ? 'href="/radar/"' : 'href="/en/radar/"'));
  });
}

test("Turkish public pages expose a Turkish accessible label for the language picker", async () => {
  for (const fileName of ["index.html", "morse-flash/index.html", "airmousehand/index.html", "radar/index.html"]) {
    const html = await readFile(new URL(fileName, root), "utf8");
    assert.match(html, /<summary aria-label="Dil seç">/);
  }
});

test("every language selector summary shows its selected flag", async () => {
  for (const locale of locales) {
    for (const page of ["home", "morse", "airmouse"]) {
      const html = await readFile(new URL(file(locale, page), root), "utf8");
      const summary = html.match(/<summary[^>]*>[\s\S]*?<\/summary>/)?.[0] || "";
      assert.match(summary, new RegExp(`<img class="language-flag" src="/assets/img/flags/${locale.flag}\\.svg"`));
    }
  }
});

test("mobile home grid allows long localized controls to shrink without horizontal overflow", async () => {
  const css = await readFile(new URL("assets/css/home-v3.css", root), "utf8");
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.home-v3 \.page-rails > main \{ grid-template-columns: minmax\(0, 1fr\);/);
});
