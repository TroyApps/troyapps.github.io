function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function mix(start, end, amount) {
  return start + (end - start) * amount;
}

function easeOutCubic(value) {
  return 1 - (1 - clamp01(value)) ** 3;
}

function easeInCubic(value) {
  return clamp01(value) ** 3;
}

function mixPointSets(from, to, amount) {
  return from.map((point, index) => ({
    x: mix(point.x, to[index].x, amount),
    y: mix(point.y, to[index].y, amount),
    z: mix(point.z ?? 0.54, to[index].z ?? 0.54, amount),
  }));
}

export function guardMotionAt(elapsedSeconds) {
  const elapsed = Math.max(0, elapsedSeconds);
  const enter = easeOutCubic(elapsed / 0.16);
  const exit = 1 - easeInCubic((elapsed - 0.72) / 0.3);
  const pose = enter * exit;

  return {
    pose,
    elbow: {
      x: 0.03 * pose,
      y: 0.1 * pose,
      z: 0.18 * pose,
    },
    hand: {
      x: 0.13 * pose,
      y: 0.18 * pose,
      z: 0.5 * pose,
    },
    palmFacingCamera: pose > 0,
    finished: elapsed >= 1.02,
  };
}

export function slapMotionAt(elapsedSeconds, blocked = false) {
  const elapsed = Math.max(0, elapsedSeconds);
  const impactAt = blocked ? 0.3 : 0.24;
  const retreatAt = blocked ? 0.62 : 0.4;
  const duration = blocked ? 0.96 : 0.72;
  const targetX = blocked ? 0.4 : 0.06;
  const targetY = blocked ? 0.66 : 0.67;

  if (elapsed <= impactAt) {
    const amount = easeOutCubic(elapsed / impactAt);
    const wristTurn = easeInCubic(amount);
    return {
      x: mix(1.42, targetX, amount),
      y: mix(0.8, targetY, amount) - Math.sin(amount * Math.PI) * 0.09,
      z: mix(0.42, 0.56, amount) + Math.sin(amount * Math.PI) * 0.06,
      rotationX: mix(0.18, 0.02, wristTurn),
      rotationY: mix(-Math.PI, -0.04, wristTurn),
      rotationZ: mix(-1.18, -0.08, amount),
      scaleX: mix(0.9, 1.1, amount),
      scaleY: mix(1.04, 0.92, amount),
      scaleZ: mix(0.96, 0.7, amount),
      impact: elapsed >= impactAt - 0.07,
      finished: false,
    };
  }

  if (elapsed < retreatAt) {
    const recoil = Math.sin((elapsed - impactAt) * 72) * 0.014;
    return {
      x: targetX + recoil,
      y: targetY,
      z: 0.56,
      rotationX: 0.02,
      rotationY: -0.04,
      rotationZ: -0.08 + recoil * 2,
      scaleX: 1.06,
      scaleY: 0.95,
      scaleZ: 0.76,
      impact: elapsed <= impactAt + 0.11,
      finished: false,
    };
  }

  const amount = easeInCubic((elapsed - retreatAt) / (duration - retreatAt));
  return {
    x: mix(targetX, 1.48, amount),
    y: mix(targetY, 0.84, amount),
    z: mix(0.56, 0.42, amount),
    rotationX: mix(0.02, 0.12, amount),
    rotationY: mix(-0.04, -Math.PI, amount),
    rotationZ: mix(-0.08, -1.28, amount),
    scaleX: mix(1.06, 0.88, amount),
    scaleY: mix(0.95, 1.03, amount),
    scaleZ: mix(0.76, 0.95, amount),
    impact: elapsed <= retreatAt + 0.08,
    finished: elapsed >= duration,
  };
}

const WHIP_ENTER = [
  { x: 1.43, y: 0.56 }, { x: 1.45, y: 0.66 }, { x: 1.42, y: 0.78 },
  { x: 1.36, y: 0.91 }, { x: 1.29, y: 0.97 }, { x: 1.21, y: 0.91 },
  { x: 1.15, y: 0.82 },
];
const WHIP_WINDUP = [
  { x: 0.95, y: 0.5 }, { x: 0.82, y: 0.7 }, { x: 0.55, y: 1.0 },
  { x: 0.12, y: 1.08 }, { x: -0.38, y: 0.9 }, { x: -0.28, y: 0.62 },
  { x: 0.42, y: 0.58 },
];
const WHIP_STRIKE = [
  { x: 0.98, y: 0.55 }, { x: 0.82, y: 0.66 }, { x: 0.62, y: 0.84 },
  { x: 0.42, y: 0.88 }, { x: 0.24, y: 0.78 }, { x: 0.1, y: 0.69 },
  { x: 0.0, y: 0.63 },
];
const WHIP_CAUGHT = WHIP_STRIKE.map((point, index) => (
  index === WHIP_STRIKE.length - 1 ? { x: 0.36, y: 0.62 } : point
));
const WHIP_FOLLOW = [
  { x: 1.0, y: 0.55 }, { x: 0.82, y: 0.58 }, { x: 0.62, y: 0.66 },
  { x: 0.44, y: 0.58 }, { x: 0.29, y: 0.65 }, { x: 0.14, y: 0.7 },
  { x: 0.02, y: 0.67 },
];
const WHIP_EXIT = WHIP_ENTER.map((point) => ({ x: point.x + 0.16, y: point.y - 0.04 }));

export function whipMotionAt(elapsedSeconds, caught = false) {
  const elapsed = Math.max(0, elapsedSeconds);
  const impactAt = caught ? 0.4 : 0.34;
  const followAt = caught ? 0.62 : 0.49;
  const duration = caught ? 0.98 : 0.78;
  const strike = caught ? WHIP_CAUGHT : WHIP_STRIKE;
  let points;

  if (elapsed <= 0.16) {
    points = mixPointSets(WHIP_ENTER, WHIP_WINDUP, easeOutCubic(elapsed / 0.16));
  } else if (elapsed <= impactAt) {
    points = mixPointSets(WHIP_WINDUP, strike, easeOutCubic((elapsed - 0.16) / (impactAt - 0.16)));
  } else if (elapsed <= followAt) {
    points = mixPointSets(strike, WHIP_FOLLOW, easeOutCubic((elapsed - impactAt) / (followAt - impactAt)));
  } else {
    points = mixPointSets(WHIP_FOLLOW, WHIP_EXIT, easeInCubic((elapsed - followAt) / (duration - followAt)));
  }

  return {
    points,
    impact: !caught && elapsed >= impactAt - 0.04 && elapsed <= impactAt + 0.055,
    finished: elapsed >= duration,
  };
}
