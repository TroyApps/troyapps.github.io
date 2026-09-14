export const BAZOOKA_EFFECTS = Object.freeze({
  aimClip: "BazookaAim",
  fireClip: "BazookaFire",
  impactTargetY: 0.68,
  reducedMotionAutoRestore: true,
});

export function selectNativeGuardHand(nodeNames) {
  const available = new Set(nodeNames);
  if (available.has("L_Hand")) return "L_Hand";
  if (available.has("R_Hand")) return "R_Hand";
  return null;
}

export function troyParticleBudget(isMobile) {
  return isMobile ? 560 : 900;
}

export function cameraDistanceForBounds({ width, height, aspect, verticalFovRadians }) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const tangent = Math.tan(verticalFovRadians / 2);
  const distanceForHeight = height / (2 * tangent);
  const distanceForWidth = width / (2 * tangent * safeAspect);
  return Math.max(distanceForHeight, distanceForWidth) * 1.36;
}

export function cameraTargetHeight(modelHeight) {
  return modelHeight * 0.54;
}
