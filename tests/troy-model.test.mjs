import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const modelUrl = new URL("../assets/models/troy/troy.glb", import.meta.url);
const expectedAnimations = [
  "Acknowledge",
  "Annoyed",
  "BazookaAim",
  "BazookaFire",
  "Idle",
  "Point",
  "Poke",
  "Recover",
  "Slap",
  "Talk",
  "WhipHit",
];

function parseGlbJson(bytes) {
  assert.equal(bytes.toString("ascii", 0, 4), "glTF", "GLB magic must be glTF");
  assert.equal(bytes.readUInt32LE(4), 2, "GLB must use glTF 2.0");
  assert.equal(bytes.readUInt32LE(8), bytes.length, "declared GLB length must match file size");

  const jsonLength = bytes.readUInt32LE(12);
  assert.equal(bytes.toString("ascii", 16, 20), "JSON", "first GLB chunk must be JSON");
  return JSON.parse(bytes.subarray(20, 20 + jsonLength).toString("utf8").trimEnd());
}

test("Troy GLB is a compact, skinned model with the exact web animation contract", async () => {
  const bytes = await readFile(modelUrl);
  const gltf = parseGlbJson(bytes);

  assert.ok(bytes.length <= 6 * 1024 * 1024, `Troy GLB is too large: ${bytes.length} bytes`);
  assert.equal(gltf.meshes?.length, 1, "Troy must export as one web mesh");
  assert.equal(gltf.skins?.length, 1, "Troy must include one skeleton skin");
  const primitive = gltf.meshes[0]?.primitives?.[0];
  assert.equal(primitive?.targets?.length, 3, "Troy must include three facial morph targets");
  assert.deepEqual(
    gltf.meshes[0]?.extras?.targetNames,
    ["Surprised", "Angry", "Defensive"],
    "Troy facial morph names must stay exact",
  );
  assert.deepEqual(
    gltf.animations?.map(({ name }) => name).sort(),
    expectedAnimations,
  );

  const nodeNames = new Set(gltf.nodes?.map(({ name }) => name));
  for (const bone of ["Tail01", "Tail02", "Tail03", "Tail04", "Tail05"]) {
    assert.equal(nodeNames.has(bone), true, `missing ${bone}`);
  }

  function animationDuration(name) {
    const animation = gltf.animations.find((candidate) => candidate.name === name);
    assert.ok(animation, `${name} animation must exist`);
    return Math.max(...animation.samplers.map(({ input }) => gltf.accessors[input].max[0]));
  }

  const durationLimits = {
    Poke: 2,
    Slap: 2.5,
    WhipHit: 2.5,
    Acknowledge: 4.5,
    Recover: 2,
  };
  for (const [name, limit] of Object.entries(durationLimits)) {
    const duration = animationDuration(name);
    assert.ok(duration <= limit, `${name} must be at most ${limit}s, got ${duration}s`);
  }

  const forbiddenNames = /(?:icosphere|camera|light)/i;
  assert.equal(
    gltf.nodes?.some(({ name = "" }) => forbiddenNames.test(name)),
    false,
    "helper geometry, cameras, and lights must not ship in the model",
  );
});
