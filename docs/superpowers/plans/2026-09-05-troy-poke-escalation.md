# Troy Poke Escalation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Troy a silent, escalating Poke personality that moves from surprise to annoyance to defense, then calms after 12 seconds.

**Architecture:** Add a pure session-only mood module that returns a semantic reaction tier. Keep animation/copy selection in the existing action and localization modules, then let the controller orchestrate the tier, animation sequence, and speech bubble. Remove the active synthesized-sound UI and runtime wiring without deleting the isolated sound module, so recorded voice can be designed later without blocking this milestone.

**Tech Stack:** Static HTML, scoped CSS, vanilla JavaScript ES modules, Three.js 0.185.1, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-04-troy-mascot-interaction-design.md`

## Global Constraints

- First poke is `surprised`, second poke within the irritation window is `annoyed`, and third or later poke is `defensive`.
- Irritation resets at an inclusive 12,000 ms boundary with no persistent storage or background polling.
- Poke tiers use only the existing `Poke`, `Annoyed`, and `Recover` GLB clips.
- Turkish and English must expose separate copy pools for all three tiers with no immediate repetition.
- The sound button and sound runtime wiring are removed from the active pages for this phase.
- Existing Slap, Whip, Command, accessibility, fallback, responsive, social-link, Radar-marker, and `app-ads.txt` contracts remain intact.
- Do not commit, push, or deploy.

## File Structure

- Create `assets/js/troy/troy-mood.js`: pure irritation counter, inclusive decay, and calm/reset API.
- Modify `assets/js/troy/troy-actions.js`: map semantic Poke tiers to animation sequences and dialogue keys.
- Modify `assets/js/troy/troy-copy.js`: localized Poke-tier dialogue pools; remove active sound labels.
- Modify `assets/js/troy/troy-controller.js`: evaluate mood when a Poke actually starts and orchestrate its resolved reaction.
- Modify `index.html` and `en/index.html`: remove the sound button and bump one shared module cache key.
- Modify `assets/css/home-v2.css`: remove sound-button-only styling while keeping tool layout stable.
- Modify `tests/troy-actions.test.mjs`: cover mood, reaction resolution, copy, and removal of the sound contract.
- Modify `tests/site-contract.test.mjs`: require the silent-first page contract.

---

### Task 1: Build the Pure Mood and Poke-Reaction Contract

**Files:**
- Create: `assets/js/troy/troy-mood.js`
- Modify: `assets/js/troy/troy-actions.js`
- Modify: `assets/js/troy/troy-copy.js`
- Modify: `tests/troy-actions.test.mjs`

**Interfaces:**
- Produces: `TROY_IRRITATION_RESET_MS = 12000`.
- Produces: `createTroyMood({ resetAfterMs }?)` returning `registerPoke(now)`, `level(now)`, and `calm()`.
- Produces: `resolveTroyReaction(name, tier?)` returning `{ dialogueKey: string, sequence: string[] } | null`.
- Consumes: existing `getTroyAction(name)` for base Slap and Whip behavior.

- [x] **Step 1: Replace synthesized-sound tests with failing mood and reaction tests**

Add imports for `createTroyMood`, `TROY_IRRITATION_RESET_MS`, and `resolveTroyReaction`. Add exact checks:

```js
test("Troy poke mood escalates and resets at the inclusive boundary", () => {
  const mood = createTroyMood();
  assert.equal(TROY_IRRITATION_RESET_MS, 12_000);
  assert.equal(mood.registerPoke(1_000), "surprised");
  assert.equal(mood.registerPoke(2_000), "annoyed");
  assert.equal(mood.registerPoke(3_000), "defensive");
  assert.equal(mood.registerPoke(4_000), "defensive");
  assert.equal(mood.level(15_999), 3);
  assert.equal(mood.level(16_000), 0);
  assert.equal(mood.registerPoke(16_000), "surprised");
});

test("Troy mood can be calmed without storage or timers", () => {
  const mood = createTroyMood();
  mood.registerPoke(100);
  mood.registerPoke(200);
  assert.equal(mood.calm(), 0);
  assert.equal(mood.level(201), 0);
});

test("poke tiers resolve to deliberate animation and dialogue contracts", () => {
  assert.deepEqual(resolveTroyReaction("poke", "surprised"), {
    dialogueKey: "pokeSurprised",
    sequence: ["poke", "recover"],
  });
  assert.deepEqual(resolveTroyReaction("poke", "annoyed"), {
    dialogueKey: "pokeAnnoyed",
    sequence: ["poke", "annoyed", "recover"],
  });
  assert.deepEqual(resolveTroyReaction("poke", "defensive"), {
    dialogueKey: "pokeDefensive",
    sequence: ["annoyed", "poke", "recover"],
  });
});
```

Delete the tests that import or exercise `createTroySound`. Update the locale test to require three Poke-tier pools instead of `dialogue.poke` and `copy.sound`.

- [x] **Step 2: Run the focused tests and verify they fail**

Run:

```powershell
node --test tests/troy-actions.test.mjs
```

Expected: FAIL because `troy-mood.js`, `resolveTroyReaction`, and the tiered copy keys do not exist.

- [x] **Step 3: Implement the pure mood module**

Create a closure with this behavior:

```js
export const TROY_IRRITATION_RESET_MS = 12_000;

export function createTroyMood({ resetAfterMs = TROY_IRRITATION_RESET_MS } = {}) {
  let irritation = 0;
  let lastPhysicalAt = Number.NEGATIVE_INFINITY;

  function refresh(now) {
    if (Number.isFinite(now) && now - lastPhysicalAt >= resetAfterMs) irritation = 0;
    return irritation;
  }

  return {
    registerPoke(now) {
      refresh(now);
      irritation = Math.min(3, irritation + 1);
      lastPhysicalAt = now;
      return irritation === 1 ? "surprised" : irritation === 2 ? "annoyed" : "defensive";
    },
    level(now) { return refresh(now); },
    calm() {
      irritation = 0;
      lastPhysicalAt = Number.NEGATIVE_INFINITY;
      return irritation;
    },
  };
}
```

Normalize a non-positive or non-finite custom `resetAfterMs` back to 12,000 ms, and treat non-finite `now` values as no decay rather than throwing.

- [x] **Step 4: Add Poke-tier reaction resolution**

Add immutable Poke variants to `troy-actions.js` and export:

```js
export function resolveTroyReaction(name, tier = "surprised") {
  if (name === "poke") {
    const reaction = POKE_REACTIONS[tier] || POKE_REACTIONS.surprised;
    return { dialogueKey: reaction.dialogueKey, sequence: [...reaction.sequence] };
  }
  const action = getTroyAction(name);
  return action ? { dialogueKey: name, sequence: [...action.sequence] } : null;
}
```

Use the exact sequences asserted in Step 1. Keep `getTroyAction()` backward compatible for cooldown, name, and effect lookup.

- [x] **Step 5: Split Poke copy into three localized pools**

Replace each locale's `dialogue.poke` with `pokeSurprised`, `pokeAnnoyed`, and `pokeDefensive`, with at least three lines per pool. Turkish tone progresses from “Ayy!” to a warning to indignant self-defense; English mirrors the intent rather than translating mechanically. Remove `copy.sound` because no active control consumes it.

- [x] **Step 6: Run the focused pure tests**

Run:

```powershell
node --test tests/troy-actions.test.mjs
```

Expected: all focused tests PASS.

---

### Task 2: Integrate Escalation and Remove Active Sound UI

**Files:**
- Modify: `assets/js/troy/troy-controller.js`
- Modify: `index.html`
- Modify: `en/index.html`
- Modify: `assets/css/home-v2.css`
- Modify: `tests/site-contract.test.mjs`

**Interfaces:**
- Consumes: `createTroyMood()` and `resolveTroyReaction(name, tier)` from Task 1.
- Produces: the visible `surprised -> annoyed -> defensive -> calm` Poke loop.
- Preserves: existing action queue, cooldowns, renderer fallback, commands, keyboard operation, and localized status region.

- [x] **Step 1: Make the site contract fail on active sound controls**

Replace the current sound-button assertion with:

```js
assert.doesNotMatch(html, /data-troy-sound/);
```

Add checks that `troy-controller.js` imports `troy-mood.js`, calls `registerPoke`, and calls `resolveTroyReaction`. Require both pages to use the same new cache key `20260905-mascot3`.

- [x] **Step 2: Run the site contract and verify it fails**

Run:

```powershell
node --test tests/site-contract.test.mjs
```

Expected: FAIL while the sound button and old controller wiring still exist.

- [x] **Step 3: Orchestrate the reaction tier in the controller**

Import `resolveTroyReaction` and `createTroyMood`, create one mood instance per page, then change `runTool(name)` so the tier is recorded only after cooldown acceptance and immediately before dialogue/animation starts:

```js
const tier = name === "poke" ? mood.registerPoke(now) : null;
const reaction = resolveTroyReaction(name, tier);
showDialogue(reaction.dialogueKey);

for (const next of reaction.sequence) {
  // preserve the existing token and completion guards
}
```

When a command begins, call `mood.calm()`. Keep Slap and Whip dialogue and sequences unchanged. Keep queue evaluation at execution time so queued Pokes advance exactly once when they actually run.

- [x] **Step 4: Remove active synthesized-sound wiring**

Remove the `createTroySound` import, sound-button lookup, synchronization function, `sound.play`, click listener, startup sync, and `pagehide` disposal from the controller. Do not delete `troy-sound.js`; it remains isolated and unused for possible later reference.

- [x] **Step 5: Remove the sound buttons and their dedicated styles**

Delete the `data-troy-sound` button from Turkish and English HTML. Remove `.troy-sound` selectors from the base, hover, focus, pressed, mobile, and reduced-motion CSS rules without weakening `.troy-tool` focus or sizing. Bump all controller and Troy-module cache references from `20260905-mascot2` to `20260905-mascot3` consistently.

- [x] **Step 6: Run site and pure tests**

Run:

```powershell
node --test tests/troy-actions.test.mjs tests/site-contract.test.mjs
```

Expected: all tests PASS.

---

### Task 3: Full Regression and Local Browser Acceptance

**Files:**
- Verify: all files changed in Tasks 1 and 2.
- Modify only if verification finds a mascot-scoped defect.

**Interfaces:**
- Consumes: completed silent Poke escalation.
- Produces: local evidence for user acceptance with no publication.

- [x] **Step 1: Run the complete automated regression gate**

Run:

```powershell
node --test tests/*.test.mjs
node --check assets/js/troy/troy-actions.js
node --check assets/js/troy/troy-copy.js
node --check assets/js/troy/troy-mood.js
node --check assets/js/troy/troy-controller.js
node --check assets/js/troy/troy-state.js
node --check assets/js/troy/troy-clips.js
node --check assets/js/troy/troy-sound.js
node --check assets/js/troy/troy-three.js
git diff --check
```

Expected: every command exits 0; the unused sound module remains syntactically valid.

- [x] **Step 2: Verify local HTTP delivery**

Require HTTP 200 for `/`, `/en/`, `assets/js/troy/troy-mood.js?v=20260905-mascot3`, the controller, CSS, and Troy GLB from the local port 4173 server.

- [x] **Step 3: Verify the Turkish Poke loop in a fresh browser load**

Click Troy once and require `pokeSurprised` copy with `Poke -> Recover`. Click again within 12 seconds and require `pokeAnnoyed` with `Poke -> Annoyed -> Recover`. Click a third time and require `pokeDefensive` with `Annoyed -> Poke -> Recover`. Wait at least 12 seconds without a physical action, click again, and require the surprised tier.

- [x] **Step 4: Verify English, keyboard, and regression behavior**

Repeat the three-tier flow on `/en/`. Confirm Enter/Space trigger the selected tool, rapid inputs retain only the latest pending action, Command calms mood and navigates, Slap and Whip still work, sound control is absent, fallback remains usable, and no console errors appear.

- [ ] **Step 5: Verify responsive layout**

Current evidence: the automated 480 px CSS contract passes and removing the fifth sound control reduces layout pressure. The in-app browser's temporary viewport override remained at 1280 px, so fresh live 480 px and 390 px measurements are intentionally left unchecked.

At desktop, 480 px, and 390 px widths, require no horizontal overflow, no covered dialogue, no clipped tool controls, and visible keyboard focus.

- [x] **Step 6: Present the local result without committing**

Report test totals and the local preview URL. Run `git status --short` and confirm all work remains uncommitted. Do not run `git add`, `git commit`, `git push`, or deployment commands.

## Deferred Roadmap

After the user accepts this Poke slice, continue in this order:

1. Slap foreground hand, anticipation/contact/recoil timing, cheek-hold reaction, and escalating written responses.
2. Whip foreground hand holding the whip, swing/contact/retract timing, defensive Troy reaction, and escalating written responses.
3. Command personality polish: reluctant acknowledgement, pointing, smug completion, and contextual lines.
4. Broader TroyApps homepage, navigation, cards, footer, and social-link refinement.
5. Recorded Troy voice, optional playback, facial/jaw synchronization, and only then any audio preference UI.
