export const TROY_BAZOOKA_EXPLOSION_MS = 720;

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function smoothStep(value) {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export function bazookaImpactAt(inputElapsed) {
  const elapsed = Number.isFinite(inputElapsed) ? Math.max(0, inputElapsed) : 0;
  const phase = elapsed < 140
    ? "contact"
    : elapsed < TROY_BAZOOKA_EXPLOSION_MS
      ? "flinch"
      : "explode";

  return {
    elapsed,
    phase,
    sparkIntensity: 1 - smoothStep(elapsed / 320) * 0.72,
    recoil: smoothStep(elapsed / 360),
    explode: elapsed >= TROY_BAZOOKA_EXPLOSION_MS,
    hideModel: elapsed >= TROY_BAZOOKA_EXPLOSION_MS,
  };
}
