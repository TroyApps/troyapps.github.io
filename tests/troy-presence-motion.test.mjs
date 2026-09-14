import assert from "node:assert/strict";
import test from "node:test";

import {
  canTrackPointer,
  chooseIdlePresence,
  pointerFocusFromCanvasRect,
  pointerInputModeForState,
  pointerLookFromAnchor,
  pointerLookFromViewport,
  shouldLockPointerPose,
  threatGestureAt,
} from "../assets/js/troy/troy-presence-motion.js";

test("pointer look is centered, clamped, and disabled during physical actions", () => {
  assert.deepEqual(pointerLookFromViewport(500, 400, 1_000, 800), { yaw: 0, pitch: 0 });
  assert.deepEqual(pointerLookFromViewport(5_000, -4_000, 1_000, 800), { yaw: 0.3, pitch: 0.18 });
  assert.deepEqual(pointerLookFromViewport(-4_000, 5_000, 1_000, 800), { yaw: -0.3, pitch: -0.24 });
  assert.equal(canTrackPointer("idle"), true);
  assert.equal(canTrackPointer("threat"), true);
  for (const state of ["poke", "whipHit", "bazookaAim", "bazookaFire", "rocketFlight", "pixelScattered", "reforming"]) {
    assert.equal(canTrackPointer(state), false, `${state} must own Troy's pose`);
  }
});

test("pointer look uses Troy's head-centered visual focus", () => {
  assert.deepEqual(pointerLookFromAnchor(740, 190, 740, 190, 1_000, 800), { yaw: 0, pitch: 0 });
  const belowHead = pointerLookFromAnchor(740, 350, 740, 190, 1_000, 800);
  assert.equal(belowHead.yaw, 0);
  assert.ok(belowHead.pitch < 0, "a cursor below Troy's head must make him look down even above viewport center");
  assert.ok(pointerLookFromAnchor(740, 40, 740, 190, 1_000, 800).pitch > 0);
  assert.ok(pointerLookFromAnchor(940, 190, 740, 190, 1_000, 800).yaw > 0);
  assert.deepEqual(pointerLookFromAnchor(9_000, -9_000, 740, 190, 1_000, 800), { yaw: 0.3, pitch: 0.18 });
});

test("downward pointer tracking bends one step farther without changing upward tracking", () => {
  const below = pointerLookFromAnchor(740, 350, 740, 190, 1_000, 800);
  const above = pointerLookFromAnchor(740, -9_000, 740, 190, 1_000, 800);
  assert.equal(Number(below.pitch.toFixed(3)), -0.088);
  assert.equal(above.pitch, 0.18);
});

test("pointer focus stays fixed inside Troy's canvas instead of following the rotating head bone", () => {
  assert.deepEqual(
    pointerFocusFromCanvasRect({ left: 562, top: 83, width: 400, height: 358 }),
    { x: 762, y: 183.24 },
  );
});

test("bazooka firing takes exclusive ownership of Troy's pose from the pointer", () => {
  assert.equal(pointerInputModeForState("idle"), "track");
  assert.equal(pointerInputModeForState("bazookaAim"), "aim");
  for (const state of ["bazookaFire", "rocketFlight", "pixelScattered", "reforming"]) {
    assert.equal(pointerInputModeForState(state), "locked");
    assert.equal(shouldLockPointerPose(state), true, `${state} must clear residual pointer motion`);
  }
  assert.equal(shouldLockPointerPose("bazookaAim"), false);
});

test("idle presence occasionally selects the threatening finger gesture", () => {
  assert.equal(chooseIdlePresence(0.1), "threat");
  assert.equal(chooseIdlePresence(0.8), "annoyed");
});

test("threat gesture raises, wags, and lowers Troy's native hand", () => {
  assert.deepEqual(threatGestureAt(0), { pose: 0, wag: 0, finished: false });
  const middle = threatGestureAt(1.1);
  assert.ok(middle.pose > 0.95);
  assert.ok(Math.abs(middle.wag) > 0.05);
  assert.equal(middle.finished, false);
  assert.deepEqual(threatGestureAt(2.2), { pose: 0, wag: 0, finished: true });
});
