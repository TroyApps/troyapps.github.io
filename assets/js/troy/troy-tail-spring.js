const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

export function createTailSpring({ stiffness = 34, damping = 9, maxBend = 0.42 } = {}) {
  const safeStiffness = Math.max(0.01, Number(stiffness) || 34);
  const safeDamping = Math.max(0, Number(damping) || 9);
  const safeMaxBend = Math.max(0.01, Number(maxBend) || 0.42);
  let bendX = 0;
  let bendZ = 0;
  let compression = 0;
  let velocityX = 0;
  let velocityZ = 0;
  let compressionVelocity = 0;

  function integrate(position, velocity, delta, limit) {
    const nextVelocity = velocity + (-safeStiffness * position - safeDamping * velocity) * delta;
    return {
      position: clamp(position + nextVelocity * delta, -limit, limit),
      velocity: nextVelocity,
    };
  }

  function pose() {
    return {
      bendX,
      bendZ,
      compression,
      bodyLift: Math.max(0, compression) * 0.045,
    };
  }

  return {
    impulse(x = 0, z = 0) {
      velocityX += Number(x) || 0;
      velocityZ += Number(z) || 0;
      compressionVelocity += Math.hypot(Number(x) || 0, Number(z) || 0) * 0.11;
      return pose();
    },
    step(deltaSeconds = 0) {
      const delta = clamp(Number(deltaSeconds) || 0, 0, 1 / 20);
      const nextX = integrate(bendX, velocityX, delta, safeMaxBend);
      bendX = nextX.position;
      velocityX = nextX.velocity;
      const nextZ = integrate(bendZ, velocityZ, delta, safeMaxBend);
      bendZ = nextZ.position;
      velocityZ = nextZ.velocity;
      const nextCompression = integrate(compression, compressionVelocity, delta, 0.16);
      compression = nextCompression.position;
      compressionVelocity = nextCompression.velocity;
      return pose();
    },
    pose,
    idleLift(timeSeconds = 0) {
      const time = Number(timeSeconds) || 0;
      return clamp(
        0.08 + Math.sin(time * 2.13) * 0.015 + Math.sin(time * 3.71 + 0.8) * 0.01,
        0.055,
        0.105,
      );
    },
  };
}
