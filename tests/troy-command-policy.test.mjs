import assert from "node:assert/strict";
import test from "node:test";

import { commandInteractionMode } from "../assets/js/troy/troy-command-policy.js";

test("commands remain usable while Troy waits to be reassembled", () => {
  assert.equal(commandInteractionMode({ busy: true, state: "pixelScattered" }), "navigate-only");
  assert.equal(commandInteractionMode({ busy: true, state: "rocketFlight" }), "blocked");
  assert.equal(commandInteractionMode({ busy: false, state: "idle" }), "animated");
});
