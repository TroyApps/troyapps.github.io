import assert from "node:assert/strict";
import test from "node:test";

import { commandInteractionMode } from "../assets/js/troy/troy-command-policy.js";

test("commands open and navigate even while Troy is busy", () => {
  assert.equal(commandInteractionMode({ busy: true, state: "pixelScattered" }), "navigate-only");
  assert.equal(commandInteractionMode({ busy: true, state: "rocketFlight" }), "navigate-only");
  assert.equal(commandInteractionMode({ busy: true, state: "whipHit" }), "navigate-only");
  assert.equal(commandInteractionMode({ busy: false, state: "idle" }), "animated");
});

test("command mode is never blocked", () => {
  for (const state of ["idle", "poke", "whipHit", "bazookaFire", "rocketFlight", "pixelScattered"]) {
    for (const busy of [true, false]) {
      assert.notEqual(commandInteractionMode({ busy, state }), "blocked");
    }
  }
});
