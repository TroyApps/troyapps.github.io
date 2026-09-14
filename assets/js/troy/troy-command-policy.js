export function commandInteractionMode({ busy, state }) {
  if (!busy) return "animated";
  if (state === "pixelScattered") return "navigate-only";
  return "blocked";
}
