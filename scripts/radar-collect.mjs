/* Veri toplama: yapay zeka haberleri + gunun GitHub repolari.
   Her kaynak kendi basina hata verir; biri olurse digerleri devam eder. */

import { get, retry, parseFeed, dedupe, stripTags, clip, log, sleep } from "./radar-lib.mjs";
import { NEWS_FEEDS, REPO_FALLBACK_QUERY, REPO_BLOCKLIST, LIMITS } from "./radar-sources.mjs";

const GH_API = "https://api.github.com";

function ghHeaders() {
  const h = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28"
  };
  if (process.env.GITHUB_TOKEN) h.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/* ---------- Haberler ---------- */

export async function collectNews() {
  const health = [];
  const all = [];

  /* Kaynaklari paralel cek ama her birini kendi try'inda tut. */
  await Promise.all(
    NEWS_FEEDS.map(async (feed) => {
      const xml = await retry(() => get(feed.url, { timeout: 15000 }), 2, 700);
      if (!xml) {
        health.push({ name: feed.name, ok: false, count: 0 });
        return;
      }
      const items = parseFeed(xml, feed.name).map((it) => ({ ...it, weight: feed.weight }));
      health.push({ name: feed.name, ok: items.length > 0, count: items.length });
      all.push(...items);
    })
  );

  const cutoff = Date.now() - LIMITS.newsMaxAgeHours * 3600 * 1000;
  let fresh = all.filter((it) => it.ts == null || it.ts >= cutoff);

  /* Taze haber az geldiyse pencereyi genislet, sayfa bos kalmasin. */
  if (fresh.length < LIMITS.news) {
    log(`taze haber az (${fresh.length}), pencere genisletiliyor`);
    fresh = all;
  }

  const ranked = dedupe(fresh).sort((a, b) => {
    const wa = (a.weight || 1) * 1e12;
    const wb = (b.weight || 1) * 1e12;
    return (wb + (b.ts || 0)) - (wa + (a.ts || 0));
  });

  const dead = health.filter((h) => !h.ok).map((h) => h.name);
  if (dead.length) log("cevap vermeyen kaynaklar:", dead.join(", "));
  log(`haber: ${all.length} ham -> ${ranked.length} tekil`);

  return { items: ranked.slice(0, LIMITS.news), health };
}

/* ---------- Repolar ---------- */

/* GitHub'in kendi gunluk trending sayfasi. Resmi API'si yok, sayfayi okuyoruz. */
async function trendingList() {
  const html = await retry(
    () => get("https://github.com/trending?since=daily", { timeout: 15000 }),
    2,
    900
  );
  if (!html) return [];

  const articles = html.match(/<article class="Box-row"[\s\S]*?<\/article>/g) || [];
  const out = [];
  for (const a of articles) {
    const m = a.match(/return_to=%2F([^%"]+)%2F([^%"&]+)/);
    if (!m) continue;
    const full = `${m[1]}/${decodeURIComponent(m[2])}`;
    const today = (a.match(/([\d,]+)\s*stars? today/) || [])[1];
    out.push({
      full,
      starsToday: today ? Number(today.replace(/,/g, "")) : null
    });
  }
  log(`trending sayfasi: ${out.length} repo`);
  return out;
}

/* Sayfa yapisi degisirse buraya duseriz: resmi arama API'si. */
async function searchList() {
  const since = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const q = REPO_FALLBACK_QUERY.replace("{SINCE}", since);
  const url = `${GH_API}/search/repositories?q=${encodeURIComponent(q)}&per_page=30`;
  const data = await retry(() => get(url, { headers: ghHeaders(), json: true, timeout: 15000 }), 2, 1200);
  if (!data?.items) return [];
  log(`arama API'si: ${data.items.length} repo`);
  return data.items.map((r) => ({ full: r.full_name, starsToday: null }));
}

async function repoDetail(full) {
  const r = await get(`${GH_API}/repos/${full}`, { headers: ghHeaders(), json: true, timeout: 12000 });
  if (!r || r.private) return null;
  return r;
}

async function repoReadme(full) {
  const raw = await get(`${GH_API}/repos/${full}/readme`, {
    headers: { ...ghHeaders(), accept: "application/vnd.github.raw+json" },
    timeout: 12000
  });
  if (!raw) return { raw: "", clean: "" };

  /* Modele yollanacak surum: rozetleri, HTML'i ve baglantilari at.
     Ham surumu sakliyoruz cunku kurulum komutlari kod bloklarinin icinde. */
  const clean = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`>|-]{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { raw, clean: clean.slice(0, LIMITS.readmeChars) };
}

/* README'de GERCEKTEN yazan kurulum komutunu bul.
   Tahmin yurutmuyoruz: uydurma bir komut, komut olmamasindan beterdir. */
export function findInstall(rawReadme) {
  if (!rawReadme) return null;
  const patterns = [
    /npm\s+i(?:nstall)?\s+(?:-g\s+)?[@\w.\/-]{2,}/,
    /npx\s+[@\w.\/-]{2,}/,
    /pnpm\s+(?:add|i|install)\s+(?:-g\s+)?[@\w.\/-]{2,}/,
    /yarn\s+(?:add|global\s+add)\s+[@\w.\/-]{2,}/,
    /bun\s+(?:add|install)\s+[@\w.\/-]{2,}/,
    /pipx?\s+install\s+[\w.\[\]-]{2,}/,
    /uv\s+(?:tool\s+install|pip\s+install|add)\s+[\w.\[\]-]{2,}/,
    /cargo\s+install\s+[\w-]{2,}/,
    /go\s+install\s+[\w.\/@-]{4,}/,
    /brew\s+install\s+[\w\/-]{2,}/,
    /docker\s+(?:run|pull)\s+[\w.\/:-]{4,60}/,
    /apt(?:-get)?\s+install\s+[\w-]{2,}/,
    /curl\s+-[a-zA-Z]*sS?[a-zA-Z]*\s+https?:\/\/[^\s`'"]{6,70}/
  ];
  for (const re of patterns) {
    const m = rawReadme.match(re);
    if (m) return m[0].replace(/\s+/g, " ").trim().slice(0, 90);
  }
  return null;
}

/* Kod deposu gibi durmayanlari ele: ne dili, ne etiketi, ne aciklamasi olan seyler
   genelde pdf arsivi, ders notu, link listesi cikiyor. */
function looksLikeProject(d) {
  const hasSignal = Boolean(d.language) || (d.topics || []).length > 0;
  return hasSignal && Boolean(d.description);
}

export async function collectRepos() {
  let list = await trendingList();
  let via = "trending";
  if (list.length < 5) {
    log("trending yetersiz, arama API'sine dusuluyor");
    list = await searchList();
    via = "search";
  }
  if (!list.length) return { items: [], via: "yok" };

  const filtered = list
    .filter((r) => !REPO_BLOCKLIST.some((re) => re.test(r.full)))
    /* Gunun yildizina gore sirala: "bugun ne patladi" sorusunun cevabi bu. */
    .sort((a, b) => (b.starsToday ?? -1) - (a.starsToday ?? -1));

  const picked = filtered.slice(0, LIMITS.repos + 6);

  const out = [];
  for (const cand of picked) {
    if (out.length >= LIMITS.repos) break;
    const d = await repoDetail(cand.full);
    if (!d) continue;
    if (!looksLikeProject(d)) {
      log("atlandi (proje gibi durmuyor):", cand.full);
      continue;
    }
    const readme = await repoReadme(cand.full);
    out.push({
      full: d.full_name,
      name: d.name,
      owner: d.owner?.login || "",
      avatar: d.owner?.avatar_url || "",
      url: d.html_url,
      homepage: d.homepage || "",
      desc: clip(stripTags(d.description || ""), 220),
      language: d.language || "",
      stars: d.stargazers_count || 0,
      starsToday: cand.starsToday,
      forks: d.forks_count || 0,
      topics: (d.topics || []).slice(0, 6),
      license: d.license?.spdx_id && d.license.spdx_id !== "NOASSERTION" ? d.license.spdx_id : "",
      pushedAt: d.pushed_at || null,
      install: findInstall(readme.raw),
      readme: readme.clean
    });
    await sleep(120); /* API'ye nazik davran */
  }

  log(`repo: ${out.length} tane (${via})`);
  return { items: out, via };
}
