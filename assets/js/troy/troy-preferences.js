export function shouldUsePosterFallback({ reducedMotion = false, saveData = false } = {}) {
  return reducedMotion === true || saveData === true;
}
