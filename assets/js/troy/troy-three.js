import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { clipNameForState, isLoopingState, playbackRateForState, shouldFreezeCurrentClip, shouldRestartLoopingAction } from "./troy-clips.js?v=20260914-headlock2";
import { createPixelGhostState } from "./troy-pixel-ghost.js?v=20260908-mascot32";
import { guardMotionAt, whipMotionAt } from "./troy-physical-motion.js?v=20260908-mascot32";
import { shouldUsePosterFallback } from "./troy-preferences.js?v=20260908-mascot32";
import { fitPropToMascotHeight, TROY_PROP_MODELS } from "./troy-props.js?v=20260908-mascot32";
import { BAZOOKA_EFFECTS, cameraDistanceForBounds, cameraTargetHeight, selectNativeGuardHand, troyParticleBudget } from "./troy-renderer-contract.js?v=20260910-shell1";
import { createTailSpring } from "./troy-tail-spring.js?v=20260908-mascot32";
import { bazookaImpactAt, TROY_BAZOOKA_EXPLOSION_MS } from "./troy-bazooka-impact.js?v=20260908-mascot32";
import { bazookaBarrelAxis, bazookaHeadClearanceOffset, bazookaLaunchDirection, bazookaLiftAt, bazookaPointerLookForState, smoothRocketLook } from "./troy-bazooka-motion.js?v=20260914-headlock1";
import { canTrackPointer, pointerFocusFromCanvasRect, pointerInputModeForState, pointerLookFromAnchor, shouldLockPointerPose, threatGestureAt } from "./troy-presence-motion.js?v=20260914-lookdown1";

const REQUIRED_CLIPS = [
  "Idle",
  "Talk",
  "Point",
  "Annoyed",
  BAZOOKA_EFFECTS.aimClip,
  BAZOOKA_EFFECTS.fireClip,
  "Poke",
  "WhipHit",
  "Acknowledge",
  "Recover",
];
const CROSS_FADE_SECONDS = 0.18;
const REQUIRED_EXPRESSIONS = ["Surprised", "Angry", "Defensive"];
const EXPRESSION_BLEND_SPEED = 14;

function createWhip(mascotSize, leatherOverride = null) {
  const whip = new THREE.Group();
  const leather = leatherOverride || new THREE.MeshStandardMaterial({ color: 0x171214, roughness: 0.66, metalness: 0.04 });
  const handleMaterial = leather.clone();
  const initialMotion = whipMotionAt(0, false);
  const initialPoints = initialMotion.points.map((point) => new THREE.Vector3(
    point.x * mascotSize.x,
    point.y * mascotSize.y,
    mascotSize.z * 0.5 + 0.38,
  ));
  const curve = new THREE.CatmullRomCurve3(initialPoints.slice(1));
  const line = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 48, mascotSize.y * 0.015, 8, false),
    leather,
  );
  line.name = "TroyInteractionWhipLine";
  whip.add(line);
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(mascotSize.y * 0.025, mascotSize.y * 0.033, 1, 14),
    handleMaterial,
  );
  handle.name = "TroyInteractionWhipHandle";
  whip.add(handle);
  whip.visible = false;
  whip.name = "TroyInteractionWhip";
  return whip;
}

function fallbackController(stage, reason) {
  stage.dataset.troyRenderer = "fallback";
  stage.dataset.troyFallback = reason;
  const timers = new Set();
  const schedule = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  };
  const controller = {
    ready: false,
    playState() {
      return Promise.resolve(false);
    },
    setExpression() {
      return false;
    },
    playEffect() {
      return false;
    },
    setAim() {
      return false;
    },
    launchBazooka() {
      return true;
    },
    completeBazookaFlight() {
      stage.dataset.troyRocket = "contact";
      stage.dataset.troyPropImpact = "bazooka-contact";
      schedule(() => {
        stage.dataset.troyRocket = "impact";
        stage.dataset.troyPropImpact = "bazooka-explosion";
        stage.dispatchEvent(new CustomEvent("troy:pixel-scattered"));
        schedule(() => delete stage.dataset.troyPropImpact, 620);
      }, TROY_BAZOOKA_EXPLOSION_MS);
      return true;
    },
    reformPixels() {
      stage.dispatchEvent(new CustomEvent("troy:reformed"));
      return true;
    },
    clearEffect() {},
    debug() {
      return { ready: false, reason };
    },
    dispose() {
      for (const timer of timers) window.clearTimeout(timer);
      timers.clear();
    },
  };
  return controller;
}

function prefersPosterFallback() {
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection?.saveData;
  return shouldUsePosterFallback({ reducedMotion, saveData });
}

function cappedPixelRatio(width, height) {
  const mobile = window.matchMedia?.("(max-width: 760px)").matches;
  const pixelBudget = mobile ? 900_000 : 1_800_000;
  const deviceRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.4 : 2);
  return Math.min(deviceRatio, Math.sqrt(pixelBudget / Math.max(1, width * height)));
}

function createRadialTexture(innerColor, outerColor = "rgba(0,0,0,0)") {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.38, innerColor);
  gradient.addColorStop(1, outerColor);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export async function createTroyRenderer(stage) {
  const canvas = stage.querySelector("[data-troy-canvas]");
  const modelUrl = stage.dataset.troyModel;

  if (!canvas || !modelUrl) return fallbackController(stage, "missing-markup");
  if (prefersPosterFallback()) return fallbackController(stage, "motion-or-data-preference");

  let renderer;

  try {
    const mobile = window.matchMedia?.("(max-width: 760px)").matches;
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 30);
    const modelPivot = new THREE.Group();
    scene.add(modelPivot);

    scene.add(new THREE.HemisphereLight(0xffe9df, 0x180304, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffd8ca, 3.8);
    keyLight.position.set(-2.2, 3.1, 2.8);
    scene.add(keyLight);

    const redRim = new THREE.PointLight(0xff261d, 12, 5, 2);
    redRim.position.set(2.1, 1.45, 1.1);
    scene.add(redRim);

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelUrl);
    const model = gltf.scene;
    const clipsByName = new Map(gltf.animations.map((clip) => [clip.name, clip]));
    const missingClips = REQUIRED_CLIPS.filter((name) => !clipsByName.has(name));
    if (missingClips.length) throw new Error(`Troy GLB is missing clips: ${missingClips.join(", ")}`);

    const expressionBindings = [];
    const skinnedMeshes = [];
    model.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = false;
      object.receiveShadow = false;
      object.frustumCulled = true;
      if (object.isSkinnedMesh) skinnedMeshes.push(object);
      if (!object.morphTargetDictionary || !object.morphTargetInfluences) return;
      const indices = new Map(
        REQUIRED_EXPRESSIONS
          .filter((name) => Number.isInteger(object.morphTargetDictionary[name]))
          .map((name) => [name, object.morphTargetDictionary[name]]),
      );
      if (indices.size === REQUIRED_EXPRESSIONS.length) {
        expressionBindings.push({ mesh: object, indices });
      }
    });
    if (!expressionBindings.length) {
      throw new Error(`Troy GLB is missing facial morphs: ${REQUIRED_EXPRESSIONS.join(", ")}`);
    }

    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -bounds.min.y, -center.z);
    modelPivot.add(model);

    const particleCount = troyParticleBudget(mobile);
    const particlePositions = new Float32Array(particleCount * 3);
    const particleHomes = new Float32Array(particleCount * 3);
    const particleStarts = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const red = index % 5 !== 0;
      particleColors[index * 3] = red ? 0.92 : 0.025;
      particleColors[index * 3 + 1] = red ? 0.055 : 0.015;
      particleColors[index * 3 + 2] = red ? 0.035 : 0.018;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: size.y * (mobile ? 0.018 : 0.014),
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pixelGhost = new THREE.Points(particleGeometry, particleMaterial);
    pixelGhost.name = "TroyPixelGhost";
    pixelGhost.frustumCulled = false;
    pixelGhost.visible = false;
    modelPivot.add(pixelGhost);

    let bazooka = null;
    let rocket = null;
    let rocketRestScale = null;
    let bazookaMuzzle = null;
    let bazookaExhaust = null;
    let bazookaAvailable = false;
    let whip = createWhip(size);
    let whipUsesGeneratedAsset = false;
    modelPivot.add(whip);

    try {
      const [bazookaGltf, rocketGltf] = await Promise.all([
        loader.loadAsync(TROY_PROP_MODELS.bazooka),
        loader.loadAsync(TROY_PROP_MODELS.rocket),
      ]);
      const hand = model.getObjectByName("R_Hand");
      if (!hand) throw new Error("Troy GLB is missing R_Hand");

      bazooka = bazookaGltf.scene;
      bazooka.name = "TroyBazookaProp";
      const bazookaBounds = new THREE.Box3().setFromObject(bazooka);
      const bazookaSize = bazookaBounds.getSize(new THREE.Vector3());
      const bazookaLength = Math.max(bazookaSize.x, bazookaSize.y, bazookaSize.z);
      bazooka.scale.setScalar(fitPropToMascotHeight(bazookaLength, size.y, 0.48));
      bazooka.position.set(0.025, 0.03, 0.015);
      bazooka.rotation.set(0, Math.PI, 0);
      bazooka.visible = false;
      hand.add(bazooka);
      bazookaMuzzle = bazooka.getObjectByName("BazookaMuzzle");
      bazookaExhaust = bazooka.getObjectByName("BazookaExhaust");
      if (!bazookaMuzzle || !bazookaExhaust) {
        throw new Error("Bazooka GLB is missing muzzle or exhaust anchors");
      }
      // The generated marker nodes are vertical, but the visible tube runs on X.
      // Place the muzzle at the large open +X end and the exhaust at the -X rear.
      bazookaMuzzle.position.set(0.49, 0, 0);
      bazookaExhaust.position.set(-0.49, 0, 0);

      rocket = rocketGltf.scene;
      rocket.name = "TroyRocketProp";
      const rocketBounds = new THREE.Box3().setFromObject(rocket);
      const rocketSize = rocketBounds.getSize(new THREE.Vector3());
      const rocketLength = Math.max(rocketSize.x, rocketSize.y, rocketSize.z);
      rocket.scale.setScalar(fitPropToMascotHeight(rocketLength, size.y, 0.15));
      rocketRestScale = rocket.scale.clone();
      rocket.visible = false;
      modelPivot.add(rocket);
      bazookaAvailable = true;
      stage.dataset.troyBazooka = "ready";
    } catch (error) {
      bazooka?.removeFromParent();
      rocket?.removeFromParent();
      bazooka = null;
      rocket = null;
      stage.dataset.troyBazooka = "unavailable";
      const bazookaButton = stage.querySelector('[data-troy-tool-option="bazooka"]');
      if (bazookaButton) bazookaButton.disabled = true;
      console.warn("Troy bazooka assets unavailable; bazooka interaction disabled.", error);
    }

    try {
      const whipGltf = await loader.loadAsync(TROY_PROP_MODELS.whip);
      let generatedLeather = null;
      whipGltf.scene.traverse((object) => {
        if (!object.isMesh || generatedLeather) return;
        const source = Array.isArray(object.material) ? object.material[0] : object.material;
        if (!source) return;
        generatedLeather = source.clone();
        generatedLeather.color?.set(0x6d4032);
        generatedLeather.transparent = false;
        generatedLeather.opacity = 1;
        generatedLeather.alphaMap = null;
        generatedLeather.alphaTest = 0;
        generatedLeather.depthWrite = true;
        generatedLeather.side = THREE.DoubleSide;
        if (generatedLeather.map) {
          generatedLeather.map = generatedLeather.map.clone();
          generatedLeather.map.wrapS = THREE.RepeatWrapping;
          generatedLeather.map.wrapT = THREE.RepeatWrapping;
          generatedLeather.map.repeat.set(5, 1);
          generatedLeather.map.needsUpdate = true;
        }
      });
      modelPivot.remove(whip);
      whip.traverse((object) => {
        object.geometry?.dispose();
        object.material?.dispose();
      });
      whipGltf.scene.traverse((object) => object.geometry?.dispose());
      whip = createWhip(size, generatedLeather);
      whip.name = "TroyDynamicGeneratedWhipProp";
      whipUsesGeneratedAsset = true;
      modelPivot.add(whip);
    } catch (error) {
      console.warn("Troy generated whip asset unavailable; using lightweight fallback.", error);
    }

    const mixer = new THREE.AnimationMixer(model);
    const actions = new Map(
      REQUIRED_CLIPS.map((name) => [name, mixer.clipAction(clipsByName.get(name))]),
    );
    let currentAction = null;
    let heldBazookaPose = null;
    let pendingCompletion = null;
    let targetExpression = null;
    let effectState = null;
    let lastWhipGeometryAt = Number.NEGATIVE_INFINITY;
    const targetAim = new THREE.Vector2();
    const currentAim = new THREE.Vector2();
    const resolvedBazookaAim = new THREE.Vector2();
    const targetLook = new THREE.Vector2();
    const currentLook = new THREE.Vector2();
    const neutralLook = new THREE.Vector2();
    const spine = model.getObjectByName("Spine02");
    const head = model.getObjectByName("Head");

    function captureBazookaPose() {
      heldBazookaPose = {
        head: head?.quaternion.clone(),
        spine: spine?.quaternion.clone(),
      };
    }

    function restoreBazookaPose() {
      if (!heldBazookaPose) return;
      head?.quaternion.copy(heldBazookaPose.head);
      spine?.quaternion.copy(heldBazookaPose.spine);
    }
    const nativeGuardHand = selectNativeGuardHand(
      ["L_Hand", "R_Hand"].filter((name) => model.getObjectByName(name)),
    );
    const guardSide = nativeGuardHand?.startsWith("L_") ? "L" : "R";
    const guardArm = {
      upper: model.getObjectByName(`${guardSide}_Upperarm`),
      forearm: model.getObjectByName(`${guardSide}_Forearm`),
      hand: nativeGuardHand ? model.getObjectByName(nativeGuardHand) : null,
    };
    const tailBones = ["Tail01", "Tail02", "Tail03", "Tail04", "Tail05"]
      .map((name) => model.getObjectByName(name));
    if (tailBones.some((bone) => !bone)) throw new Error("Troy GLB is missing procedural tail bones");
    const tailRest = tailBones.map((bone) => ({
      quaternion: bone.quaternion.clone(),
      scale: bone.scale.clone(),
    }));
    const tailWeights = [0.12, 0.19, 0.25, 0.25, 0.19];
    const tailBalance = [
      new THREE.Euler(-0.39, 0, 0.29, "XYZ"),
      new THREE.Euler(-0.49, 0, 0.48, "XYZ"),
      new THREE.Euler(-0.4, 0, 0.37, "XYZ"),
      new THREE.Euler(-0.16, 0, -0.41, "XYZ"),
      new THREE.Euler(0.03, 0, -0.26, "XYZ"),
    ];
    const tailSpring = createTailSpring({ stiffness: 34, damping: 9, maxBend: 0.42 });
    let tailImpulseSeed = 0;
    const bazookaRest = bazooka?.quaternion.clone() || new THREE.Quaternion();
    const bazookaRestPosition = bazooka?.position.clone() || new THREE.Vector3();
    let rocketFlight = null;
    let exhaustUntil = 0;
    let lastSmokeAt = Number.NEGATIVE_INFINITY;
    let flashUntil = 0;
    let bazookaRecoilUntil = 0;
    let bazookaLiftStartedAt = null;
    let bazookaOverlayAwaiting = false;
    let bazookaImpact = null;
    let bazookaImpactCleanupTimer = 0;
    let rocketLook = 0;

    const flashTexture = createRadialTexture("rgba(255,236,134,1)", "rgba(255,36,18,0)");
    const smokeTexture = createRadialTexture("rgba(104,95,96,.82)", "rgba(22,11,12,0)");
    const flashMaterial = new THREE.SpriteMaterial({
      map: flashTexture,
      color: 0xff3b24,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const flash = new THREE.Sprite(flashMaterial);
    flash.visible = false;
    flash.renderOrder = 8;
    modelPivot.add(flash);
    const fireCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 2),
      new THREE.MeshBasicMaterial({
        color: 0xff6418,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    fireCore.visible = false;
    fireCore.renderOrder = 9;
    modelPivot.add(fireCore);
    const smokePool = Array.from({ length: 80 }, (_, index) => {
      const baseColor = index % 5 === 0 ? 0xff4f24 : index % 5 === 1 ? 0xd69b8a : 0x6d6666;
      const material = new THREE.SpriteMaterial({
        map: smokeTexture,
        color: baseColor,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.userData.life = 0;
      sprite.userData.velocity = new THREE.Vector3();
      sprite.userData.baseColor = baseColor;
      modelPivot.add(sprite);
      return sprite;
    });
    let nextSmoke = 0;
    const ghostState = createPixelGhostState();
    let ghostStartedAt = 0;
    let reformStartedAt = 0;
    let ghostHover = false;
    let ghostFallbackTimer = 0;
    const pixelTarget = stage.querySelector("[data-troy-pixel-target]");

    function localPositionFor(object) {
      object.updateWorldMatrix(true, false);
      const point = object.getWorldPosition(new THREE.Vector3());
      return modelPivot.worldToLocal(point);
    }

    function spawnSmoke(position, velocity, life = 0.9, scale = 0.085, color = null) {
      const sprite = smokePool[nextSmoke];
      nextSmoke = (nextSmoke + 1) % smokePool.length;
      sprite.position.copy(position);
      sprite.scale.setScalar(scale * size.y);
      sprite.material.color.set(color ?? sprite.userData.baseColor);
      sprite.material.opacity = 0.68;
      sprite.visible = true;
      sprite.userData.life = life;
      sprite.userData.maxLife = life;
      sprite.userData.velocity.copy(velocity);
    }

    function sampleSkinnedMesh() {
      if (!skinnedMeshes.length) throw new Error("Troy has no skinned mesh for pixel sampling");
      modelPivot.updateWorldMatrix(true, true);
      const sources = skinnedMeshes.map((mesh) => ({
        mesh,
        count: mesh.geometry.attributes.position?.count || 0,
      })).filter(({ count }) => count > 0);
      const totalVertices = sources.reduce((total, source) => total + source.count, 0);
      if (!totalVertices) throw new Error("Troy skinned mesh has no vertices");

      for (let index = 0; index < particleCount; index += 1) {
        let sourceIndex = Math.floor((index / particleCount) * totalVertices);
        let source = sources[0];
        for (const candidate of sources) {
          if (sourceIndex < candidate.count) {
            source = candidate;
            break;
          }
          sourceIndex -= candidate.count;
        }
        const vertexIndex = (sourceIndex * 37 + index * 17) % source.count;
        const vertex = new THREE.Vector3().fromBufferAttribute(
          source.mesh.geometry.attributes.position,
          vertexIndex,
        );
        if (typeof source.mesh.applyBoneTransform === "function") {
          source.mesh.applyBoneTransform(vertexIndex, vertex);
        } else if (typeof source.mesh.boneTransform === "function") {
          source.mesh.boneTransform(vertexIndex, vertex);
        }
        source.mesh.localToWorld(vertex);
        modelPivot.worldToLocal(vertex);
        const offset = index * 3;
        particlePositions[offset] = vertex.x;
        particlePositions[offset + 1] = vertex.y;
        particlePositions[offset + 2] = vertex.z;
        particleHomes[offset] = vertex.x;
        particleHomes[offset + 1] = vertex.y;
        particleHomes[offset + 2] = vertex.z;

        const angle = ((index * 2.399963) + Math.sin(index * 19.17)) % (Math.PI * 2);
        const centerY = size.y * 0.52;
        const dx = vertex.x;
        const dy = vertex.y - centerY;
        const dz = vertex.z;
        const length = Math.hypot(dx, dy, dz) || 1;
        const speed = size.y * (0.22 + ((index * 29) % 17) / 80);
        particleVelocities[offset] = (dx / length + Math.cos(angle) * 0.75) * speed;
        particleVelocities[offset + 1] = (dy / length + Math.sin(angle) * 0.55) * speed;
        particleVelocities[offset + 2] = (dz / length + Math.sin(angle * 1.7) * 0.5) * speed;
      }
      particleGeometry.attributes.position.needsUpdate = true;
    }

    function finishPixelFallback() {
      window.clearTimeout(ghostFallbackTimer);
      model.visible = true;
      pixelGhost.visible = false;
      ghostState.click();
      ghostState.finishReform();
      stage.dispatchEvent(new CustomEvent("troy:reformed"));
    }

    function scatterPixels({ hideModel = false } = {}) {
      if (ghostState.current() === "pixelScattered") return true;
      ghostState.impact();
      ghostStartedAt = performance.now();
      stage.dataset.troyPixelState = "scattered";
      try {
        sampleSkinnedMesh();
        pixelGhost.visible = true;
        particleMaterial.opacity = 0.95;
        if (hideModel) model.visible = false;
        stage.dispatchEvent(new CustomEvent("troy:pixel-scattered"));
        return true;
      } catch (error) {
        console.warn("Troy 3D pixel sampling unavailable; using safe fallback.", error);
        stage.dataset.troyPixelFallback = "true";
        model.visible = false;
        stage.dispatchEvent(new CustomEvent("troy:pixel-scattered"));
        ghostFallbackTimer = window.setTimeout(finishPixelFallback, 900);
        return false;
      }
    }

    function reformPixels() {
      if (ghostState.current() !== "pixelScattered") return false;
      ghostState.click();
      reformStartedAt = performance.now();
      particleStarts.set(particlePositions);
      stage.dataset.troyPixelState = "reforming";
      return true;
    }

    function updatePixelGhost(timestamp, delta) {
      const ghostMode = ghostState.current();
      if (ghostMode === "pixelScattered") {
        const drag = Math.exp(-0.62 * delta);
        const attraction = ghostHover ? 0.88 : 0.26;
        const speaking = stage.dataset.troyDialogueState !== "hidden";
        for (let index = 0; index < particleCount; index += 1) {
          const offset = index * 3;
          const homeX = particleHomes[offset];
          const homeY = particleHomes[offset + 1];
          const homeZ = particleHomes[offset + 2];
          const isHead = homeY > size.y * 0.64;
          const compact = ghostHover ? 0.72 : 0.34;
          const targetX = homeX * compact;
          const targetY = size.y * 0.5 + (homeY - size.y * 0.5) * compact;
          const targetZ = homeZ * compact;
          particleVelocities[offset] = particleVelocities[offset] * drag
            + (targetX - particlePositions[offset]) * attraction * delta;
          particleVelocities[offset + 1] = particleVelocities[offset + 1] * drag
            + (targetY - particlePositions[offset + 1]) * attraction * delta;
          particleVelocities[offset + 2] = particleVelocities[offset + 2] * drag
            + (targetZ - particlePositions[offset + 2]) * attraction * delta;
          if (speaking && isHead) {
            particleVelocities[offset] += Math.sin(timestamp * 0.014 + index) * delta * size.y * 0.34;
            if (homeY > size.y * 0.72) {
              particleVelocities[offset + 1] += delta * size.y * 0.12;
            }
          }
          particlePositions[offset] += particleVelocities[offset] * delta;
          particlePositions[offset + 1] += particleVelocities[offset + 1] * delta;
          particlePositions[offset + 2] += particleVelocities[offset + 2] * delta;
        }
        particleGeometry.attributes.position.needsUpdate = true;
        return;
      }

      if (ghostMode !== "reforming") return;
      const progress = THREE.MathUtils.clamp((timestamp - reformStartedAt) / 900, 0, 1);
      const eased = 1 - ((1 - progress) ** 3);
      for (let index = 0; index < particlePositions.length; index += 1) {
        particlePositions[index] = THREE.MathUtils.lerp(
          particleStarts[index],
          particleHomes[index],
          eased,
        );
      }
      particleGeometry.attributes.position.needsUpdate = true;
      particleMaterial.opacity = 1 - Math.max(0, (progress - 0.72) / 0.28);
      if (progress >= 0.72) model.visible = true;
      if (progress < 1) return;

      pixelGhost.visible = false;
      particleMaterial.opacity = 0.95;
      ghostState.finishReform();
      delete stage.dataset.troyPixelState;
      stage.dispatchEvent(new CustomEvent("troy:reformed"));
    }

    function setAim(yaw = 0, pitch = 0) {
      if (!bazookaAvailable) return false;
      targetAim.set(
        THREE.MathUtils.clamp(Number(yaw) || 0, -0.32, 0.32),
        THREE.MathUtils.clamp(Number(pitch) || 0, -0.2, 0.2),
      );
      return true;
    }

    function launchBazooka(seed = 1) {
      if (!bazookaAvailable || !bazooka || !rocket || !bazookaMuzzle || rocketFlight || bazookaOverlayAwaiting) return false;
      modelPivot.updateWorldMatrix(true, true);
      const start = localPositionFor(bazookaMuzzle);
      const exhaust = localPositionFor(bazookaExhaust);
      const direction = start.clone().sub(exhaust).normalize();
      const muzzleNdc = bazookaMuzzle.getWorldPosition(new THREE.Vector3()).project(camera);
      const canvasRect = canvas.getBoundingClientRect();
      stage.dataset.troyBazookaMuzzleX = String(canvasRect.left + (muzzleNdc.x + 1) * canvasRect.width / 2);
      stage.dataset.troyBazookaMuzzleY = String(canvasRect.top + (1 - muzzleNdc.y) * canvasRect.height / 2);
      rocket.position.copy(start);
      rocket.scale.copy(rocketRestScale || rocket.scale);
      rocket.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
      rocket.visible = true;
      rocketFlight = {
        start,
        direction,
        startedAt: performance.now(),
        duration: 320,
      };
      bazookaOverlayAwaiting = true;
      flash.position.copy(start);
      flash.scale.setScalar(size.y * 0.38);
      flash.visible = true;
      flash.material.opacity = 1;
      flashUntil = performance.now() + 230;
      fireCore.position.copy(start);
      fireCore.scale.setScalar(size.y * 0.13);
      fireCore.material.opacity = 1;
      fireCore.visible = true;
      fireCore.userData.startedAt = performance.now();
      fireCore.userData.until = performance.now() + 210;
      fireCore.userData.baseScale = size.y * 0.13;
      exhaustUntil = performance.now() + 1_100;
      lastSmokeAt = Number.NEGATIVE_INFINITY;
      bazookaRecoilUntil = performance.now() + 180;
      for (let index = 0; index < 8; index += 1) {
        const angle = index * 2.399963;
        spawnSmoke(
          start,
          new THREE.Vector3(Math.cos(angle) * 0.05, 0.11 + Math.sin(angle) * 0.035, 0.2).multiplyScalar(size.y),
          0.75 + (index % 3) * 0.12,
          0.06 + (index % 3) * 0.01,
        );
      }
      stage.dataset.troyRocket = "flight";
      tailSpring.impulse(-0.22, 0);
      return true;
    }

    function completeBazookaFlight() {
      if (!bazookaOverlayAwaiting || ghostState.current() === "pixelScattered") return false;
      const timestamp = performance.now();
      const impact = new THREE.Vector3(0, size.y * BAZOOKA_EFFECTS.impactTargetY, size.z * 0.04);
      bazookaOverlayAwaiting = false;
      rocketFlight = null;
      rocket.position.copy(impact);
      rocket.scale.copy(rocketRestScale || rocket.scale).multiplyScalar(1.42);
      rocket.visible = true;
      bazookaImpact = {
        startedAt: timestamp,
        impact,
        exploded: false,
        lastSparkAt: Number.NEGATIVE_INFINITY,
      };
      flash.position.copy(impact);
      flash.scale.setScalar(size.y * 0.32);
      flash.visible = true;
      flash.material.opacity = 1;
      flashUntil = timestamp + 320;
      fireCore.position.copy(impact);
      fireCore.scale.setScalar(size.y * 0.09);
      fireCore.material.opacity = 1;
      fireCore.visible = true;
      fireCore.userData.startedAt = timestamp;
      fireCore.userData.until = timestamp + 300;
      fireCore.userData.baseScale = size.y * 0.09;
      for (let index = 0; index < 18; index += 1) {
        const angle = index * 2.399963;
        const speed = 0.19 + (index % 6) * 0.035;
        spawnSmoke(
          impact,
          new THREE.Vector3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            ((index % 3) - 1) * 0.12,
          ).multiplyScalar(size.y),
          0.24 + (index % 4) * 0.045,
          0.012 + (index % 3) * 0.007,
          index % 3 === 0 ? 0xffb02e : 0xff251c,
        );
      }
      stage.dataset.troyRocket = "contact";
      stage.dataset.troyPropImpact = "bazooka-contact";
      setExpression("Surprised");
      tailSpring.impulse(-0.3, 0.18);
      return true;
    }

    function explodeBazookaImpact(timestamp, impactState, motion) {
      if (impactState.exploded) return;
      impactState.exploded = true;
      rocket.visible = false;
      rocket.scale.copy(rocketRestScale || rocket.scale);
      flash.position.copy(impactState.impact);
      flash.scale.setScalar(size.y * 0.82);
      flash.visible = true;
      flash.material.opacity = 1;
      flashUntil = timestamp + 480;
      fireCore.position.copy(impactState.impact);
      fireCore.scale.setScalar(size.y * 0.22);
      fireCore.material.opacity = 1;
      fireCore.visible = true;
      fireCore.userData.startedAt = timestamp;
      fireCore.userData.until = timestamp + 440;
      fireCore.userData.baseScale = size.y * 0.22;
      for (let index = 0; index < 34; index += 1) {
        const angle = index * 2.399963;
        const speed = 0.16 + (index % 7) * 0.034;
        spawnSmoke(
          impactState.impact,
          new THREE.Vector3(
            Math.cos(angle) * speed,
            0.05 + Math.sin(angle) * speed * 0.72,
            ((index % 3) - 1) * 0.09,
          ).multiplyScalar(size.y),
          0.72 + (index % 5) * 0.12,
          0.052 + (index % 4) * 0.023,
          index % 5 === 0 ? 0xff241b : null,
        );
      }
      stage.dataset.troyRocket = "impact";
      stage.dataset.troyPropImpact = "bazooka-explosion";
      setExpression("Angry");
      tailSpring.impulse(-0.72, 0.48);
      window.clearTimeout(bazookaImpactCleanupTimer);
      bazookaImpactCleanupTimer = window.setTimeout(() => {
        if (stage.dataset.troyPropImpact === "bazooka-explosion") delete stage.dataset.troyPropImpact;
      }, 620);
      scatterPixels({ hideModel: motion.hideModel });
      bazookaImpact = null;
    }

    function updateAim(delta) {
      const isBazookaSelected = stage.dataset.troyTool === "bazooka";
      const blend = 1 - Math.exp(-10 * delta);
      const pointerAim = bazookaPointerLookForState(stage.dataset.troyState, {
        yaw: targetAim.x,
        pitch: targetAim.y,
      });
      resolvedBazookaAim.set(pointerAim.yaw, pointerAim.pitch);
      currentAim.lerp(isBazookaSelected ? resolvedBazookaAim : neutralLook, blend);
      currentLook.lerp(canTrackPointer(stage.dataset.troyState) ? targetLook : neutralLook, blend);
      const activeLook = isBazookaSelected ? currentAim : currentLook;
      const spineAim = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(activeLook.y * 0.35, activeLook.x * 0.35, 0, "YXZ"),
      );
      const headAim = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(activeLook.y * 0.72, activeLook.x * 0.82, 0, "YXZ"),
      );
      spine?.quaternion.multiply(spineAim);
      head?.quaternion.multiply(headAim);

      rocketLook = smoothRocketLook(rocketLook, stage.dataset.troyRocketPhase, delta);
      if (rocketLook > 0.0001) {
        spine?.quaternion.multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-rocketLook * 0.35, 0, 0, "XYZ")),
        );
        head?.quaternion.multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-rocketLook, 0, 0, "XYZ")),
        );
      }

      if (!bazookaAvailable || !bazooka) return;
      bazooka.visible = isBazookaSelected && stage.dataset.troyState !== "pixelScattered";
      const timestamp = performance.now();
      const liftElapsed = bazookaLiftStartedAt === null ? Number.POSITIVE_INFINITY : timestamp - bazookaLiftStartedAt;
      const launchLift = bazookaLiftAt(liftElapsed);
      const aimedQuaternion = bazookaRest.clone().multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(currentAim.y * 0.45, currentAim.x * 0.45, 0, "YXZ"),
        ),
      );
      if (launchLift > 0 && bazookaMuzzle && bazooka.parent) {
        const launchVector = bazookaLaunchDirection();
        const launchDirection = new THREE.Vector3(launchVector.x, launchVector.y, launchVector.z);
        const barrelAxis = bazookaBarrelAxis();
        const desiredWorld = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(barrelAxis.x, barrelAxis.y, barrelAxis.z),
          launchDirection,
        );
        const parentWorld = bazooka.parent.getWorldQuaternion(new THREE.Quaternion());
        const desiredLocal = parentWorld.invert().multiply(desiredWorld);
        aimedQuaternion.slerp(desiredLocal, launchLift);
      }
      bazooka.quaternion.copy(aimedQuaternion);
      if (liftElapsed >= 1_400) bazookaLiftStartedAt = null;

      const recoil = THREE.MathUtils.clamp((bazookaRecoilUntil - timestamp) / 180, 0, 1);
      bazooka.position.copy(bazookaRestPosition);
      bazooka.position.z += recoil * size.y * 0.065;
      const headClearance = bazookaHeadClearanceOffset(liftElapsed);
      if (headClearance !== 0 && bazooka.parent) {
        const parentWorld = bazooka.parent.getWorldQuaternion(new THREE.Quaternion());
        const localClearance = new THREE.Vector3(headClearance * size.y, 0, 0)
          .applyQuaternion(parentWorld.invert());
        bazooka.position.add(localClearance);
      }
      bazooka.rotation.x += recoil * 0.08;
    }

    function updateBazooka(timestamp, delta) {
      if (flash.visible && timestamp >= flashUntil) flash.visible = false;
      if (flash.visible) {
        flash.material.opacity = THREE.MathUtils.clamp((flashUntil - timestamp) / 180, 0.12, 1);
      }
      if (fireCore.visible) {
        const startedAt = fireCore.userData.startedAt || timestamp;
        const until = fireCore.userData.until || timestamp;
        const progress = THREE.MathUtils.clamp((timestamp - startedAt) / Math.max(1, until - startedAt), 0, 1);
        if (progress >= 1) fireCore.visible = false;
        else {
          fireCore.scale.setScalar((fireCore.userData.baseScale || size.y * 0.13) * (1 + progress * 0.9));
          fireCore.material.opacity = 1 - progress;
        }
      }
      if (bazookaAvailable && bazookaExhaust && timestamp < exhaustUntil && timestamp - lastSmokeAt >= 30) {
        lastSmokeAt = timestamp;
        const exhaust = localPositionFor(bazookaExhaust);
        spawnSmoke(exhaust, new THREE.Vector3(0, 0.13, 0.36).multiplyScalar(size.y), 0.92, 0.09);
      }

      if (rocketFlight && rocket) {
        const progress = (timestamp - rocketFlight.startedAt) / rocketFlight.duration;
        const depth = THREE.MathUtils.clamp(progress, 0, 1);
        rocket.position.copy(rocketFlight.start).addScaledVector(rocketFlight.direction, depth * size.y * 0.38);
        rocket.scale.copy(rocketRestScale || rocket.scale).multiplyScalar(1 + depth * 0.7);
        if (timestamp - lastSmokeAt >= 32) {
          lastSmokeAt = timestamp;
          spawnSmoke(rocket.position, new THREE.Vector3(0, 0.05, -0.16).multiplyScalar(size.y), 0.8, 0.07);
        }
        if (progress >= 1) {
          rocket.visible = false;
          rocketFlight = null;
        }
      }

      if (bazookaImpact) {
        const motion = bazookaImpactAt(timestamp - bazookaImpact.startedAt);
        const recoil = motion.recoil;
        spine?.quaternion.multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-recoil * 0.34, 0, recoil * 0.04, "XYZ")),
        );
        head?.quaternion.multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-recoil * 0.22, 0, -recoil * 0.06, "XYZ")),
        );
        stage.dataset.troyImpactPhase = motion.phase;
        if (!motion.explode && timestamp - bazookaImpact.lastSparkAt >= 54) {
          bazookaImpact.lastSparkAt = timestamp;
          const angle = timestamp * 0.027;
          spawnSmoke(
            bazookaImpact.impact,
            new THREE.Vector3(Math.cos(angle) * 0.24, Math.sin(angle) * 0.24, 0.06).multiplyScalar(size.y),
            0.24,
            0.016 + motion.sparkIntensity * 0.01,
            0xff2a1f,
          );
        }
        if (motion.explode) explodeBazookaImpact(timestamp, bazookaImpact, motion);
      }

      for (const sprite of smokePool) {
        if (!sprite.visible) continue;
        sprite.userData.life -= delta;
        if (sprite.userData.life <= 0) {
          sprite.visible = false;
          sprite.material.opacity = 0;
          continue;
        }
        sprite.position.addScaledVector(sprite.userData.velocity, delta);
        sprite.scale.multiplyScalar(1 + delta * 0.45);
        sprite.material.opacity = 0.68 * (sprite.userData.life / sprite.userData.maxLife);
      }
    }

    function updateThreatGesture() {
      if (stage.dataset.troyState !== "threat") return;
      const motion = threatGestureAt(currentAction?.time ?? 0);
      if (!guardArm.hand || !guardArm.forearm || motion.pose <= 0.001) return;
      guardArm.forearm.quaternion.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, motion.wag * 0.22, motion.wag * 0.28, "XYZ"),
        ),
      );
      guardArm.hand.quaternion.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, motion.wag * 0.35, motion.wag, "XYZ"),
        ),
      );
    }

    function updateTail(timestamp, delta) {
      if (stage.dataset.troyState === "pixelScattered") return;
      const pose = tailSpring.step(delta);
      tailBones.forEach((bone, index) => {
        const weight = tailWeights[index];
        bone.quaternion.copy(tailRest[index].quaternion).multiply(
          new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
              tailBalance[index].x + pose.bendX * weight,
              tailBalance[index].y,
              tailBalance[index].z + pose.bendZ * weight,
              "XYZ",
            ),
          ),
        );
        bone.scale.copy(tailRest[index].scale);
        if (index < 2) bone.scale.y *= 1 - Math.max(0, pose.compression) * (index === 0 ? 0.48 : 0.28);
      });
      const idleLift = tailSpring.idleLift(timestamp / 1000);
      modelPivot.position.y = size.y * (0.07 + idleLift + pose.bodyLift);
    }

    function bendWhip(elapsed, caught) {
      if (elapsed - lastWhipGeometryAt < 1 / 45) return whipMotionAt(elapsed, caught);
      lastWhipGeometryAt = elapsed;
      const motion = whipMotionAt(elapsed, caught);
      const points = motion.points.map((point) => new THREE.Vector3(
        point.x * size.x,
        point.y * size.y,
        size.z * (point.z ?? 0.5) + 0.38,
      ));
      const curve = new THREE.CatmullRomCurve3(points.slice(1));
      const line = whip.getObjectByName("TroyInteractionWhipLine");
      if (line?.isMesh) {
        const previousGeometry = line.geometry;
        line.geometry = new THREE.TubeGeometry(curve, 48, size.y * 0.015, 8, false);
        previousGeometry.dispose();
      }
      const handle = whip.getObjectByName("TroyInteractionWhipHandle");
      if (handle?.isMesh) {
        const start = points[0];
        const end = points[1];
        const direction = end.clone().sub(start);
        handle.position.copy(start).add(end).multiplyScalar(0.5);
        handle.scale.set(1, Math.max(direction.length(), size.y * 0.16), 1);
        handle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
      }
      return motion;
    }

    function pointBoneAt(bone, child, targetWorld, strength) {
      if (!bone || !child || strength <= 0) return;
      bone.updateWorldMatrix(true, true);
      const bonePosition = bone.getWorldPosition(new THREE.Vector3());
      const childPosition = child.getWorldPosition(new THREE.Vector3());
      const currentDirection = childPosition.sub(bonePosition).normalize();
      const targetDirection = targetWorld.clone().sub(bonePosition).normalize();
      if (currentDirection.lengthSq() === 0 || targetDirection.lengthSq() === 0) return;

      const worldRotation = new THREE.Quaternion().setFromUnitVectors(currentDirection, targetDirection);
      const desiredWorld = worldRotation.multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
      const parentWorldInverse = bone.parent
        .getWorldQuaternion(new THREE.Quaternion())
        .invert();
      const desiredLocal = parentWorldInverse.multiply(desiredWorld);
      bone.quaternion.slerp(desiredLocal, THREE.MathUtils.clamp(strength, 0, 1));
      bone.updateWorldMatrix(true, true);
    }

    function poseGuardArm(motion) {
      const { upper, forearm, hand } = guardArm;
      if (!upper || !forearm || !hand || motion.pose <= 0.001) return;

      modelPivot.updateWorldMatrix(true, true);
      const pivotRotation = modelPivot.getWorldQuaternion(new THREE.Quaternion());
      const shoulder = upper.getWorldPosition(new THREE.Vector3());
      const elbowTarget = shoulder.clone().add(
        new THREE.Vector3(
          motion.elbow.x * size.x,
          motion.elbow.y * size.y,
          motion.elbow.z * size.y,
        ).applyQuaternion(pivotRotation),
      );
      const handTarget = shoulder.clone().add(
        new THREE.Vector3(
          motion.hand.x * size.x,
          motion.hand.y * size.y,
          motion.hand.z * size.y,
        ).applyQuaternion(pivotRotation),
      );

      pointBoneAt(upper, forearm, elbowTarget, motion.pose);
      pointBoneAt(forearm, hand, handTarget, motion.pose);

      hand.updateWorldMatrix(true, true);
    }

    function clearEffect() {
      effectState = null;
      whip.visible = false;
      delete stage.dataset.troyPhysicalEffect;
      delete stage.dataset.troyPropImpact;
    }

    function playEffect(name) {
      clearEffect();
      if (!["whipCrack", "whipCaught", "pokeGuard"].includes(name)) return false;
      effectState = { name, startedAt: performance.now(), tailImpulseApplied: false };
      lastWhipGeometryAt = Number.NEGATIVE_INFINITY;
      whip.visible = name.startsWith("whip");
      stage.dataset.troyPhysicalEffect = name;
      return true;
    }

    function updateEffect(timestamp) {
      if (!effectState) return;
      const { name, startedAt } = effectState;
      const elapsed = (timestamp - startedAt) / 1000;
      if (name.startsWith("whip")) {
        const caught = name === "whipCaught";
        const motion = bendWhip(elapsed, caught);
        if (caught) {
          const guard = guardMotionAt(elapsed);
          poseGuardArm(guard);
          stage.dataset.troyPropImpact = guard.pose > 0.28 ? "whip-caught" : "whip-catch-ready";
          if (!effectState.tailImpulseApplied && elapsed >= 0.18) {
            effectState.tailImpulseApplied = true;
            tailSpring.impulse(-0.36, 0.24);
          }
        }
        else if (motion.impact) {
          stage.dataset.troyPropImpact = "whip";
          if (!effectState.tailImpulseApplied) {
            effectState.tailImpulseApplied = true;
            tailImpulseSeed += 1;
            const angle = tailImpulseSeed * 2.399963;
            tailSpring.impulse(
              Math.cos(angle) * 0.9,
              Math.sin(angle) * 0.65,
            );
          }
        }
        else delete stage.dataset.troyPropImpact;
        if (motion.finished) clearEffect();
        return;
      }
      if (name === "pokeGuard") {
        const motion = guardMotionAt(elapsed);
        const pose = motion.pose;
        poseGuardArm(motion);
        spine?.quaternion.multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.24 * pose, 0, -0.08 * pose, "XYZ")),
        );
        head?.quaternion.multiply(
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2 * pose, 0.12 * pose, 0.08 * pose, "XYZ")),
        );
        stage.dataset.troyPropImpact = pose > 0.28 ? "poke-guard" : "poke-guard-ready";
        if (!effectState.tailImpulseApplied && elapsed >= 0.12) {
          effectState.tailImpulseApplied = true;
          tailSpring.impulse(-0.54, 0.36);
        }
        if (motion.finished) clearEffect();
      }
    }

    function finishPending(value) {
      if (!pendingCompletion) return;
      pendingCompletion.resolve(value);
      pendingCompletion = null;
    }

    mixer.addEventListener("finished", ({ action }) => {
      if (pendingCompletion?.action !== action) return;
      finishPending(true);
    });

    function playState(state) {
      if (shouldLockPointerPose(state)) resetPointer({ immediate: true });
      if (!shouldFreezeCurrentClip(state)) heldBazookaPose = null;
      const stableBazookaFire = state === "bazookaFire";
      if (stableBazookaFire) bazookaLiftStartedAt = performance.now();
      const visualState = stableBazookaFire ? "bazookaAim" : state;
      const clipName = clipNameForState(visualState);
      const nextAction = actions.get(clipName);
      if (!nextAction) {
        if (shouldFreezeCurrentClip(visualState) && currentAction) {
          currentAction.paused = false;
          currentAction.setEffectiveTimeScale(0);
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      }
      if (stableBazookaFire) {
        finishPending(false);
        nextAction.enabled = true;
        nextAction.reset();
        nextAction.setEffectiveTimeScale(0);
        nextAction.setEffectiveWeight(1);
        nextAction.setLoop(THREE.LoopRepeat, Infinity);
        nextAction.play();
        nextAction.time = 0;
        nextAction.paused = false;
        mixer.update(0);
        captureBazookaPose();
        currentAction = nextAction;
        stage.dataset.troyClip = clipName;
        stage.dataset.troyClipDuration = nextAction.getClip().duration.toFixed(3);
        stage.dataset.troyActionTime = "0.000";
        return new Promise((resolve) => window.setTimeout(() => resolve(true), 190));
      }
      nextAction.paused = false;
      if (nextAction === currentAction && isLoopingState(visualState)) {
        if (shouldRestartLoopingAction(visualState, nextAction.getEffectiveTimeScale())) {
          nextAction.reset();
          nextAction.setEffectiveTimeScale(playbackRateForState(visualState));
          nextAction.setEffectiveWeight(1);
          nextAction.play();
          mixer.update(0);
        }
        return Promise.resolve(true);
      }

      finishPending(false);
      nextAction.enabled = true;
      nextAction.reset();
      nextAction.setEffectiveTimeScale(playbackRateForState(visualState));
      nextAction.setEffectiveWeight(1);
      nextAction.clampWhenFinished = !isLoopingState(visualState);
      nextAction.setLoop(
        isLoopingState(visualState) ? THREE.LoopRepeat : THREE.LoopOnce,
        isLoopingState(visualState) ? Infinity : 1,
      );
      nextAction.play();

      if (currentAction && currentAction !== nextAction) {
        nextAction.crossFadeFrom(currentAction, CROSS_FADE_SECONDS, true);
      }
      currentAction = nextAction;
      stage.dataset.troyClip = clipName;
      stage.dataset.troyClipDuration = nextAction.getClip().duration.toFixed(3);
      stage.dataset.troyActionTime = "0.000";

      if (isLoopingState(visualState)) {
        return Promise.resolve(true);
      }
      return new Promise((resolve) => {
        pendingCompletion = { action: nextAction, resolve };
      });
    }

    function setExpression(name = null) {
      if (name !== null && !REQUIRED_EXPRESSIONS.includes(name)) return false;
      targetExpression = name;
      stage.dataset.troyExpression = name || "neutral";
      return true;
    }

    let isIntersecting = true;
    let isRendering = false;
    let firstFrame = true;
    let diagnosticsElapsed = 0;
    let lastFrameTime = null;
    let lastRenderedAt = 0;
    const targetRotation = new THREE.Vector2();

    function renderFrame(timestamp) {
      if (document.hidden || !isIntersecting) {
        pauseRendering();
        return;
      }

      const pivotTarget = canTrackPointer(stage.dataset.troyState) ? targetRotation : neutralLook;
      modelPivot.rotation.y += (pivotTarget.x - modelPivot.rotation.y) * 0.055;
      modelPivot.rotation.x += (pivotTarget.y - modelPivot.rotation.x) * 0.055;
      const delta = lastFrameTime === null
        ? 0
        : Math.min(Math.max(0, (timestamp - lastFrameTime) / 1000), 0.3);
      lastFrameTime = timestamp;
      lastRenderedAt = timestamp;
      mixer.update(delta);
      if (shouldFreezeCurrentClip(stage.dataset.troyState)) restoreBazookaPose();
      updateAim(delta);
      updateThreatGesture();
      updateTail(timestamp, delta);
      updateEffect(timestamp);
      updateBazooka(timestamp, delta);
      updatePixelGhost(timestamp, delta);
      const expressionBlend = 1 - Math.exp(-EXPRESSION_BLEND_SPEED * delta);
      for (const { mesh, indices } of expressionBindings) {
        for (const [name, index] of indices) {
          const target = name === targetExpression ? 1 : 0;
          const current = mesh.morphTargetInfluences[index] || 0;
          mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            current,
            target,
            expressionBlend,
          );
        }
      }
      diagnosticsElapsed += delta;
      if (diagnosticsElapsed >= 0.25) {
        diagnosticsElapsed = 0;
        stage.dataset.troyActionTime = (currentAction?.time ?? 0).toFixed(3);
      }
      renderer.render(scene, camera);

      if (firstFrame) {
        firstFrame = false;
        stage.dataset.troyRenderer = "ready";
        stage.dispatchEvent(
          new CustomEvent("troy:renderer-ready", { detail: { clips: [...clipsByName.keys()] } }),
        );
      }
    }

    function resumeRendering() {
      if (document.hidden || !isIntersecting || isRendering) return;
      isRendering = true;
      lastFrameTime = null;
      lastRenderedAt = performance.now();
      renderer.setAnimationLoop(renderFrame);
    }

    function pauseRendering() {
      if (!isRendering) return;
      renderer.setAnimationLoop(null);
      isRendering = false;
      lastFrameTime = null;
      lastRenderedAt = 0;
    }

    function resize() {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setPixelRatio(cappedPixelRatio(width, height));
      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const distance = cameraDistanceForBounds({
        width: size.x,
        height: size.y,
        aspect: camera.aspect,
        verticalFovRadians: verticalFov,
      });
      const targetHeight = cameraTargetHeight(size.y);
      camera.position.set(0, targetHeight, Math.max(1.7, distance));
      camera.lookAt(0, targetHeight, 0);
      camera.updateProjectionMatrix();
    }

    function onPointerMove(event) {
      if (event.pointerType === "touch") return;
      if (pointerInputModeForState(stage.dataset.troyState) !== "track") return;
      const canvasRect = canvas.getBoundingClientRect();
      const pointerFocus = pointerFocusFromCanvasRect(canvasRect);
      const look = pointerLookFromAnchor(
        event.clientX,
        event.clientY,
        pointerFocus.x,
        pointerFocus.y,
        window.innerWidth,
        window.innerHeight,
      );
      targetLook.set(look.yaw, look.pitch);
      targetRotation.set(look.yaw * 0.3, look.pitch * 0.12);
    }

    function resetPointer({ immediate = false } = {}) {
      targetRotation.set(0, 0);
      targetAim.set(0, 0);
      targetLook.set(0, 0);
      if (!immediate) return;
      currentAim.set(0, 0);
      currentLook.set(0, 0);
      resolvedBazookaAim.set(0, 0);
      modelPivot.rotation.x = 0;
      modelPivot.rotation.y = 0;
    }

    function onVisibilityChange() {
      if (document.hidden) pauseRendering();
      else resumeRendering();
    }

    function setGhostHover() {
      ghostHover = true;
    }

    function clearGhostHover() {
      ghostHover = false;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) resumeRendering();
      else pauseRendering();
    }, { rootMargin: "80px" });
    intersectionObserver.observe(stage);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);
    pixelTarget?.addEventListener("pointerenter", setGhostHover);
    pixelTarget?.addEventListener("pointerleave", clearGhostHover);
    pixelTarget?.addEventListener("focus", setGhostHover);
    pixelTarget?.addEventListener("blur", clearGhostHover);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Some browsers heavily throttle animation frames in an unfocused but still
    // visible window. This low-frequency watchdog only draws when rAF has stalled.
    const renderWatchdog = window.setInterval(() => {
      const now = performance.now();
      if (isRendering && !document.hidden && isIntersecting && now - lastRenderedAt > 240) {
        renderFrame(now);
      }
    }, 250);

    resize();
    setExpression(null);
    await playState("idle");
    resumeRendering();

    const controller = {
      ready: true,
      playState,
      setExpression,
      playEffect,
      setAim,
      launchBazooka,
      completeBazookaFlight,
      reformPixels,
      clearEffect,
      debug() {
        return {
          ready: true,
          mixerTime: mixer.time,
          clip: currentAction?.getClip().name || null,
          actionTime: currentAction?.time ?? null,
          duration: currentAction?.getClip().duration ?? null,
          effectiveTimeScale: currentAction?.getEffectiveTimeScale() ?? null,
          paused: currentAction?.paused ?? null,
          running: currentAction?.isRunning() ?? null,
          expression: targetExpression,
          physicalEffect: effectState?.name || null,
          bazookaAvailable,
          rocketFlight: Boolean(rocketFlight),
          particleCount,
          pixelState: ghostState.current(),
          generatedWhip: whipUsesGeneratedAsset,
          documentHidden: document.hidden,
          isIntersecting,
          isRendering,
        };
      },
      dispose() {
        finishPending(false);
        pauseRendering();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("blur", resetPointer);
        pixelTarget?.removeEventListener("pointerenter", setGhostHover);
        pixelTarget?.removeEventListener("pointerleave", clearGhostHover);
        pixelTarget?.removeEventListener("focus", setGhostHover);
        pixelTarget?.removeEventListener("blur", clearGhostHover);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        window.clearInterval(renderWatchdog);
        window.clearTimeout(ghostFallbackTimer);
        window.clearTimeout(bazookaImpactCleanupTimer);
        mixer.stopAllAction();
        clearEffect();
        bazooka?.traverse((object) => {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) material?.dispose();
        });
        rocket?.traverse((object) => {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) material?.dispose();
        });
        whip.traverse((object) => {
          object.geometry?.dispose();
          object.material?.dispose();
        });
        for (const sprite of smokePool) sprite.material.dispose();
        flashMaterial.dispose();
        flashTexture.dispose();
        smokeTexture.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
      },
    };
    return controller;
  } catch (error) {
    renderer?.dispose();
    console.warn("Troy 3D poster fallback active:", error);
    return fallbackController(stage, "webgl-or-model-error");
  }
}
