import assert from "node:assert/strict";
import test from "node:test";

const siteRocket = await import("../assets/js/troy/troy-site-rocket-path.js").catch(() => ({}));

test("site rocket rises above Troy, stalls, then ends at his head", () => {
  assert.equal(typeof siteRocket.createSiteRocketRoute, "function");

  const route = siteRocket.createSiteRocketRoute({
    viewport: { width: 1_200, height: 720 },
    stage: { left: 520, top: 108, width: 360, height: 600 },
  });

  assert.deepEqual(route[0], { x: 707, y: 210 });
  assert.deepEqual(route.at(-1), { x: 700, y: 252 });
  assert.ok(route[2].y < 108, "the stall point must leave visible air above Troy's head");
  assert.ok(route.slice(1, -1).some((point) => point.y < 180), "the rocket must climb above Troy's head");
  assert.ok(route.every((point) => point.x >= 0 && point.x <= 1_200));
  assert.ok(route.every((point) => point.y >= 0 && point.y <= 720));
  assert.equal(route[1].x, route[0].x, "the rocket must leave the tube vertically");
  assert.equal(route[2].x, route[0].x, "the powered climb must stay vertical");
});

test("site rocket accepts the actual projected bazooka muzzle as its launch point", () => {
  const route = siteRocket.createSiteRocketRoute({
    viewport: { width: 1_200, height: 720 },
    stage: { left: 520, top: 108, width: 360, height: 600 },
    source: { x: 744, y: 196 },
  });

  assert.deepEqual(route[0], { x: 744, y: 196 });
  assert.equal(route[1].x, 744);
});

test("site rocket route sampling keeps a finite forward direction", () => {
  assert.equal(typeof siteRocket.siteRocketPointAt, "function");
  const route = [
    { x: 20, y: 200 },
    { x: 500, y: 80 },
    { x: 1_300, y: 180 },
    { x: -120, y: 580 },
    { x: 700, y: 396 },
  ];

  assert.deepEqual(siteRocket.siteRocketPointAt(route, 0).position, route[0]);
  const middle = siteRocket.siteRocketPointAt(route, 0.5);
  assert.ok(Number.isFinite(middle.position.x));
  assert.ok(Number.isFinite(middle.position.y));
  assert.ok(Math.abs(Math.hypot(middle.tangent.x, middle.tangent.y) - 1) < 0.000001);
  assert.deepEqual(siteRocket.siteRocketPointAt(route, 1).position, route.at(-1));
});

test("site rocket turns through a continuous arc at route joins", () => {
  assert.equal(typeof siteRocket.siteRocketPointAt, "function");
  const route = [
    { x: 0, y: 100 },
    { x: 220, y: 0 },
    { x: 440, y: 150 },
    { x: 650, y: 0 },
    { x: 860, y: 120 },
  ];

  const beforeJoin = siteRocket.siteRocketPointAt(route, 0.2495);
  const afterJoin = siteRocket.siteRocketPointAt(route, 0.2505);
  const directionAgreement = beforeJoin.tangent.x * afterJoin.tangent.x
    + beforeJoin.tangent.y * afterJoin.tangent.y;

  assert.ok(directionAgreement > 0.98, "a turn must not snap to the next straight segment");
});

test("site rocket cuts thrust, coughs smoke, and accelerates into the fall", () => {
  assert.equal(typeof siteRocket.siteRocketFlightAt, "function");

  const launch = siteRocket.siteRocketFlightAt(0, 4_000);
  const climb = siteRocket.siteRocketFlightAt(1_200, 4_000);
  const engineCut = siteRocket.siteRocketFlightAt(1_681, 4_000);
  const flameFade = siteRocket.siteRocketFlightAt(1_800, 4_000);
  const flameOut = siteRocket.siteRocketFlightAt(1_920, 4_000);
  const stall = siteRocket.siteRocketFlightAt(1_900, 4_000);
  const fall = siteRocket.siteRocketFlightAt(3_000, 4_000);
  const impact = siteRocket.siteRocketFlightAt(4_000, 4_000);

  assert.deepEqual(launch, {
    phase: "thrust",
    progress: 0,
    flameOpacity: 1,
    smokeOpacity: 0.12,
    wobble: 0,
  });
  assert.equal(climb.phase, "thrust");
  assert.equal(climb.flameOpacity, 1);
  assert.equal(engineCut.phase, "stall");
  assert.ok(engineCut.flameOpacity > 0 && engineCut.flameOpacity < 1, "engine flame must begin fading instead of disappearing on the phase boundary");
  assert.ok(flameFade.flameOpacity > 0 && flameFade.flameOpacity < engineCut.flameOpacity, "engine flame must decay continuously after cutoff");
  assert.equal(flameOut.flameOpacity, 0);
  assert.equal(stall.phase, "stall");
  assert.equal(stall.flameOpacity, 0);
  assert.ok(stall.smokeOpacity > 0.35, "the dead engine must cough visible smoke");
  assert.equal(fall.phase, "fall");
  assert.equal(fall.flameOpacity, 0);
  assert.ok(fall.progress > stall.progress, "gravity must advance the rocket toward Troy");
  assert.notEqual(fall.wobble, 0);
  assert.deepEqual(impact, {
    phase: "impact",
    progress: 1,
    flameOpacity: 0,
    smokeOpacity: 0,
    wobble: 0,
  });
});

test("dead rocket follows its aerodynamic flight tangent", () => {
  assert.equal(typeof siteRocket.siteRocketOrientationAt, "function");
  const downward = { x: 0.08, y: 0.996 };
  const fall = siteRocket.siteRocketFlightAt(3_000, 4_000);
  const fallAngle = siteRocket.siteRocketOrientationAt(fall, downward);
  const tangentAngle = Math.atan2(downward.y, downward.x);

  assert.ok(Math.abs(fallAngle - tangentAngle) < 0.2, "the rocket nose must align with its actual velocity instead of a fixed phase angle");
});

test("rocket orientation has a bounded turn rate through stall and fall", () => {
  assert.equal(typeof siteRocket.smoothSiteRocketOrientation, "function");
  const previous = -Math.PI / 2;
  const desired = Math.PI / 2;
  const next = siteRocket.smoothSiteRocketOrientation(previous, desired, 1 / 60);

  assert.ok(next > previous, "the rocket must begin turning toward the new velocity");
  assert.ok(next - previous < 0.08, "one frame must not flip the rocket to its new orientation");
});
