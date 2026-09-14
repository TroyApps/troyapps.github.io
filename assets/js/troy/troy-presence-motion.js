const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function smoothStep(value) {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

export function pointerLookFromViewport(clientX, clientY, width, height) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  return pointerLookFromAnchor(clientX, clientY, safeWidth * 0.5, safeHeight * 0.5, safeWidth, safeHeight);
}

export function pointerLookFromAnchor(clientX, clientY, anchorX, anchorY, width, height) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const horizontal = ((Number(clientX) || 0) - (Number(anchorX) || 0)) / (safeWidth * 0.5);
  const vertical = ((Number(clientY) || 0) - (Number(anchorY) || 0)) / (safeHeight * 0.5);
  const pitchStrength = vertical > 0 ? 0.22 : 0.18;
  const pitch = clamp(-vertical * pitchStrength, -0.24, 0.18);
  return {
    yaw: clamp(horizontal * 0.3, -0.3, 0.3),
    pitch: Object.is(pitch, -0) ? 0 : pitch,
  };
}

export function pointerFocusFromCanvasRect(rect) {
  const left = Number(rect?.left) || 0;
  const top = Number(rect?.top) || 0;
  const width = Math.max(1, Number(rect?.width) || 1);
  const height = Math.max(1, Number(rect?.height) || 1);
  return {
    x: left + width * 0.5,
    y: top + height * 0.28,
  };
}

export function canTrackPointer(state) {
  return pointerInputModeForState(state) === "track";
}

export function pointerInputModeForState(state) {
  if (state === "idle" || state === "threat") return "track";
  if (state === "bazookaAim") return "aim";
  return "locked";
}

export function shouldLockPointerPose(state) {
  return ["bazookaFire", "rocketFlight", "pixelScattered", "reforming"].includes(state);
}

export function chooseIdlePresence(randomValue) {
  return clamp(Number(randomValue) || 0, 0, 1) < 0.32 ? "threat" : "annoyed";
}

export function threatGestureAt(elapsed) {
  const time = Math.max(0, Number(elapsed) || 0);
  if (time >= 2.2) return { pose: 0, wag: 0, finished: true };
  const enter = smoothStep(time / 0.32);
  const exit = time <= 1.78 ? 1 : 1 - smoothStep((time - 1.78) / 0.42);
  const pose = enter * exit;
  return {
    pose,
    wag: Math.sin(time * 10) * 0.18 * pose,
    finished: false,
  };
}
