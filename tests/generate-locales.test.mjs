import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const turkishHome = await readFile(new URL("index.html", root), "utf8");
const sourceHome = await readFile(new URL("en/index.html", root), "utf8");
const sourceMorse = await readFile(new URL("en/morse-flash/index.html", root), "utf8");
const generator = await import("../scripts/generate-locales.mjs").catch(() => ({}));

function assetUrls(html) {
  return [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)(?:\?[^"#]*)?"/g)]
    .map((match) => match[1]))]
    .sort();
}

function homeSection(html, className) {
  const section = html.match(new RegExp(`<[^>]+class="[^"]*${className}[^"]*"[\\s\\S]*?<\\/section>`));
  assert.ok(section, `${className} section must exist`);
  return section[0];
}

test("home hero and ticker use the finalized Google Play and Troy Community copy in every locale", () => {
  const expectedTickerCopy = new Map([
    ["tr", "TROY COMMUNITY · YAKINDA"],
    ["en", "TROY COMMUNITY · COMING SOON"],
    ["es-419", "TROY COMMUNITY · PRÓXIMAMENTE"],
    ["pt-BR", "TROY COMMUNITY · EM BREVE"],
    ["hi", "TROY COMMUNITY · जल्द आ रहा है"],
    ["id", "TROY COMMUNITY · SEGERA HADIR"],
    ["ar", "TROY COMMUNITY · قريبًا"],
    ["de", "TROY COMMUNITY · DEMNÄCHST"],
    ["fr", "TROY COMMUNITY · BIENTÔT"],
    ["it", "TROY COMMUNITY · PROSSIMAMENTE"],
  ]);
  const retiredTickerCopy = new Map([
    ["tr", ["SİNYAL AKIŞI AKTİF", "Sinyal akışı aktif"]],
    ["en", ["SIGNAL STREAM ACTIVE", "Signal stream active"]],
    ["es-419", ["FLUJO DE SEÑAL ACTIVO", "Flujo de señal activo"]],
    ["pt-BR", ["FLUXO DE SINAL ATIVO", "Fluxo de sinal ativo"]],
    ["hi", ["सिग्नल प्रवाह सक्रिय"]],
    ["id", ["ALIRAN SINYAL AKTIF", "Aliran sinyal aktif"]],
    ["ar", ["تدفّق الإشارة نشط"]],
    ["de", ["SIGNALFLUSS AKTIV", "Signalfluss aktiv"]],
    ["fr", ["FLUX DE SIGNAL ACTIF", "Flux de signal actif"]],
    ["it", ["FLUSSO DEL SEGNALE ATTIVO", "Flusso del segnale attivo"]],
  ]);

  for (const [language, expectedTicker] of expectedTickerCopy) {
    const html = language === "tr"
      ? turkishHome
      : language === "en"
        ? sourceHome
        : generator.translatePage(sourceHome, language, "home");
    const hero = homeSection(html, "command-hero");
    const ticker = homeSection(html, "signal-ticker");

    assert.match(hero, /<span>Google Play<\/span>/, `${language} hero CTA`);
    assert.match(ticker, new RegExp(expectedTicker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${language} ticker copy`);
    assert.doesNotMatch(ticker, /RADAR/i, `${language} ticker must not mention Radar`);
    for (const retiredCopy of retiredTickerCopy.get(language)) {
      assert.equal(ticker.includes(retiredCopy), false, `${language} ticker must not include ${retiredCopy}`);
    }
  }
});

test("Arabic home output is localized, RTL, and retains the premium assets", () => {
  assert.equal(typeof generator.translatePage, "function");
  const html = generator.translatePage(sourceHome, "ar", "home");

  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /<title>[^<]*TroyApps[^<]*<\/title>/);
  assert.match(html, /href="\/ar\/morse-flash\/"/);
  assert.match(html, /href="\/en\/radar\/"/);
  assert.match(html, />التطبيقات<\/a>/);
  assert.match(html, /data-troy-tool-option="poke"[^>]*>[\s\S]*?المس<\/button>/);
  assert.match(html, /data-troy-command-trigger[^>]*>[\s\S]*?أمر<\/button>/);
  assert.equal((html.match(/aria-current="page"/g) || []).length >= 1, true);
  assert.deepEqual(assetUrls(html), assetUrls(sourceHome));
});

test("Latin American Spanish Morse output preserves product behavior", () => {
  assert.equal(typeof generator.translatePage, "function");
  const html = generator.translatePage(sourceMorse, "es-419", "morse");

  assert.match(html, /<html lang="es-419">/);
  assert.doesNotMatch(html, /<html[^>]*\sdir=/);
  assert.match(html, /data-text="CONVIERTE LA LUZ EN CÓDIGO"/);
  assert.match(html, /href="\/es\/"/);
  assert.match(html, /href="\/es\/morse-flash\/"[^>]*aria-current="page"/);
  assert.match(html, /src="\/assets\/js\/morse\.js"/);
  assert.deepEqual(assetUrls(html), assetUrls(sourceMorse));
});

test("every generated page receives all ten hreflang alternates", () => {
  assert.equal(typeof generator.translatePage, "function");
  for (const language of ["es-419", "pt-BR", "hi", "id", "ar", "de", "fr", "it"]) {
    for (const [page, source] of [["home", sourceHome], ["morse", sourceMorse]]) {
      const html = generator.translatePage(source, language, page);
      const alternateBlock = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)];
      assert.deepEqual(
        alternateBlock.map((match) => match[1]),
        ["tr", "en", "es-419", "pt-BR", "hi", "id", "ar", "de", "fr", "it", "x-default"],
      );
    }
  }
});

test("French and Italian pages use localized copy instead of English fallbacks", () => {
  const frenchHome = generator.translatePage(sourceHome, "fr", "home");
  const italianMorse = generator.translatePage(sourceMorse, "it", "morse");

  assert.match(frenchHome, /<html lang="fr">/);
  assert.match(frenchHome, />Applications<\/a>/);
  assert.match(frenchHome, /Outils mobiles pratiques/);
  assert.doesNotMatch(frenchHome, />Choose language</);

  assert.match(italianMorse, /<html lang="it">/);
  assert.match(italianMorse, /TRASFORMA LA LUCE IN CODICE/);
  assert.match(italianMorse, /Scarica da Google Play/);
  assert.doesNotMatch(italianMorse, />Choose language</);
});
