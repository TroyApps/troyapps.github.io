/* HTML uretimi.
   Sayfalar statik yaziliyor: arama motorlari icerigi dogrudan gorur,
   ziyaretcinin tarayicisi hicbir JSON indirmez. */

import { esc, trDate, enDate } from "./radar-lib.mjs";

/* Sadece http(s) adreslerine izin ver. Beslemeler ucuncu taraf: bozuk ya da
   kotu niyetli bir kaynak javascript: adresi sokusturmasin. */
function safeUrl(u) {
  const s = String(u || "").trim();
  return /^https?:\/\//i.test(s) ? s : "";
}

/* ---------- Piksel arma ----------
   Her depo icin isminden turetilen, tekrar edilebilir 5x5 bir desen.
   Kimsenin gorseline dokunmuyoruz, tamamen kendi uretimimiz. */

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const LANG_COLOR = {
  TypeScript: "#3ea8ff", JavaScript: "#ffd93d", Python: "#4bc0a8", Rust: "#ff8b5e",
  Go: "#41d6e8", Java: "#ff6b6b", "C++": "#c58bff", C: "#9aa5b1", Shell: "#9be36b",
  Ruby: "#ff5c8a", Kotlin: "#c08bff", Swift: "#ff9f43", PHP: "#8b93ff", Zig: "#ffb454",
  Dart: "#37b6ff", "C#": "#8ce06a", Lua: "#6d8bff", HTML: "#ff7a45", CSS: "#5bb0ff"
};

export function langColor(lang) {
  return LANG_COLOR[lang] || "#00ff9c";
}

/** Simetrik 5x5 piksel arma; identicon mantigi ama bizim paletimizde. */
export function sigil(seed, accent) {
  const h = hash32(seed);
  const cells = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const bit = (h >>> ((y * 3 + x) % 30)) & 1;
      if (!bit) continue;
      cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
      if (x < 2) cells.push(`<rect x="${4 - x}" y="${y}" width="1" height="1"/>`);
    }
  }
  return (
    `<svg class="rd-sigil" viewBox="0 0 5 5" width="34" height="34" aria-hidden="true" ` +
    `shape-rendering="crispEdges"><g fill="${esc(accent)}">${cells.join("")}</g></svg>`
  );
}

/* ---------- Yardimcilar ---------- */

function nf(n) {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "") + "k";
  return String(n);
}

function since(ts, tr) {
  if (!ts) return "";
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return tr ? `${mins} dk önce` : `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return tr ? `${hrs} saat önce` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return tr ? `${days} gün önce` : `${days}d ago`;
}

/* ---------- Repo karti ---------- */

function repoCard(r, s, i, tr) {
  const t = tr ? s.tr : s.en;
  const accent = langColor(r.language);
  const rank = String(i + 1).padStart(2, "0");

  const topics = (r.topics || [])
    .slice(0, 4)
    .map((x) => `<li>${esc(x)}</li>`)
    .join("");

  const today =
    r.starsToday != null
      ? `<span class="rd-hot" title="${tr ? "bugün kazandığı yıldız" : "stars gained today"}">▲ ${nf(r.starsToday)}</span>`
      : "";

  const install = r.install
    ? `<div class="rd-cmd"><span class="rd-cmd-label">${tr ? "kurulum" : "install"}</span><code>${esc(r.install)}</code></div>`
    : "";

  const who = t.who
    ? `<p class="rd-who"><span>${tr ? "kime lazım" : "who it's for"}</span> ${esc(t.who)}</p>`
    : "";

  return `
        <article class="rd-card rd-repo" style="--rd-accent:${esc(accent)}">
          <div class="rd-rank">${rank}</div>
          <div class="rd-head">
            ${sigil(r.full, accent)}
            <div class="rd-title">
              <h3><a href="${esc(safeUrl(r.url))}" rel="noopener nofollow" target="_blank">${esc(r.owner)}<span>/</span>${esc(r.name)}</a></h3>
              <p class="rd-meta">
                ${r.language ? `<span class="rd-lang">${esc(r.language)}</span>` : ""}
                <span class="rd-stars">★ ${nf(r.stars)}</span>
                ${today}
                ${r.license ? `<span class="rd-lic">${esc(r.license)}</span>` : ""}
              </p>
            </div>
            ${safeUrl(r.avatar) ? `<img class="rd-avatar" src="${esc(safeUrl(r.avatar))}&amp;s=96" alt="" width="40" height="40" loading="lazy" decoding="async" onerror="this.remove()">` : ""}
          </div>
          <p class="rd-what">${esc(t.what)}</p>
          ${t.how ? `<p class="rd-how">${esc(t.how)}</p>` : ""}
          ${install}
          ${who}
          ${topics ? `<ul class="rd-topics">${topics}</ul>` : ""}
        </article>`;
}

/* ---------- Haber karti ---------- */

function newsCard(n, s, tr) {
  const t = tr ? s.tr : s.en;
  const accent = ["#00ff9c", "#ff3ef2", "#ffd93d", "#3ea8ff"][hash32(n.source) % 4];
  return `
        <article class="rd-card rd-news" style="--rd-accent:${esc(accent)}">
          <div class="rd-src">${sigil(n.source, accent)}<span>${esc(n.source)}</span>${n.ts ? `<time datetime="${new Date(n.ts).toISOString()}">${esc(since(n.ts, tr))}</time>` : ""}</div>
          <h3><a href="${esc(safeUrl(n.link))}" rel="noopener nofollow" target="_blank">${esc(t.title || n.title)}</a></h3>
          ${t.summary ? `<p>${esc(t.summary)}</p>` : ""}
        </article>`;
}

/* ---------- Sayfa govdesi ---------- */

export function renderRadar(data, tr) {
  const d = new Date(data.generatedAt);
  const stamp = tr ? trDate(d) : enDate(d);
  const clock = d.toISOString().slice(11, 16);

  const repos = data.repos
    .map((r, i) => repoCard(r, data.repoSummaries[i], i, tr))
    .join("");
  const news = data.news.map((n, i) => newsCard(n, data.newsSummaries[i], tr)).join("");

  const empty = (msg) => `<p class="rd-empty">${esc(msg)}</p>`;

  return `
      <p class="rd-stamp">${tr ? "Son tarama" : "Last sweep"}: <strong>${esc(stamp)}</strong> · ${esc(clock)} UTC</p>

      <section class="rd-block" id="${tr ? "repolar" : "repos"}" aria-labelledby="${tr ? "repolar" : "repos"}-h">
        <h2 id="${tr ? "repolar" : "repos"}-h" class="rd-h">${tr ? "Günün Depoları" : "Today's Repos"}</h2>
        <p class="rd-lede">${tr
          ? "GitHub'da bugün en çok yıldız toplayan projeler. Her biri için: ne işe yarıyor, nasıl kuruluyor, kimin işine yarar."
          : "The projects gaining the most stars on GitHub today. For each: what it does, how to install it, who it's for."}</p>
        <div class="rd-grid">${repos || empty(tr ? "Bugün liste alınamadı, yarın tekrar deneyeceğiz." : "Could not fetch the list today; we will try again tomorrow.")}</div>
      </section>

      <section class="rd-block" id="${tr ? "haberler" : "news"}" aria-labelledby="${tr ? "haberler" : "news"}-h">
        <h2 id="${tr ? "haberler" : "news"}-h" class="rd-h">${tr ? "Yapay Zeka Haberleri" : "AI News"}</h2>
        <p class="rd-lede">${tr
          ? "Son 48 saatin öne çıkan başlıkları. Başlığa tıklayınca haberin kendi sayfasına gidersin."
          : "Notable headlines from the last 48 hours. Clicking a headline takes you to the original article."}</p>
        <div class="rd-list">${news || empty(tr ? "Bugün haber alınamadı." : "No news could be fetched today.")}</div>
      </section>`;
}

/* ---------- Ana sayfadaki kucuk kutu ---------- */

export function renderHomeBox(data, tr) {
  const items = data.repos.slice(0, 3).map((r, i) => {
    const t = tr ? data.repoSummaries[i].tr : data.repoSummaries[i].en;
    return `
            <li>
              <a href="${tr ? "/radar/" : "/en/radar/"}">
                <span class="rb-name">${esc(r.owner)}/${esc(r.name)}</span>
                <span class="rb-what">${esc(t.what)}</span>
              </a>
            </li>`;
  }).join("");

  const heads = data.news.slice(0, 2).map((n, i) => {
    const t = tr ? data.newsSummaries[i].tr : data.newsSummaries[i].en;
    return `<li><a href="${tr ? "/radar/#haberler" : "/en/radar/#news"}"><span class="rb-src">${esc(n.source)}</span>${esc(t.title || n.title)}</a></li>`;
  }).join("");

  const d = new Date(data.generatedAt);
  return `
        <div class="radar-box">
          <div class="radar-box-head">
            <span class="rb-live">● ${tr ? "CANLI" : "LIVE"}</span>
            <span class="rb-date">${esc(tr ? trDate(d) : enDate(d))}</span>
          </div>
          <p class="rb-lede">${tr ? "Bugün GitHub'da öne çıkanlar" : "Trending on GitHub today"}</p>
          <ul class="rb-list">${items}</ul>
          ${heads ? `<p class="rb-lede rb-lede-2">${tr ? "Yapay zeka gündemi" : "AI headlines"}</p><ul class="rb-news">${heads}</ul>` : ""}
          <a class="btn btn-ghost rb-all" href="${tr ? "/radar/" : "/en/radar/"}">${tr ? "TÜMÜNÜ GÖR" : "SEE ALL"} ▸</a>
        </div>`;
}
