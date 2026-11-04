// The city: one SVG with a night skyline (primary) above a compact district strip (secondary).
//
//   Skyline   one building per week, height = that week's contributions on an absolute, saturating scale (a busier
//             year is a taller city, never normalised to the busiest week), lit windows = days with activity.
//   Districts one block per public repository, one building per file, height = file size, colour = role.
//
// Concepts adapted from two open-source projects, both credited in THIRD_PARTY_NOTICES.md:
//   * pinkpixel-dev/skyline (Apache-2.0): week = building, day = window, seeded star sky, antenna on the record week.
//     Re-implemented from scratch as vector SVG; changes: absolute height scale, setbacks, reflection, grouped animation.
//   * parrisdigital/repository-city (MIT, Copyright (c) 2026 Parris Digital): file classification, excluded file types and
//     the log2(size) height curve, drawn here as a static isometric SVG instead of its Three.js viewer.
//
// Input is plain data (dates and counts, public repository file trees). Nothing here can see a private repository.
import { Doc, C, panel } from "./lib.mjs";

export const LABEL = "#8393a3"; // 5.9:1 on Midnight; used for every piece of small text (steel #687988 is 4.25:1, ornaments only)
const SKY_TOP = "#0b1016", SKY_LOW = "#0f1f26";
const LIT = [0, 0.5, 0.68, 0.86, 1]; // window opacity by GitHub's contribution level 1-4
const TONES = ["#141d27", "#18232e", "#1c2834"];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const hash = (a, b = 0, c = 0) => { let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 2147483647)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
const h01 = (a, b, c) => hash(a, b, c) / 4294967295;
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- file classification and exclusions (adapted from repository-city, MIT) ----------
const BINARY = new Set("png jpg jpeg gif webp avif ico bmp tiff mp3 wav ogg mp4 mov webm pdf zip gz tar woff woff2 ttf otf eot exe dll so dylib wasm svg".split(" "));
const LOCK = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|poetry\.lock|Cargo\.lock|uv\.lock)$/;
const EXCL = /(^|\/)(node_modules|\.next|dist|build|coverage|vendor|target|\.git|\.turbo|__pycache__|\.venv)\//;
const CODE = new Set("ts tsx mts js jsx mjs cjs py rs go rb java kt swift css scss html sh sql graphql".split(" "));
export function classify(p) {
  const ext = (p.split(".").pop() || "").toLowerCase(), base = p.split("/").pop();
  if (BINARY.has(ext) || LOCK.test(p) || EXCL.test(p)) return null;
  if (/(^|\/)(tests?|__tests__|spec)\//.test(p) || /(\.|_)(test|spec)\.[a-z]+$/.test(base) || /^test_/.test(base)) return "test";
  if (/(^|\/)docs?\//.test(p) || ext === "md" || /^(LICENSE|NOTICE|README|PRIVACY|PRODUCT)/i.test(base)) return "doc";
  if (CODE.has(ext)) return "source";
  if (/^(package|tsconfig|pyproject|requirements|vitest|next\.config|postcss|tailwind|ruff|\.gitignore|\.gitattributes)/.test(base) || ["json", "toml", "yml", "yaml", "cfg", "ini", "mjs"].includes(ext)) return "config";
  return "other";
}
// the district is the quiet half of the picture: role colours sit a step below the skyline's mint lights
const ROLE = { source: "#5cc7a9", test: "#8798a8", doc: "#4b5a68", config: "#2e3a46", other: "#232d37" };
const mix = (hex, to, t) => { const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16); const f = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t); return "#" + [16, 8, 0].map((s) => f(s).toString(16).padStart(2, "0")).join(""); };

// Anything that can reach a <text> element is reduced to a safe, font-covered alphabet first.
export const safeLabel = (s, max = 22) => String(s).toUpperCase().replace(/[^A-Z0-9 ._\-]/g, "?").slice(0, max);

// ---------- calendar helpers ----------
function weeksOf(days) {
  const first = new Date(days[0].date + "T00:00:00Z"), start = new Date(first);
  start.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const weeks = [];
  for (const d of days) {
    const wi = Math.floor((new Date(d.date + "T00:00:00Z") - start) / (7 * 864e5));
    (weeks[wi] ??= Array(7).fill(null))[new Date(d.date + "T00:00:00Z").getUTCDay()] = d;
  }
  return weeks.map((w) => w || Array(7).fill(null));
}
// Absolute and saturating: every extra contribution raises the building, nothing is ever clipped or re-normalised.
export const heightOf = (tot) => (tot <= 0 ? 4 : 9 + 232 * (1 - Math.exp(-tot / 32)));

export async function renderCity({ days, repos = [], visibleWeeks = 53, fixed = true }) {
  if (!days || !days.length) throw new Error("no calendar days");
  const W = 960, X0 = 48, X1 = 912;
  // ---- skyline model ----
  const all = weeksOf(days);
  const front = all.slice(-visibleWeeks), back = all.slice(0, Math.max(0, all.length - visibleWeeks));
  const tot = front.map((w) => w.reduce((s, d) => s + (d ? d.count : 0), 0));
  const act = front.map((w) => w.filter((d) => d && d.count > 0).length);
  const grand = days.reduce((s, d) => s + d.count, 0), active = days.filter((d) => d.count > 0).length;
  const best = Math.max(0, ...tot), rec = best > 0 ? tot.indexOf(best) : -1;
  const hs = tot.map(heightOf), maxH = Math.max(...hs);
  const GY = Math.round(clamp(maxH + 100, 200, 340)); // ground line; the sky grows with the city
  const REFL = 44;
  const first = days[0].date, last = days[days.length - 1].date;
  const span = `${MON[+first.slice(5, 7) - 1]} ${first.slice(0, 4)} - ${MON[+last.slice(5, 7) - 1]} ${last.slice(0, 4)}`;

  // ---- district model ----
  // The district has a fixed budget of buildings so the file stays small however large a repository grows. When there are
  // more files than the budget, each repository keeps its largest files (proportionally) and the footer says so.
  const MAX_BUILDINGS = 150;
  const raw = repos.map((r) => ({ r, sealed: r.sealed || null, files: r.sealed ? [] : r.files.map((f) => ({ ...f, role: classify(f.path) })).filter((f) => f.role) }));
  const totalFiles = raw.reduce((s, x) => s + x.files.length, 0), capped = totalFiles > MAX_BUILDINGS;
  const plans = raw.map(({ r, sealed, files }) => {
    if (capped) files = files.sort((a, b) => b.size - a.size).slice(0, Math.max(12, Math.floor((MAX_BUILDINGS * files.length) / totalFiles)));
    files.sort((a, b) => a.path.localeCompare(b.path));
    const n = Math.max(files.length, 1);
    const cols = sealed ? 5 : clamp(Math.ceil(Math.sqrt(n * 1.25)), 3, 9);
    const rows = sealed ? 4 : Math.max(2, Math.ceil(files.length / cols));
    return { name: r.name, files, cols, rows, sealed };
  });
  const logs = plans.flatMap((p) => p.files.map((f) => Math.log2(f.size + 1)));
  const lo = logs.length ? Math.min(...logs) : 0, hi = logs.length ? Math.max(...logs) : 1;
  const K = Math.sqrt(3) / 2, proj = (x, y, z) => [(x - y) * K, (x + y) * 0.5 - z * 0.9];
  const GAP = 2.2, lots = [], boxes = [];
  let ox = 0, oy = 0;
  plans.forEach((p, di) => {
    lots.push({ x: ox, y: oy, w: p.cols, d: p.rows, name: p.name, sealed: p.sealed });
    p.files.forEach((f, i) => {
      const c = i % p.cols, r = Math.floor(i / p.cols), n = (Math.log2(f.size + 1) - lo) / Math.max(1e-6, hi - lo);
      boxes.push({ x: ox + c + 0.14, y: oy + r + 0.14, w: 0.72, d: 0.72, z: 0.4 + Math.pow(n, 1.25) * 3.2, role: f.role, di, i });
    });
    ox += p.cols + GAP; oy -= p.cols + GAP;
  });
  let dMinX = 0, dMaxX = 1, dMinY = 0, dMaxY = 1;
  if (lots.length) {
    const pts = [];
    for (const l of lots) for (const [x, y] of [[l.x, l.y], [l.x + l.w, l.y], [l.x + l.w, l.y + l.d], [l.x, l.y + l.d]]) pts.push(proj(x, y, 0));
    for (const b of boxes) pts.push(proj(b.x, b.y, b.z), proj(b.x + b.w, b.y + b.d, 0));
    dMinX = Math.min(...pts.map((p) => p[0])); dMaxX = Math.max(...pts.map((p) => p[0]));
    dMinY = Math.min(...pts.map((p) => p[1])); dMaxY = Math.max(...pts.map((p) => p[1]));
  }
  const D_TOP = GY + REFL + 48, D_H = 112; // district zone below the water line
  const S = lots.length ? Math.min(((X1 - X0) * 0.62) / (dMaxX - dMinX), D_H / (dMaxY - dMinY), 13) : 1;
  const dW = (dMaxX - dMinX) * S, dx0 = (W - dW) / 2 - dMinX * S, dy0 = D_TOP - dMinY * S;
  const T = ([x, y, z]) => { const [px, py] = proj(x, y, z); return [px * S + dx0, py * S + dy0]; };
  const P = (pts) => pts.map((p) => T(p).map((v) => f1(v)).join(",")).join(" ");
  const Pi = (pts) => pts.map((p) => T(p).map((v) => Math.round(v)).join(",")).join(" "); // buildings: whole pixels keep the file small
  const dBottom = lots.length ? D_TOP + (dMaxY - dMinY) * S : D_TOP;
  const FOOT = dBottom + 52;
  const H = Math.round(lots.length ? FOOT + 6 : GY + REFL + 70);

  const plain = (n) => String(n).replace(/[^A-Za-z0-9._-]/g, "?").slice(0, 40); // names are sanitised everywhere, including the hidden description
  const names = plans.map((p) => `${plain(p.name)}${p.sealed ? " (source private)" : ` (${p.files.length} ${p.files.length === 1 ? "file" : "files"})`}`).join(", ");
  const doc = new Doc(W, H, {
    fixed,
    title: `A night skyline of my GitHub activity, ${span}, above a map of my projects.`,
    desc: `One building per week, as GitHub counts contributions: ${grand} contributions on ${active} days; the busiest week had ${best}. Taller means more contributions; lit windows are days with activity. Below, one block per public repository: ${names || "none yet"}.`,
  });
  doc.style(`
@keyframes up{from{transform:scaleY(.02);opacity:0}to{transform:scaleY(1);opacity:1}}
@keyframes tw{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes st{0%,100%{opacity:.9}50%{opacity:.25}}
@keyframes bc{0%,55%{opacity:1}56%,100%{opacity:.15}}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.55}}
.bl{transform-box:fill-box;transform-origin:50% 100%;animation:up 1.1s cubic-bezier(.2,.7,.2,1) both}
.bx{transform-box:fill-box;transform-origin:50% 100%;animation:up .9s cubic-bezier(.2,.7,.2,1) both}
.t0{animation:tw 3.4s ease-in-out infinite}.t1{animation:tw 4.6s ease-in-out -1.2s infinite}.t2{animation:tw 5.8s ease-in-out -2.4s infinite}
.s0{animation:st 4.2s ease-in-out infinite}.s1{animation:st 6.4s ease-in-out -2.1s infinite}
.bc{animation:bc 2.6s steps(1) infinite}
.p0{animation:pu 5s ease-in-out infinite}.p1{animation:pu 6.4s ease-in-out -2s infinite}.p2{animation:pu 7.6s ease-in-out -4s infinite}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
`);
  doc.add(panel(W, H));
  doc.add(`<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_TOP}"/><stop offset="1" stop-color="${SKY_LOW}"/></linearGradient>
<linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea}" stop-opacity="0"/><stop offset="1" stop-color="${C.sea}" stop-opacity=".12"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.steel}" stop-opacity="0"/><stop offset=".15" stop-color="${LABEL}" stop-opacity=".55"/><stop offset=".85" stop-color="${LABEL}" stop-opacity=".55"/><stop offset="1" stop-color="${C.steel}" stop-opacity="0"/></linearGradient>
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.midnight}" stop-opacity=".1"/><stop offset="1" stop-color="${C.midnight}" stop-opacity="1"/></linearGradient>
${TONES.map((tn, k) => `<linearGradient id="g${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(tn, LABEL, 0.3)}"/><stop offset=".07" stop-color="${tn}"/><stop offset="1" stop-color="${tn}"/></linearGradient>`).join("")}
<clipPath id="water"><rect x="0" y="${GY + 1}" width="${W}" height="${REFL}"/></clipPath>
<radialGradient id="moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.offwhite}" stop-opacity=".16"/><stop offset="1" stop-color="${C.offwhite}" stop-opacity="0"/></radialGradient>
</defs>
<rect x="1" y="1" width="${W - 2}" height="${GY - 1}" rx="15" fill="url(#sky)"/>
<rect x="1" y="${GY - 110}" width="${W - 2}" height="110" fill="url(#hz)"/>`);

  // sky: moon + seeded stars (decoration only; never data)
  doc.add(`<circle cx="${X1 - 34}" cy="58" r="34" fill="url(#moon)"/><circle cx="${X1 - 34}" cy="58" r="6.5" fill="${C.offwhite}" fill-opacity=".9"/>`);
  let stars = "";
  const nStars = Math.round(clamp(GY / 7, 26, 46));
  for (let i = 0; i < nStars; i++) {
    const x = X0 + (hash(i, 1, 1) % (X1 - X0)), y = 22 + (hash(i, 2, 2) % Math.max(20, GY - 96));
    if (Math.hypot(x - (X1 - 34), y - 58) < 26) continue;
    const g = hash(i, 4, 4) % 3;
    stars += `<circle${g === 0 ? ' class="s0"' : g === 1 ? ' class="s1"' : ""} cx="${x}" cy="${y}" r="${(0.55 + (hash(i, 3, 3) % 5) * 0.14).toFixed(2)}" fill="${C.offwhite}" fill-opacity="${(0.24 + (hash(i, 5, 5) % 5) * 0.06).toFixed(2)}"/>`;
  }
  doc.add(`<g>${stars}</g>`);

  // distant history: when the account is older than the visible year, earlier months sit far away as dim slivers
  if (back.length) {
    const months = new Map();
    for (const w of back) for (const d of w) if (d) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) || 0) + d.count);
    const keys = [...months.keys()], bw = clamp(64 / keys.length - 1, 2, 7);
    let far = "";
    keys.forEach((k, i) => { const h = 5 + 0.55 * heightOf(months.get(k) / 4); far += `<rect x="${f1(X0 + i * (bw + 1))}" y="${f1(GY - h)}" width="${f1(bw)}" height="${f1(h)}" fill="#18212b" fill-opacity=".7"/>`; });
    doc.add(`<g>${far}</g>`);
  }

  // ---- buildings ----
  // Markup is kept compact on purpose (one silhouette path per building, windows as square-capped dots) so that even a
  // very busy year stays well inside the size budget.
  const FX0 = back.length ? X0 + 76 : X0;
  const step = Math.min((X1 - FX0) / front.length, 17), x0 = X1 - front.length * step;
  const lots0 = [], reflBody = [], reflWin = [[], [], [], [], []];
  // pass 1: geometry and how many windows each building lights. The share lit equals the share of the week's days with
  // activity (days / 7). If a city is so dense that the windows alone would blow the size budget, every building is
  // thinned by the same factor, so more activity still always means more light.
  const MAX_WINDOWS = 1700;
  const geo = front.map((wk, i) => {
    const t = tot[i], a = act[i], h = hs[i];
    const bw = clamp(step * (0.7 + 0.22 * h01(i, 11, 3)), 5, 19), cx = x0 + i * step + step / 2, x = cx - bw / 2;
    if (t === 0) return { empty: true, x, bw };
    const tiered = h > 92, tierH = tiered ? Math.round(clamp(h * 0.15, 9, 30)) : 0, bodyH = h - tierH;
    const usable = bw - 4.4, cols = Math.max(1, Math.floor(usable / 3.4)), rows = Math.max(0, Math.floor((bodyH - 7) / 6)), cells = rows * cols;
    return { wk, i, a, h, bw, cx, x, top: GY - h, tiered, tierH, tw: bw * 0.6, bodyH, usable, cols, wp: usable / cols, rows, cells, nLit: a > 0 && cells > 0 ? clamp(Math.round((cells * a) / 7), 1, cells) : 0 };
  });
  const litTotal = geo.reduce((s2, g) => s2 + (g.nLit || 0), 0), thin = litTotal > MAX_WINDOWS ? MAX_WINDOWS / litTotal : 1;
  let bld = "";
  for (const g of geo) {
    if (g.empty) { lots0.push(`M${f1(g.x)} ${GY}h${f1(g.bw)}v-3h-${f1(g.bw)}z`); continue; } // a vacant lot: a low slab, nothing else
    const { i, wk, h, bw, cx, x, top, tiered, tw, bodyH, cols, wp, cells } = g, tx = cx - tw / 2, by = GY - bodyH;
    const d = `M${f1(x)} ${GY}V${f1(by)}${tiered ? `H${f1(tx)}V${f1(top)}h${f1(tw)}V${f1(by)}` : ""}H${f1(x + bw)}V${GY}z`;
    reflBody.push(`M${f1(x)} ${GY}h${f1(bw)}v${f1(Math.min(bodyH, REFL))}h-${f1(bw)}z`);
    let extra = "";
    if (i === rec || h > 150) { // antenna on the tallest towers; a beacon on the busiest week
      const al = 10 + (hash(i, 6, 6) % 7);
      extra += `<path d="M${f1(cx)} ${f1(top)}v-${al}" stroke="${C.steel}" stroke-opacity=".8" fill="none"/>`;
      if (i === rec) extra += `<circle class="bc" cx="${f1(cx)}" cy="${f1(top - al - 2)}" r="1.9" fill="${C.sea}"/>`;
    }
    const lv = [[], [], [], [], []];
    if (g.nLit > 0) {
      const nLit = Math.max(1, Math.round(g.nLit * thin));
      const order = [...Array(cells).keys()].sort((p2, q) => hash(i, p2, 21) - hash(i, q, 21)).slice(0, nLit);
      const levels = wk.filter((dd) => dd && dd.count > 0).map((dd) => dd.level || 1).sort((p2, q) => q - p2);
      order.forEach((cell, k) => {
        const r = Math.floor(cell / cols), c = cell % cols, level = levels[k % levels.length] || 1;
        const wx = x + 2.2 + (c + 0.5) * wp, wy = GY - 5 - (r + 0.5) * 6;
        lv[level].push(`M${f1(wx)} ${f1(wy)}h0`);
        if (GY - wy < REFL) reflWin[level].push(`M${f1(wx)} ${f1(2 * GY - wy)}h0`);
      });
    }
    const wins = [1, 2, 3, 4].map((L) => (lv[L].length ? `<path d="${lv[L].join("")}" stroke="${C.sea}" stroke-opacity="${LIT[L]}"/>` : "")).join("");
    const tg = wins && hash(i, 7, 7) % 3 !== 0 ? `t${hash(i, 8, 8) % 3}` : "";
    bld += `<g class="bl" style="animation-delay:${(i * 0.018).toFixed(3)}s"><path d="${d}" fill="url(#g${hash(i, 9, 9) % 3})"/>${extra}<g${tg ? ` class="${tg}"` : ""} fill="none" stroke-width="2.4" stroke-linecap="square">${wins}</g></g>`;
  }
  if (lots0.length) doc.add(`<path d="${lots0.join("")}" fill="#0f161d"/>`);
  doc.add(`<g>${bld}</g>`);
  // ground line, then the reflection in the water: the same city, mirrored, dim, fading out
  doc.add(`<line x1="${X0 - 14}" y1="${GY + 0.5}" x2="${X1 + 14}" y2="${GY + 0.5}" stroke="url(#gl)"/>`);
  const refW = reflWin.map((pp, L) => (pp.length ? `<path d="${pp.join("")}" stroke="${C.sea}" stroke-opacity="${(LIT[L] * 0.5).toFixed(2)}"/>` : "")).join("");
  doc.add(`<g clip-path="url(#water)"><path d="${reflBody.join("")}" fill="${TONES[1]}" fill-opacity=".45"/><g fill="none" stroke-width="2.4" stroke-linecap="square">${refW}</g></g>`);
  doc.add(`<rect x="1" y="${GY + 1}" width="${W - 2}" height="${REFL}" fill="url(#fade)"/>`);

  // captions under the water line
  const cy = GY + REFL + 22;
  doc.add(doc.text(span, { fam: "mono", size: 11, fill: LABEL, x: X0, y: cy, ls: 1.8 }));
  doc.add(doc.text("1 WEEK = 1 BUILDING  /  LIT WINDOW = ACTIVE DAY", { fam: "mono", size: 11, fill: LABEL, x: X1, y: cy, anchor: "end", ls: 1.4 }));

  // ---- districts (secondary) ----
  if (lots.length) {
    doc.add(`<line x1="${X0}" y1="${GY + REFL + 38}" x2="${X1}" y2="${GY + REFL + 38}" stroke="${C.steel}" stroke-opacity=".18"/>`);
    let ground = "";
    for (const l of lots) {
      const pts = P([[l.x, l.y, 0], [l.x + l.w, l.y, 0], [l.x + l.w, l.y + l.d, 0], [l.x, l.y + l.d, 0]]);
      ground += l.sealed
        ? `<polygon points="${pts}" fill="none" stroke="${LABEL}" stroke-opacity=".75" stroke-dasharray="3 3.5"/>`
        : `<polygon points="${pts}" fill="#10161d" stroke="${C.steel}" stroke-opacity=".3"/>`;
    }
    doc.add(`<g>${ground}</g>`);
    // a padlock at the centre of a sealed lot: the project exists, its source is not public
    for (const l of lots) if (l.sealed) {
      const [px, py] = T([l.x + l.w / 2, l.y + l.d / 2, 0]), s = Math.max(1.1, S * 0.09);
      doc.add(`<g transform="translate(${f1(px)} ${f1(py - 7 * s)}) scale(${s.toFixed(2)})" fill="none" stroke="${C.sea}" stroke-width="1.6" stroke-linecap="round"><rect x="-6" y="-1" width="12" height="9" rx="1.6" fill="${C.midnight}"/><path d="M-3.4 -1V-4a3.4 3.4 0 0 1 6.8 0V-1"/></g>`);
    }
    const byLot = new Map();
    for (const b of boxes) (byLot.get(b.di) ?? byLot.set(b.di, []).get(b.di)).push(b);
    let bx = "";
    for (const [di, list] of byLot) {
      list.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z); // back to front (painter's algorithm)
      let g = "";
      for (const b of list) {
        const col = ROLE[b.role], left = mix(col, C.midnight, 0.42), right = mix(col, C.midnight, 0.64);
        const { x, y, w, d: dd, z } = b;
        const pulse = b.role === "source" && hash(b.di, b.i, 5) % 5 === 0 ? ` class="p${hash(b.i, b.di, 6) % 3}"` : "";
        g += `<polygon points="${Pi([[x, y + dd, 0], [x + w, y + dd, 0], [x + w, y + dd, z], [x, y + dd, z]])}" fill="${left}"/><polygon points="${Pi([[x + w, y, 0], [x + w, y + dd, 0], [x + w, y + dd, z], [x + w, y, z]])}" fill="${right}"/><polygon points="${Pi([[x, y, z], [x + w, y, z], [x + w, y + dd, z], [x, y + dd, z]])}" fill="${col}"${pulse}/>`;
      }
      bx += `<g class="bx" style="animation-delay:${(di * 0.18).toFixed(2)}s">${g}</g>`;
    }
    doc.add(`<g>${bx}</g>`);
    const labelY = Math.max(...lots.map((l) => T([l.x + l.w, l.y + l.d, 0])[1])) + 19; // one shared baseline
    // long names are shortened so neighbouring labels can never touch (one mono character is about 8.1px with spacing)
    const centres = lots.map((l) => T([l.x + l.w, l.y + l.d, 0])[0]);
    const room = centres.length > 1 ? Math.min(...centres.slice(1).map((c, k) => c - centres[k])) : 400;
    const maxChars = clamp(Math.floor((room - 14) / 8.1), 6, 22);
    const fit = (n) => { const t = safeLabel(n, 200); return t.length > maxChars ? t.slice(0, maxChars - 1) + "." : t; };
    for (const l of lots) {
      const [lx] = T([l.x + l.w, l.y + l.d, 0]);
      doc.add(doc.text(fit(l.name), { fam: "mono", size: 11, fill: LABEL, x: f1(lx), y: f1(labelY), anchor: "middle", ls: 1.5 }));
      if (l.sealed) doc.add(doc.text(safeLabel(l.sealed), { fam: "mono", size: 10, fill: C.sea, x: f1(lx), y: f1(labelY + 14), anchor: "middle", ls: 1.4, opacity: 0.9 }));
    }
    // footer: what a block is, and the role colours
    const fy = Math.round(FOOT - 6);
    doc.add(doc.text(capped ? "1 BLOCK = 1 PUBLIC REPOSITORY  /  1 BUILDING = 1 FILE (LARGEST SHOWN)" : "1 BLOCK = 1 PUBLIC REPOSITORY  /  1 BUILDING = 1 FILE", { fam: "mono", size: 10, fill: LABEL, x: X0, y: fy, ls: 1.3 }));
    let lx = X1;
    for (const [role, label] of [["config", "CONFIG"], ["doc", "DOCS"], ["test", "TESTS"], ["source", "SOURCE"]]) {
      doc.add(doc.text(label, { fam: "mono", size: 10, fill: LABEL, x: lx, y: fy, anchor: "end", ls: 1.3 }));
      const wdt = label.length * 6.9 + 1.3 * label.length;
      doc.add(`<rect x="${f1(lx - wdt - 12)}" y="${fy - 8}" width="8" height="8" fill="${ROLE[role]}"/>`);
      lx -= wdt + 28;
    }
  }
  doc.meta = { H, GY, weeks: all.length, visible: front.length, older: back.length, grand, active, best, maxH: Math.round(maxH), thinned: thin < 1, districts: plans.map((p) => ({ name: p.name, files: p.files.length, sealed: !!p.sealed })), capped, span };
  return doc;
}
