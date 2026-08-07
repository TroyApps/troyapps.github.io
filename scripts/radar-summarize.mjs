/* Ozetleme katmani.
   Sira: OpenRouter -> Groq -> mekanik ozet.
   Model cevap vermezse ya da bozuk JSON donerse sistem sessizce bir alt
   basamaga iner. Hicbir senaryoda bos alan birakmaz. */

import { log, clip, sleep } from "./radar-lib.mjs";

const PROVIDERS = [
  {
    id: "openrouter",
    key: () => process.env.OPENROUTER_API_KEY,
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: () => process.env.RADAR_MODEL || "google/gemini-2.0-flash-001",
    extraHeaders: {
      "HTTP-Referer": "https://troyapps.app",
      "X-Title": "TroyApps Radar"
    }
  },
  {
    id: "groq",
    key: () => process.env.GROQ_API_KEY,
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: () => process.env.RADAR_MODEL_GROQ || "llama-3.3-70b-versatile",
    extraHeaders: {}
  }
];

/** Tek bir saglayiciya sohbet istegi atar. Basarisizsa null. */
async function ask(provider, prompt, maxTokens = 2200) {
  const key = provider.key();
  if (!key) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(provider.url, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        ...provider.extraHeaders
      },
      body: JSON.stringify({
        model: provider.model(),
        temperature: 0.2,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content:
              "Sen bir teknoloji editorusun. Kisa, net ve abartisiz yazarsin. " +
              "Pazarlama dili kullanmazsin. Emin olmadigin bir sey varsa uydurmazsin. " +
              "SADECE gecerli JSON dondurursun, baska hicbir sey yazmazsin."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!res.ok) {
      log(`${provider.id} HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === "string" ? text : null;
  } catch (err) {
    log(`${provider.id} hata:`, err.name === "AbortError" ? "zaman asimi" : err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Saglayicilari sirayla dener. */
async function askAny(prompt, maxTokens) {
  for (const p of PROVIDERS) {
    if (!p.key()) continue;
    for (let attempt = 0; attempt < 2; attempt++) {
      const out = await ask(p, prompt, maxTokens);
      if (out) return { text: out, provider: p.id };
      await sleep(1200 * (attempt + 1));
    }
  }
  return null;
}

/** Modelin etrafina kod bloklari sarmasina karsi dayanikli JSON okuma. */
export function parseJsonLoose(text) {
  if (!text) return null;
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const start = t.search(/[[{]/);
  if (start < 0) return null;
  const open = t[start];
  const close = open === "[" ? "]" : "}";
  const end = t.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

/* ---------- Mekanik yedek ---------- */

function mechanicalRepo(r) {
  const dil = r.language ? `${r.language} ile yazılmış` : "Açık kaynak";
  const konu = r.topics?.length ? ` (${r.topics.slice(0, 3).join(", ")})` : "";
  /* Kurulum komutu zaten kendi kutusunda gosteriliyor; burada tekrarlamiyoruz. */
  return {
    tr: {
      what: r.desc ? `${r.desc}` : `${dil} bir proje${konu}.`,
      how: r.install ? "" : "Kurulum adımları için depodaki README'ye bakın.",
      who: r.topics?.length ? `İlgi alanı: ${r.topics.slice(0, 3).join(", ")}.` : ""
    },
    en: {
      what: r.desc || `An open source ${r.language || "project"}${konu}.`,
      how: r.install ? "" : "See the repository README for setup steps.",
      who: r.topics?.length ? `Topics: ${r.topics.slice(0, 3).join(", ")}.` : ""
    }
  };
}

function mechanicalNews(n) {
  return {
    tr: { title: n.title, summary: clip(n.blurb || "", 200) },
    en: { title: n.title, summary: clip(n.blurb || "", 200) }
  };
}

/* ---------- Repo ozetleri ---------- */

const REPO_SHAPE =
  '{"items":[{"i":0,"tr":{"what":"...","how":"...","who":"..."},' +
  '"en":{"what":"...","how":"...","who":"..."}}]}';

function repoPrompt(batch) {
  const body = batch
    .map((r, i) =>
      [
        `### ${i}`,
        `depo: ${r.full}`,
        `dil: ${r.language || "?"}`,
        `aciklama: ${r.desc || "-"}`,
        `etiketler: ${(r.topics || []).join(", ") || "-"}`,
        r.install ? `readme'de gecen kurulum komutu: ${r.install}` : "kurulum komutu bulunamadi",
        `readme ozeti: ${clip(r.readme || "", 1500)}`
      ].join("\n")
    )
    .join("\n\n");

  return [
    "Asagida GitHub depolari var. Her biri icin uc soruyu cevapla.",
    "",
    "what : Bu proje ne ise yarar? En fazla iki cumle. Somut ol, ne sorunu cozdugunu yaz.",
    "how  : Nasil kullanilir? Tek cumle. Kurulum komutu verildiyse ondan bahset, VERILMEDIYSE KOMUT UYDURMA.",
    "who  : Kimin isine yarar? Tek kisa cumle.",
    "",
    "tr alanini Turkce, en alanini Ingilizce yaz. Turkce metinde Ingilizce teknik",
    "terimleri oldugu gibi birak (repo, commit, agent gibi). Abartma, reklam dili kullanma.",
    "Readme'de olmayan bir ozellik veya rakam UYDURMA.",
    "",
    `Sadece su sekilde JSON dondur: ${REPO_SHAPE}`,
    "i alani yukaridaki ### numarasiyla ayni olmali.",
    "",
    body
  ].join("\n");
}

function validRepoEntry(e) {
  return (
    e &&
    typeof e.i === "number" &&
    e.tr && typeof e.tr.what === "string" && e.tr.what.trim().length > 3 &&
    e.en && typeof e.en.what === "string" && e.en.what.trim().length > 3
  );
}

export async function summarizeRepos(repos) {
  const result = repos.map(mechanicalRepo);
  if (!repos.length) return { summaries: result, provider: null };

  let usedProvider = null;
  const SIZE = 4; /* kucuk gruplar: bir grup patlarsa digerleri kurtulur */

  for (let start = 0; start < repos.length; start += SIZE) {
    const batch = repos.slice(start, start + SIZE);
    const out = await askAny(repoPrompt(batch), 2400);
    if (!out) {
      log(`repo ozeti ${start}-${start + batch.length - 1}: model yok, mekanik ozet`);
      continue;
    }
    usedProvider = out.provider;
    const parsed = parseJsonLoose(out.text);
    const items = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    let ok = 0;
    for (const e of items) {
      if (!validRepoEntry(e)) continue;
      const idx = start + e.i;
      if (idx < 0 || idx >= repos.length) continue;
      result[idx] = {
        tr: {
          what: clip(String(e.tr.what).trim(), 300),
          how: clip(String(e.tr.how || "").trim(), 200) || result[idx].tr.how,
          who: clip(String(e.tr.who || "").trim(), 160)
        },
        en: {
          what: clip(String(e.en.what).trim(), 300),
          how: clip(String(e.en.how || "").trim(), 200) || result[idx].en.how,
          who: clip(String(e.en.who || "").trim(), 160)
        }
      };
      ok++;
    }
    log(`repo ozeti ${start}-${start + batch.length - 1}: ${ok}/${batch.length} basarili (${out.provider})`);
  }

  return { summaries: result, provider: usedProvider };
}

/* ---------- Haber ozetleri ---------- */

function newsPrompt(batch) {
  const body = batch
    .map((n, i) => `### ${i}\nkaynak: ${n.source}\nbaslik: ${n.title}\nozet: ${clip(n.blurb || "", 400)}`)
    .join("\n\n");

  return [
    "Asagida yapay zeka haberleri var. Her biri icin:",
    "tr.title   : Basligi dogal bir Turkceye cevir. Tiklama tuzagi yapma, abartma.",
    "tr.summary : Tek cumlede ne oldugunu anlat. En fazla 25 kelime.",
    "en.summary : Ayni seyi Ingilizce, tek cumle.",
    "",
    "Verilen metinde OLMAYAN hicbir bilgiyi ekleme. Emin degilsen basligi sadelestirmekle yetin.",
    "",
    'Sadece su sekilde JSON dondur: {"items":[{"i":0,"tr":{"title":"...","summary":"..."},"en":{"summary":"..."}}]}',
    "",
    body
  ].join("\n");
}

export async function summarizeNews(news) {
  const result = news.map(mechanicalNews);
  if (!news.length) return { summaries: result, provider: null };

  let usedProvider = null;
  const SIZE = 6;

  for (let start = 0; start < news.length; start += SIZE) {
    const batch = news.slice(start, start + SIZE);
    const out = await askAny(newsPrompt(batch), 1800);
    if (!out) {
      log(`haber ozeti ${start}-${start + batch.length - 1}: model yok, kaynak ozeti kullanilacak`);
      continue;
    }
    usedProvider = out.provider;
    const parsed = parseJsonLoose(out.text);
    const items = Array.isArray(parsed?.items) ? parsed.items : Array.isArray(parsed) ? parsed : [];
    let ok = 0;
    for (const e of items) {
      if (!e || typeof e.i !== "number") continue;
      const idx = start + e.i;
      if (idx < 0 || idx >= news.length) continue;
      const trTitle = String(e.tr?.title || "").trim();
      const trSum = String(e.tr?.summary || "").trim();
      const enSum = String(e.en?.summary || "").trim();
      if (trTitle.length < 4 && trSum.length < 4) continue;
      result[idx] = {
        tr: {
          title: trTitle.length > 3 ? clip(trTitle, 160) : news[idx].title,
          summary: clip(trSum || result[idx].tr.summary, 220)
        },
        en: {
          title: news[idx].title,
          summary: clip(enSum || result[idx].en.summary, 220)
        }
      };
      ok++;
    }
    log(`haber ozeti ${start}-${start + batch.length - 1}: ${ok}/${batch.length} basarili (${out.provider})`);
  }

  return { summaries: result, provider: usedProvider };
}

export function hasModelKey() {
  return PROVIDERS.some((p) => Boolean(p.key()));
}
