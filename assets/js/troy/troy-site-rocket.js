import { createSiteRocketRoute, siteRocketFlightAt, siteRocketOrientationAt, siteRocketPointAt, smoothSiteRocketOrientation } from "./troy-site-rocket-path.js?v=20260914-flightphysics1";

const FLIGHT_DURATION_MS = 4_000;

function createLayer() {
  const layer = document.createElement("div");
  layer.className = "troy-site-rocket-layer";
  layer.setAttribute("aria-hidden", "true");
  const rocket = document.createElement("span");
  rocket.className = "troy-site-rocket";
  const body = document.createElement("span");
  body.className = "troy-site-rocket__body";
  const flame = document.createElement("span");
  flame.className = "troy-site-rocket__flame";
  rocket.append(body, flame);
  layer.append(rocket);

  const trails = Array.from({ length: 9 }, (_, index) => {
    const trail = document.createElement("span");
    trail.className = "troy-site-rocket__trail";
    trail.style.setProperty("--trail-index", String(index));
    layer.append(trail);
    return trail;
  });
  document.documentElement.append(layer);
  return { layer, rocket, trails };
}

export function createSiteRocket(stage) {
  let active = null;

  function cancel() {
    if (!active) return false;
    window.cancelAnimationFrame(active.frame);
    active.layer.remove();
    active.resolve(false);
    active = null;
    delete stage.dataset.troyRocketPhase;
    return true;
  }

  function fly() {
    cancel();
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return Promise.resolve(true);
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width < 1 || stageRect.height < 1) return Promise.resolve(false);
    const route = createSiteRocketRoute({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      stage: stageRect,
      source: {
        x: Number(stage.dataset.troyBazookaMuzzleX),
        y: Number(stage.dataset.troyBazookaMuzzleY),
      },
    });
    const { layer, rocket, trails } = createLayer();

    return new Promise((resolve) => {
      const startedAt = performance.now();
      active = { angle: null, frame: 0, lastTimestamp: startedAt, layer, resolve };
      const tick = (timestamp) => {
        if (!active) return;
        const flight = siteRocketFlightAt(timestamp - startedAt, FLIGHT_DURATION_MS);
        const motion = siteRocketPointAt(route, flight.progress);
        const desiredAngle = siteRocketOrientationAt(flight, motion.tangent);
        const deltaSeconds = Math.max(0, timestamp - active.lastTimestamp) / 1_000;
        active.angle = smoothSiteRocketOrientation(active.angle, desiredAngle, deltaSeconds);
        active.lastTimestamp = timestamp;
        layer.dataset.rocketPhase = flight.phase;
        stage.dataset.troyRocketPhase = flight.phase;
        rocket.style.transform = `translate3d(${motion.position.x}px, ${motion.position.y}px, 0) rotate(${active.angle}rad)`;
        rocket.querySelector(".troy-site-rocket__flame").style.opacity = String(flight.flameOpacity);
        trails.forEach((trail, index) => {
          const distance = 18 + index * 13;
          const sway = Math.sin(timestamp * 0.012 + index * 1.7) * (3 + index * 0.75);
          const x = motion.position.x - motion.tangent.x * distance - motion.tangent.y * sway;
          const y = motion.position.y - motion.tangent.y * distance + motion.tangent.x * sway;
          trail.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          trail.style.opacity = String(Math.max(0, flight.smokeOpacity - index * 0.065));
        });
        if (flight.phase === "impact") {
          layer.remove();
          active = null;
          delete stage.dataset.troyRocketPhase;
          resolve(true);
          return;
        }
        active.frame = window.requestAnimationFrame(tick);
      };
      active.frame = window.requestAnimationFrame(tick);
    });
  }

  return { cancel, fly };
}
