import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function page(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

const locales = [
  { name: "Turkish", file: "index.html" },
  { name: "English", file: "en/index.html" },
];

for (const locale of locales) {
  test(`${locale.name} homepage exposes the premium Troy shell`, async () => {
    const html = await page(locale.file);

    assert.match(html, /<body class="home-v2 home-v3 theme-command">/);
    assert.match(html, /id="troy-stage"/);
    assert.match(html, /\/assets\/css\/theme-v3\.css\?v=20260913-header4/);
    assert.match(html, /\/assets\/css\/home-v2\.css\?v=20260912-drop7/);
    assert.match(html, /\/assets\/js\/troy\/troy-three\.js\?v=20260914-lookdown1/);
    assert.match(html, /\/assets\/js\/troy\/troy-controller\.js\?v=20260914-lookdown1/);
    assert.doesNotMatch(html, /\/assets\/js\/mascot\.js/);
  });

  test(`${locale.name} homepage has no auth preview or data collection controls`, async () => {
    const html = await page(locale.file);
    assert.doesNotMatch(html, /auth-preview|data-auth-status|<form\b|<input\b/i);
  });

  test(`${locale.name} footer links every official TroyApps social account`, async () => {
    const html = await page(locale.file);
    const requiredLinks = [
      "https://www.youtube.com/channel/UC2PncaDQ9wSXYqY5IaffuJw",
      "https://www.instagram.com/troyappsofficial/",
      "https://www.tiktok.com/@troyappsofficial",
      "https://www.facebook.com/troyappsofficial",
    ];

    for (const href of requiredLinks) {
      assert.ok(html.includes(`href="${href}"`), `missing ${href}`);
    }
  });

  test(`${locale.name} homepage retains the Radar injection boundary`, async () => {
    const html = await page(locale.file);
    const start = html.indexOf("<!-- RADARBOX:START -->");
    const end = html.indexOf("<!-- RADARBOX:END -->");

    assert.ok(start >= 0, "Radar start marker missing");
    assert.ok(end > start, "Radar end marker must follow start marker");
  });

  test(`${locale.name} homepage mounts Troy as a local Three.js model with a poster fallback`, async () => {
    const html = await page(locale.file);

    assert.match(html, /<canvas\b[^>]*data-troy-canvas[^>]*><\/canvas>/i);
    assert.match(html, /data-troy-model="\/assets\/models\/troy\/troy\.glb"/);
    assert.match(html, /data-troy-poster/);
    assert.match(html, /"three"\s*:\s*"\/assets\/vendor\/three-0\.185\.1\/three\.module\.min\.js"/);
    assert.match(html, /"three\/addons\/"\s*:\s*"\/assets\/vendor\/three-0\.185\.1\/addons\/"/);
    assert.match(html, /\/assets\/js\/troy\/troy-three\.js/);
    assert.doesNotMatch(html, /(?:unpkg|jsdelivr|cdnjs)\.com[^"']*three/i);
  });

  test(`${locale.name} homepage exposes accessible choose-then-activate Troy controls`, async () => {
    const html = await page(locale.file);

    assert.match(html, /<button\b[^>]*data-troy-target[^>]*>/i);
    assert.equal((html.match(/data-troy-tool-option=/g) || []).length, 3);
    assert.match(html, /data-troy-tool-option="poke"[^>]*aria-pressed="true"/);
    assert.match(html, /data-troy-tool-option="bazooka"[^>]*aria-pressed="false"/);
    assert.doesNotMatch(html, /data-troy-tool-option="slap"/);
    assert.match(html, /data-troy-tool-option="whip"[^>]*aria-pressed="false"/);
    assert.match(html, /data-troy-command-trigger[^>]*aria-expanded="false"[^>]*aria-controls="troy-command-panel"/);
    assert.match(html, /id="troy-command-panel"[^>]*data-troy-command-panel[^>]*hidden/);
    assert.doesNotMatch(html, /data-troy-sound/);
    assert.match(html, /data-troy-effect/);
    assert.match(html, /data-troy-dialogue-state="hidden"/);
    assert.match(html, /data-troy-pixels/);
    assert.match(html, /data-troy-pixel-target[^>]*hidden/);
    assert.match(html, /class="troy-intro"[^>]*role="status"[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  });

  test(`${locale.name} Troy commands remain native localized links`, async () => {
    const html = await page(locale.file);
    const commandHrefs = locale.file === "index.html"
      ? ["#uygulamalar", "/radar/", "#hakkimizda", "#iletisim"]
      : ["#apps", "/en/radar/", "#about", "#contact"];
    const noScriptCommands = html.match(/<noscript>[\s\S]*?troy-command-fallback[\s\S]*?<\/noscript>/i)?.[0];

    assert.ok(noScriptCommands, "missing no-JavaScript Troy command fallback");

    for (const href of commandHrefs) {
      assert.ok(
        html.includes(`href="${href}" data-troy-command=`),
        `missing native Troy command link: ${href}`,
      );
      assert.ok(
        noScriptCommands.includes(`href="${href}"`),
        `missing no-JavaScript Troy command link: ${href}`,
      );
    }
  });
}

test("app-ads publisher record stays exact and BOM-free", async () => {
  const bytes = await readFile(new URL("app-ads.txt", root));
  const text = bytes.toString("utf8");

  assert.deepEqual([...bytes.subarray(0, 3)], [0x67, 0x6f, 0x6f]);
  assert.equal(
    text,
    "google.com, pub-9329708777375659, DIRECT, f08c47fec0942fa0\r\n",
  );
});

test("homepage-linked Troy assets exist in the published tree", async () => {
  const requiredAssets = [
    "assets/css/home-v2.css",
    "assets/img/troy/troy-hero.webp",
    "assets/js/troy/troy-controller.js",
    "assets/js/troy/troy-dialogue-visuals.js",
    "assets/js/troy/troy-bazooka-motion.js",
    "assets/js/troy/troy-mood.js",
    "assets/js/troy/troy-pixel-ghost.js",
    "assets/js/troy/troy-preferences.js",
    "assets/js/troy/troy-renderer-contract.js",
    "assets/js/troy/troy-tail-spring.js",
    "assets/js/troy/troy-three.js",
    "assets/models/troy/bazooka.glb",
    "assets/models/troy/rocket.glb",
    "assets/models/troy/troy.glb",
    "assets/vendor/three-0.185.1/three.module.min.js",
    "assets/vendor/three-0.185.1/addons/loaders/GLTFLoader.js",
    "assets/vendor/three-0.185.1/LICENSE",
  ];

  for (const asset of requiredAssets) {
    const exists = await access(new URL(asset, root)).then(
      () => true,
      () => false,
    );
    assert.ok(exists, `missing published asset: ${asset}`);
  }
});

test("Troy runtime cache-busts the reframed renderer boundary", async () => {
  const controller = await page("assets/js/troy/troy-controller.js");
  const renderer = await page("assets/js/troy/troy-three.js");

  assert.doesNotMatch(`${controller}\n${renderer}`, /2026090[45]-mascot[123]/);
  assert.match(renderer, /troy-preferences\.js\?v=20260908-mascot32/);
  assert.match(renderer, /troy-renderer-contract\.js\?v=20260910-shell1/);
  assert.match(controller, /troy-mood\.js\?v=20260908-mascot32/);
  assert.match(controller, /troy-three\.js\?v=20260914-lookdown1/);
  assert.doesNotMatch(controller, /troy-sound\.js/);
  assert.doesNotMatch(`${controller}\n${renderer}`, /slapHand|SlapHand|slapHit|slapBlocked/);
  assert.equal((controller.match(/\?v=20260908-mascot32/g) || []).length, 4);
  assert.equal((renderer.match(/\?v=20260908-mascot32/g) || []).length, 6);
});

test("bazooka pose hold keeps the mixer evaluating its base pose instead of accumulating head rotation", async () => {
  const renderer = await page("assets/js/troy/troy-three.js");

  assert.match(renderer, /setEffectiveTimeScale\(0\)/);
  assert.doesNotMatch(renderer, /\b(?:currentAction|nextAction)\.paused = true/);
  assert.match(renderer, /let heldBazookaPose = null/);
  assert.match(renderer, /head: head\?\.quaternion\.clone\(\)/);
  assert.match(renderer, /head\?\.quaternion\.copy\(heldBazookaPose\.head\)/);
  assert.match(renderer, /spine\?\.quaternion\.copy\(heldBazookaPose\.spine\)/);
});

test("Troy command completion discards physical input queued during acknowledgement", async () => {
  const controller = await page("assets/js/troy/troy-controller.js");
  const runCommand = controller.match(/async function runCommand\(link\) \{[\s\S]*?\n  \}/)?.[0];

  assert.ok(runCommand, "runCommand implementation missing");
  assert.match(runCommand, /pendingActions\.clear\(\);[\s\S]*?busy = false;/);
});

test("Troy controls keep readable labels across desktop and mobile layouts", async () => {
  const css = await page("assets/css/home-v2.css");

  assert.match(css, /font:\s*700\s+\.68rem\/1\.1\s+var\(--body\)/);
  assert.match(
    css,
    /@media\s*\(max-width:\s*480px\)[\s\S]*?\.home-v2\s+\.troy-tool\s*\{[^}]*font-size:\s*\.75rem/,
  );
});

test("Troy controller exposes deterministic animation state transitions", async () => {
  const moduleUrl = new URL("assets/js/troy/troy-state.js", root);
  const stateModule = await import(moduleUrl).catch(() => null);

  assert.equal(typeof stateModule?.createTroyState, "function");
  const troy = stateModule.createTroyState();
  assert.equal(troy.current(), "idle");
  assert.equal(troy.enter("bazookaAim"), "bazookaAim");
  assert.equal(troy.finish(), "bazookaFire");
  assert.equal(troy.finish(), "rocketFlight");
  assert.equal(troy.finish(), "pixelScattered");
  assert.equal(troy.enter("unknown"), "idle");
});
