/* Site sozlesmesi: uretilmis sayfalar guncel mi, linkler kirik mi,
   eski tema (Troy / Radar / reklam raylari) geri sizmis mi. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const site = JSON.parse(read("content/site.json"));
const PAGES = ["index.html", "en/index.html", "404.html", "privacy/index.html", "morse-flash-policy/index.html", "airmousehand-policy/index.html"];
const HOME = ["index.html", "en/index.html"];

test("uretilmis sayfalar content/ ile ayni (node scripts/build-pages.mjs calistirilmis)", () => {
  execFileSync(process.execPath, [join(ROOT, "scripts/build-pages.mjs"), "--check"], { stdio: "pipe" });
});

test("her sayfadaki yerel href/src dosyasi repoda var", () => {
  const missing = [];
  for (const page of PAGES) {
    const html = read(page);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
      let p = m[1];
      if (p.endsWith("/")) p += "index.html";
      const abs = join(ROOT, p);
      if (!existsSync(abs) || statSync(abs).isDirectory()) missing.push(`${page}: ${m[1]}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("ana sayfalar: uygulama linkleri, politika linkleri, dil alternatifleri", () => {
  for (const page of HOME) {
    const html = read(page);
    for (const app of site.apps) {
      assert.ok(html.includes(app.play), `${page}: ${app.name} Play linki yok`);
      assert.ok(html.includes(`href="${app.policy}"`), `${page}: ${app.name} politika linki yok`);
      assert.equal((html.match(new RegExp(`${app.shots_dir}/`, "g")) || []).length, app.shots, `${page}: ${app.name} ${app.shots} gorsel olmali`);
    }
    assert.ok(html.includes('href="/privacy/"'), `${page}: gizlilik linki yok`);
    assert.ok(html.includes('hreflang="tr"') && html.includes('hreflang="en"'), `${page}: hreflang eksik`);
    assert.ok(html.includes(site.play_developer), `${page}: gelistirici sayfasi linki yok`);
    assert.ok(html.includes(`mailto:${site.mail}`), `${page}: e-posta yok`);
  }
});

test("AdSense: yukleyici ana sayfalarda var, reklam birimi (ins) hicbir yerde yok", () => {
  for (const page of HOME) assert.ok(read(page).includes(`adsbygoogle.js?client=${site.adsense_client}`), `${page}: AdSense yukleyici yok`);
  for (const page of PAGES) assert.ok(!/<ins class="adsbygoogle"/.test(read(page)), `${page}: reklam birimi olmamali (onay yok)`);
});

test("eski tema geri sizmadi (Troy, Radar, three.js, reklam raylari)", () => {
  for (const page of PAGES) {
    const html = read(page);
    for (const bad of ["troy-controller", "three.module", "ad-rail", "RADAR:START", "/radar/", "theme-v3.css", "home-v3.css"]) {
      assert.ok(!html.includes(bad), `${page}: "${bad}" bulundu`);
    }
  }
  for (const gone of ["assets/js/troy", "assets/models", "assets/vendor", "scripts/radar.mjs", ".github/workflows/radar.yml"]) {
    assert.ok(!existsSync(join(ROOT, gone)), `${gone} silinmis olmali`);
  }
});

test("politika sayfalari ve app-ads.txt yerinde (Play Store linkleri bunlara bakiyor)", () => {
  for (const p of ["privacy/index.html", "morse-flash-policy/index.html", "airmousehand-policy/index.html", "app-ads.txt", "ads.txt", "CNAME"]) {
    assert.ok(existsSync(join(ROOT, p)), `${p} yok`);
  }
  assert.ok(read("app-ads.txt").includes("pub-9329708777375659"));
});

test("yonlendirme sayfalari eski adresleri ana sayfaya tasir", () => {
  for (const [file, to] of Object.entries(site.redirects)) {
    const html = read(file);
    assert.ok(html.includes(`url=${to}`) && html.includes('name="robots" content="noindex"'), `${file} -> ${to}`);
  }
});

test("dil secimi: kok sayfa Turkce olmayan tarayicilari /en/'e yollar, secim saklanir", () => {
  const tr = read("index.html"), en = read("en/index.html");
  assert.ok(/location\.replace\("\/en\/"/.test(tr), "TR ana sayfada yonlendirme yok");
  assert.ok(tr.indexOf("troyapps-lang") < tr.indexOf("site.css"), "betik CSS'ten once olmali");
  assert.ok(en.includes('!=="tr")return;') && en.includes('"en"!=="tr"'), "EN sayfa yonlendirmemeli");
  for (const h of [tr, en]) {
    assert.ok(h.includes('href="/?lang=tr"') && h.includes('href="/en/?lang=en"'), "dil dugmeleri tercihi kaydetmeli");
    assert.ok(h.includes('hreflang="x-default" href="https://troyapps.app/en/"'), "x-default Ingilizce olmali");
  }
  for (const page of ["privacy/index.html", "404.html"]) assert.ok(!read(page).includes("troyapps-lang"), `${page}: dil betigi olmamali`);
});
