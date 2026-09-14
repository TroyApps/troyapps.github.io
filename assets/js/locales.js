export const SITE_LOCALES = Object.freeze([
  Object.freeze({ language: "tr", folder: "", label: "TR", name: "Türkçe", dir: "ltr", flag: "tr" }),
  Object.freeze({ language: "en", folder: "en", label: "EN", name: "English", dir: "ltr", flag: "us" }),
  Object.freeze({ language: "es-419", folder: "es", label: "ES", name: "Español", dir: "ltr", flag: "mx" }),
  Object.freeze({ language: "pt-BR", folder: "pt-br", label: "PT-BR", name: "Português (Brasil)", dir: "ltr", flag: "br" }),
  Object.freeze({ language: "hi", folder: "hi", label: "HI", name: "हिन्दी", dir: "ltr", flag: "in" }),
  Object.freeze({ language: "id", folder: "id", label: "ID", name: "Bahasa Indonesia", dir: "ltr", flag: "id" }),
  Object.freeze({ language: "ar", folder: "ar", label: "AR", name: "العربية", dir: "rtl", flag: "sa" }),
  Object.freeze({ language: "de", folder: "de", label: "DE", name: "Deutsch", dir: "ltr", flag: "de" }),
  Object.freeze({ language: "fr", folder: "fr", label: "FR", name: "Français", dir: "ltr", flag: "fr" }),
  Object.freeze({ language: "it", folder: "it", label: "IT", name: "Italiano", dir: "ltr", flag: "it" }),
]);

const BY_LANGUAGE = new Map(SITE_LOCALES.map((locale) => [locale.language.toLowerCase(), locale]));

export function resolveSiteLocale(language) {
  const normalized = String(language || "").trim().replaceAll("_", "-").toLowerCase();
  if (BY_LANGUAGE.has(normalized)) return BY_LANGUAGE.get(normalized);
  if (normalized.startsWith("es-")) return BY_LANGUAGE.get("es-419");
  if (normalized.startsWith("pt-")) return BY_LANGUAGE.get("pt-br");
  const base = normalized.split("-")[0];
  return BY_LANGUAGE.get(base) || BY_LANGUAGE.get("en");
}

export function localePath(language, page = "home") {
  const locale = resolveSiteLocale(language);
  if (page === "radar") return locale.language === "tr" ? "/radar/" : "/en/radar/";
  const prefix = locale.folder ? `/${locale.folder}` : "";
  if (page === "morse") return `${prefix}/morse-flash/`;
  return prefix ? `${prefix}/` : "/";
}

export function languageFlag(locale) {
  return `<img class="language-flag" src="/assets/img/flags/${locale.flag}.svg" width="20" height="14" alt="" aria-hidden="true">`;
}

export function languageMenu(language, page = "home") {
  const selected = resolveSiteLocale(language);
  return SITE_LOCALES.map((locale) => {
    const current = locale.language === selected.language ? ' aria-current="page"' : "";
    return `<a href="${localePath(locale.language, page)}" lang="${locale.language}" hreflang="${locale.language}"${current}>${languageFlag(locale)}<span>${locale.name}</span></a>`;
  }).join("");
}

export function radarHomeTargets() {
  return SITE_LOCALES.map((locale) => ({
    file: `${locale.folder ? `${locale.folder}/` : ""}index.html`,
    summaryLanguage: locale.language === "tr" ? "tr" : "en",
  }));
}
