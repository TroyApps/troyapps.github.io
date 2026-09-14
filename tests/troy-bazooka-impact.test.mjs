import assert from "node:assert/strict";
import test from "node:test";

const impactModule = await import("../assets/js/troy/troy-bazooka-impact.js").catch(() => ({}));

test("bazooka impact gives Troy time to flinch before the explosion", () => {
  assert.equal(typeof impactModule.bazookaImpactAt, "function");

  const contact = impactModule.bazookaImpactAt(0);
  const flinch = impactModule.bazookaImpactAt(320);
  const lastWarningFrame = impactModule.bazookaImpactAt(719);
  const explosion = impactModule.bazookaImpactAt(720);

  assert.equal(contact.phase, "contact");
  assert.equal(contact.explode, false);
  assert.ok(contact.sparkIntensity > 0.9);
  assert.equal(flinch.phase, "flinch");
  assert.ok(flinch.recoil > 0.8);
  assert.equal(lastWarningFrame.explode, false);
  assert.equal(lastWarningFrame.hideModel, false);
  assert.equal(explosion.phase, "explode");
  assert.equal(explosion.explode, true);
  assert.equal(explosion.hideModel, true);
});

test("bazooka impact timeline clamps malformed and completed input", () => {
  assert.equal(impactModule.bazookaImpactAt(-50).elapsed, 0);
  assert.equal(impactModule.bazookaImpactAt(Number.NaN).elapsed, 0);
  assert.equal(impactModule.bazookaImpactAt(9_000).recoil, 1);
});
