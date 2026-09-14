const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

function mix(minimum, maximum, amount) {
  return minimum + (maximum - minimum) * amount;
}

function smoothStep(value) {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function catmullRom(p0, p1, p2, p3, amount) {
  const t2 = amount * amount;
  const t3 = t2 * amount;
  const sample = (axis) =>
    0.5 *
    (2 * p1[axis] +
      (-p0[axis] + p2[axis]) * amount +
      (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
      (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3);
  return { x: sample("x"), y: sample("y"), z: sample("z") };
}

function sampleRoute(route, progress) {
  if (progress <= 0) return { ...route[0] };
  if (progress >= 1) return { ...route.at(-1) };

  const scaled = progress * (route.length - 1);
  const segment = Math.min(route.length - 2, Math.floor(scaled));
  const amount = scaled - segment;
  const p1 = route[segment];
  const p2 = route[segment + 1];
  const p0 = route[Math.max(0, segment - 1)];
  const p3 = route[Math.min(route.length - 1, segment + 2)];
  return catmullRom(p0, p1, p2, p3, amount);
}

export function clampBazookaAim(pointerX, pointerY) {
  return {
    yaw: clamp(pointerX * 0.32, -0.32, 0.32),
    pitch: clamp(pointerY * 0.2, -0.2, 0.2),
  };
}

export function bazookaPointerLookForState(state, aim) {
  if (state !== "bazookaAim") return { yaw: 0, pitch: 0 };
  return {
    yaw: Number.isFinite(aim?.yaw) ? aim.yaw : 0,
    pitch: Number.isFinite(aim?.pitch) ? aim.pitch : 0,
  };
}

export function bazookaLiftAt(elapsed) {
  const time = Math.max(0, Number(elapsed) || 0);
  if (time < 190) return smoothStep(time / 190);
  if (time <= 900) return 1;
  if (time >= 1_400) return 0;
  return 1 - smoothStep((time - 900) / 500);
}

export function bazookaHeadClearanceOffset(elapsed) {
  const lift = bazookaLiftAt(elapsed);
  return lift === 0 ? 0 : -0.085 * lift;
}

export function rocketLookTargetForPhase() {
  return 0;
}

export function smoothRocketLook() {
  return 0;
}

export function bazookaLaunchDirection() {
  const direction = { x: -0.22, y: 0.985, z: 0.12 };
  const length = Math.hypot(direction.x, direction.y, direction.z);
  return {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length,
  };
}

export function bazookaBarrelAxis() {
  return { x: 1, y: 0, z: 0 };
}

export function createRocketRoute(seed, bounds, target) {
  const random = seededRandom(seed);
  const generatedPoints = 3 + Math.floor(random() * 3);
  const muzzle = { x: 0, y: clamp(0.58, bounds.minY, bounds.maxY), z: 0.5 };
  const initialAngle = mix(-Math.PI * 0.82, -Math.PI * 0.18, random());
  const initial = {
    x: clamp(Math.cos(initialAngle) * 0.34, bounds.minX, bounds.maxX),
    y: clamp(muzzle.y + Math.sin(initialAngle) * 0.28, bounds.minY, bounds.maxY),
    z: mix(0.4, 0.72, random()),
  };
  const route = [muzzle, initial];

  for (let index = 0; index < generatedPoints; index += 1) {
    const cornerBias = index % 2 === 0 ? random() ** 0.45 : 1 - random() ** 0.45;
    route.push({
      x: mix(bounds.minX, bounds.maxX, cornerBias),
      y: mix(bounds.minY, bounds.maxY, random()),
      z: mix(0.2, 0.88, random()),
    });
  }
  route.push({ ...target });
  return route;
}

export function rocketFlightDuration(routePointCount) {
  const points = clamp(Math.round(Number(routePointCount) || 6), 6, 8);
  return 3_200 + points * 300;
}

export function rocketMotionAt(route, progress) {
  if (!Array.isArray(route) || route.length < 2) {
    throw new TypeError("rocket route needs at least two points");
  }
  const clampedProgress = clamp(progress, 0, 1);
  const position = sampleRoute(route, clampedProgress);
  let next = sampleRoute(route, clamp(clampedProgress + 0.001, 0, 1));
  let delta = {
    x: next.x - position.x,
    y: next.y - position.y,
    z: next.z - position.z,
  };
  let length = Math.hypot(delta.x, delta.y, delta.z);
  if (length < 0.000001) {
    next = sampleRoute(route, clamp(clampedProgress - 0.001, 0, 1));
    delta = {
      x: position.x - next.x,
      y: position.y - next.y,
      z: position.z - next.z,
    };
    length = Math.hypot(delta.x, delta.y, delta.z) || 1;
  }
  return {
    position,
    tangent: {
      x: delta.x / length,
      y: delta.y / length,
      z: delta.z / length,
    },
    finished: progress >= 1,
  };
}
