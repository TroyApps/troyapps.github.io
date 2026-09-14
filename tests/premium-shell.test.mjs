import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const playUrl = "https://play.google.com/store/apps/developer?id=Troy+Apps";
const socials = [
  "https://www.youtube.com/channel/UC2PncaDQ9wSXYqY5IaffuJw",
  "https://www.instagram.com/troyappsofficial/",
  "https://www.tiktok.com/@troyappsofficial",
  "https://www.facebook.com/troyappsofficial",
];

async function read(relativePath) { return readFile(new URL(relativePath, root), "utf8"); }

for (const file of ["index.html", "en/index.html"]) {
  test(`${file} exposes the shared command shell without auth`, async () => {
    const html = await read(file);
    assert.match(html, /<body class="home-v2 home-v3 theme-command">/);
    assert.match(html, /theme-v3\.css\?v=20260913-header4/);
    assert.match(html, /class="[^"]*command-header[^"]*"/);
    assert.match(html, /<details class="language-menu"/);
    assert.match(html, /class="[^"]*command-footer[^"]*"/);
    assert.ok(html.includes(playUrl));
    assert.ok(html.includes("mailto:info@troyapps.app"));
    assert.ok(html.includes("mailto:support@troyapps.app"));
    for (const href of socials) assert.ok(html.includes(`href="${href}"`));
    assert.doesNotMatch(html, /auth-preview|data-auth-status|Google ile Giriş|Google Sign-In/i);
    assert.doesNotMatch(html, /<form\b|<input\b/i);
  });
}

test("the shared theme file exists and defines the stable token contract", async () => {
  await access(new URL("assets/css/theme-v3.css", root));
  const css = await read("assets/css/theme-v3.css");
  for (const token of ["--cmd-bg", "--cmd-surface", "--cmd-red", "--cmd-red-bright", "--cmd-ink", "--cmd-muted", "--cmd-line", "--cmd-focus"]) {
    assert.ok(css.includes(token), `missing ${token}`);
  }
  assert.match(css, /:focus-visible/);
});

const publicPages=[{file:"index.html",lang:"tr",kind:"home"},{file:"en/index.html",lang:"en",kind:"home"},{file:"morse-flash/index.html",lang:"tr",kind:"product"},{file:"en/morse-flash/index.html",lang:"en",kind:"product"},{file:"radar/index.html",lang:"tr",kind:"radar"},{file:"en/radar/index.html",lang:"en",kind:"radar"},{file:"morse-flash-policy/index.html",lang:"tr",kind:"policy"},{file:"airmousehand-policy/index.html",lang:"tr",kind:"policy"},{file:"404.html",lang:"tr",kind:"not-found"}];
function localAssets(html){return [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m)=>m[1]).filter((v)=>v.startsWith("/assets/")).map((v)=>v.split("?")[0].slice(1));}
for(const pageInfo of publicPages){test(`${pageInfo.file} has the public page baseline`,async()=>{const html=await read(pageInfo.file);assert.match(html,new RegExp(`<html lang="${pageInfo.lang}">`));assert.equal((html.match(/<main\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.match(html,/class="skip-link"/);assert.match(html,/theme-v3\.css/);assert.doesNotMatch(html,/auth-preview|data-auth-status|Sign in to your account|Google ile Giriş/i);if(["home","product","radar"].includes(pageInfo.kind)){assert.match(html,/command-header/);assert.match(html,/command-footer/);for(const href of ["mailto:info@troyapps.app","mailto:support@troyapps.app",playUrl,...socials])assert.ok(html.includes(href),href);}else assert.match(html,/href="\/"/);});test(`${pageInfo.file} resolves local assets`,async()=>{const html=await read(pageInfo.file);for(const asset of localAssets(html))assert.ok(await access(new URL(asset,root)).then(()=>true,()=>false),asset);});}
for(const [trFile,enFile] of [["index.html","en/index.html"],["morse-flash/index.html","en/morse-flash/index.html"],["radar/index.html","en/radar/index.html"]])test(`${trFile} and ${enFile} preserve structural parity`,async()=>{const [tr,en]=await Promise.all([read(trFile),read(enFile)]);for(const pattern of [/<header\b/g,/<main\b/g,/<footer\b/g,/class="[^"]*command-button/g,/data-inventory-tab/g,/data-troy-tool-option/g,/class="rd-card/g])assert.equal((tr.match(pattern)||[]).length,(en.match(pattern)||[]).length,pattern.source);});
test("homepage controls expose keyboard and state attributes",async()=>{const html=await read("index.html"),toggles=(html.match(/<button\b[^>]*nav-toggle[^>]*>/g)||[]),tabs=(html.match(/<button\b[^>]*data-inventory-tab[^>]*>/g)||[]);assert.equal(toggles.length,1);assert.match(toggles[0],/type="button"/);assert.match(toggles[0],/aria-expanded="false"/);assert.match(toggles[0],/aria-controls="nav-menu"/);assert.equal(tabs.filter((tag)=>tag.includes('role="tab"')).length,tabs.length);assert.equal(tabs.filter((tag)=>tag.includes('tabindex="0"')).length,1);assert.match(html,/class="troy-intro"[^>]*aria-live="polite"/);assert.match(html,/<details class="language-menu"[\s\S]*?<summary/);});
