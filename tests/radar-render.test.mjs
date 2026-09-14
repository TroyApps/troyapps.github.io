import assert from "node:assert/strict";
import test from "node:test";

import { renderHomeBox, renderRadar } from "../scripts/radar-render.mjs";

const fixture = {
  generatedAt: "2026-09-13T10:11:20.560Z",
  repos: [{
    full: "troyapps/example",
    owner: "troyapps",
    name: "example",
    url: "https://github.com/troyapps/example",
    stars: 1,
    topics: [],
  }],
  news: [],
  repoSummaries: [{
    tr: { what: "Örnek depo", how: "", who: "" },
    en: { what: "Example repository", how: "", who: "" },
  }],
  newsSummaries: [],
};

test("Radar renderers never emit indentation-only or trailing-whitespace lines", () => {
  for (const html of [renderRadar(fixture, true), renderHomeBox(fixture, true)]) {
    assert.doesNotMatch(html, /[ \t]+$/m);
  }
});
