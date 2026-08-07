/* TroyApps Radar — ortak yardimcilar.
   Bagimlilik yok: Node 20+ global fetch ve saf regex ile calisir.
   Tasarim ilkesi: hicbir tekil hata butun calismayi dusurmez. */

export const UA =
  "Mozilla/5.0 (compatible; TroyAppsRadar/1.0; +https://troyapps.app)";

export function log(...a) {
  console.log("[radar]", ...a);
}

/** Zaman asimli fetch. Basarisizlikta null doner, asla firlatmaz. */
export async function get(url, { timeout = 15000, headers = {}, json = false } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, ...headers },
      signal: ctrl.signal,
      redirect: "follow"
    });
    if (!res.ok) {
      log("HTTP", res.status, url);
      return null;
    }
    return json ? await res.json() : await res.text();
  } catch (err) {
    log("HATA", url, err.name === "AbortError" ? "zaman asimi" : err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Birkac kez dener; her denemede biraz daha bekler. */
export async function retry(fn, tries = 3, waitMs = 800) {
  for (let i = 0; i < tries; i++) {
    const out = await fn();
    if (out != null) return out;
    if (i < tries - 1) await sleep(waitMs * (i + 1));
  }
  return null;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Metin temizligi ---------- */

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", eacute: "é", uuml: "ü", ouml: "ö"
};

export function decodeEntities(s = "") {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

function safeChar(code) {
  try {
    return Number.isFinite(code) ? String.fromCodePoint(code) : "";
  } catch {
    return "";
  }
}

export function stripTags(s = "") {
  return decodeEntities(
    String(s)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** HTML'e gomulecek her sey buradan gecer. */
export function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function clip(s = "", n = 240) {
  const t = String(s).trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).trim() + "…";
}

/* ---------- Cok kucuk bir RSS/Atom cozumleyici ---------- */

function tag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).trim();
}

function atomLink(block) {
  const alt = block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i);
  if (alt) return decodeEntities(alt[1]);
  const any = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (any) return decodeEntities(any[1]);
  return "";
}

/** RSS <item> ve Atom <entry> bloklarini ayni sekle indirger. */
export function parseFeed(xml, sourceName) {
  if (!xml || xml.length < 40) return [];
  const blocks =
    xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) ||
    [];

  const out = [];
  for (const b of blocks) {
    const title = stripTags(tag(b, "title"));
    let link = tag(b, "link") || atomLink(b);
    link = link.trim();
    if (!title || !/^https?:\/\//i.test(link)) continue;

    const raw =
      tag(b, "description") ||
      tag(b, "summary") ||
      tag(b, "content:encoded") ||
      tag(b, "content") ||
      "";

    const dateStr =
      tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date");
    const ts = Date.parse(dateStr);

    out.push({
      title: clip(title, 160),
      link,
      source: sourceName,
      blurb: clip(stripTags(raw), 320),
      ts: Number.isFinite(ts) ? ts : null
    });
  }
  return out;
}

/* ---------- Tekrar eden haberleri ayikla ---------- */

const STOP = new Set(["the", "a", "an", "of", "for", "and", "to", "in", "on", "with", "is", "its"]);

function fingerprint(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9À-ɏ\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .slice(0, 8)
    .sort()
    .join(" ");
}

export function dedupe(items) {
  const seenLink = new Set();
  const seenFp = new Set();
  const out = [];
  for (const it of items) {
    let key;
    try {
      const u = new URL(it.link);
      key = (u.hostname + u.pathname).replace(/\/+$/, "").toLowerCase();
    } catch {
      key = it.link;
    }
    const fp = fingerprint(it.title);
    if (seenLink.has(key) || (fp && seenFp.has(fp))) continue;
    seenLink.add(key);
    if (fp) seenFp.add(fp);
    out.push(it);
  }
  return out;
}

/* ---------- Tarih ---------- */

export function isoDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function trDate(d = new Date()) {
  const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `${d.getUTCDate()} ${aylar[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function enDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
  });
}
