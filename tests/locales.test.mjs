import assert from "node:assert/strict";
import test from "node:test";

const localeModule = await import("../assets/js/locales.js").catch(() => ({}));
const {
  SITE_LOCALES,
  resolveSiteLocale,
  localePath,
  languageMenu,
  radarHomeTargets,
} = localeModule;

test("the public locale manifest keeps the approved language order", () => {
  assert.ok(Array.isArray(SITE_LOCALES));
  assert.deepEqual(
    SITE_LOCALES.map(({ language }) => language),
    ["tr", "en", "es-419", "pt-BR", "hi", "id", "ar", "de", "fr", "it"],
  );
  assert.deepEqual(
    SITE_LOCALES.map(({ label }) => label),
    ["TR", "EN", "ES", "PT-BR", "HI", "ID", "AR", "DE", "FR", "IT"],
  );
});

test("regional browser languages resolve to the intended site locale", () => {
  assert.equal(resolveSiteLocale("es-MX").language, "es-419");
  assert.equal(resolveSiteLocale("pt-PT").language, "pt-BR");
  assert.equal(resolveSiteLocale("AR-sa").language, "ar");
  assert.equal(resolveSiteLocale("xx").language, "en");
});

test("locale routes preserve page context and keep Radar on TR or EN", () => {
  assert.equal(localePath("tr", "home"), "/");
  assert.equal(localePath("pt-BR", "morse"), "/pt-br/morse-flash/");
  assert.equal(localePath("tr", "radar"), "/radar/");
  assert.equal(localePath("ar", "radar"), "/en/radar/");
});

test("language menu renders ten accessible choices and one current locale", () => {
  const html = languageMenu("de", "home");
  assert.equal((html.match(/<a\b/g) || []).length, 10);
  assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
  assert.match(html, /href="\/de\/"[^>]*aria-current="page"/);
  assert.match(html, /href="\/es\/"[^>]*lang="es-419"/);
  assert.match(html, /<span>Português \(Brasil\)<\/span>/);
  assert.match(html, /<span>العربية<\/span>/);
});

test("daily Radar refreshes every localized homepage without extra summary languages", () => {
  assert.deepEqual(radarHomeTargets(), [
    { file: "index.html", summaryLanguage: "tr" },
    { file: "en/index.html", summaryLanguage: "en" },
    { file: "es/index.html", summaryLanguage: "en" },
    { file: "pt-br/index.html", summaryLanguage: "en" },
    { file: "hi/index.html", summaryLanguage: "en" },
    { file: "id/index.html", summaryLanguage: "en" },
    { file: "ar/index.html", summaryLanguage: "en" },
    { file: "de/index.html", summaryLanguage: "en" },
    { file: "fr/index.html", summaryLanguage: "en" },
    { file: "it/index.html", summaryLanguage: "en" },
  ]);
});
