/* Radar kaynaklari.
   Yeni kaynak eklemek/cikarmak icin sadece bu dosyaya dokunman yeter.
   Bir kaynak olurse sistem onu sessizce atlar ve saglik raporuna yazar. */

/* Resmi bloglar once gelir: haber sitelerinden daha guvenilir ve daha erken. */
export const NEWS_FEEDS = [
  { name: "OpenAI",           url: "https://openai.com/news/rss.xml",                                      weight: 3 },
  { name: "Google AI",        url: "https://blog.google/technology/ai/rss/",                               weight: 3 },
  { name: "Google DeepMind",  url: "https://deepmind.google/blog/rss.xml",                                 weight: 3 },
  { name: "Hugging Face",     url: "https://huggingface.co/blog/feed.xml",                                 weight: 3 },
  { name: "Microsoft AI",     url: "https://blogs.microsoft.com/ai/feed/",                                 weight: 2 },
  { name: "NVIDIA",           url: "https://blogs.nvidia.com/blog/category/generative-ai/feed/",           weight: 2 },
  { name: "Meta AI",          url: "https://ai.meta.com/blog/rss/",                                        weight: 2 },
  { name: "TechCrunch",       url: "https://techcrunch.com/category/artificial-intelligence/feed/",        weight: 2 },
  { name: "The Verge",        url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",    weight: 2 },
  { name: "Ars Technica",     url: "https://arstechnica.com/ai/feed/",                                     weight: 2 },
  { name: "VentureBeat",      url: "https://venturebeat.com/category/ai/feed/",                            weight: 1 },
  { name: "MIT Tech Review",  url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",  weight: 2 },
  { name: "Simon Willison",   url: "https://simonwillison.net/atom/everything/",                           weight: 1 },
  { name: "Hacker News",      url: "https://hnrss.org/newest?q=AI+OR+LLM&points=150",                      weight: 1 }
];

/* Trending sayfasi olurse bu sorguya duseriz. */
export const REPO_FALLBACK_QUERY = "stars:>40 pushed:>{SINCE} sort:stars";

/* Radar'da gostermek istemedigimiz seyler: icerik ciftligi, spam, kurs listeleri. */
export const REPO_BLOCKLIST = [
  /awesome-/i,
  /interview[-_]?(questions|prep)/i,
  /free[-_]?(courses?|books?|programming)/i,
  /system[-_]design[-_]primer/i,
  /coding[-_]interview/i,
  /roadmap$/i
];

export const LIMITS = {
  news: 10,          /* sayfada gosterilecek haber sayisi */
  repos: 8,          /* sayfada gosterilecek repo sayisi */
  newsMaxAgeHours: 48,
  readmeChars: 4000  /* modele yollanacak README parcasi */
};
