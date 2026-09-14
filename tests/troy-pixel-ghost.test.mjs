import assert from "node:assert/strict";
import test from "node:test";

const ghostModule = await import("../assets/js/troy/troy-pixel-ghost.js").catch(() => ({}));
const { createGhostDialogueSchedule, createPixelGhostState } = ghostModule;

test("Troy remains scattered until the cloud is clicked", () => {
  assert.equal(typeof createPixelGhostState, "function");
  const ghost = createPixelGhostState();
  assert.equal(ghost.impact(), "pixelScattered");
  ghost.advance(600_000);
  assert.equal(ghost.current(), "pixelScattered");
  assert.equal(ghost.click(), "reforming");
  assert.equal(ghost.finishReform(), "recovered");
});

test("ghost dialogue waits, escalates, and is deterministic", () => {
  assert.equal(typeof createGhostDialogueSchedule, "function");
  const schedule = createGhostDialogueSchedule(12);
  assert.equal(schedule[0], 3000);
  assert.ok(schedule.slice(1).every((ms) => ms >= 7000 && ms <= 10000));
  assert.deepEqual(schedule, createGhostDialogueSchedule(12));
  assert.notDeepEqual(schedule, createGhostDialogueSchedule(13));
});
