import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SITE_LOCALES, languageFlag, languageMenu, localePath, resolveSiteLocale } from "../assets/js/locales.js";
import { AIRMOUSE_COPY, COMMON_COPY, HOME_COPY, LOCALE_META, MORSE_COPY, copyFor } from "./locale-copy.mjs";

const SITE_ORIGIN = "https://troyapps.app";
const SCRIPT_PATH = fileURLToPath(import.meta.url);
const PROJECT_ROOT = resolve(dirname(SCRIPT_PATH), "..");

function absolutePageUrl(language, page) {
  return `${SITE_ORIGIN}${localePath(language, page)}`;
}

function alternateLinks(page) {
  const links = SITE_LOCALES.map((locale) =>
    `  <link rel="alternate" hreflang="${locale.language}" href="${absolutePageUrl(locale.language, page)}">`,
  );
  links.push(`  <link rel="alternate" hreflang="x-default" href="${absolutePageUrl("tr", page)}">`);
  return links.join("\n");
}

function sitemapAlternates(page) {
  const links = SITE_LOCALES.map((locale) =>
    `    <xhtml:link rel="alternate" hreflang="${locale.language}" href="${absolutePageUrl(locale.language, page)}"/>`,
  );
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${absolutePageUrl("tr", page)}"/>`);
  return links.join("\n");
}

function sitemapPage(language, page) {
  return [
    "  <url>",
    `    <loc>${absolutePageUrl(language, page)}</loc>`,
    sitemapAlternates(page),
    "  </url>",
  ].join("\n");
}

function radarSitemapPage(language, day) {
  const path = language === "tr" ? "/radar/" : "/en/radar/";
  return [
    "  <url>",
    `    <loc>${SITE_ORIGIN}${path}</loc>`,
    `    <lastmod>${day}</lastmod>`,
    "    <changefreq>daily</changefreq>",
    "    <priority>0.8</priority>",
    `    <xhtml:link rel="alternate" hreflang="tr" href="${SITE_ORIGIN}/radar/"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/en/radar/"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/radar/"/>`,
    "  </url>",
  ].join("\n");
}

async function writeSitemap(root) {
  const path = resolve(root, "sitemap.xml");
  const current = await readFile(path, "utf8").catch(() => "");
  const radarDay = current.match(/<loc>https:\/\/troyapps\.app\/(?:en\/)?radar\/<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/)?.[1]
    || new Date().toISOString().slice(0, 10);
  const entries = [
    ...SITE_LOCALES.map((locale) => sitemapPage(locale.language, "home")),
    ...SITE_LOCALES.map((locale) => sitemapPage(locale.language, "morse")),
    ...SITE_LOCALES.map((locale) => sitemapPage(locale.language, "airmouse")),
    radarSitemapPage("tr", radarDay),
    radarSitemapPage("en", radarDay),
    "  <url>\n    <loc>https://troyapps.app/morse-flash-policy/</loc>\n  </url>",
    "  <url>\n    <loc>https://troyapps.app/airmousehand-policy/</loc>\n  </url>",
    "  <url>\n    <loc>https://troyapps.app/privacy/</loc>\n  </url>",
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`;
  await writeFile(path, xml, "utf8");
}

function ogLocaleLinks(language) {
  return SITE_LOCALES
    .filter((locale) => locale.language !== language)
    .map((locale) => {
      const code = locale.language === "tr" ? "tr_TR" : locale.language === "en" ? "en_US" : LOCALE_META[locale.language].og;
      return `  <meta property="og:locale:alternate" content="${code}">`;
    })
    .join("\n");
}

function replaceSeo(html, language, page) {
  const locale = resolveSiteLocale(language);
  const canonical = absolutePageUrl(locale.language, page);
  const ogLocale = locale.language === "tr" ? "tr_TR" : locale.language === "en" ? "en_US" : LOCALE_META[locale.language].og;

  let output = html.replace(
    /  <link rel="canonical" href="[^"]+">\r?\n(?:  <link rel="alternate"[^\n]+>\r?\n)+/,
    `  <link rel="canonical" href="${canonical}">\n${alternateLinks(page)}\n`,
  );
  output = output.replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${canonical}">`);
  output = output.replace(
    /  <meta property="og:locale" content="[^"]+">\r?\n(?:  <meta property="og:locale:alternate" content="[^"]+">\r?\n)*/,
    `  <meta property="og:locale" content="${ogLocale}">\n${ogLocaleLinks(locale.language)}\n`,
  );
  return output;
}

function translateKnownPhrases(html, language, page) {
  const pageCopy = { home: HOME_COPY, morse: MORSE_COPY, airmouse: AIRMOUSE_COPY };
  const rows = [...COMMON_COPY, ...pageCopy[page]];
  const translations = copyFor(rows, language);
  const entries = [...translations.entries()].sort(([a], [b]) => b.length - a.length);
  let output = html;

  for (const [source, target] of entries) {
    if (!target || source === target) continue;
    if (source.includes("<")) {
      output = output.replaceAll(source, target);
      continue;
    }
    output = output.replaceAll(`>${source}<`, `>${target}<`);
    output = output.replaceAll(`="${source}"`, `="${target}"`);
    output = output.replaceAll(`</span> ${source}</button>`, `</span> ${target}</button>`);
    if (source.length > 8) output = output.replaceAll(source, target);
  }
  return output;
}

function replaceLanguageControl(html, language, page) {
  const locale = resolveSiteLocale(language);
  const choose = locale.language === "tr"
    ? "Dil seç"
    : copyFor(COMMON_COPY, locale.language).get("Choose language") || "Choose language";
  const control = `<details class="language-menu"><summary aria-label="${choose}">${languageFlag(locale)}<span>${locale.label}</span><span aria-hidden="true">⌄</span></summary><div class="language-options">${languageMenu(locale.language, page)}</div></details>`;
  return html.replace(/<details class="language-menu">[\s\S]*?<\/details>/, control);
}

function replaceLocaleRoutes(html, language) {
  const radarToken = "__TROYAPPS_RADAR_ROUTE__";
  return html
    .replaceAll("/en/radar/", radarToken)
    .replaceAll("/en/morse-flash/", localePath(language, "morse"))
    .replaceAll("/en/airmousehand/", localePath(language, "airmouse"))
    .replaceAll("/en/", localePath(language, "home"))
    .replaceAll(radarToken, localePath(language, "radar"));
}

export function translatePage(sourceHtml, language, page) {
  if (!new Set(["home", "morse", "airmouse"]).has(page)) throw new Error(`Unsupported localized page: ${page}`);
  const locale = resolveSiteLocale(language);
  if (locale.language === "tr") throw new Error("Turkish uses its authored source page");

  let html = String(sourceHtml);
  html = replaceLocaleRoutes(html, locale.language);
  html = html.replace(/<html lang="en"(?: dir="ltr")?>/, `<html lang="${locale.language}"${locale.dir === "rtl" ? ' dir="rtl"' : ""}>`);
  html = translateKnownPhrases(html, locale.language, page);
  html = replaceSeo(html, locale.language, page);
  html = replaceLanguageControl(html, locale.language, page);
  return html;
}

async function refreshAuthoredPage(root, relativePath, language, page) {
  const path = resolve(root, relativePath);
  let html = await readFile(path, "utf8");
  html = replaceSeo(html, language, page);
  html = replaceLanguageControl(html, language, page);
  await writeFile(path, html, "utf8");
}

async function refreshMenuOnly(root, relativePath, language, page) {
  const path = resolve(root, relativePath);
  const html = await readFile(path, "utf8");
  await writeFile(path, replaceLanguageControl(html, language, page), "utf8");
}

export async function writeLocalizedPages(root = PROJECT_ROOT) {
  const englishHome = await readFile(resolve(root, "en/index.html"), "utf8");
  const englishMorse = await readFile(resolve(root, "en/morse-flash/index.html"), "utf8");
  const englishAirMouse = await readFile(resolve(root, "en/airmousehand/index.html"), "utf8");

  for (const locale of SITE_LOCALES.filter(({ language }) => !["tr", "en"].includes(language))) {
    for (const [page, source, suffix] of [
      ["home", englishHome, "index.html"],
      ["morse", englishMorse, "morse-flash/index.html"],
      ["airmouse", englishAirMouse, "airmousehand/index.html"],
    ]) {
      const path = resolve(root, locale.folder, suffix);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, translatePage(source, locale.language, page), "utf8");
    }
  }

  await refreshAuthoredPage(root, "index.html", "tr", "home");
  await refreshAuthoredPage(root, "en/index.html", "en", "home");
  await refreshAuthoredPage(root, "morse-flash/index.html", "tr", "morse");
  await refreshAuthoredPage(root, "en/morse-flash/index.html", "en", "morse");
  await refreshAuthoredPage(root, "airmousehand/index.html", "tr", "airmouse");
  await refreshAuthoredPage(root, "en/airmousehand/index.html", "en", "airmouse");
  await refreshMenuOnly(root, "radar/index.html", "tr", "radar");
  await refreshMenuOnly(root, "en/radar/index.html", "en", "radar");
  await writeSitemap(root);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath && pathToFileURL(invokedPath).href === pathToFileURL(SCRIPT_PATH).href) {
  await writeLocalizedPages();
  console.log("TroyApps locale pages generated.");
}
