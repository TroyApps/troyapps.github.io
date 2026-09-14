export const TROY_PROP_MODELS = Object.freeze({
  bazooka: "/assets/models/troy/bazooka.glb?v=20260907-bazooka1",
  rocket: "/assets/models/troy/rocket.glb?v=20260907-bazooka1",
  whip: "/assets/models/troy/whip.glb?v=20260906-prop2",
});

export function fitPropToMascotHeight(propHeight, mascotHeight, heightRatio) {
  return (mascotHeight * heightRatio) / Math.max(propHeight, 0.001);
}
