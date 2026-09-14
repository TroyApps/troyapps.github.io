import assert from "node:assert/strict";
import test from "node:test";

const actionsModule = await import("../assets/js/troy/troy-actions.js").catch(() => ({}));
const copyModule = await import("../assets/js/troy/troy-copy.js").catch(() => ({}));
const moodModule = await import("../assets/js/troy/troy-mood.js").catch(() => ({}));

const {
  createLatestActionQueue,
  getTroyAction,
  isActionReady,
  isTroyTool,
  resolveTroyReaction,
} = actionsModule;
const { getTroyCopy, pickTroyLine } = copyModule;
const { createTroyMood, TROY_IRRITATION_RESET_MS } = moodModule;

test("Troy interaction modules expose testable browser-independent contracts", () => {
  assert.equal(typeof actionsModule.getTroyAction, "function");
  assert.equal(typeof actionsModule.isTroyTool, "function");
  assert.equal(typeof actionsModule.isActionReady, "function");
  assert.equal(typeof actionsModule.createLatestActionQueue, "function");
  assert.equal(typeof actionsModule.resolveTroyReaction, "function");
  assert.equal(typeof copyModule.getTroyCopy, "function");
  assert.equal(typeof copyModule.pickTroyLine, "function");
  assert.equal(typeof moodModule.createTroyMood, "function");
});

test("physical Troy tools produce the intended animation sequence and effect", () => {
  assert.deepEqual(getTroyAction("poke"), {
    name: "poke",
    sequence: ["poke", "recover"],
    effect: null,
    cooldownMs: 450,
  });
  assert.deepEqual(getTroyAction("bazooka"), {
    name: "bazooka",
    sequence: ["bazookaAim", "bazookaFire", "rocketFlight", "pixelScattered"],
    effect: "bazookaLaunch",
    cooldownMs: 1200,
  });
  assert.deepEqual(getTroyAction("whip"), {
    name: "whip",
    sequence: ["whipHit", "recover"],
    effect: "whip",
    cooldownMs: 900,
  });
  assert.equal(getTroyAction("unknown"), null);
  assert.equal(isTroyTool("poke"), true);
  assert.equal(isTroyTool("bazooka"), true);
  assert.equal(isTroyTool("slap"), false);
  assert.equal(isTroyTool("command"), false);
});

test("Troy action cooldown becomes ready at the exact boundary", () => {
  assert.equal(isActionReady(1_000, 1_449, 450), false);
  assert.equal(isActionReady(1_000, 1_450, 450), true);
});

test("Troy pending queue retains only the latest valid action", () => {
  const queue = createLatestActionQueue();
  queue.request("poke");
  queue.request("whip");
  queue.request("unknown");
  assert.equal(queue.size(), 1);
  assert.equal(queue.take(), "whip");
  assert.equal(queue.take(), null);
  assert.equal(queue.size(), 0);
});

test("all Troy locales provide complete controls and varied reactions", () => {
  const expectedPokeLabels = new Map([
    ["tr", "Dürt"], ["en", "Poke"], ["es-419", "Tocar"], ["pt-BR", "Cutucar"],
    ["hi", "छुएँ"], ["id", "Sentuh"], ["ar", "المس"], ["de", "Anstupsen"],
    ["fr", "Taquiner"], ["it", "Pungola"],
  ]);
  for (const language of ["tr", "en", "es-419", "pt-BR", "hi", "id", "ar", "de", "fr", "it"]) {
    const copy = getTroyCopy(language);
    assert.equal(copy.tools.poke.label, expectedPokeLabels.get(language));
    assert.deepEqual(Object.keys(copy.tools), ["poke", "bazooka", "whip", "command"]);
    assert.deepEqual(Object.keys(copy.commands), ["apps", "radar", "about", "contact"]);
    assert.ok(copy.dialogue.pokeSurprised.length >= 3);
    assert.ok(copy.dialogue.pokeAnnoyed.length >= 3);
    assert.ok(copy.dialogue.pokeDefensive.length >= 3);
    assert.ok(copy.dialogue.bazooka.length >= 3);
    assert.equal(copy.dialogue.bazookaImpact.length, 1);
    assert.ok(copy.dialogue.pixelScattered.length >= 4);
    assert.ok(copy.dialogue.reforming.length >= 2);
    assert.ok(copy.dialogue.whipSurprised.length >= 3);
    assert.ok(copy.dialogue.whipAnnoyed.length >= 3);
    assert.ok(copy.dialogue.whipDefensive.length >= 3);
    assert.equal(copy.sound, undefined);
  }
});

test("French and Italian Troy reactions are localized", () => {
  const french = getTroyCopy("fr");
  const italian = getTroyCopy("it");

  assert.equal(french.tools.poke.label, "Taquiner");
  assert.equal(french.dialogue.bazookaImpact[0], "Bon sang... Ça recommence !");
  assert.equal(italian.tools.poke.label, "Pungola");
  assert.equal(italian.dialogue.bazookaImpact[0], "Dannazione... Ci risiamo!");
});

test("Troy resolves regional aliases and falls back to English", () => {
  assert.equal(getTroyCopy("es-MX"), getTroyCopy("es-419"));
  assert.equal(getTroyCopy("pt-PT"), getTroyCopy("pt-BR"));
  assert.equal(getTroyCopy("unknown"), getTroyCopy("en"));
});

test("bazooka collision uses Troy's approved impact reaction", () => {
  assert.deepEqual(getTroyCopy("tr").dialogue.bazookaImpact, [
    "Lanet olsun... Yine aynısı oluyor!",
  ]);
  assert.deepEqual(getTroyCopy("en").dialogue.bazookaImpact, [
    "Damn it... This keeps happening!",
  ]);
});

test("Troy dialogue selection avoids an immediate repeated line", () => {
  assert.deepEqual(pickTroyLine(["a", "b", "c"], 1, 0.5), { line: "c", index: 2 });
  assert.deepEqual(pickTroyLine(["only"], 0, 0.9), { line: "only", index: 0 });
  assert.deepEqual(pickTroyLine([], 0, 0.9), { line: "", index: -1 });
});

test("Troy poke mood escalates and resets at the inclusive boundary", () => {
  const mood = createTroyMood();
  assert.equal(TROY_IRRITATION_RESET_MS, 12_000);
  assert.equal(mood.registerPoke(1_000), "surprised");
  assert.equal(mood.registerPoke(2_000), "annoyed");
  assert.equal(mood.registerPoke(3_000), "defensive");
  assert.equal(mood.registerPoke(4_000), "defensive");
  assert.equal(mood.level(15_999), 3);
  assert.equal(mood.level(16_000), 0);
  assert.equal(mood.registerPoke(16_000), "surprised");
});

test("poke and whip retain independent irritation boundaries", () => {
  const mood = createTroyMood();
  assert.equal(mood.registerPhysical("whip", 1_000), "surprised");
  assert.equal(mood.registerPhysical("whip", 2_000), "annoyed");
  assert.equal(mood.registerPhysical("whip", 3_000), "defensive");
});

test("Troy mood can be calmed without storage or timers", () => {
  const mood = createTroyMood();
  mood.registerPoke(100);
  mood.registerPoke(200);
  assert.equal(mood.calm(), 0);
  assert.equal(mood.level(201), 0);
});

test("poke tiers resolve to deliberate animation and dialogue contracts", () => {
  assert.deepEqual(resolveTroyReaction("poke", "surprised"), {
    dialogueKey: "pokeSurprised",
    expression: "Surprised",
    sequence: ["poke", "recover"],
  });
  assert.deepEqual(resolveTroyReaction("poke", "annoyed"), {
    dialogueKey: "pokeAnnoyed",
    expression: "Angry",
    sequence: ["poke", "annoyed", "recover"],
  });
  assert.deepEqual(resolveTroyReaction("poke", "defensive"), {
    dialogueKey: "pokeDefensive",
    expression: "Defensive",
    sequence: ["recover"],
    effect: "pokeGuard",
  });
  assert.deepEqual(resolveTroyReaction("bazooka", "surprised"), {
    dialogueKey: "bazooka",
    expression: "Angry",
    sequence: ["bazookaAim", "bazookaFire", "rocketFlight", "pixelScattered"],
    effect: "bazookaLaunch",
  });
  assert.deepEqual(resolveTroyReaction("whip", "surprised"), {
    dialogueKey: "whipSurprised",
    expression: "Surprised",
    sequence: ["whipHit", "recover"],
    effect: "whipCrack",
  });
  assert.deepEqual(resolveTroyReaction("whip", "annoyed"), {
    dialogueKey: "whipAnnoyed",
    expression: "Angry",
    sequence: ["whipHit", "annoyed", "recover"],
    effect: "whipCrack",
  });
  assert.deepEqual(resolveTroyReaction("whip", "defensive"), {
    dialogueKey: "whipDefensive",
    expression: "Defensive",
    sequence: ["recover"],
    effect: "whipCaught",
  });
  assert.equal(resolveTroyReaction("unknown"), null);
});
