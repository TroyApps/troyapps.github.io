import assert from "node:assert/strict";
import test from "node:test";

const visualsModule = await import("../assets/js/troy/troy-dialogue-visuals.js").catch(() => ({}));
const {
  createDialogueFragments,
  createDialogueTimeline,
  createPixelOrbit,
  dialogueTimingFor,
} = visualsModule;

test("dialogue assembles, stays for five seconds, disperses, then hides", () => {
  assert.equal(typeof createDialogueTimeline, "function");
  const timeline = createDialogueTimeline();
  timeline.show(1_000);

  assert.equal(timeline.phase(1_000), "assembling");
  assert.equal(timeline.phase(1_649), "assembling");
  assert.equal(timeline.phase(1_650), "visible");
  assert.equal(timeline.phase(6_649), "visible");
  assert.equal(timeline.phase(6_650), "dispersing");
  assert.equal(timeline.phase(7_299), "dispersing");
  assert.equal(timeline.phase(7_300), "hidden");
});

test("a new Troy reaction restarts dialogue assembly and visibility", () => {
  const timeline = createDialogueTimeline();
  timeline.show(1_000);
  assert.equal(timeline.phase(6_800), "dispersing");

  timeline.show(6_800);
  assert.equal(timeline.phase(6_800), "assembling");
  assert.equal(timeline.phase(12_449), "visible");
});

test("bazooka impact dialogue assembles before the delayed explosion", () => {
  assert.equal(typeof dialogueTimingFor, "function");
  assert.deepEqual(dialogueTimingFor("bazookaImpact"), {
    assembleMs: 240,
    visibleMs: 5_000,
    disperseMs: 650,
  });
  assert.deepEqual(dialogueTimingFor("pokeSurprised"), {
    assembleMs: 650,
    visibleMs: 5_000,
    disperseMs: 650,
  });
});

test("idle Troy receives an uneven deterministic red-black pixel orbit", () => {
  assert.equal(typeof createPixelOrbit, "function");
  const first = createPixelOrbit(22);
  const second = createPixelOrbit(22);

  assert.deepEqual(first, second);
  assert.equal(first.length, 22);
  assert.ok(new Set(first.map((pixel) => pixel.radiusX)).size >= 5);
  assert.ok(new Set(first.map((pixel) => pixel.radiusY)).size >= 5);
  assert.deepEqual(new Set(first.map((pixel) => pixel.color)), new Set(["red", "black"]));
  assert.ok(first.every((pixel) => pixel.size >= 2 && pixel.size <= 5));
});

test("dialogue receives deterministic red-black shards that can assemble and disperse", () => {
  assert.equal(typeof createDialogueFragments, "function");
  const fragments = createDialogueFragments(16);

  assert.equal(fragments.length, 16);
  assert.deepEqual(new Set(fragments.map((fragment) => fragment.color)), new Set(["red", "black"]));
  assert.ok(fragments.every((fragment) => Math.abs(fragment.startX) >= 18));
  assert.ok(fragments.every((fragment) => Math.abs(fragment.startY) >= 12));
  assert.ok(new Set(fragments.map((fragment) => fragment.delay)).size >= 8);
  assert.deepEqual(createDialogueFragments(16), fragments);
});
