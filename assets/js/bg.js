/* TroyApps — morphing geometric pixel field */
import {
  buildGeometryTargets,
  chooseNextPattern,
  morphPoint,
  particleBudget,
} from "./pixel-geometry.js?v=20260910-pixel1";

const canvas = document.getElementById("bg-signal");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let currentPattern = "diamond";
  let mode = "shape";
  let transitionStarted = performance.now();
  let transitionDuration = reducedMotion ? 1 : 2400;
  let nextTransition = transitionStarted + (reducedMotion ? Number.POSITIVE_INFINITY : 5200);
  let shapeStrength = reducedMotion ? 1 : 0;
  let burstUntil = 0;
  let animationFrame = 0;

  function randomPoint(margin = 0) {
    return {
      x: margin + Math.random() * Math.max(1, width - margin * 2),
      y: margin + Math.random() * Math.max(1, height - margin * 2),
    };
  }

  function setParticleCount() {
    const targetCount = particleBudget(width, reducedMotion);
    while (particles.length < targetCount) {
      const point = randomPoint();
      particles.push({
        x: point.x,
        y: point.y,
        from: point,
        to: point,
        size: 2.2 + Math.random() * 3.2,
        alpha: 0.44 + Math.random() * 0.34,
        wobble: Math.random() * Math.PI * 2,
        speed: 0.00045 + Math.random() * 0.00055,
      });
    }
    particles.length = targetCount;
  }

  function shapeTargets(kind) {
    const shortest = Math.min(width, height);
    const centerX = width * (0.32 + Math.random() * 0.36);
    const centerY = height * (0.3 + Math.random() * 0.4);
    const scale = Math.max(88, Math.min(shortest * 0.28, 230));
    return buildGeometryTargets({
      kind,
      count: particles.length,
      centerX,
      centerY,
      scale,
      phase: Math.random() * 0.5 - 0.25,
    });
  }

  function beginTransition(targets, now, nextMode) {
    particles.forEach((particle, index) => {
      particle.from = { x: particle.x, y: particle.y };
      particle.to = targets[index];
    });
    mode = nextMode;
    transitionStarted = now;
    transitionDuration = nextMode === "shape" ? 2600 : 2200;
    nextTransition = now + transitionDuration + (nextMode === "shape" ? 3000 : 1500);
  }

  function assembleNextShape(now) {
    currentPattern = chooseNextPattern(currentPattern);
    beginTransition(shapeTargets(currentPattern), now, "shape");
  }

  function scatter(now) {
    const margin = Math.min(width, height) * 0.06;
    beginTransition(particles.map(() => randomPoint(margin)), now, "scatter");
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setParticleCount();

    const targets = shapeTargets(currentPattern);
    particles.forEach((particle, index) => {
      particle.x = targets[index].x;
      particle.y = targets[index].y;
      particle.from = { ...targets[index] };
      particle.to = { ...targets[index] };
    });
  }

  function drawConnections(now, pulse) {
    if (shapeStrength < 0.42) return;
    ctx.save();
    ctx.strokeStyle = `rgba(224, 45, 38, ${0.07 + shapeStrength * 0.11 * pulse})`;
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    particles.forEach((particle, index) => {
      const wobbleX = Math.cos(now * particle.speed + particle.wobble) * 1.8;
      const wobbleY = Math.sin(now * particle.speed * 1.17 + particle.wobble) * 1.8;
      if (index === 0) ctx.moveTo(particle.x + wobbleX, particle.y + wobbleY);
      else ctx.lineTo(particle.x + wobbleX, particle.y + wobbleY);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawParticle(particle, now, pulse, index) {
    const wobbleAmount = mode === "shape" ? 2.5 : 7;
    const x = particle.x + Math.cos(now * particle.speed + particle.wobble) * wobbleAmount;
    const y = particle.y + Math.sin(now * particle.speed * 1.17 + particle.wobble) * wobbleAmount;
    const size = particle.size * pulse;
    const bright = index % 7 === 0;
    const alpha = Math.min(0.82, particle.alpha * (bright ? 1.35 : 1) * pulse);

    ctx.shadowBlur = bright ? 12 : 6;
    ctx.shadowColor = "rgba(239, 48, 40, .65)";
    ctx.fillStyle = `rgba(${bright ? "244, 61, 52" : "170, 31, 27"}, ${alpha})`;
    ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), Math.ceil(size), Math.ceil(size));

    if (index % 5 === 0) {
      const satellite = Math.max(1, size * 0.42);
      ctx.fillStyle = `rgba(84, 12, 12, ${alpha * 0.7})`;
      ctx.fillRect(Math.round(x + size * 2.1), Math.round(y - size * 1.7), satellite, satellite);
    }
  }

  function render(now) {
    if (!reducedMotion && now >= nextTransition) {
      if (mode === "shape") scatter(now);
      else assembleNextShape(now);
    }

    const progress = Math.min(1, Math.max(0, (now - transitionStarted) / transitionDuration));
    shapeStrength = mode === "shape" ? progress : 1 - progress;
    particles.forEach((particle) => {
      const point = morphPoint(particle.from, particle.to, progress);
      particle.x = point.x;
      particle.y = point.y;
    });

    ctx.clearRect(0, 0, width, height);
    const burst = now < burstUntil;
    const pulse = (1 + Math.sin(now * 0.0023) * 0.14) * (burst ? 1.85 : 1);
    drawConnections(now, pulse);
    particles.forEach((particle, index) => drawParticle(particle, now, pulse, index));
    ctx.shadowBlur = 0;

    if (!reducedMotion) animationFrame = requestAnimationFrame(render);
  }

  resize();
  if (reducedMotion) render(performance.now() + 1);
  else animationFrame = requestAnimationFrame(render);

  window.__signalBurst = function signalBurst() {
    burstUntil = performance.now() + 1100;
  };

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (reducedMotion) return;
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
    } else {
      transitionStarted = performance.now();
      nextTransition = transitionStarted + 1800;
      animationFrame = requestAnimationFrame(render);
    }
  });

  const glow = document.getElementById("cursor-glow");
  if (glow && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let gx = width / 2;
    let gy = height / 3;
    let targetX = gx;
    let targetY = gy;
    document.addEventListener("pointermove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    });
    (function glowFrame() {
      gx += (targetX - gx) * 0.08;
      gy += (targetY - gy) * 0.08;
      glow.style.transform = `translate(${gx}px,${gy}px)`;
      requestAnimationFrame(glowFrame);
    })();
  }
}
