import assert from "node:assert/strict";
import test from "node:test";

const rendererContract = await import("../assets/js/troy/troy-renderer-contract.js").catch(() => ({}));

test("guard reaction selects a native Troy hand bone", () => {
  assert.equal(typeof rendererContract.selectNativeGuardHand, "function");
  assert.equal(rendererContract.selectNativeGuardHand(["L_Hand", "R_Hand"]), "L_Hand");
  assert.equal(rendererContract.selectNativeGuardHand(["R_Hand"]), "R_Hand");
  assert.equal(rendererContract.selectNativeGuardHand([]), null);
});

test("bazooka renderer exposes the approved visual contract", () => {
  assert.deepEqual(rendererContract.BAZOOKA_EFFECTS, {
    aimClip: "BazookaAim",
    fireClip: "BazookaFire",
    impactTargetY: 0.68,
    reducedMotionAutoRestore: true,
  });
});

test("pixel budget is capped deliberately for desktop and mobile", () => {
  assert.equal(rendererContract.troyParticleBudget(false), 900);
  assert.equal(rendererContract.troyParticleBudget(true), 560);
});

test("compact hero framing leaves animation-safe room above Troy's horns", () => {
  const distance = rendererContract.cameraDistanceForBounds({
    width: 1,
    height: 2,
    aspect: 1.2,
    verticalFovRadians: 0.4886921906,
  });
  assert.ok(Math.abs(distance - 5.455) < 0.01, `unexpected camera distance ${distance}`);
  assert.equal(rendererContract.cameraTargetHeight(2), 1.08);
});
