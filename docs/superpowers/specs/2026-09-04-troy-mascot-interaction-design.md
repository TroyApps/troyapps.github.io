# Troy Mascot Interaction System Design

**Date:** 2026-09-04
**Status:** User-approved silent-first design with active 3D acting revision
**Scope:** Finish Troy's mascot interactions before any broader site-layout work.

## Goal

Turn Troy from a single-click animated model into a playful, deliberate interaction system. The visitor chooses an action first, then applies it to Troy by clicking or activating the character. The system must remain fast, accessible, bilingual, and fully usable when WebGL or motion is unavailable.

## Product Contract

The mascot tray exposes four actions:

1. **Dürt / Poke** — select the tool, then activate Troy for a short mild body reaction and a playful complaint.
2. **Tokat / Slap** — select the tool, then activate Troy for a head-hit reaction followed by recovery.
3. **Kırbaç / Whip** — select the tool, then activate Troy. A lightweight visual whip arc and contact flash appear over the stage while Troy plays a body-hit reaction and recovers.
4. **Komut Ver / Command** — open an accessible command panel. Commands take the visitor to Applications, Radar, About, or Contact while Troy acknowledges and points or talks.

The selected physical tool remains visibly active until another tool is selected. The character target's accessible label changes to describe the selected action.

## Silent-First Delivery Strategy

Troy's personality will be completed through animation, facial/body acting where the current rig permits it, and localized speech bubbles before recorded voice is introduced. Recorded dialogue, lip sync, and voice-file production are explicitly deferred. The behavior and copy boundaries must remain clean enough that voice can later subscribe to the same semantic reaction without changing the interaction model.

The first delivery slice is **Poke escalation**. It proves the complete character loop before Slap and Whip receive their stronger foreground-hand effects:

1. First poke: Troy is surprised, plays `Poke -> Recover`, and shows a surprised line.
2. Second poke within the irritation window: Troy is annoyed, plays `Poke -> Annoyed -> Recover`, and shows an annoyed warning.
3. Third and later pokes within the window: Troy becomes defensive, plays `Annoyed -> Poke -> Recover`, and shows a sharper defensive line.
4. After 12 seconds without a physical interaction, irritation resets. The next poke is treated as the first poke again.
5. A command acknowledgement does not increase irritation. It may calm Troy immediately after the command begins so the service flow does not inherit hostile copy.

The escalation level is session-only browser state. It is not persisted, tracked, or sent anywhere.

## Character Agency Contract

Troy is not a passive target. The humor comes from a stubborn digital creature reacting to the visitor and eventually resisting them.

- First physical interaction: surprise.
- Second interaction inside the irritation window: anger and a warning.
- Third and later interaction: active defense, blocking, dodging, catching, or pulling back against the visitor.
- Slap escalation culminates in Troy catching or stopping the incoming hand.
- Whip escalation culminates in Troy dodging, grabbing, or pulling the whip rather than remaining helpless.
- Commands reset hostility and return Troy to reluctant but competent service.
- No blood, wounds, torture imagery, religious mockery, occult symbols, or realistic suffering are used.

## Facial Acting Contract

The current source has one 25,000-vertex skinned character mesh, one 41-bone body rig, and no facial morph targets. `Head` is the only face-related bone, so the current model can move the head but cannot independently animate brows, eyelids, cheeks, jaw, or mouth.

The revised model will expose three facial morph targets:

- `Surprised`: raised brows, more open eyes, and a small open-mouth silhouette.
- `Angry`: lowered inward brows, narrowed eyes, and a tightened mouth.
- `Defensive`: asymmetric guarded eyes/brows and a braced mouth.

Morphs affect only the front/head region and must not deform horns, ears, collar, or neck. They layer over the existing skeletal clips so one body clip can carry different expressions. The renderer blends expressions in and out instead of adding separate full-body clips for every emotional combination.

Before the website model is replaced, a separate Blender prototype and four close-up renders (`Basis`, `Surprised`, `Angry`, `Defensive`) must be reviewed visually. If the source topology cannot support a clean morph without texture distortion, the fallback is lightweight head-parented 3D facial geometry, not a screen-space CSS face.

## Interaction Model

- Tool selection and animation state are separate concepts. The selected tool is stored as `data-troy-tool`; the currently playing reaction remains `data-troy-state`.
- Physical actions use a two-step flow: select a tool, then activate Troy.
- Only one animation sequence plays at a time. Repeated input does not build an unlimited queue; at most the most recent pending action is retained.
- A short per-action cooldown prevents accidental rapid repetition.
- Physical reactions feed a small deterministic mood model. The model returns a semantic reaction tier (`surprised`, `annoyed`, or `defensive`) rather than choosing animation or copy itself.
- Mood decay uses the timestamp of the most recent physical interaction. No background interval is required; the level is recalculated when an interaction begins and when the idle timer fires.
- The idle/annoyed timer runs only while Troy is idle, no action is pending, and the command panel is closed.
- The existing poster fallback remains available. In reduced-motion, data-saver, or WebGL-failure mode, dialogue and navigation still work; decorative motion and the whip sweep are suppressed or reduced to a static emphasis.

## 3D Animation Contract

The web GLB will expose these named clips:

- `Idle`
- `Talk`
- `Point`
- `Annoyed`
- `Poke`
- `Slap`
- `WhipHit`
- `Acknowledge`
- `Recover`

Source-action mapping:

- `Poke`: a short, softened and accelerated edit derived from `hit_to_body_01` for the first version.
- `Slap`: `hit_to_head`.
- `WhipHit`: `hit_to_body_01` with timing tuned to the contact effect.
- `Point`: shortened or accelerated `agree`.
- `Talk`: shortened or accelerated `complain_01`.
- `Acknowledge`: a useful trimmed section of `greet_02`.
- `Recover`: the existing short transition into idle.

The current whip arc remains a temporary placeholder. After the Poke slice is accepted, Slap and Whip will gain pointer-transparent foreground attacker artwork: an open hand for Slap and a hand holding the whip for Whip. These visuals remain separate from Troy's rig and synchronize with the character's 3D contact reaction, keeping the mascot model stable while allowing the foreground strike to be replaced or refined independently.

The final attacker artwork will be real scene geometry in a separate lightweight GLB, not a CSS arc or flat DOM hand. The Slap version contains an open hand/forearm; the Whip version contains the same visual language with a held whip. This prop phase begins only after the facial morph prototype is accepted.

## Module Boundaries

- `troy-three.js` remains the renderer and animation adapter. It loads the model, validates required clips, cross-fades actions, and reports completion.
- `troy-three.js` will also validate the three morph targets and expose `playExpression(name, options)` independently from `playState(state)`.
- `troy-state.js` remains the deterministic animation-state machine and gains the new reaction states.
- `troy-clips.js` maps animation states to the exact GLB clip names.
- A new pure `troy-actions.js` describes each semantic action: animation sequence, effect, cooldown, and dialogue key.
- A pure `troy-mood.js` owns irritation level, the 12-second reset rule, and reaction-tier selection. It has no DOM, timers, randomness, storage, or renderer dependency.
- A new `troy-copy.js` owns Turkish and English dialogue and labels.
- `troy-controller.js` owns DOM events, selected-tool state, the one-pending-action queue, command-panel behavior, mood orchestration, and dialogue timing.
- The HTML keeps a distinct character target, toolbar, command panel, status dialogue, and decorative effect layer.

## Visual and Responsive Design

- Desktop: a compact horizontal control tray placed in the Troy stage, but outside the full character target's hit layer.
- Mobile: a compact tray below the character so it does not cover the model or speech bubble.
- The active tool receives a strong red highlight and a clear pressed state.
- The pointer may visually reflect the selected tool, but the interaction must not depend on cursor appearance.
- Layering order: character target, decorative effect, speech bubble, badge/tools/command panel.
- Broader hero, navigation, card, and footer redesign work is explicitly out of scope until the mascot is accepted.

## Dialogue

- Each semantic reaction tier uses a small randomized pool of localized, playful lines. Repetition is controlled so the same line is not selected twice in succession when alternatives exist.
- Poke copy is separated into `pokeSurprised`, `pokeAnnoyed`, and `pokeDefensive` pools in Turkish and English.
- Example tone progresses from “Ayy!” to a warning and finally an indignant defensive response. The comedy comes from escalation and timing, not from random unrelated lines.
- The existing synthesized-effect sound control is removed from the active interface for this phase. Recorded voice, sound effects, audio preferences, and lip sync are out of scope until the silent character behavior is accepted.

## Accessibility

- Tool buttons expose `aria-pressed`; the group has a clear accessible label.
- Troy remains a real keyboard-operable button. Enter and Space apply the selected tool.
- The command trigger exposes `aria-expanded` and `aria-controls`; Escape closes the panel and restores focus appropriately.
- Commands are native links so navigation survives JavaScript failure.
- Dialogue uses `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
- Canvas and effects remain decorative and hidden from assistive technology.
- Focus styles, touch targets, reduced motion, and narrow-screen overflow are verified.

## Privacy and Safety Boundaries

- No authentication, account creation, analytics, tracking, form submission, or personal-data collection is added.
- The existing brand contacts, social destinations, Radar injection markers, localization, application data, and `app-ads.txt` contract remain unchanged.
- No commit, push, or deployment occurs until the user approves the complete local result.

## Verification Contract

- Unit tests cover semantic action definitions, state transitions, clip mapping, cooldown/queue behavior, mood escalation, 12-second decay, reset behavior, and dialogue selection.
- Model tests verify the exact required animation list, durations, skin, and size budget.
- Facial prototype checks verify exact morph names, non-zero affected vertex counts, horn/ear/collar exclusion, and close-up visual renders before production replacement.
- Site-contract tests verify both languages, all four controls, command links, data hooks, accessibility semantics, and fallback content.
- Browser smoke tests cover mouse, touch-equivalent pointer input, Enter/Space, rapid repeated input, command focus/close behavior, Turkish and English, reduced motion, poster fallback, and 480 px layout.
- Final verification includes all Node tests, JavaScript syntax checks, `git diff --check`, and local HTTP checks. Publication remains a separate explicit decision.

## Out of Scope

- Broader homepage or navigation layout changes.
- Real user accounts or authentication.
- Analytics and behavioral tracking.
- A fully simulated 3D whip with physics or a whip prop rigged into Troy's character model.
- Recorded voice, lip sync, voice-file conversion, and audio playback.
- Replacing Troy's body rig or regenerating the complete character.
- Slap-hand and Whip-hand production during the facial prototype task; those remain the next approved task after facial acceptance.
