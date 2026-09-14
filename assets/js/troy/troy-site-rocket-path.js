const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function smoothStep(value) {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export function createSiteRocketRoute({ viewport, stage, source: projectedSource }) {
  const width = Math.max(1, Number(viewport?.width) || 1);
  const height = Math.max(1, Number(viewport?.height) || 1);
  const stageWidth = Math.max(1, Number(stage?.width) || 1);
  const stageHeight = Math.max(1, Number(stage?.height) || 1);
  const stageLeft = Number(stage?.left) || 0;
  const stageTop = Number(stage?.top) || 0;
  const point = (x, y) => ({
    x: Math.round(clamp(x, 0, width)),
    y: Math.round(clamp(y, 0, height)),
  });
  const source = point(
    Number.isFinite(projectedSource?.x) ? projectedSource.x : stageLeft + stageWidth * 0.52,
    Number.isFinite(projectedSource?.y) ? projectedSource.y : stageTop + stageHeight * 0.17,
  );
  const impact = point(stageLeft + stageWidth * 0.5, stageTop + stageHeight * 0.24);
  const apexY = clamp(stageTop - Math.min(24, stageHeight * 0.05), 30, height * 0.42);

  return [
    source,
    point(source.x, Math.min(source.y - stageHeight * 0.12, stageTop + stageHeight * 0.1)),
    point(source.x, apexY),
    point(stageLeft + stageWidth * 0.56, apexY + Math.max(5, stageHeight * 0.01)),
    point(stageLeft + stageWidth * 0.53, stageTop + stageHeight * 0.14),
    impact,
  ];
}

export function siteRocketOrientationAt(flight, tangent) {
  const direction = Math.atan2(Number(tangent?.y) || 0, Number(tangent?.x) || 0);
  const wobble = (Number(flight?.wobble) || 0) * Math.PI / 180;
  return direction + wobble * 0.18;
}

export function smoothSiteRocketOrientation(current, desired, deltaSeconds) {
  if (!Number.isFinite(desired)) return Number.isFinite(current) ? current : 0;
  if (!Number.isFinite(current)) return desired;
  const delta = clamp(Number(deltaSeconds) || 0, 0, 0.1);
  const fullTurn = Math.PI * 2;
  let turn = ((desired - current + Math.PI) % fullTurn + fullTurn) % fullTurn - Math.PI;
  if (turn <= -Math.PI + 0.000001) turn = Math.PI;
  const maximumTurn = 2.8 * delta;
  return current + clamp(turn, -maximumTurn, maximumTurn);
}

export function siteRocketPointAt(route, progress) {
  if (!Array.isArray(route) || route.length < 2) {
    throw new TypeError("site rocket route needs at least two points");
  }
  const clamped = clamp(Number(progress) || 0, 0, 1);
  if (clamped <= 0) return { position: { ...route[0] }, tangent: unitVector(route[0], route[1]) };
  if (clamped >= 1) return { position: { ...route.at(-1) }, tangent: unitVector(route.at(-2), route.at(-1)) };

  const position = sampleRoute(route, clamped);
  const distance = 0.001;
  let next = sampleRoute(route, clamp(clamped + distance, 0, 1));
  let previous = position;
  if (Math.hypot(next.x - position.x, next.y - position.y) < 0.000001) {
    previous = sampleRoute(route, clamp(clamped - distance, 0, 1));
    next = position;
  }
  return {
    position,
    tangent: unitVector(previous, next),
  };
}

export function siteRocketFlightAt(elapsed, duration) {
  const total = Math.max(1, Number(duration) || 1);
  const time = clamp((Number(elapsed) || 0) / total, 0, 1);
  if (time >= 1) {
    return { phase: "impact", progress: 1, flameOpacity: 0, smokeOpacity: 0, wobble: 0 };
  }
  if (time <= 0.42) {
    return {
      phase: "thrust",
      progress: 0.52 * smoothStep(time / 0.42),
      flameOpacity: engineFlameOpacity(time),
      smokeOpacity: 0.12,
      wobble: 0,
    };
  }
  if (time <= 0.6) {
    const stall = (time - 0.42) / 0.18;
    return {
      phase: "stall",
      progress: 0.52 + 0.1 * smoothStep(stall),
      flameOpacity: engineFlameOpacity(time),
      smokeOpacity: 0.35 + Math.abs(Math.sin(stall * Math.PI * 2)) * 0.65,
      wobble: Math.sin(stall * Math.PI * 3) * 5,
    };
  }
  const fall = (time - 0.6) / 0.4;
  return {
    phase: "fall",
    progress: 0.62 + 0.38 * fall * fall,
    flameOpacity: 0,
    smokeOpacity: 0.72 * (1 - fall),
    wobble: Math.sin(fall * Math.PI * 7) * (1 - fall) * 8,
  };
}

function engineFlameOpacity(time) {
  if (time <= 0.36) return 1;
  if (time >= 0.48) return 0;
  const opacity = 1 - smoothStep((time - 0.36) / 0.12);
  return opacity < 0.01 ? 0 : opacity;
}

function sampleRoute(route, progress) {
  const scaled = progress * (route.length - 1);
  const segment = Math.min(route.length - 2, Math.floor(scaled));
  const amount = scaled - segment;
  const p1 = route[segment];
  const p2 = route[segment + 1];
  const p0 = route[Math.max(0, segment - 1)];
  const p3 = route[Math.min(route.length - 1, segment + 2)];
  return catmullRom(p0, p1, p2, p3, amount);
}

function catmullRom(p0, p1, p2, p3, amount) {
  const squared = amount * amount;
  const cubed = squared * amount;
  const sample = (axis) => 0.5 * (
    2 * p1[axis]
    + (-p0[axis] + p2[axis]) * amount
    + (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * squared
    + (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * cubed
  );
  return { x: sample("x"), y: sample("y") };
}

function unitVector(start, end) {
  const x = end.x - start.x;
  const y = end.y - start.y;
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}
