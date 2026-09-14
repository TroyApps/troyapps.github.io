const CLIPS = Object.freeze({
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
});

const PLAYBACK_RATES = Object.freeze({
  idle: 1,
  talk: 1.45,
  point: 1.35,
  threat: 1.05,
  annoyed: 1.1,
  poke: 1.5,
  bazookaAim: 1,
  bazookaFire: 1.15,
  whipHit: 1.2,
  acknowledge: 1.45,
  recover: 1.2,
});

export function clipNameForState(state) {
  if (["rocketFlight", "pixelScattered", "reforming"].includes(state)) return null;
  return CLIPS[state] || CLIPS.idle;
}

export function isLoopingState(state) {
  return state === "idle" || state === "bazookaAim";
}

export function shouldFreezeCurrentClip(state) {
  return state === "bazookaFire" || state === "rocketFlight";
}

export function shouldRestartLoopingAction(state, effectiveTimeScale) {
  return isLoopingState(state) && !(Number.isFinite(effectiveTimeScale) && effectiveTimeScale > 0);
}

export function playbackRateForState(state) {
  return PLAYBACK_RATES[state] || 1;
}
