import assert from "node:assert/strict";
import test from "node:test";

import * as clipModule from "../assets/js/troy/troy-clips.js";
import { shouldUsePosterFallback } from "../assets/js/troy/troy-preferences.js";
import { createTroyState } from "../assets/js/troy/troy-state.js";

const { clipNameForState, isLoopingState, playbackRateForState, shouldFreezeCurrentClip } = clipModule;

test("every Troy UI state maps to the exact exported Blender clip", () => {
  assert.deepEqual(
    Object.fromEntries(
      ["idle", "talk", "point", "threat", "annoyed", "poke", "bazookaAim", "bazookaFire", "whipHit", "acknowledge", "recover"].map((state) => [
        state,
        clipNameForState(state),
      ]),
    ),
    {
      idle: "Idle",
      talk: "Talk",
      point: "Point",
      threat: "Point",
      annoyed: "Annoyed",
      poke: "Poke",
      bazookaAim: "BazookaAim",
      bazookaFire: "BazookaFire",
      whipHit: "WhipHit",
      acknowledge: "Acknowledge",
      recover: "Recover",
    },
  );
  assert.equal(clipNameForState("unknown"), "Idle");
  assert.equal(clipNameForState("rocketFlight"), null);
  assert.equal(clipNameForState("pixelScattered"), null);
  assert.equal(clipNameForState("reforming"), null);
});

test("Troy's idle and bazooka aim clips loop", () => {
  assert.equal(isLoopingState("idle"), true);
  assert.equal(isLoopingState("bazookaAim"), true);
  assert.equal(isLoopingState("talk"), false);
  assert.equal(isLoopingState("recover"), false);
});

test("bazooka launch and rocket flight freeze the firing pose so the looping aim clip cannot nod Troy's head", () => {
  assert.equal(typeof shouldFreezeCurrentClip, "function");
  assert.equal(shouldFreezeCurrentClip("bazookaFire"), true);
  assert.equal(shouldFreezeCurrentClip("rocketFlight"), true);
  assert.equal(shouldFreezeCurrentClip("bazookaAim"), false);
  assert.equal(shouldFreezeCurrentClip("pixelScattered"), false);
});

test("a frozen bazooka aim clip restarts before the next shot", () => {
  assert.equal(typeof clipModule.shouldRestartLoopingAction, "function");
  assert.equal(clipModule.shouldRestartLoopingAction("bazookaAim", 0), true);
  assert.equal(clipModule.shouldRestartLoopingAction("bazookaAim", 1), false);
  assert.equal(clipModule.shouldRestartLoopingAction("idle", 0), true);
  assert.equal(clipModule.shouldRestartLoopingAction("talk", 0), false);
});

test("every Troy clip plays at a positive intentional rate", () => {
  assert.equal(typeof playbackRateForState, "function");
  for (const state of ["idle", "talk", "point", "threat", "annoyed", "poke", "bazookaAim", "bazookaFire", "whipHit", "acknowledge", "recover"]) {
    assert.ok(playbackRateForState(state) > 0, `${state} must have a positive playback rate`);
  }
  assert.equal(playbackRateForState("unknown"), 1);
});

test("physical reactions and the bazooka sequence advance deliberately", () => {
  for (const reaction of ["poke", "whipHit"]) {
    const troy = createTroyState();
    assert.equal(troy.enter(reaction), reaction);
    assert.equal(troy.finish(), "recover");
    assert.equal(troy.finish(), "idle");
  }
  const troy = createTroyState();
  assert.equal(troy.enter("acknowledge"), "acknowledge");
  assert.equal(troy.finish(), "idle");
  assert.equal(troy.enter("threat"), "threat");
  assert.equal(troy.finish(), "idle");
  assert.equal(troy.enter("bazookaAim"), "bazookaAim");
  assert.equal(troy.finish(), "bazookaFire");
  assert.equal(troy.finish(), "rocketFlight");
  assert.equal(troy.finish(), "pixelScattered");
  assert.equal(troy.finish(), "pixelScattered");
  assert.equal(troy.enter("reforming"), "reforming");
  assert.equal(troy.finish(), "idle");
});

test("reduced-motion and data-saver preferences select the poster fallback", () => {
  assert.equal(shouldUsePosterFallback({ reducedMotion: true, saveData: false }), true);
  assert.equal(shouldUsePosterFallback({ reducedMotion: false, saveData: true }), true);
  assert.equal(shouldUsePosterFallback({ reducedMotion: false, saveData: false }), false);
});
