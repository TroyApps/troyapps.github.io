function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

export function createPixelGhostState() {
  let state = "intact";

  return {
    impact() {
      if (state === "intact" || state === "recovered") state = "pixelScattered";
      return state;
    },
    advance() {
      return state;
    },
    click() {
      if (state === "pixelScattered") state = "reforming";
      return state;
    },
    finishReform() {
      if (state === "reforming") state = "recovered";
      return state;
    },
    current() {
      return state;
    },
  };
}

export function createGhostDialogueSchedule(seed, count = 8) {
  const random = seededRandom(seed);
  const schedule = [3_000];
  for (let index = 1; index < Math.max(1, count); index += 1) {
    schedule.push(7_000 + Math.floor(random() * 3_001));
  }
  return schedule;
}
