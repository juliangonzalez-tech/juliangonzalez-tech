// Run with:  node --test tools/graphite/test/*.test.mjs
// Everything here uses synthetic data; no network, no real account.
import test from "node:test";
import assert from "node:assert/strict";
import { renderCity, heightOf, classify, safeLabel, LABEL } from "../city.mjs";
import { verifyCity, MAX_BYTES } from "../verify-city.mjs";
import { selectRepos, yearChunks, normalizeCalendar } from "../github.mjs";
import { C, contrast } from "../lib.mjs";

// ---- helpers ----
const pad = (n) => String(n).padStart(2, "0");
function calendar(startISO, nDays, fn) {
  const out = [], t0 = new Date(startISO + "T00:00:00Z");
  for (let i = 0; i < nDays; i++) {
    const d = new Date(t0.getTime() + i * 864e5), count = fn(i, d);
    out.push({ date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, count, level: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4 });
  }
  return out;
}
const file = (path, size = 800) => ({ path, size });
const render = async (opts) => { const doc = await renderCity(opts); const svg = await doc.render(); return { doc, svg }; };
const repos = [{ name: "alpha", files: [file("src/a.ts"), file("tests/a.test.ts"), file("README.md"), file("package.json")] }];

test("empty account renders a valid, calm night (no buildings, only vacant lots)", async () => {
  const { svg, doc } = await render({ days: calendar("2026-01-01", 90, () => 0), repos: [] });
  assert.match(svg, /^<svg /); assert.equal(doc.meta.grand, 0); assert.ok(doc.meta.H >= 200 && doc.meta.H < 400);
  assert.deepEqual(verifyCity(svg, { repos: [] }), []);
});

test("a single contribution is visible", async () => {
  const { svg } = await render({ days: calendar("2026-01-01", 30, (i) => (i === 29 ? 1 : 0)), repos: [] });
  assert.match(svg, /stroke="#70E3C4" stroke-opacity="[\d.]+"/); // one lit window
});

test("output is deterministic: same data, byte-identical SVG (so an unchanged day never makes a commit)", async () => {
  const days = calendar("2025-06-01", 400, (i) => (i % 9 === 0 ? (i % 5) + 1 : 0));
  const a = await render({ days, repos }), b = await render({ days, repos });
  assert.equal(a.svg, b.svg);
});

test("heights are absolute: more contributions always means a taller building, and nothing exceeds the cap", () => {
  let prev = 0;
  for (const t of [0, 1, 2, 5, 10, 20, 50, 100, 500, 5000]) { const h = heightOf(t); assert.ok(h >= prev, `monotonic at ${t}`); assert.ok(h <= 241, `cap at ${t}`); prev = h; }
  assert.ok(heightOf(34) > heightOf(18) + 30, "a 34-contribution week must be visibly taller than an 18 one");
});

test("an extreme week cannot break the layout", async () => {
  const { doc, svg } = await render({ days: calendar("2026-01-01", 60, (i) => (i === 30 ? 5000 : 1)), repos });
  assert.ok(doc.meta.H <= 700); assert.deepEqual(verifyCity(svg, { repos: ["alpha"] }), []);
});

test("three years of daily activity: 53 visible weeks, older history compressed, within budget and bounds", async () => {
  const { doc, svg } = await render({ days: calendar("2023-01-01", 1400, (i) => (i % 3 === 0 ? 2 + (i % 7) : 0)), repos });
  assert.equal(doc.meta.visible, 53); assert.ok(doc.meta.older > 0);
  assert.ok(Buffer.byteLength(svg) < MAX_BYTES, `size ${Buffer.byteLength(svg)}`);
  const xs = [...svg.matchAll(/<rect x="([\d.]+)" y="[\d.]+" width="([\d.]+)"/g)].map((m) => +m[1] + +m[2]);
  assert.ok(Math.max(...xs.filter((x) => x < 1000)) <= 960, "nothing is drawn past the panel edge");
});

test("a young account's buildings stay slim and sit at the right edge", async () => {
  const { svg } = await render({ days: calendar("2026-10-20", 14, (i) => (i % 2 ? 3 : 0)), repos: [] });
  const bodies = [...svg.matchAll(/<path d="M([\d.]+) \d+V[\d.]+(?:H[\d.]+V[\d.]+h[\d.]+V[\d.]+)?H([\d.]+)V\d+z" fill="url\(#g\d\)"/g)].map((m) => ({ x: +m[1], w: +m[2] - +m[1] }));
  assert.ok(bodies.length > 0 && Math.max(...bodies.map((b) => b.w)) <= 19.1 && Math.min(...bodies.map((b) => b.x)) > 480);
});

test("worst case: 53 very busy weeks and five large repositories still fit the size budget", async () => {
  const rp = Array.from({ length: 5 }, (_, i) => ({ name: `repo${i}`, files: Array.from({ length: 300 }, (_, k) => file(`src/m${k}.ts`, 200 + k * 7)) }));
  const { svg, doc } = await render({ days: calendar("2025-11-01", 371, (i) => 8 + (i % 13) * 5), repos: rp });
  assert.ok(Buffer.byteLength(svg) < MAX_BYTES, `size ${Buffer.byteLength(svg)} (${doc.meta.H}px tall)`);
  assert.deepEqual(verifyCity(svg, { repos: rp.map((r) => r.name) }), []);
});

test("repository names can never inject markup or glyphs the font lacks", async () => {
  assert.equal(safeLabel("<script>alert(1)</script>"), "?SCRIPT?ALERT?1???SCRI"); // unsafe characters become "?", length is capped
  const evil = [{ name: "<b onload=x>é☃", files: [file("a.ts")] }, { name: "x".repeat(200), files: [file("a.ts")] }];
  const { svg } = await render({ days: calendar("2026-01-01", 30, () => 1), repos: evil });
  assert.ok(!/<b onload/.test(svg)); assert.deepEqual(verifyCity(svg, { repos: evil.map((r) => r.name) }), []);
});

test("an empty repository and a 1000-file repository both render; the district keeps a fixed building budget and says so", async () => {
  const big = { name: "big", files: Array.from({ length: 1000 }, (_, i) => file(`src/f${i}.ts`, 100 + i)) };
  const { svg } = await render({ days: calendar("2026-01-01", 60, () => 1), repos: [{ name: "empty", files: [] }, big] });
  assert.ok((svg.match(/<polygon points=/g) || []).length <= 150 * 3 + 12);
  assert.ok(Buffer.byteLength(svg) < MAX_BYTES, `size ${Buffer.byteLength(svg)}`);
  assert.match(svg, /LARGEST SHOWN/);
  assert.deepEqual(verifyCity(svg, { repos: ["empty", "big"] }), []);
});

test("a sealed project is drawn as an empty dashed lot with a padlock and never lists any file", async () => {
  const sealed = [{ name: "secret", files: [file("TOP/SECRET/PLAN.TS"), file("keys/api.ts")], sealed: "SOURCE PRIVATE" }];
  const { svg, doc } = await render({ days: calendar("2026-01-01", 30, () => 1), repos: sealed });
  assert.equal(doc.meta.districts[0].files, 0); assert.match(svg, /stroke-dasharray/); assert.ok(!/PLAN|api\.ts|keys/i.test(svg));
  assert.match(svg, />SOURCE PRIVATE</);
});

test("verify gate: rejects script, external references, oversized and unexpected text; accepts the real output", async () => {
  const { svg } = await render({ days: calendar("2026-01-01", 60, (i) => i % 4), repos });
  assert.deepEqual(verifyCity(svg, { repos: ["alpha"] }), []);
  assert.ok(verifyCity(svg.replace("</svg>", "<script>1</script></svg>"), { repos: ["alpha"] }).includes("script element"));
  assert.ok(verifyCity(svg.replace("</svg>", '<image href="https://x.test/a.png"/></svg>'), { repos: ["alpha"] }).length >= 2);
  assert.ok(verifyCity(svg.replace("ALPHA", "SECRET-REPO-NAME"), { repos: ["alpha"] }).some((p) => p.includes("unexpected text")));
  assert.ok(verifyCity(svg + " ".repeat(MAX_BYTES), { repos: ["alpha"] }).some((p) => p.startsWith("too large")));
});

test("accessibility: every text colour has at least 4.5:1 contrast on the panel, and reduced motion switches animation off", async () => {
  for (const c of [LABEL, C.offwhite, C.sea]) assert.ok(contrast(c, C.midnight) >= 4.5, `${c} = ${contrast(c, C.midnight).toFixed(2)}`);
  const { svg } = await render({ days: calendar("2026-01-01", 60, (i) => i % 4), repos });
  assert.match(svg, /@media \(prefers-reduced-motion: reduce\)\{\*\{animation:none!important\}\}/);
  assert.match(svg, /role="img"/); assert.match(svg, /<title>[^<]+<\/title>/); assert.match(svg, /<desc>[^<]+<\/desc>/);
  // base state is the finished picture: no element starts hidden unless an animation is running
  assert.ok(!/<(?:rect|g|path|circle|polygon|text|line)\b[^>]*\bopacity="0"(?![^>]*>\s*<animate)/.test(svg.replace(/<rect width="\d+" height="\d+" fill="#0B1016" fill-opacity="0"><animate[^>]*\/><\/rect>/, "")), "nothing is permanently invisible");
});

test("every animation is slow enough to be safe (nothing blinks faster than 3 times a second)", async () => {
  const { svg } = await render({ days: calendar("2026-01-01", 60, (i) => i % 4), repos });
  for (const m of svg.matchAll(/animation:[a-z]+ ([\d.]+)s/g)) assert.ok(+m[1] >= 0.8 || /steps/.test(m[0]) === false, m[0]);
  assert.ok(!/animation:bc [0-2]\.[0-2]/.test(svg));
});

// ---- data layer (pure functions) ----
const R = (o) => ({ name: "r", private: false, visibility: "public", fork: false, archived: false, pushed_at: "2026-01-01", created_at: "2025-01-01", ...o });
test("only public, original, active repositories are selected; the profile repo and excluded ones are skipped", () => {
  const list = [R({ name: "keep" }), R({ name: "priv", private: true, visibility: "private" }), R({ name: "internal", visibility: "internal" }), R({ name: "forked", fork: true }),
    R({ name: "old", archived: true }), R({ name: "me" }), R({ name: "Signal-Lab" }), R({ name: "also-keep", created_at: "2025-05-01" })];
  assert.deepEqual(selectRepos(list, { login: "me", exclude: ["signal-lab"], maxRepos: 5 }).map((r) => r.name), ["keep", "also-keep"]);
});
test("the number of districts is capped to the most recently pushed repositories, shown in creation order", () => {
  const list = Array.from({ length: 9 }, (_, i) => R({ name: `r${i}`, pushed_at: `2026-0${i + 1}-01`, created_at: `2025-0${9 - i}-01` }));
  const names = selectRepos(list, { login: "x", maxRepos: 3 }).map((r) => r.name);
  assert.equal(names.length, 3); assert.deepEqual(new Set(names), new Set(["r8", "r7", "r6"]));
});
test("a contribution window longer than a year is split into legal one-year queries without gaps", () => {
  const chunks = yearChunks(new Date("2023-02-10T00:00:00Z"), new Date("2026-11-04T12:00:00Z"));
  assert.equal(chunks.length, 4);
  for (const [a, b] of chunks) assert.ok(b - a < 366 * 864e5);
  for (let i = 1; i < chunks.length; i++) assert.equal(chunks[i][0] - chunks[i - 1][1], 1000);
});
test("calendar normalisation keeps GitHub's own counts and levels, drops days outside the range and de-duplicates", () => {
  const mk = (d, n, l) => ({ date: d, contributionCount: n, contributionLevel: l });
  const c1 = { contributionCalendar: { weeks: [{ contributionDays: [mk("2026-01-01", 0, "NONE"), mk("2026-01-02", 4, "THIRD_QUARTILE")] }] } };
  const c2 = { contributionCalendar: { weeks: [{ contributionDays: [mk("2026-01-02", 4, "THIRD_QUARTILE"), mk("2026-01-03", 1, "FIRST_QUARTILE")] }] } };
  assert.deepEqual(normalizeCalendar([c1, c2], "2026-01-02", "2026-01-31"), [{ date: "2026-01-02", count: 4, level: 3 }, { date: "2026-01-03", count: 1, level: 1 }]);
});
test("file classification and exclusions follow repository-city's rules", () => {
  assert.equal(classify("src/app.ts"), "source"); assert.equal(classify("tests/app.test.ts"), "test"); assert.equal(classify("README.md"), "doc");
  assert.equal(classify("package.json"), "config"); assert.equal(classify("logo.png"), null); assert.equal(classify("node_modules/x/index.js"), null); assert.equal(classify("package-lock.json"), null);
});
