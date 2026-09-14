import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
for (const name of ["bazooka", "whip"]) {
  test(`${name} control icon is a non-empty WebP`, async () => {
    const bytes = await readFile(new URL(`assets/img/troy/controls/${name}.webp`, root));
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP");
    assert.ok(bytes.byteLength > 1500);
    assert.ok(bytes.byteLength < 180000);
  });
}
for (const file of ["index.html", "en/index.html"]) {
  test(`${file} uses static model-derived control icons`, async () => {
    const html = await readFile(new URL(file, root), "utf8");
    assert.match(html, /data-troy-tool-option="bazooka"[\s\S]*?\/assets\/img\/troy\/controls\/bazooka\.webp/);
    assert.match(html, /data-troy-tool-option="whip"[\s\S]*?\/assets\/img\/troy\/controls\/whip\.webp/);
    assert.equal((html.match(/data-troy-canvas/g) || []).length, 1);
  });
}
