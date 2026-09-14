# Troy Bazooka, Pixel Ghost, and Tail-Spring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Troy's slap with an aimable self-defeating bazooka, keep him as an interactive talking pixel cloud until clicked, and make his five-bone tail act as his spring-loaded support.

**Architecture:** Tripo creates separate bazooka and rocket meshes; Blender normalizes those props and expands Troy's rig and clips; browser-independent JavaScript modules compute aiming, seeded rocket flight, pixel-state transitions, and tail physics; the Three.js renderer owns visual integration. Existing controller/copy/state modules remain the orchestration boundary.

**Tech Stack:** Static HTML/CSS, ES modules, Three.js 0.185.1, binary GLB, Blender 5.2 Python, Node.js built-in test runner, Codex in-app browser.

**Spec:** `docs/superpowers/specs/2026-09-07-troy-bazooka-pixel-tail-design.md`

## Global Constraints

- Do not commit, push, or deploy; the user will authorize publishing only after the whole site is approved.
- Keep Turkish and English behavior structurally identical and copy localized.
- Preserve poke, whip, facial morphs, dialogue particles, accessibility, social links, and poster fallback.
- Remove slap from controls, copy, action/state contracts, renderer loading, and tests.
- The scattered state has no automatic reformation timer; only clicking/tapping the particle cloud reforms Troy.
- Reduced-motion and data-saver visitors must keep a non-blocking simple fallback.
- Keep each GLB under 5 MB and the Troy character GLB under 6 MB.

## File Map

- `../troyapps-3d-work/optimize_bazooka_props_for_web.py`: normalize, decimate, texture-limit, and export the two Tripo props.
- `../troyapps-3d-work/inspect_tail_topology.py`: identify the tail vertex island and emit a deterministic audit.
- `../troyapps-3d-work/build_tail_bazooka_rig.py`: add tail bones/weights and the two bazooka clips while preserving existing morphs/clips.
- `assets/models/troy/bazooka.glb`: optimized held weapon.
- `assets/models/troy/rocket.glb`: optimized projectile.
- `assets/models/troy/troy.glb`: revised eleven-clip Troy model with `Tail01` through `Tail05`.
- `assets/js/troy/troy-bazooka-motion.js`: pure cursor clamp and seeded rocket route functions.
- `assets/js/troy/troy-pixel-ghost.js`: pure scattered/reforming state and escalating dialogue schedule.
- `assets/js/troy/troy-tail-spring.js`: pure damped spring simulation.
- `assets/js/troy/troy-renderer-contract.js`: browser-independent renderer constants shared by tests and Three.js integration.
- `assets/js/troy/troy-props.js`: public prop URLs and scale metadata.
- `assets/js/troy/troy-actions.js`: `bazooka` action and reaction contract; no slap.
- `assets/js/troy/troy-state.js`: bazooka, rocket, scattered, and reformation transitions.
- `assets/js/troy/troy-clips.js`: two new Blender clip mappings.
- `assets/js/troy/troy-copy.js`: localized bazooka and pixel-ghost lines.
- `assets/js/troy/troy-controller.js`: DOM events and state orchestration.
- `assets/js/troy/troy-three.js`: visual integration only; delegates calculations to pure modules.
- `assets/css/home-v2.css`: bazooka cursor, smoke/flash fallback, scattered hit target, reduced-motion styling.
- `index.html`, `en/index.html`: renamed bazooka control and particle-cloud target markup.
- `tests/troy-bazooka-motion.test.mjs`: aim and route behavior.
- `tests/troy-pixel-ghost.test.mjs`: indefinite scattering, click reformation, dialogue escalation.
- `tests/troy-tail-spring.test.mjs`: spring impulses and settling.
- Existing Troy tests: updated contracts and regression coverage.

---

### Task 1: Generate and Normalize Bazooka Props

**Files:**
- Create: `../troyapps-3d-work/source/troy-bazooka-raw.glb`
- Create: `../troyapps-3d-work/source/troy-rocket-raw.glb`
- Create: `../troyapps-3d-work/optimize_bazooka_props_for_web.py`
- Create: `assets/models/troy/bazooka.glb`
- Create: `assets/models/troy/rocket.glb`
- Modify: `assets/js/troy/troy-props.js`
- Test: `tests/troy-prop-assets.test.mjs`

**Interfaces:**
- Produces: `TROY_PROP_MODELS.bazooka` and `TROY_PROP_MODELS.rocket`, each a local versioned URL.
- Produces: normalized bazooka forward axis `-Z`, grip origin `(0,0,0)`, rocket forward axis `-Z`.

- [ ] **Step 1: Replace the hand-prop expectation with bazooka and rocket expectations**

```js
assert.deepEqual(Object.keys(propModels).sort(), ["bazooka", "rocket", "whip"]);
assert.match(propModels.bazooka, /^\/assets\/models\/troy\/bazooka\.glb\?v=/);
assert.match(propModels.rocket, /^\/assets\/models\/troy\/rocket\.glb\?v=/);
assert.doesNotMatch(JSON.stringify(propModels), /hand\.glb|slapHand/);
```

- [ ] **Step 2: Run the asset contract and verify RED**

Run: `node --test tests\troy-prop-assets.test.mjs`

Expected: FAIL because `bazooka` and `rocket` are absent and `slapHand` still exists.

- [ ] **Step 3: Generate the bazooka in Tripo using this exact prompt**

```text
Single stylized cartoon shoulder bazooka prop for a mischievous small red devil mascot, chunky compact proportions, matte black forged metal body, deep red accent bands, large open muzzle, visible shoulder rest, two hand grips, rear exhaust cone, subtle worn edges, premium game-ready PBR texture, isolated object centered on a neutral background. No character, no hands, no rocket, no smoke, no fire, no text, no logo, no stand, no floor, no environment.
```

Use the user's signed-in Tripo session. Generate one model, inspect the preview, download GLB, and save it exactly as `../troyapps-3d-work/source/troy-bazooka-raw.glb`.

- [ ] **Step 4: Generate the rocket in Tripo using this exact prompt**

```text
Single stylized cartoon bazooka rocket projectile matching a black and red mischievous devil mascot, compact pointed warhead, matte black metal shell, deep red nose and fin accents, four clear rear fins, visible exhaust nozzle, premium game-ready PBR texture, isolated object centered on a neutral background. No launcher, no character, no hands, no smoke, no fire, no text, no logo, no stand, no floor, no environment.
```

Download GLB to `../troyapps-3d-work/source/troy-rocket-raw.glb`.

- [ ] **Step 5: Create the Blender normalization script**

Implement these exact entry points in `optimize_bazooka_props_for_web.py`:

```python
import math
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parent
ASSETS = {
    "bazooka": (ROOT / "source" / "troy-bazooka-raw.glb", ROOT / "output" / "troy-bazooka-web.glb", 32000),
    "rocket": (ROOT / "source" / "troy-rocket-raw.glb", ROOT / "output" / "troy-rocket-web.glb", 12000),
}
MAX_TEXTURE_SIZE = 1024

def optimize_asset(name, source, output, target_triangles):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source))
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"{name}: no mesh in {source}")
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    root = bpy.context.active_object
    root.name = "TroyBazooka" if name == "bazooka" else "TroyRocket"
    longest_axis = max(range(3), key=lambda axis: root.dimensions[axis])
    if longest_axis == 0:
        root.rotation_euler.y = math.radians(-90)
    elif longest_axis == 1:
        root.rotation_euler.x = math.radians(90)
    triangles = len(root.data.polygons)
    if triangles > target_triangles:
        modifier = root.modifiers.new(name="WebDecimate", type="DECIMATE")
        modifier.ratio = target_triangles / triangles
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for image in bpy.data.images:
        scale = min(1.0, MAX_TEXTURE_SIZE / max(image.size[0], image.size[1]))
        if scale < 1.0:
            image.scale(round(image.size[0] * scale), round(image.size[1] * scale))
    if name == "bazooka":
        length = root.dimensions.z
        for empty_name, z in (("BazookaGrip", 0.0), ("BazookaMuzzle", -length / 2), ("BazookaExhaust", length / 2)):
            empty = bpy.data.objects.new(empty_name, None)
            empty.location = (0.0, 0.0, z)
            empty.parent = root
            bpy.context.collection.objects.link(empty)
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB", export_animations=False)
```

Replace the shown function body with Blender operations following the existing hand/whip optimizers. Name the exported root objects `TroyBazooka` and `TroyRocket`; add bazooka empties `BazookaGrip`, `BazookaMuzzle`, and `BazookaExhaust` before export.

- [ ] **Step 6: Run Blender normalization and copy verified outputs**

Run:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python .\optimize_bazooka_props_for_web.py
Copy-Item -LiteralPath '.\output\troy-bazooka-web.glb' -Destination '..\troyapps.github.io\assets\models\troy\bazooka.glb' -Force
Copy-Item -LiteralPath '.\output\troy-rocket-web.glb' -Destination '..\troyapps.github.io\assets\models\troy\rocket.glb' -Force
```

Expected script output: both assets report a GLB path, triangle count below their target, texture maximum 1024, and size between 100 KB and 5 MB.

- [ ] **Step 7: Update the prop manifest and verify GREEN**

```js
export const TROY_PROP_MODELS = Object.freeze({
  bazooka: "/assets/models/troy/bazooka.glb?v=20260907-bazooka1",
  rocket: "/assets/models/troy/rocket.glb?v=20260907-bazooka1",
  whip: "/assets/models/troy/whip.glb?v=20260906-prop2",
});
```

Run: `node --test tests\troy-prop-assets.test.mjs`

Expected: PASS.

- [ ] **Step 8: Record the uncommitted checkpoint**

Run: `git diff --check` and `git status --short`.

Expected: no diff errors; new prop assets and source changes remain uncommitted.

---

### Task 2: Add Tail Bones and Bazooka Clips to Troy

**Files:**
- Create: `../troyapps-3d-work/inspect_tail_topology.py`
- Create: `../troyapps-3d-work/build_tail_bazooka_rig.py`
- Create: `../troyapps-3d-work/working/troy-tail-bazooka-v1.blend`
- Create: `../troyapps-3d-work/output/troy-tail-bazooka-v1.glb`
- Modify: `assets/models/troy/troy.glb`
- Modify: `tests/troy-model.test.mjs`

**Interfaces:**
- Produces bones: `Tail01`, `Tail02`, `Tail03`, `Tail04`, `Tail05`.
- Produces loopable clip `BazookaAim` and one-shot clip `BazookaFire`.
- Preserves morph targets: `Surprised`, `Angry`, `Defensive`.

- [ ] **Step 1: Expand the model contract test**

```js
const expectedAnimations = [
  "Acknowledge", "Annoyed", "BazookaAim", "BazookaFire", "Idle",
  "Point", "Poke", "Recover", "Slap", "Talk", "WhipHit",
];
const nodeNames = new Set(gltf.nodes.map(({ name }) => name));
for (const bone of ["Tail01", "Tail02", "Tail03", "Tail04", "Tail05"]) {
  assert.equal(nodeNames.has(bone), true, `missing ${bone}`);
}
```

Keep `Slap` temporarily in the GLB for compatibility; runtime removal happens in Task 4. This avoids re-authoring every earlier clip in the same asset pass.

- [ ] **Step 2: Run the model test and verify RED**

Run: `node --test tests\troy-model.test.mjs`

Expected: FAIL because tail bones and bazooka clips do not exist.

- [ ] **Step 3: Create a tail topology audit**

`inspect_tail_topology.py` must import `working/troy-interactions-v2.blend`, find mesh `Troy`, split connected vertex islands, and emit JSON containing each island's vertex count, bounds, centroid, and farthest point from the pelvis. Select the tail island as the non-head island whose horizontal extent leaves the torso bounds and whose thinnest two axes remain below 35% of total character height. Abort unless exactly one island satisfies the rule.

Run:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python .\inspect_tail_topology.py
```

Expected: one selected tail region and a non-empty ordered centerline from pelvis-side root to tip.

- [ ] **Step 4: Build the tail rig and two bazooka actions**

Implement these helpers in `build_tail_bazooka_rig.py`:

```python
TAIL_BONES = ["Tail01", "Tail02", "Tail03", "Tail04", "Tail05"]

def add_tail_chain(armature, centerline):
    # Create five connected deform bones following equal arc-length centerline points.
    return [armature.data.edit_bones[name] for name in TAIL_BONES]

def assign_tail_weights(mesh, ordered_centerline):
    # For each audited tail vertex, blend between its two nearest centerline segments;
    # normalize those new groups and leave every non-tail vertex untouched.
    return None

def build_bazooka_aim(armature):
    # Create a 48-frame loop with shoulder-width grip placement and stable feet/body.
    return bpy.data.actions["BazookaAim"]

def build_bazooka_fire(armature):
    # Copy the aim pose, key a six-frame recoil, four-frame overshoot, and settle by frame 24.
    return bpy.data.actions["BazookaFire"]
```

Validate in the script that non-tail group weights are byte-for-byte unchanged, the five bones are connected, the morph names remain exact, and all eleven clips exist before export.

- [ ] **Step 5: Export, audit, and install the revised Troy GLB**

Run:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python .\build_tail_bazooka_rig.py
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python .\audit_rigged.py -- .\output\troy-tail-bazooka-v1.glb
Copy-Item -LiteralPath '.\output\troy-tail-bazooka-v1.glb' -Destination '..\troyapps.github.io\assets\models\troy\troy.glb' -Force
```

Expected: one mesh, one armature, eleven actions, five named tail bones, three morphs, and GLB size at most 6 MB.

- [ ] **Step 6: Run the model test and verify GREEN**

Run: `node --test tests\troy-model.test.mjs`

Expected: PASS.

- [ ] **Step 7: Record the uncommitted checkpoint**

Run: `git diff --check` and `git status --short`.

---

### Task 3: Implement Aim and Seeded Rocket Flight Mathematics

**Files:**
- Create: `assets/js/troy/troy-bazooka-motion.js`
- Create: `tests/troy-bazooka-motion.test.mjs`

**Interfaces:**
- Produces: `clampBazookaAim(pointerX, pointerY) -> { yaw, pitch }`.
- Produces: `createRocketRoute(seed, bounds, target) -> Array<{x,y,z}>`.
- Produces: `rocketMotionAt(route, progress) -> { position, tangent, finished }`.

- [ ] **Step 1: Write failing aim and route tests**

```js
test("bazooka aim is clamped and returns to neutral", () => {
  assert.deepEqual(clampBazookaAim(0, 0), { yaw: 0, pitch: 0 });
  assert.deepEqual(clampBazookaAim(9, -9), { yaw: 0.32, pitch: -0.2 });
});

test("seeded rocket visits safe points and ends at Troy", () => {
  const bounds = { minX: -0.86, maxX: 0.86, minY: 0.18, maxY: 0.9 };
  const target = { x: 0, y: 0.68, z: 0.54 };
  const first = createRocketRoute(42, bounds, target);
  assert.deepEqual(first, createRocketRoute(42, bounds, target));
  assert.ok(first.length >= 5 && first.length <= 7);
  assert.deepEqual(first.at(-1), target);
  assert.ok(first.slice(1, -1).every((p) => p.x >= bounds.minX && p.x <= bounds.maxX));
  assert.notDeepEqual(first, createRocketRoute(43, bounds, target));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests\troy-bazooka-motion.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure motion module**

Use a 32-bit linear-congruential generator seeded by the supplied integer. Build a route with muzzle start, initial pointer-directed point, three-to-five generated points, and the exact Troy target. Use Catmull-Rom interpolation math in `rocketMotionAt`; return the normalized finite-difference tangent using `progress + 0.001`.

```js
export function clampBazookaAim(pointerX, pointerY) {
  return {
    yaw: Math.max(-0.32, Math.min(0.32, pointerX * 0.32)),
    pitch: Math.max(-0.2, Math.min(0.2, pointerY * 0.2)),
  };
}
```

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests\troy-bazooka-motion.test.mjs`

Expected: PASS.

- [ ] **Step 5: Record the uncommitted checkpoint**

Run: `git diff --check`.

---

### Task 4: Replace Slap with Bazooka in the UI and Controller Contract

**Files:**
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `assets/js/troy/troy-actions.js`
- Modify: `assets/js/troy/troy-state.js`
- Modify: `assets/js/troy/troy-clips.js`
- Modify: `assets/js/troy/troy-copy.js`
- Modify: `assets/js/troy/troy-controller.js`
- Modify: `assets/css/home-v2.css`
- Test: `tests/site-contract.test.mjs`
- Test: `tests/troy-actions.test.mjs`
- Test: `tests/troy-animation.test.mjs`

**Interfaces:**
- Consumes: `clampBazookaAim` and renderer `setAim(x,y)`, `launchBazooka(seed)`.
- Produces tool name `bazooka` and states `bazookaAim`, `bazookaFire`, `rocketFlight`, `pixelScattered`, `reforming`.

- [ ] **Step 1: Change contract tests from slap to bazooka**

```js
assert.match(html, /data-troy-tool-option="bazooka"/);
assert.doesNotMatch(html, /data-troy-tool-option="slap"/);
assert.deepEqual(Object.keys(copy.tools), ["poke", "bazooka", "whip", "command"]);
assert.deepEqual(getTroyAction("bazooka"), {
  name: "bazooka",
  sequence: ["bazookaAim", "bazookaFire", "rocketFlight", "pixelScattered"],
  effect: "bazookaLaunch",
  cooldownMs: 1200,
});
```

- [ ] **Step 2: Run the three focused tests and verify RED**

Run: `node --test tests\site-contract.test.mjs tests\troy-actions.test.mjs tests\troy-animation.test.mjs`

Expected: FAIL on missing bazooka and remaining slap contracts.

- [ ] **Step 3: Implement localized markup and copy**

Replace the slap button with `Bazuka` / `Bazooka`, keep `aria-pressed`, and add one initially hidden button:

```html
<button class="troy-pixel-target" type="button" data-troy-pixel-target hidden></button>
```

Its localized label is `Troy'un piksellerini yeniden birleştir` / `Reassemble Troy's pixels`.

Add at least four non-repeating scattered lines and two reform lines per locale. Keep the approved Turkish tone and equivalent English sarcasm.

- [ ] **Step 4: Implement action/state/clip contracts**

Map `bazookaAim -> BazookaAim` and `bazookaFire -> BazookaFire`. Treat `rocketFlight`, `pixelScattered`, and `reforming` as renderer-driven states that do not request a Blender clip. Remove slap from `isTroyTool`, mood escalation, and public copy.

- [ ] **Step 5: Wire controller events**

On pointer move, call `renderer.setAim(normalizedX, normalizedY)` only while bazooka is selected and no rocket/pixel sequence is active. On bazooka target click, call `renderer.launchBazooka(++shotSeed)` and enter `rocketFlight`. Listen for renderer events:

```js
stage.addEventListener("troy:pixel-scattered", enterPixelScattered);
stage.addEventListener("troy:reformed", finishReformation);
pixelTarget.addEventListener("click", () => rendererPromise.then((renderer) => renderer.reformPixels()));
```

While scattered, schedule the first line at 3000 ms and later lines with deterministic intervals from 7000 through 10000 ms. Clear these timers on reform, page hide, or renderer fallback.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `node --test tests\site-contract.test.mjs tests\troy-actions.test.mjs tests\troy-animation.test.mjs`

Expected: PASS.

- [ ] **Step 7: Record the uncommitted checkpoint**

Run: `git diff --check` and `git status --short`.

---

### Task 5: Render Bazooka, Rocket, Flash, and Smoke

**Files:**
- Modify: `assets/js/troy/troy-three.js`
- Modify: `assets/css/home-v2.css`
- Create: `assets/js/troy/troy-renderer-contract.js`
- Create: `tests/troy-renderer-contract.test.mjs`
- Test: `tests/troy-prop-assets.test.mjs`
- Test: `tests/troy-bazooka-motion.test.mjs`

**Interfaces:**
- Consumes: normalized prop GLBs and pure motion functions.
- Produces renderer methods: `setAim(x,y)`, `launchBazooka(seed)`, `reformPixels()`.
- Emits: `troy:pixel-scattered` after rocket impact and `troy:reformed` after reconstruction.

- [ ] **Step 1: Add a renderer-surface contract test**

Export a browser-independent `BAZOOKA_EFFECTS` constant from `troy-three.js` through a small new `troy-renderer-contract.js` module to avoid importing Three.js in Node:

```js
assert.deepEqual(BAZOOKA_EFFECTS, {
  aimClip: "BazookaAim",
  fireClip: "BazookaFire",
  impactTargetY: 0.68,
  reducedMotionAutoRestore: true,
});
```

- [ ] **Step 2: Run the focused renderer contract and verify RED**

Run: `node --test tests\troy-prop-assets.test.mjs tests\troy-bazooka-motion.test.mjs`

Expected: FAIL on the missing renderer contract.

- [ ] **Step 3: Load and mount props**

Load bazooka and rocket with the existing `GLTFLoader`. Attach the bazooka root under `R_Hand`; resolve `BazookaMuzzle` and `BazookaExhaust` by name. Add the rocket to `modelPivot`, initially hidden. Throw an asset-specific error if required nodes are missing, disable only the bazooka interaction, and retain poke/whip.

- [ ] **Step 4: Apply aim after the animation mixer update**

After `mixer.update(delta)`, ease current aim toward the clamped target. Apply 35% yaw to `Spine02`, 20% to `Head`, and the remaining visual direction to the bazooka attachment. Restore saved rest quaternions when the tool changes.

- [ ] **Step 5: Implement launch and rocket travel**

`launchBazooka(seed)` plays `BazookaFire`, freezes a route from the current muzzle and aim, displays the rocket, and starts a 2.8-to-3.8-second flight based on route length. Each frame samples position/tangent and calls `rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1), tangent)`.

- [ ] **Step 6: Add runtime-drawn fire and smoke**

Use pooled `THREE.Sprite` or `THREE.Points` particles with programmatically generated radial canvas textures: red/yellow muzzle flash for 140 ms, grey/red rear exhaust for 650 ms, and a maximum 80-point smoke trail behind the rocket. No new raster download is required.

- [ ] **Step 7: Trigger impact and verify GREEN**

At route completion, hide the rocket, clear pooled smoke on fade completion, trigger the impact flash, and call the pixel-scattering entry point from Task 6. Run all focused bazooka/asset tests and expect PASS.

- [ ] **Step 8: Record the uncommitted checkpoint**

Run: `git diff --check`.

---

### Task 6: Implement the Persistent Talking Pixel Ghost

**Files:**
- Create: `assets/js/troy/troy-pixel-ghost.js`
- Create: `tests/troy-pixel-ghost.test.mjs`
- Modify: `assets/js/troy/troy-three.js`
- Modify: `assets/js/troy/troy-controller.js`
- Modify: `assets/css/home-v2.css`

**Interfaces:**
- Produces: `createPixelGhostState()` with `impact()`, `advance(milliseconds)`, `click()`, `finishReform()`, `current()`.
- Produces: `createGhostDialogueSchedule(seed) -> number[]`.
- Renderer owns `scatterPixels()` and `reformPixels()`.

- [ ] **Step 1: Write failing persistent-state tests**

```js
test("Troy remains scattered until the cloud is clicked", () => {
  const ghost = createPixelGhostState();
  assert.equal(ghost.impact(), "pixelScattered");
  ghost.advance(600_000);
  assert.equal(ghost.current(), "pixelScattered");
  assert.equal(ghost.click(), "reforming");
  assert.equal(ghost.finishReform(), "recovered");
});

test("ghost dialogue waits, escalates, and is deterministic", () => {
  const schedule = createGhostDialogueSchedule(12);
  assert.equal(schedule[0], 3000);
  assert.ok(schedule.slice(1).every((ms) => ms >= 7000 && ms <= 10000));
  assert.deepEqual(schedule, createGhostDialogueSchedule(12));
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests\troy-pixel-ghost.test.mjs`

Expected: FAIL because the module is absent.

- [ ] **Step 3: Implement the pure ghost state and schedule**

Use closed states `intact`, `pixelScattered`, `reforming`, `recovered`. `current()` must never inspect elapsed time to leave `pixelScattered`. Ignore repeated impact/click calls unless valid for the current state. Use the same seeded generator family as rocket motion for repeatable tests.

- [ ] **Step 4: Build the 3D particle cloud**

At renderer initialization, allocate one `THREE.Points` buffer sized to 900 particles. At impact, sample positions and vertex colors from the skinned mesh. Apply skinning and current world transforms before storing each home position. Mobile uses the first 560 particles; desktop uses all 900.

During scatter, integrate deterministic outward velocity, drag, and a weak attraction to a Troy-shaped volume. After 700 ms, hide the mesh and keep the cloud moving indefinitely. Head-area particles receive a pulsing displacement while a dialogue line is visible; brow-area particles receive a smaller upward displacement.

- [ ] **Step 5: Implement hover and click-only reformation**

Show the accessible HTML pixel target over the cloud while scattered. Hover/focus increases the attraction force. Click calls `reformPixels()`, which interpolates every particle to its home position over 900 ms, fades the skinned mesh in after 650 ms, then hides the particle points and emits `troy:reformed`.

- [ ] **Step 6: Implement failure fallback**

If buffer creation or skin sampling throws, use the existing CSS pixel scatter, hide Troy for 700 ms, restore him automatically, and emit `troy:reformed`. Record `stage.dataset.troyPixelFallback = "true"` so the live test can verify the degraded path without trapping the page.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `node --test tests\troy-pixel-ghost.test.mjs tests\troy-dialogue-visuals.test.mjs`

Expected: PASS.

- [ ] **Step 8: Record the uncommitted checkpoint**

Run: `git diff --check`.

---

### Task 7: Implement Tail Balance and Whip Spring Physics

**Files:**
- Create: `assets/js/troy/troy-tail-spring.js`
- Create: `tests/troy-tail-spring.test.mjs`
- Modify: `assets/js/troy/troy-three.js`

**Interfaces:**
- Produces: `createTailSpring({ stiffness, damping, maxBend })`.
- Methods: `impulse(x,z)`, `step(deltaSeconds)`, `pose()`, `idleLift(timeSeconds)`.
- `pose()` returns `{ bendX, bendZ, compression, bodyLift }`.

- [ ] **Step 1: Write failing spring tests**

```js
test("tail impulse bends within limits and settles", () => {
  const spring = createTailSpring({ stiffness: 34, damping: 9, maxBend: 0.42 });
  spring.impulse(0.8, -0.4);
  const first = spring.step(1 / 60);
  assert.ok(first.bendX > 0 && Math.abs(first.bendX) <= 0.42);
  for (let i = 0; i < 360; i += 1) spring.step(1 / 60);
  const settled = spring.pose();
  assert.ok(Math.abs(settled.bendX) < 0.005);
  assert.ok(Math.abs(settled.bendZ) < 0.005);
});

test("idle bounce is irregular but bounded", () => {
  const spring = createTailSpring({ stiffness: 34, damping: 9, maxBend: 0.42 });
  const lifts = [0, 0.7, 1.9, 3.2].map((time) => spring.idleLift(time));
  assert.ok(lifts.every((lift) => lift >= 0 && lift <= 0.035));
  assert.notEqual(lifts[1] - lifts[0], lifts[2] - lifts[1]);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests\troy-tail-spring.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the damped spring**

Use semi-implicit Euler integration for each bend axis and compression:

```js
velocity += (-stiffness * position - damping * velocity) * delta;
position += velocity * delta;
position = Math.max(-maxBend, Math.min(maxBend, position));
```

Clamp `delta` to `1/20` second. `idleLift(time)` combines two low-amplitude sine waves at incommensurate frequencies and clamps output to 0.035 character-height units.

- [ ] **Step 4: Run and verify GREEN**

Run: `node --test tests\troy-tail-spring.test.mjs`

Expected: PASS.

- [ ] **Step 5: Apply tail pose after mixer and aim updates**

Resolve all five tail bones once and save rest quaternions. Distribute `bendX` and `bendZ` across them with weights `[0.12, 0.19, 0.25, 0.25, 0.19]`. Apply compression mostly to `Tail01`/`Tail02`. Lift the model pivot so the tail tip is the apparent contact and feet remain visibly clear of the floor.

- [ ] **Step 6: Connect interaction impulses**

On ordinary whip contact, derive a seeded horizontal direction and call `tailSpring.impulse(directionX * 0.9, directionZ * 0.65)`. On caught whip, use half strength. On bazooka recoil, apply `tailSpring.impulse(-0.22, 0)`. Disable procedural tail updates during `pixelScattered`; resume neutral settling during `reforming`.

- [ ] **Step 7: Record the uncommitted checkpoint**

Run: `git diff --check`.

---

### Task 8: Integrate Fallbacks, Performance Limits, and Live Verification

**Files:**
- Modify: `assets/js/troy/troy-preferences.js`
- Modify: `assets/js/troy/troy-three.js`
- Modify: `assets/js/troy/troy-controller.js`
- Modify: `assets/css/home-v2.css`
- Modify: `tests/site-contract.test.mjs`
- Modify: cache keys in `index.html`, `en/index.html`, and Troy ES-module imports.

**Interfaces:**
- Final public renderer: `playState`, `setExpression`, `playEffect`, `setAim`, `launchBazooka`, `reformPixels`, `clearEffect`, `debug`, `dispose`.

- [ ] **Step 1: Extend fallback and disposal tests**

Assert reduced motion selects poster fallback, pixel target is hidden by default, bazooka assets are local, and one cache version is used across all Troy imports. Add a pure helper test showing desktop particle budget 900 and mobile budget 560.

- [ ] **Step 2: Run the full suite and verify RED only on new expectations**

Run: `node --test tests\*.test.mjs`

Expected: existing tests pass; new fallback/budget assertions fail until wired.

- [ ] **Step 3: Complete fallback and disposal behavior**

Ensure reduced motion uses poster fallback and no wandering rocket, shake, 3D scatter, or tail oscillator. Ensure missing bazooka disables only its tool. Dispose bazooka, rocket, Points buffers, canvas textures, smoke pool, event listeners, and timers.

- [ ] **Step 4: Bump one shared cache key**

Choose the next unused `20260907-mascotNN` value and use it in both locale HTML files, all controller imports, all renderer imports, and site-contract expectations. Do not mix versions.

- [ ] **Step 5: Run fresh automated verification**

Run:

```powershell
node --test tests\*.test.mjs
git diff --check
git status --short
```

Expected: zero test failures, zero diff errors, and all work remains uncommitted.

- [ ] **Step 6: Verify desktop behavior in the local browser**

Reload `http://127.0.0.1:4173/?preview=troy-poke3`, wait for `data-troy-renderer="ready"`, select Bazuka, and verify:

- bazooka is in both hands;
- cursor movement changes aim smoothly and returns to center on pointer leave;
- click produces recoil, front flash, rear smoke, and a visible 3D rocket;
- rocket visits three to five stage-safe waypoints and hits Troy;
- Troy remains a moving particle cloud for at least 20 seconds;
- escalating dialogue appears without immediate repeats;
- only clicking the cloud begins reformation;
- Troy reforms and returns to bazooka aim;
- whip produces varied tail bends and damped recovery;
- browser logs contain no warnings or errors.

- [ ] **Step 7: Verify mobile and reduced-motion behavior**

Use a 390×844 viewport, confirm controls do not overlap the cloud hit target and particle budget is 560. Enable reduced-motion emulation, reload, and confirm the poster/simple fallback never leaves Troy permanently hidden.

- [ ] **Step 8: Hand off without publishing**

Leave the local preview open and report test counts, browser evidence, asset sizes, and any remaining visual judgment calls. Do not commit, push, or deploy.
