# Troy Facial Acting Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reversible Blender prototype proving that the existing Troy mesh can display visible surprised, angry, and defensive facial expressions without replacing the body rig or production website model.

**Architecture:** Work only in `troyapps-3d-work` and generate a separate prototype `.blend`, `.glb`, audit JSON, and four close-up PNG renders. Add three morph targets to the existing skinned mesh using explicit head/front spatial masks, then validate that each target moves facial vertices while protected horn, ear, collar, and neck regions remain untouched. Do not copy the prototype GLB into the website until the user visually approves the renders.

**Tech Stack:** Blender 5.2 Python API, glTF 2.0/GLB, Python standard library, existing Troy 25k mesh and 41-bone rig.

**Spec:** `docs/superpowers/specs/2026-09-04-troy-mascot-interaction-design.md`

## Global Constraints

- Prototype outputs never replace `assets/models/troy/troy.glb` in this plan.
- Required shape-key names are exactly `Basis`, `Surprised`, `Angry`, and `Defensive`.
- Only vertices in the `Head` vertex group and front facial depth may move.
- Horns, ears, collar, neck, and all body vertices remain byte-position identical between Basis and each expression.
- Expressions must read clearly in still close-ups before web integration begins.
- Do not commit, push, or deploy.

## File Structure

- Keep `../troyapps-3d-work/inspect_face_topology.py`: reusable topology diagnostic.
- Create `../troyapps-3d-work/build_face_prototype.py`: import, mask, shape-key construction, validation, render, save, and export.
- Create `../troyapps-3d-work/working/troy-facial-prototype-v1.blend`: inspectable prototype source.
- Create `../troyapps-3d-work/output/troy-facial-prototype-v1.glb`: non-production prototype export.
- Create `../troyapps-3d-work/output/troy-face-basis.png`.
- Create `../troyapps-3d-work/output/troy-face-surprised.png`.
- Create `../troyapps-3d-work/output/troy-face-angry.png`.
- Create `../troyapps-3d-work/output/troy-face-defensive.png`.
- Create `../troyapps-3d-work/output/troy-facial-prototype-v1-audit.json`.

---

### Task 1: Lock the Facial-Mask and Morph Validation Contract

**Files:**
- Create: `../troyapps-3d-work/build_face_prototype.py`
- Create: `../troyapps-3d-work/output/troy-facial-prototype-v1-audit.json`

**Interfaces:**
- Consumes: `../troyapps-3d-work/output/troy-interactions-v2.glb`.
- Produces: deterministic vertex-index sets named `face_core`, `brow_left`, `brow_right`, `eye_left`, `eye_right`, and `mouth`.
- Produces: audit fields `shape_keys`, `moved_vertices`, `max_displacement`, `protected_vertices_moved`, and region bounds.

- [ ] **Step 1: Write validation before expression deformation**

Build the audit function first. It must raise when required shape keys are absent, any expression moves zero vertices, any expression moves a vertex outside `face_core`, or any protected vertex moves more than `0.00001` Blender units.

- [ ] **Step 2: Run the builder in audit-only mode and verify failure**

Run Blender against the current GLB with `--audit-only`. Expected: non-zero exit identifying missing `Surprised`, `Angry`, and `Defensive` keys.

- [ ] **Step 3: Implement deterministic facial masks**

Use the imported mesh's `Head` vertex-group weight plus local coordinates. Start with the measured head bounds (`x -0.254..0.254`, `y -0.235..0.150`, `z 0.521..0.979`) and restrict expression candidates to the front half (`y < -0.115`) and central face (`abs(x) < 0.18`, `0.56 < z < 0.82`). Subdivide the central face into brow, eye, and mouth bands and write their exact resolved bounds/counts into the audit.

- [ ] **Step 4: Verify masks exclude protected areas**

Require non-empty left/right brow and eye masks, a non-empty mouth mask, symmetry within 30 percent between left/right mask counts, and zero candidate vertices outside the Head group.

---

### Task 2: Create and Render Three Expression Morphs

**Files:**
- Modify: `../troyapps-3d-work/build_face_prototype.py`
- Create: `../troyapps-3d-work/working/troy-facial-prototype-v1.blend`
- Create: `../troyapps-3d-work/output/troy-facial-prototype-v1.glb`
- Create: four PNG renders listed in File Structure.

**Interfaces:**
- Consumes: validated facial masks from Task 1.
- Produces: shape keys `Surprised`, `Angry`, and `Defensive` on the existing `Troy` mesh.
- Preserves: the existing armature, skin weights, materials, textures, and nine skeletal clips.

- [ ] **Step 1: Add Basis and three named shape keys**

Create Basis first. Each expression copies Basis and changes only vertices in its facial submasks; all other key-block coordinates remain identical.

- [ ] **Step 2: Sculpt Surprised**

Raise both brow regions, open the eye bands vertically away from their local centers, and lower the mouth region into a small oval. Cap every per-vertex displacement at `0.035` Blender units.

- [ ] **Step 3: Sculpt Angry**

Lower inner brow vertices, slightly raise outer brow vertices, narrow both eye bands, and compress the mouth band. Cap every displacement at `0.03` Blender units.

- [ ] **Step 4: Sculpt Defensive**

Create an asymmetric guarded expression: narrow the screen-left eye more strongly, tilt the brows unevenly, and pull one mouth corner sideways/down. Cap every displacement at `0.03` Blender units.

- [ ] **Step 5: Render controlled close-ups**

Use one fixed camera aimed at the head, one neutral world/background, identical three-light setup, 768 x 768 resolution, transparent background, and the same skeletal frame for every render. Set exactly one expression to influence `1.0` per expression render and all to `0.0` for Basis.

- [ ] **Step 6: Save and export the prototype**

Save the `.blend`, export a selected skinned GLB with animations, skins, shape keys, cameras/lights excluded, and write the audit JSON next to it.

---

### Task 3: Verify and Present the Prototype

**Files:**
- Verify: all Task 2 outputs.
- Do not modify website production assets.

**Interfaces:**
- Consumes: prototype Blender, GLB, renders, and audit.
- Produces: a visual approval package for the user.

- [ ] **Step 1: Parse the prototype GLB**

Require one skin, one 25k Troy mesh, morph target count `3`, exact target names, and the existing nine animation names.

- [ ] **Step 2: Validate the audit**

Require each expression to move at least 30 vertices, maximum displacement at or below its cap, and `protected_vertices_moved` equal to zero.

- [ ] **Step 3: Inspect all four PNG renders**

Compare Basis against Surprised, Angry, and Defensive. Reject distortions affecting horns, ears, collar, silhouette, or texture alignment. If the expressions do not read clearly, revise only mask bounds/displacements and render again.

- [ ] **Step 4: Present renders without integrating**

Show the four labeled close-ups and report audit counts. Wait for user acceptance before replacing the website GLB or starting the separate 3D Slap/Whip prop task.

## Approved Continuation After Facial Acceptance

1. Integrate morph blending into `troy-three.js` and connect Poke tiers.
2. Build the separate 3D open-hand Slap prop and catch/block escalation.
3. Build the separate 3D hand-held Whip prop and dodge/grab/pull escalation.
4. Polish Command acting and then continue the broader site redesign.
5. Add recorded voice only after all silent acting is accepted.
