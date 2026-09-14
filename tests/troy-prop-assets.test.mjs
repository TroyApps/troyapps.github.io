import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));

async function glbJson(publicPath) {
  const assetPath = publicPath.split("?", 1)[0];
  const localPath = `${siteRoot}${assetPath.slice(1).replaceAll("/", "\\")}`;
  const buffer = await readFile(localPath);
  const jsonLength = buffer.readUInt32LE(12);
  return JSON.parse(buffer.subarray(20, 20 + jsonLength).toString().replace(/\0+$/, ""));
}

test("Troy renderer exposes web-ready GLB assets for bazooka combat", async () => {
  let propModels;
  try {
    ({ TROY_PROP_MODELS: propModels } = await import("../assets/js/troy/troy-props.js"));
  } catch {
    assert.fail("Troy prop asset manifest is missing");
  }

  assert.deepEqual(propModels, {
    bazooka: "/assets/models/troy/bazooka.glb?v=20260907-bazooka1",
    rocket: "/assets/models/troy/rocket.glb?v=20260907-bazooka1",
    whip: "/assets/models/troy/whip.glb?v=20260906-prop2",
  });

  for (const publicPath of Object.values(propModels)) {
    const assetPath = publicPath.split("?", 1)[0];
    const localPath = `${siteRoot}${assetPath.slice(1).replaceAll("/", "\\")}`;
    const assetStat = await stat(localPath);
    const header = await readFile(localPath, { encoding: null, flag: "r" });
    assert.ok(assetStat.size > 100_000 && assetStat.size < 5_000_000, `${publicPath} must be web-sized`);
    assert.equal(header.subarray(0, 4).toString("ascii"), "glTF", `${publicPath} must be a binary GLB`);
  }
});

test("bazooka GLB preserves both authored endpoint markers on its local Y axis", async () => {
  const gltf = await glbJson("/assets/models/troy/bazooka.glb");
  const muzzle = gltf.nodes.find((node) => node.name === "BazookaMuzzle");
  const exhaust = gltf.nodes.find((node) => node.name === "BazookaExhaust");

  assert.deepEqual(muzzle.translation, [0, -0.3506084084510803, 0]);
  assert.deepEqual(exhaust.translation, [0, 0.3506084084510803, 0]);
});

test("physical props scale to a deliberate fraction of Troy's height", async () => {
  const { fitPropToMascotHeight } = await import("../assets/js/troy/troy-props.js");
  assert.equal(fitPropToMascotHeight(4, 2, 0.34), 0.17);
  assert.equal(fitPropToMascotHeight(0, 2, 0.34), 680);
});
