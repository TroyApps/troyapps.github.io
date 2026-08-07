/* TroyApps Radar — gunluk calisan ana betik.
   Kullanim:
     node scripts/radar.mjs              gercek tarama
     node scripts/radar.mjs --dry        dosyalari yazma, sadece raporla
     node scripts/radar.mjs --input x    internete cikmadan ornek veriyle calis
*/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { log, isoDay } from "./radar-lib.mjs";
import { collectNews, collectRepos } from "./radar-collect.mjs";
import { summarizeRepos, summarizeNews, hasModelKey } from "./radar-summarize.mjs";
import { renderRadar, renderHomeBox } from "./radar-render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const DRY = argv.includes("--dry");
const INPUT = (() => {
  const i = argv.indexOf("--input");
  return i >= 0 ? argv[i + 1] : null;
})();

const MARKERS = {
  page: ["<!-- RADAR:START -->", "<!-- RADAR:END -->"],
  box: ["<!-- RADARBOX:START -->", "<!-- RADARBOX:END -->"]
};

/** Isaretciler arasini degistirir. Isaretci yoksa dosyaya dokunmaz. */
async function inject(relFile, kind, html) {
  const file = path.join(ROOT, relFile);
  let src;
  try {
    src = await fs.readFile(file, "utf8");
  } catch {
    log("dosya yok, atlandi:", relFile);
    return false;
  }
  const [open, close] = MARKERS[kind];
  const a = src.indexOf(open);
  const b = src.indexOf(close);
  if (a < 0 || b < 0 || b < a) {
    log(`isaretci bulunamadi (${kind}):`, relFile);
    return false;
  }
  const next = src.slice(0, a + open.length) + "\n" + html + "\n      " + src.slice(b);
  if (next === src) return false;
  if (!DRY) await fs.writeFile(file, next, "utf8");
  log("yazildi:", relFile, `(${kind})`);
  return true;
}

async function writeJson(rel, obj) {
  if (DRY) return;
  const file = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(obj, null, 1), "utf8");
}

/** sitemap.xml icindeki radar satirlarinin tarihini gunceller. */
async function touchSitemap(day) {
  const file = path.join(ROOT, "sitemap.xml");
  let xml;
  try {
    xml = await fs.readFile(file, "utf8");
  } catch {
    return;
  }
  const next = xml.replace(
    /(<loc>https:\/\/troyapps\.app\/(?:en\/)?radar\/<\/loc>\s*<lastmod>)[^<]*(<\/lastmod>)/g,
    `$1${day}$2`
  );
  if (next !== xml && !DRY) {
    await fs.writeFile(file, next, "utf8");
    log("sitemap tarihi guncellendi");
  }
}

async function main() {
  const started = Date.now();
  log("basliyor", DRY ? "(kuru calisma)" : "", INPUT ? `(girdi: ${INPUT})` : "");
  log("model anahtari:", hasModelKey() ? "var" : "YOK - mekanik ozet kullanilacak");

  let news = [];
  let repos = [];
  let health = { feeds: [], repoSource: null };

  if (INPUT) {
    const fx = JSON.parse(await fs.readFile(INPUT, "utf8"));
    news = fx.news || [];
    repos = fx.repos || [];
    health.repoSource = "ornek-veri";
  } else {
    const [n, r] = await Promise.all([collectNews(), collectRepos()]);
    news = n.items;
    health.feeds = n.health;
    repos = r.items;
    health.repoSource = r.via;
  }

  /* Iki taraf da bosysa dun ne yazdiysak orada kalsin; bos sayfa yayinlamayiz. */
  if (!news.length && !repos.length) {
    log("HICBIR VERI ALINAMADI — sayfalara dokunulmuyor, dunku icerik korunuyor");
    process.exitCode = 0;
    return;
  }

  const [{ summaries: repoSummaries, provider: rp }, { summaries: newsSummaries, provider: np }] =
    await Promise.all([summarizeRepos(repos), summarizeNews(news)]);

  const data = {
    generatedAt: new Date().toISOString(),
    day: isoDay(),
    repos,
    news,
    repoSummaries,
    newsSummaries,
    health: {
      ...health,
      summarizer: rp || np || "mekanik",
      counts: { repos: repos.length, news: news.length }
    }
  };

  /* Sayfa govdeleri */
  await inject("radar/index.html", "page", renderRadar(data, true));
  await inject("en/radar/index.html", "page", renderRadar(data, false));
  await inject("index.html", "box", renderHomeBox(data, true));
  await inject("en/index.html", "box", renderHomeBox(data, false));

  /* Veri: guncel + arsiv. Readme'leri saklamiyoruz, gereksiz yer kaplar. */
  const slim = {
    ...data,
    repos: data.repos.map(({ readme, ...rest }) => rest)
  };
  await writeJson("assets/data/radar.json", slim);
  await writeJson(`assets/data/radar/${data.day}.json`, slim);
  await touchSitemap(data.day);

  const dead = (health.feeds || []).filter((f) => !f.ok).map((f) => f.name);
  log("--- ozet ---");
  log(`repo: ${repos.length} (${health.repoSource}) | haber: ${news.length}`);
  log(`ozetleyici: ${data.health.summarizer}`);
  if (dead.length) log(`CEVAP VERMEYEN KAYNAKLAR: ${dead.join(", ")}`);
  log(`sure: ${Math.round((Date.now() - started) / 1000)} sn`);
}

main().catch((err) => {
  /* Beklenmedik bir sey olsa bile calismayi kirmizi yapmayalim:
     sayfalar zaten dunku haliyle ayakta kalir. */
  console.error("[radar] beklenmeyen hata:", err);
  process.exitCode = 0;
});
