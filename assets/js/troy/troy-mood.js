export const TROY_IRRITATION_RESET_MS = 12_000;

export function createTroyMood({ resetAfterMs = TROY_IRRITATION_RESET_MS } = {}) {
  const decayMs = Number.isFinite(resetAfterMs) && resetAfterMs > 0
    ? resetAfterMs
    : TROY_IRRITATION_RESET_MS;
  const irritations = new Map();

  function read(name) {
    return irritations.get(name) || {
      irritation: 0,
      lastPhysicalAt: Number.NEGATIVE_INFINITY,
    };
  }

  function refresh(name, now) {
    const state = read(name);
    if (Number.isFinite(now) && now - state.lastPhysicalAt >= decayMs) state.irritation = 0;
    irritations.set(name, state);
    return state;
  }

  return {
    registerPoke(now) {
      return this.registerPhysical("poke", now);
    },
    registerPhysical(name, now) {
      const state = refresh(name, now);
      state.irritation = Math.min(3, state.irritation + 1);
      if (Number.isFinite(now)) state.lastPhysicalAt = now;
      return state.irritation === 1 ? "surprised" : state.irritation === 2 ? "annoyed" : "defensive";
    },
    level(now, name = "poke") {
      return refresh(name, now).irritation;
    },
    calm() {
      irritations.clear();
      return 0;
    },
  };
}
