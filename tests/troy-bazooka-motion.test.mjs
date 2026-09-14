import assert from "node:assert/strict";
import test from "node:test";
import * as bazookaMotion from "../assets/js/troy/troy-bazooka-motion.js";

import {
  bazookaBarrelAxis,
  bazookaLaunchDirection,
  bazookaLiftAt,
  bazookaPointerLookForState,
  clampBazookaAim,
  createRocketRoute,
  rocketLookTargetForPhase,
  smoothRocketLook,
  rocketMotionAt,
} from "../assets/js/troy/troy-bazooka-motion.js";

test("bazooka barrel follows the visible model axis instead of its vertical marker axis", () => {
  assert.equal(typeof bazookaBarrelAxis, "function");
  assert.deepEqual(bazookaBarrelAxis(), { x: 1, y: 0, z: 0 });
});

test("bazooka aim is clamped and returns to neutral", () => {
  assert.deepEqual(clampBazookaAim(0, 0), { yaw: 0, pitch: 0 });
  assert.deepEqual(clampBazookaAim(9, -9), { yaw: 0.32, pitch: -0.2 });
  assert.deepEqual(clampBazookaAim(-9, 9), { yaw: -0.32, pitch: 0.2 });
});

test("rocket flight cannot inherit a downward pointer aim from the firing pose", () => {
  const downwardAim = { yaw: 0.24, pitch: 0.2 };

  assert.deepEqual(bazookaPointerLookForState("bazookaAim", downwardAim), downwardAim);
  assert.deepEqual(bazookaPointerLookForState("bazookaFire", downwardAim), { yaw: 0, pitch: 0 });
  assert.deepEqual(bazookaPointerLookForState("rocketFlight", downwardAim), { yaw: 0, pitch: 0 });
});

test("bazooka lifts before launch, holds through recoil, then lowers", () => {
  assert.equal(typeof bazookaLiftAt, "function");
  assert.equal(bazookaLiftAt(0), 0);
  assert.equal(bazookaLiftAt(190), 1);
  assert.equal(bazookaLiftAt(900), 1);
  assert.ok(bazookaLiftAt(1_200) > 0 && bazookaLiftAt(1_200) < 1);
  assert.equal(bazookaLiftAt(1_400), 0);
});

test("raised bazooka points above Troy's shoulder instead of across his face", () => {
  assert.equal(typeof bazookaLaunchDirection, "function");
  const direction = bazookaLaunchDirection();
  assert.ok(direction.x < -0.16 && direction.x > -0.3, "the muzzle must lean away from Troy's face toward his outside shoulder");
  assert.ok(direction.y > 0.96, "the barrel must point almost vertically upward");
  assert.ok(direction.z > 0.08 && direction.z < 0.2, "the muzzle must remain readable without aiming at the viewer");
  assert.ok(Math.abs(Math.hypot(direction.x, direction.y, direction.z) - 1) < 0.000001);
});

test("raised bazooka shifts outside Troy's head silhouette and returns to his hand", () => {
  assert.equal(typeof bazookaMotion.bazookaHeadClearanceOffset, "function");
  assert.equal(bazookaMotion.bazookaHeadClearanceOffset(0), 0);
  assert.ok(bazookaMotion.bazookaHeadClearanceOffset(190) <= -0.075);
  assert.equal(bazookaMotion.bazookaHeadClearanceOffset(1_400), 0);
});

test("bazooka flight never applies a head pitch", () => {
  for (const phase of ["thrust", "stall", "fall", "impact", null]) {
    assert.equal(rocketLookTargetForPhase(phase), 0);
    assert.equal(smoothRocketLook(0.24, phase, 1 / 60), 0);
  }
});

test("seeded rocket visits safe points and ends at Troy", () => {
  const bounds = { minX: -0.86, maxX: 0.86, minY: 0.18, maxY: 0.9 };
  const target = { x: 0, y: 0.68, z: 0.54 };
  const first = createRocketRoute(42, bounds, target);

  assert.deepEqual(first, createRocketRoute(42, bounds, target));
  assert.ok(first.length >= 6 && first.length <= 8);
  assert.deepEqual(first.at(-1), target);
  assert.ok(first.slice(1, -1).every((point) => point.x >= bounds.minX && point.x <= bounds.maxX));
  assert.ok(first.slice(1, -1).every((point) => point.y >= bounds.minY && point.y <= bounds.maxY));
  assert.notDeepEqual(first, createRocketRoute(43, bounds, target));
});

test("scenic rocket routes remain on screen long enough to feel like a chase", () => {
  assert.equal(typeof bazookaMotion.rocketFlightDuration, "function");
  assert.equal(bazookaMotion.rocketFlightDuration(6), 5_000);
  assert.equal(bazookaMotion.rocketFlightDuration(8), 5_600);
});

test("rocket motion follows the route with a finite unit tangent", () => {
  const route = [
    { x: 0, y: 0, z: 0 },
    { x: 0.4, y: 0.2, z: 0.1 },
    { x: -0.2, y: 0.7, z: 0.4 },
    { x: 0, y: 0.68, z: 0.54 },
  ];

  assert.deepEqual(rocketMotionAt(route, 0).position, route[0]);
  const middle = rocketMotionAt(route, 0.5);
  assert.equal(middle.finished, false);
  assert.ok(Object.values(middle.position).every(Number.isFinite));
  assert.ok(Math.abs(Math.hypot(middle.tangent.x, middle.tangent.y, middle.tangent.z) - 1) < 0.000001);
  const end = rocketMotionAt(route, 1);
  assert.deepEqual(end.position, route.at(-1));
  assert.equal(end.finished, true);
});
