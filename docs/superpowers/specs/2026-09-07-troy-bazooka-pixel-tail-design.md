# Troy Bazooka, Pixel Ghost, and Tail-Spring Design

## Goal

Replace the slap interaction with a deliberately absurd bazooka sequence and make Troy balance on a spring-like tail. The interaction must feel like one coherent character performance: Troy arrogantly aims at the visitor, his rocket loses control and hits him, he remains alive as a talking pixel cloud until the visitor restores him, and he returns to aiming without a page reload.

This remains a local, uncommitted redesign until the wider TroyApps homepage is approved. Voice, authentication, deployment, and unrelated page changes stay out of scope.

## Chosen Approach

Use a hybrid asset/runtime system:

- Tripo supplies two separate textured 3D props: a shoulder bazooka and its rocket projectile.
- Blender cleans the props, fixes their origins and scale, poses Troy's hands around the bazooka, and adds a five-segment tail chain to Troy's existing rig.
- Three.js handles cursor aiming, the randomized rocket route, muzzle and smoke particles, model disintegration/reassembly, and damped tail response.
- Existing HTML/CSS dialogue particles remain responsible for the readable speech bubble; the 3D particle cloud supplies the physical talking performance.

Fully baked animation was rejected because it cannot follow the cursor or generate a new rocket route each time. A fully procedural web pose was rejected because Troy currently has no tail bones and two-handed bazooka placement would be fragile.

## Assets

### Bazooka

Create a stylized black/red shoulder bazooka that matches Troy's proportions and the TroyApps palette. It must have a clear grip, shoulder rest, wide muzzle, and rear exhaust. It must not include a character, hands, smoke, fire, text, logos, floor, or background.

### Rocket

Create a separate compact black/red cartoon rocket with fins and a visible rear nozzle. Its forward axis and origin must be normalized in Blender so Three.js can orient it along a curve. Fire and smoke are runtime effects and must not be baked into the model.

### Troy rig revision

Preserve the single skinned Troy mesh, three facial morphs, and existing nine animation clips. Add five tail bones, parented as a continuous chain from the pelvis/root area toward the tip. Assign only tail vertices to the new weights; body, face, hands, and current animations must remain unchanged.

Add two bazooka clips:

- `BazookaAim`: loopable two-handed aiming stance.
- `BazookaFire`: short recoil performance that returns cleanly to the aim stance.

The web GLB contract therefore expands from nine to eleven clips.

## Runtime State Model

The bazooka flow uses explicit states:

1. `bazookaAim`: Troy holds the bazooka and follows the cursor.
2. `bazookaFire`: recoil, muzzle flash, rear exhaust, and rocket launch.
3. `rocketFlight`: Troy tracks the wandering rocket while controls are temporarily locked.
4. `pixelScattered`: Troy's mesh is hidden and his interactive particle cloud remains indefinitely.
5. `reforming`: the visitor clicked the cloud; particles reconstruct Troy.
6. `recover`: Troy shakes himself off and returns to `bazookaAim` if the bazooka is still selected.

Selecting another tool is disabled from launch through reformation. No timeout automatically restores Troy. Reloading the page safely returns to the normal idle state.

## Bazooka Interaction

The slap button and all slap copy, state names, hand-prop loading, and slap tests are removed. The replacement control is localized as `Bazuka` / `Bazooka`.

When selected, the prop appears in Troy's hands and `BazookaAim` begins. Pointer position maps to a clamped aim vector so Troy never twists unnaturally. The body yaws slightly, the head follows more subtly, and the bazooka pivots most strongly. Pointer exit eases the aim back to center.

Clicking Troy's target fires once if the action is ready:

- The bazooka recoils into Troy's shoulder.
- A brief drawn muzzle flash appears at the barrel.
- Layered grey/red particles expand from the rear exhaust and fade.
- The 3D rocket leaves the muzzle in the cursor's current direction.

The rocket then follows a deterministic-per-shot Catmull-Rom path through three to five safe random waypoints within the Troy stage. Points avoid the control bar and dialogue zone. The final waypoint is Troy's upper body. A smoke ribbon trails the rocket. Each shot uses a new seed, but its path helper remains deterministic under test.

## Impact and Pixel Ghost

At impact, a short red/yellow flash and camera-safe stage shake occur. There is no gore. Troy's rendered mesh dissolves into approximately 700 to 900 red, black, and dimly lit 3D particles sampled from the deformed skinned mesh. Particles first preserve his silhouette, then loosen into a readable Troy-shaped cloud.

The cloud stays indefinitely and is the only active target. It has a generous invisible hit area for touch users. Hover/focus pulls nearby pixels slightly inward to signal that it can be clicked.

Troy continues responding while scattered:

- Head-area particles pulse like speech.
- Brow-area particles lift or tighten to sell expression.
- A few particles break away toward the existing dialogue bubble as it assembles.
- Dialogue remains text-only and localized.

The first reluctant line appears after roughly three seconds. Later lines appear at irregular seven-to-ten-second intervals without rapid repetition. The tone is profane-free, arrogant, insulting, and increasingly desperate without targeting protected traits or using genuinely abusive language. Representative Turkish lines include:

- `Şu piksellere tıkla da en azından bir işe yara.`
- `Beni toparlamanı istemiyorum... ama boş boş bakmayı bırak.`
- `Yalvardığımı sanma. Ekrana tıklayabilecek misin onu test ediyorum.`

Clicking the cloud starts reformation. Particles accelerate back to their sampled positions, the mesh fades in underneath, and Troy completes a short shake/recovery. A final sarcastic line plays before the selected tool becomes interactive again.

## Tail-Spring Motion

Troy's default visual stance is lifted so his feet do not bear his weight. The tail chain curls beneath him and its tip acts as the apparent contact point. A low-amplitude damped oscillator produces occasional irregular bounces rather than a constant metronome motion.

The tail system has two layers:

- Blender provides the rest curl and valid five-bone deformation.
- Three.js applies small procedural rotations after the animation mixer update.

A whip impact applies an impulse with a seeded random horizontal direction. The tail compresses, bends through different segments, overshoots, and returns with damping. Troy's whole-body pivot follows with smaller delayed motion. Limits prevent mesh inversion and keep the character inside the stage. Bazooka recoil uses a smaller backward impulse; pixel reformation returns to the neutral tail balance.

## Fallbacks and Performance

- Reduced-motion or data-saver mode keeps the poster fallback and uses simple opacity changes; it does not run rocket wandering, stage shake, 3D particle dispersion, or tail oscillation.
- If either bazooka asset fails, the bazooka control remains visible but disabled and Troy continues using poke and whip.
- If particle initialization fails, impact uses a CSS pixel burst and restores Troy automatically so the page cannot become stuck invisible.
- Particle count scales down on small screens and low pixel budgets.
- All geometries, materials, timers, and particle buffers are disposed with the renderer.

## Testing

Browser-independent tests cover:

- the new action/state transitions and removal of slap;
- aim clamping and neutral return;
- rocket waypoint bounds, count, final target, and deterministic seeded output;
- indefinite `pixelScattered` state and click-only transition to `reforming`;
- non-repeating escalating pixel-ghost dialogue;
- damped tail displacement, direction limits, and return to rest;
- updated GLB clip, skeleton, morph, and size contracts;
- local bazooka and rocket asset availability.

Live local-browser verification covers desktop and mobile layouts, cursor tracking, launch/recoil/smoke timing, randomized rocket travel, impact/dissolve, talking cloud hover and click, reformation, tail bounce, whip impulses, reduced motion, and console errors.

## Acceptance Criteria

- Slap is absent from both locales and runtime modules.
- Bazooka visibly sits in both hands, aims toward the pointer, and fires on target click.
- The rocket visits three to five visible randomized waypoints and returns to hit Troy.
- Troy becomes a moving, talking particle cloud and never reforms by timer alone.
- Only clicking/tapping the cloud reforms Troy.
- Pixel-state dialogue is reluctant, sarcastic, localized, and non-repeating.
- Troy visibly balances above his feet on a deforming tail and bounces irregularly.
- Whip hits bend the tail in varied directions and it settles back to its original pose.
- Existing poke, whip, facial reactions, dialogue lifecycle, accessibility, and poster fallback continue working.
- Automated tests pass and live local verification shows no console errors.
- No commit, push, or deployment occurs without a later explicit instruction.
