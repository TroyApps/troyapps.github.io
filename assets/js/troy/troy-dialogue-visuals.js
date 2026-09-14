export const TROY_DIALOGUE_ASSEMBLE_MS = 650;
export const TROY_DIALOGUE_VISIBLE_MS = 5_000;
export const TROY_DIALOGUE_DISPERSE_MS = 650;

export function dialogueTimingFor(key) {
  return {
    assembleMs: key === "bazookaImpact" ? 240 : TROY_DIALOGUE_ASSEMBLE_MS,
    visibleMs: TROY_DIALOGUE_VISIBLE_MS,
    disperseMs: TROY_DIALOGUE_DISPERSE_MS,
  };
}

export function createDialogueTimeline() {
  let shownAt = null;

  return {
    show(now = performance.now()) {
      shownAt = now;
      return "assembling";
    },
    phase(now = performance.now()) {
      if (shownAt === null) return "hidden";
      const elapsed = Math.max(0, now - shownAt);
      if (elapsed < TROY_DIALOGUE_ASSEMBLE_MS) return "assembling";
      if (elapsed < TROY_DIALOGUE_ASSEMBLE_MS + TROY_DIALOGUE_VISIBLE_MS) return "visible";
      if (elapsed < TROY_DIALOGUE_ASSEMBLE_MS + TROY_DIALOGUE_VISIBLE_MS + TROY_DIALOGUE_DISPERSE_MS) {
        return "dispersing";
      }
      return "hidden";
    },
  };
}

export function createPixelOrbit(count = 22) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const angle = (index * 137.508 + 19) % 360;
    const radians = angle * Math.PI / 180;
    const radiusX = 24 + ((index * 8) % 21);
    const radiusY = 16 + ((index * 11) % 19);

    return {
      angle,
      radiusX,
      radiusY,
      startX: Math.cos(radians) * radiusX,
      startY: Math.sin(radians) * radiusY,
      gatherX: 7 + ((index * 13) % 34),
      gatherY: 12 + ((index * 17) % 18),
      scatterX: -36 + ((index * 19) % 73),
      scatterY: -28 + ((index * 23) % 57),
      duration: 6.4 + ((index * 0.71) % 5.2),
      delay: -((index * 0.83) % 8.5),
      size: 2 + ((index * 3) % 4),
      color: index % 2 === 0 ? "red" : "black",
      reverse: index % 3 === 0,
    };
  });
}

export function createDialogueFragments(count = 16) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const angle = (index * 137.508 + 31) % 360;
    const radians = angle * Math.PI / 180;
    const distanceX = 18 + ((index * 7) % 31);
    const distanceY = 12 + ((index * 11) % 25);

    return {
      startX: Math.cos(radians) >= 0 ? distanceX : -distanceX,
      startY: Math.sin(radians) >= 0 ? distanceY : -distanceY,
      gatherX: 8 + ((index * 19) % 84),
      gatherY: 12 + ((index * 23) % 72),
      scatterX: -54 + ((index * 29) % 109),
      scatterY: -42 + ((index * 31) % 85),
      delay: (index % 12) * 24,
      size: 2 + ((index * 3) % 5),
      color: index % 2 === 0 ? "red" : "black",
    };
  });
}
