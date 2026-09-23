import {
  createLatestActionQueue,
  getTroyAction,
  isActionReady,
  isTroyTool,
  resolveTroyReaction,
} from "./troy-actions.js?v=20260908-mascot32";
import { getTroyCopy, pickTroyLine } from "./troy-copy.js?v=20260908-mascot32";
import {
  createDialogueFragments,
  createDialogueTimeline,
  createPixelOrbit,
  dialogueTimingFor,
} from "./troy-dialogue-visuals.js?v=20260908-mascot32";
import { createTroyMood } from "./troy-mood.js?v=20260908-mascot32";
import { createTroyState } from "./troy-state.js?v=20260913-presence1";
import { clampBazookaAim } from "./troy-bazooka-motion.js?v=20260914-flightphysics1";
import { commandInteractionMode } from "./troy-command-policy.js?v=20260913-presence1";
import { chooseIdlePresence } from "./troy-presence-motion.js?v=20260914-lookdown1";
import { createSiteRocket } from "./troy-site-rocket.js?v=20260914-flightphysics1";
import { createTroyRenderer } from "./troy-three.js?v=20260914-lookdown1";

const stage = document.getElementById("troy-stage");

if (stage) {
  const dialogue = stage.querySelector("[data-troy-dialogue]");
  const pixelLayer = stage.querySelector("[data-troy-pixels]");
  const target = stage.querySelector("[data-troy-target]");
  const pixelTarget = stage.querySelector("[data-troy-pixel-target]");
  const intro = stage.querySelector(".troy-intro");
  const toolButtons = [...stage.querySelectorAll("[data-troy-tool-option]")];
  const commandTrigger = stage.querySelector("[data-troy-command-trigger]");
  const commandPanel = stage.querySelector("[data-troy-command-panel]");
  const commandLinks = [...stage.querySelectorAll("[data-troy-command]")];
  const language = document.documentElement.lang;
  const copy = getTroyCopy(language);
  const state = createTroyState(stage.dataset.troyState);
  const mood = createTroyMood();
  const pendingActions = createLatestActionQueue();
  const dialogueTimeline = createDialogueTimeline();
  const rendererPromise = createTroyRenderer(stage);
  const siteRocket = createSiteRocket(stage);
  const previousLineByKey = new Map();
  const lastRunAt = new Map();
  const fallbackDurations = {
    idle: 0,
    talk: 1_900,
    point: 1_900,
    threat: 2_200,
    annoyed: 2_100,
    poke: 850,
    bazookaAim: 260,
    bazookaFire: 900,
    rocketFlight: 1_900,
    whipHit: 950,
    acknowledge: 1_900,
    recover: 650,
  };
  let selectedTool = isTroyTool(stage.dataset.troyTool) ? stage.dataset.troyTool : "poke";
  let busy = false;
  let interactionToken = 0;
  let idleTimer = 0;
  let effectTimer = 0;
  let shotSeed = 0;
  let bazookaSequenceActive = false;
  let scatteredLineIndex = 0;
  const dialogueTimers = new Set();
  const scatteredTimers = new Set();

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function isCommandOpen() {
    return Boolean(commandPanel && !commandPanel.hidden);
  }

  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  }

  function setDialoguePhase(phase) {
    stage.dataset.troyDialogueState = phase;
  }

  function clearDialogueTimers() {
    for (const timer of dialogueTimers) window.clearTimeout(timer);
    dialogueTimers.clear();
  }

  function clearScatteredTimers() {
    for (const timer of scatteredTimers) window.clearTimeout(timer);
    scatteredTimers.clear();
  }

  function scheduleScatteredDialogue(delay = 3_000) {
    const timer = window.setTimeout(() => {
      scatteredTimers.delete(timer);
      if (state.current() !== "pixelScattered") return;
      showDialogue("pixelScattered");
      const intervals = [7_000, 8_200, 9_400, 10_000];
      const nextDelay = intervals[scatteredLineIndex % intervals.length];
      scatteredLineIndex += 1;
      scheduleScatteredDialogue(nextDelay);
    }, delay);
    scatteredTimers.add(timer);
  }

  function scheduleDialoguePhase(phase, delay) {
    const timer = window.setTimeout(() => {
      dialogueTimers.delete(timer);
      setDialoguePhase(phase);
    }, delay);
    dialogueTimers.add(timer);
  }

  function mountPixelOrbit() {
    if (!pixelLayer) return;
    const pixels = createPixelOrbit(22);
    const fragment = document.createDocumentFragment();
    for (const pixel of pixels) {
      const node = document.createElement("span");
      node.className = "troy-pixel";
      node.dataset.pixelColor = pixel.color;
      node.style.setProperty("--pixel-rx", `${pixel.radiusX}%`);
      node.style.setProperty("--pixel-ry", `${pixel.radiusY}%`);
      node.style.setProperty("--pixel-start-x", `${pixel.startX}%`);
      node.style.setProperty("--pixel-start-y", `${pixel.startY}%`);
      node.style.setProperty("--pixel-gather-x", `${pixel.gatherX}%`);
      node.style.setProperty("--pixel-gather-y", `${pixel.gatherY}%`);
      node.style.setProperty("--pixel-scatter-x", `${pixel.scatterX}%`);
      node.style.setProperty("--pixel-scatter-y", `${pixel.scatterY}%`);
      node.style.setProperty("--pixel-duration", `${pixel.duration}s`);
      node.style.setProperty("--pixel-delay", `${pixel.delay}s`);
      node.style.setProperty("--pixel-size", `${pixel.size}px`);
      node.style.setProperty("--pixel-direction", pixel.reverse ? "reverse" : "normal");
      fragment.append(node);
    }
    pixelLayer.replaceChildren(fragment);
  }

  function mountDialogueFragments() {
    if (!intro) return;
    const fragment = document.createDocumentFragment();
    for (const shard of createDialogueFragments(16)) {
      const node = document.createElement("i");
      node.className = "troy-dialogue-fragment";
      node.dataset.fragmentColor = shard.color;
      node.setAttribute("aria-hidden", "true");
      node.style.setProperty("--fragment-x", `${shard.gatherX}%`);
      node.style.setProperty("--fragment-y", `${shard.gatherY}%`);
      node.style.setProperty("--fragment-start-x", `${shard.startX}px`);
      node.style.setProperty("--fragment-start-y", `${shard.startY}px`);
      node.style.setProperty("--fragment-scatter-x", `${shard.scatterX}px`);
      node.style.setProperty("--fragment-scatter-y", `${shard.scatterY}px`);
      node.style.setProperty("--fragment-delay", `${shard.delay}ms`);
      node.style.setProperty("--fragment-size", `${shard.size}px`);
      fragment.append(node);
    }
    intro.append(fragment);
  }

  function showDialogue(key) {
    const lines = copy.dialogue[key] || copy.dialogue.idle;
    const selected = pickTroyLine(lines, previousLineByKey.get(key));
    previousLineByKey.set(key, selected.index);
    if (dialogue) dialogue.textContent = selected.line;
    clearDialogueTimers();
    dialogueTimeline.show(performance.now());
    const timing = dialogueTimingFor(key);

    if (prefersReducedMotion()) {
      setDialoguePhase("visible");
      scheduleDialoguePhase("hidden", timing.visibleMs);
      return;
    }

    setDialoguePhase("assembling");
    scheduleDialoguePhase("visible", timing.assembleMs);
    scheduleDialoguePhase("dispersing", timing.assembleMs + timing.visibleMs);
    scheduleDialoguePhase(
      "hidden",
      timing.assembleMs + timing.visibleMs + timing.disperseMs,
    );
  }

  function renderState(next) {
    state.enter(next);
    stage.dataset.troyState = state.current();
  }

  function syncSelectedTool() {
    stage.dataset.troyTool = selectedTool;
    for (const button of toolButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.troyToolOption === selectedTool));
    }
    if (target) target.setAttribute("aria-label", copy.tools[selectedTool].targetLabel);
  }

  function clearEffect() {
    window.clearTimeout(effectTimer);
    delete stage.dataset.troyEffectActive;
  }

  function showEffect(effect, token) {
    clearEffect();
    if (!effect) return;
    stage.dataset.troyEffectActive = effect;
    effectTimer = window.setTimeout(() => {
      if (token === interactionToken) delete stage.dataset.troyEffectActive;
    }, 460);
  }

  function clearIdleTimer() {
    window.clearTimeout(idleTimer);
    idleTimer = 0;
  }

  function resetIdleTimer() {
    clearIdleTimer();
    if (busy || isCommandOpen() || selectedTool === "bazooka") return;
    const delay = 9_000 + Math.round(Math.random() * 4_000);
    idleTimer = window.setTimeout(() => {
      const next = chooseIdlePresence(Math.random());
      playAmbient(next, { withDialogue: next !== "threat" });
    }, delay);
  }

  async function playAndWait(renderer, next) {
    const completed = await renderer.playState(next);
    if (renderer.ready) return completed;
    await wait(fallbackDurations[next] ?? 1_000);
    return true;
  }

  async function returnToIdle(renderer, token) {
    if (token !== interactionToken) return false;
    renderState("idle");
    renderer.clearEffect();
    renderer.setExpression(null);
    await renderer.playState("idle");
    return token === interactionToken;
  }

  function enterPixelScattered() {
    if (!bazookaSequenceActive) return;
    renderState("pixelScattered");
    if (pixelTarget) pixelTarget.hidden = false;
    clearScatteredTimers();
    scatteredLineIndex = 0;
    scheduleScatteredDialogue(3_000);
  }

  async function finishReformation() {
    clearScatteredTimers();
    if (pixelTarget) pixelTarget.hidden = true;
    bazookaSequenceActive = false;
    busy = false;
    pendingActions.clear();
    const renderer = await rendererPromise;
    const restoreState = selectedTool === "bazooka" ? "bazookaAim" : "idle";
    renderState(restoreState);
    renderer.setExpression(null);
    await renderer.playState(restoreState);
    resetIdleTimer();
  }

  function setCommandOpen(open, { restoreFocus = false } = {}) {
    if (!commandPanel || !commandTrigger) return;
    commandPanel.hidden = !open;
    commandTrigger.setAttribute("aria-expanded", String(open));
    if (open) clearIdleTimer();
    else resetIdleTimer();
    if (restoreFocus) commandTrigger.focus();
  }

  async function playAmbient(next, { allowCommandOpen = false, withDialogue = true } = {}) {
    if (busy || (isCommandOpen() && !allowCommandOpen)) return false;
    const token = ++interactionToken;
    renderState(next);
    if (withDialogue) showDialogue(next);
    const renderer = await rendererPromise;
    if (token !== interactionToken) return false;
    const completed = await playAndWait(renderer, next);
    if (!completed || token !== interactionToken) return false;
    await returnToIdle(renderer, token);
    resetIdleTimer();
    return true;
  }

  async function runTool(name) {
    const action = getTroyAction(name);
    if (!action) return false;
    if (busy) {
      pendingActions.request(name);
      return false;
    }

    if (name === "bazooka") return runBazooka(action);

    const now = performance.now();
    const previousRun = lastRunAt.get(name) ?? Number.NEGATIVE_INFINITY;
    if (!isActionReady(previousRun, now, action.cooldownMs)) return false;

    busy = true;
    clearIdleTimer();
    setCommandOpen(false);
    lastRunAt.set(name, now);
    const token = ++interactionToken;
    const tier = mood.registerPhysical(name, now);
    const reaction = resolveTroyReaction(name, tier);
    showDialogue(reaction.dialogueKey);
    showEffect(action.effect, token);

    const renderer = await rendererPromise;
    renderer.setExpression(reaction.expression);
    renderer.playEffect(reaction.effect);
    let completed = token === interactionToken;
    for (const next of reaction.sequence) {
      if (!completed || token !== interactionToken) break;
      renderState(next);
      completed = await playAndWait(renderer, next);
    }

    clearEffect();
    if (token === interactionToken) await returnToIdle(renderer, token);
    busy = false;

    const pending = pendingActions.take();
    if (pending) {
      window.setTimeout(() => runTool(pending), 0);
    } else {
      resetIdleTimer();
    }
    return completed;
  }

  async function runBazooka(action) {
    const now = performance.now();
    const previousRun = lastRunAt.get(action.name) ?? Number.NEGATIVE_INFINITY;
    if (!isActionReady(previousRun, now, action.cooldownMs)) return false;

    busy = true;
    bazookaSequenceActive = true;
    clearIdleTimer();
    clearScatteredTimers();
    setCommandOpen(false);
    lastRunAt.set(action.name, now);
    const token = ++interactionToken;
    const reaction = resolveTroyReaction(action.name);
    showDialogue(reaction.dialogueKey);

    const renderer = await rendererPromise;
    if (token !== interactionToken) return false;
    renderer.setExpression(reaction.expression);
    renderState("bazookaAim");
    await playAndWait(renderer, "bazookaAim");
    if (token !== interactionToken) return false;
    renderState("bazookaFire");
    await playAndWait(renderer, "bazookaFire");
    if (token !== interactionToken) return false;
    renderState("rocketFlight");
    const launched = renderer.launchBazooka?.(++shotSeed);
    if (launched) {
      await siteRocket.fly();
      if (token !== interactionToken) return false;
      showDialogue("bazookaImpact");
      const impacted = renderer.completeBazookaFlight?.();
      if (!impacted) enterPixelScattered();
    } else {
      const timer = window.setTimeout(() => {
        scatteredTimers.delete(timer);
        enterPixelScattered();
      }, fallbackDurations.rocketFlight);
      scatteredTimers.add(timer);
    }
    return true;
  }

  function navigateCommand(link) {
    const destination = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    const isSameDocument = destination.origin === current.origin
      && destination.pathname === current.pathname
      && destination.search === current.search
      && destination.hash;

    if (isSameDocument) {
      const destinationElement = document.querySelector(destination.hash);
      destinationElement?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
      window.history.pushState(null, "", destination.hash);
      return;
    }
    window.location.assign(destination.href);
  }

  async function runCommand(link) {
    const mode = commandInteractionMode({ busy, state: state.current() });
    if (mode === "blocked") return false;
    if (mode === "navigate-only") {
      setCommandOpen(false);
      navigateCommand(link);
      return true;
    }
    busy = true;
    setCommandOpen(false);
    clearIdleTimer();
    mood.calm();
    const token = ++interactionToken;
    renderState("acknowledge");
    showDialogue("acknowledge");
    const renderer = await rendererPromise;
    if (token !== interactionToken) return false;
    renderer.setExpression(null);

    const navigationTimer = window.setTimeout(() => navigateCommand(link), 360);
    const completed = await playAndWait(renderer, "acknowledge");
    if (token !== interactionToken) {
      window.clearTimeout(navigationTimer);
      return false;
    }
    await returnToIdle(renderer, token);
    pendingActions.clear();
    busy = false;
    resetIdleTimer();
    return completed;
  }

  for (const button of toolButtons) {
    button.addEventListener("click", () => {
      const nextTool = button.dataset.troyToolOption;
      if (!isTroyTool(nextTool)) return;
      selectedTool = nextTool;
      setCommandOpen(false);
      syncSelectedTool();
      if (!busy && nextTool === "bazooka") {
        interactionToken += 1;
        clearIdleTimer();
        renderState("bazookaAim");
        rendererPromise.then((renderer) => renderer.playState("bazookaAim"));
      } else if (!busy && state.current() === "bazookaAim") {
        interactionToken += 1;
        renderState("idle");
        rendererPromise.then((renderer) => renderer.playState("idle"));
      }
      resetIdleTimer();
    });
  }

  target?.addEventListener("click", () => runTool(selectedTool));

  stage.addEventListener("pointermove", (event) => {
    if (selectedTool !== "bazooka" || bazookaSequenceActive) return;
    const bounds = stage.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    /* Ekran Y'si asagi dogru artar; nisan pitch'i ise yukari pozitif. Normal bakisla ayni yon. */
    const aim = clampBazookaAim(pointerX, -pointerY);
    rendererPromise.then((renderer) => renderer.setAim?.(aim.yaw, aim.pitch));
  });

  stage.addEventListener("troy:pixel-scattered", enterPixelScattered);
  stage.addEventListener("troy:reformed", finishReformation);

  pixelTarget?.addEventListener("click", async () => {
    if (state.current() !== "pixelScattered") return;
    clearScatteredTimers();
    renderState("reforming");
    showDialogue("reforming");
    const renderer = await rendererPromise;
    const started = renderer.reformPixels?.();
    if (!started) await finishReformation();
  });

  commandTrigger?.addEventListener("click", () => {
    const mode = commandInteractionMode({ busy, state: state.current() });
    if (mode === "blocked") return;
    const open = !isCommandOpen();
    setCommandOpen(open);
    if (open && mode === "animated") playAmbient("talk", { allowCommandOpen: true });
  });

  for (const link of commandLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      runCommand(link);
    });
  }

  document.querySelectorAll(".hero-cta a").forEach((link) => {
    link.addEventListener("pointerenter", () => playAmbient("point"));
    link.addEventListener("focus", () => playAmbient("point"));
  });

  intro?.addEventListener("pointerenter", () => playAmbient("talk"));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isCommandOpen()) {
      setCommandOpen(false, { restoreFocus: true });
      return;
    }
    resetIdleTimer();
  });
  document.addEventListener("pointerdown", resetIdleTimer, { passive: true });
  /* Sayfa kapanirken/yenilenirken Chrome (GPU) 3D tuvalin son karesini
     birakip beyaz bir katman cizebiliyor. Tuvali navigasyon basladigi
     anda gizliyoruz: beyaz kare yerine hicbir sey gorunmez, yeni sayfada
     3D hazir olunca Troy geri gelir. */
  const canvas = stage.querySelector("[data-troy-canvas]");
  function hideCanvasForUnload() {
    if (!canvas) return;
    canvas.style.visibility = "hidden";
    canvas.style.opacity = "0";
  }
  function restoreCanvasAfterShow() {
    if (!canvas) return;
    canvas.style.visibility = "";
    canvas.style.opacity = "";
  }
  window.addEventListener("beforeunload", hideCanvasForUnload);
  window.addEventListener("pageshow", restoreCanvasAfterShow);
  window.addEventListener("pagehide", () => {
    hideCanvasForUnload();
    clearIdleTimer();
    clearDialogueTimers();
    clearScatteredTimers();
    siteRocket.cancel();
    rendererPromise.then((renderer) => renderer.dispose());
  });

  mountPixelOrbit();
  mountDialogueFragments();
  setDialoguePhase("hidden");
  syncSelectedTool();
  renderState("idle");
  resetIdleTimer();
}
