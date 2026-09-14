import assert from "node:assert/strict";
import test from "node:test";

const geometryModule = new URL("../assets/js/pixel-geometry.js", import.meta.url);

test("particle budget stays subtle across viewport sizes", async () => {
  const { particleBudget } = await import(geometryModule);

  assert.equal(particleBudget(320, false), 36);
  assert.equal(particleBudget(1280, false), 48);
  assert.equal(particleBudget(2560, false), 60);
  assert.equal(particleBudget(1280, true), 36);
});

test("diamond targets land on the requested geometric outline", async () => {
  const { buildGeometryTargets } = await import(geometryModule);

  assert.deepEqual(
    buildGeometryTargets({ kind: "diamond", count: 4, centerX: 200, centerY: 120, scale: 40 }),
    [
      { x: 200, y: 80 },
      { x: 240, y: 120 },
      { x: 200, y: 160 },
      { x: 160, y: 120 },
    ],
  );
});

test("pixel morphing eases instead of snapping through sharp turns", async () => {
  const { morphPoint } = await import(geometryModule);

  assert.deepEqual(morphPoint({ x: 10, y: 30 }, { x: 110, y: 70 }, 0), { x: 10, y: 30 });
  assert.deepEqual(morphPoint({ x: 10, y: 30 }, { x: 110, y: 70 }, 0.5), { x: 60, y: 50 });
  assert.deepEqual(morphPoint({ x: 10, y: 30 }, { x: 110, y: 70 }, 1), { x: 110, y: 70 });
});

test("the next pattern never immediately repeats", async () => {
  const { chooseNextPattern } = await import(geometryModule);

  assert.equal(chooseNextPattern("hexagon", () => 0), "orbit");
  assert.equal(chooseNextPattern("diamond", () => 0.999), "cube");
});
