import assert from "node:assert/strict";
import test from "node:test";

const springModule = await import("../assets/js/troy/troy-tail-spring.js").catch(() => ({}));
const { createTailSpring } = springModule;

test("tail impulse bends within limits and settles", () => {
  assert.equal(typeof createTailSpring, "function");
  const spring = createTailSpring({ stiffness: 34, damping: 9, maxBend: 0.42 });
  spring.impulse(0.8, -0.4);
  const first = spring.step(1 / 60);
  assert.ok(first.bendX > 0 && Math.abs(first.bendX) <= 0.42);
  for (let index = 0; index < 360; index += 1) spring.step(1 / 60);
  const settled = spring.pose();
  assert.ok(Math.abs(settled.bendX) < 0.005);
  assert.ok(Math.abs(settled.bendZ) < 0.005);
});

test("tail-supported idle keeps Troy visibly above the floor with an irregular bounce", () => {
  const spring = createTailSpring({ stiffness: 34, damping: 9, maxBend: 0.42 });
  const lifts = [0, 0.7, 1.9, 3.2].map((time) => spring.idleLift(time));
  assert.ok(lifts.every((lift) => lift >= 0.055 && lift <= 0.105));
  assert.notEqual(lifts[1] - lifts[0], lifts[2] - lifts[1]);
});
