const STATES = new Set([
  "idle",
  "talk",
  "point",
  "threat",
  "annoyed",
  "poke",
  "bazookaAim",
  "bazookaFire",
  "rocketFlight",
  "pixelScattered",
  "reforming",
  "whipHit",
  "acknowledge",
  "recover",
]);
const NEXT = {
  poke: "recover",
  bazookaAim: "bazookaFire",
  bazookaFire: "rocketFlight",
  rocketFlight: "pixelScattered",
  pixelScattered: "pixelScattered",
  reforming: "idle",
  whipHit: "recover",
  recover: "idle",
  talk: "idle",
  point: "idle",
  threat: "idle",
  annoyed: "idle",
  acknowledge: "idle",
  idle: "idle",
};

export function createTroyState(initial = "idle") {
  let state = STATES.has(initial) ? initial : "idle";

  return {
    current() {
      return state;
    },
    enter(next) {
      state = STATES.has(next) ? next : "idle";
      return state;
    },
    finish() {
      state = NEXT[state] || "idle";
      return state;
    },
  };
}
