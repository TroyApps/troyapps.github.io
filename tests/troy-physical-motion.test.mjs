import assert from "node:assert/strict";
import test from "node:test";

const motionModule = await import("../assets/js/troy/troy-physical-motion.js").catch(() => ({}));
const { guardMotionAt, slapMotionAt, whipMotionAt } = motionModule;

test("guard pose lifts Troy's hand and reaches toward the camera", () => {
  assert.equal(typeof guardMotionAt, "function");

  const resting = guardMotionAt(0);
  const blocking = guardMotionAt(0.32);
  const recovered = guardMotionAt(1.02);

  assert.equal(resting.pose, 0);
  assert.ok(blocking.pose > 0.95);
  assert.ok(blocking.elbow.y > 0.08);
  assert.ok(blocking.hand.y > 0.08);
  assert.ok(blocking.hand.x > blocking.elbow.x + 0.05);
  assert.ok(blocking.hand.y > blocking.elbow.y + 0.05);
  assert.ok(blocking.hand.z > blocking.elbow.z + 0.18);
  assert.equal(blocking.palmFacingCamera, true);
  assert.equal(recovered.finished, true);
});

test("slap hand enters from the right, reaches Troy's cheek, then exits", () => {
  assert.equal(typeof slapMotionAt, "function");

  const entering = slapMotionAt(0, false);
  const impact = slapMotionAt(0.24, false);
  const exiting = slapMotionAt(0.72, false);

  assert.ok(entering.x > 1.2);
  assert.ok(Math.abs(entering.rotationY) > 2.4);
  assert.ok(impact.x < 0.12);
  assert.ok(impact.y > 0.64 && impact.y < 0.7);
  assert.ok(Math.abs(impact.rotationY) < 0.15);
  assert.ok(impact.scaleX > 1);
  assert.ok(impact.scaleY < 1);
  assert.ok(impact.scaleZ < 0.8);
  assert.equal(slapMotionAt(0.18, false).impact, true);
  assert.equal(slapMotionAt(0.32, false).impact, true);
  assert.equal(slapMotionAt(0.45, false).impact, true);
  assert.equal(slapMotionAt(0.52, false).impact, false);
  assert.ok(exiting.x > 1.2);
  assert.equal(exiting.finished, true);
});

test("whip lash changes shape and its tip cracks against Troy's head", () => {
  assert.equal(typeof whipMotionAt, "function");

  const entering = whipMotionAt(0, false);
  const windup = whipMotionAt(0.12, false);
  const cracking = whipMotionAt(0.34, false);
  const exiting = whipMotionAt(0.78, false);
  const enteringTip = entering.points.at(-1);
  const crackingTip = cracking.points.at(-1);

  assert.ok(enteringTip.x > 1.1);
  const windupXs = windup.points.map((point) => point.x);
  assert.ok(Math.max(...windupXs) < 1.2);
  assert.ok(Math.min(...windupXs) < -0.25);
  assert.ok(Math.max(...windupXs) - Math.min(...windupXs) > 1.1);
  assert.ok(crackingTip.x < 0.05);
  assert.ok(crackingTip.y > 0.58 && crackingTip.y < 0.68);
  assert.notDeepEqual(cracking.points, entering.points);
  assert.equal(cracking.impact, true);
  assert.equal(exiting.finished, true);
});
