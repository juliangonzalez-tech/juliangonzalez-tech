// Run with:  node --test tools/graphite/test/*.test.mjs
// The piano SVG is checked against the note data itself: every note must press its key on time, idle keys must stay up.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { piano, pressesFor, PIANO } from "../piano.mjs";
import { contrast, C } from "../lib.mjs";

const data = JSON.parse(fs.readFileSync(new URL("../data/pathetique-2.json", import.meta.url), "utf8"));
const doc = await piano({ dev: true });
const body = doc.body.join("\n");

// piecewise-linear value of an SMIL animation at time t
const curve = (keyTimes, values, D) => { const k = keyTimes.split(";").map(Number), v = values.split(";").map(Number); return (t) => { const u = Math.min(1, Math.max(0, t / D)); for (let i = 1; i < k.length; i++) if (u <= k[i]) return v[i - 1] + ((v[i] - v[i - 1]) * (u - k[i - 1])) / Math.max(1e-9, k[i] - k[i - 1]); return v.at(-1); }; };
const keys = new Map();
for (const m of body.matchAll(/data-m="(\d+)"><g><animateTransform[^>]*\/><use href="#\w+"\/><use href="#g\w" opacity="0"><animate [^>]*keyTimes="([^"]*)" values="([^"]*)"/g)) keys.set(+m[1], curve(m[2], m[3], doc.meta.loop));

test("the excerpt is bars 1-8 of the movement and every note fits the keyboard window", () => {
  const P = pressesFor();
  assert.equal(P.outside.length, 0); assert.equal(P.count, 109); assert.equal(data.bars, 73);
  assert.ok(P.seconds > 29 && P.seconds < 31, `loop ${P.seconds}`);
});
test("sync: every note lights its own key while it sounds (all 109)", () => {
  const P = pressesFor(); let n = 0;
  for (const [midi, ints] of P.map) for (const [on, off] of ints) { n++; const f = keys.get(midi); assert.ok(f, `key ${midi} is animated`); assert.ok(f(on + Math.min(0.18, (off - on) * 0.8)) > 0.95, `key ${midi} at ${on.toFixed(2)}s`); }
  assert.equal(n, 109);
});
test("sync: keys with no note nearby stay up and dark", () => {
  const P = pressesFor(); let checks = 0;
  for (const [midi, f] of keys) for (let t = 0.05; t < doc.meta.loop; t += 0.37) {
    const near = (P.map.get(midi) || []).some(([on, off]) => on - 0.4 <= t && t <= off + 0.6);
    if (!near) { checks++; assert.ok(f(t) < 0.05, `key ${midi} lit at ${t.toFixed(2)}s`); }
  }
  assert.ok(checks > 1000);
});
test("chords: up to four keys are down together and the loop ends with every key up", () => {
  let max = 0; for (let t = 0; t < doc.meta.loop; t += 0.05) max = Math.max(max, [...keys.values()].filter((f) => f(t) > 0.95).length);
  assert.equal(max, 4); for (const f of keys.values()) assert.ok(f(doc.meta.loop) < 0.01);
});
test("accessibility: a static twin shows the opening chord, animation hides under reduced motion, text contrast is at least 4.5:1", () => {
  assert.match(body, /<g class="still">/); assert.match(doc.css.join("\n"), /@media \(prefers-reduced-motion: reduce\)\{\.anim\{display:none\}\.still\{display:inline\}\}/);
  const still = body.slice(body.indexOf('<g class="still">')); assert.ok((still.match(/href="#g[wb]"/g) || []).length >= 3);
  assert.ok(contrast("#8393a3", C.midnight) >= 4.5);
});
test("safety: no script, link, image or external reference; light enough for a README", () => {
  assert.ok(!/<script|<image|<foreignObject|\bon\w+=|href="https?:/i.test(body)); assert.ok(body.length < 60000, `body ${body.length}`);
  assert.equal(doc.meta.W, 416); assert.equal(doc.meta.H, 145);
});
