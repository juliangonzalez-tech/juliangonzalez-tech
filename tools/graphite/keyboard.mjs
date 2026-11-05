// A realistic keyboard drawn in SVG, with SMIL key presses driven by real note data.
// Proportions follow a real piano: black keys are 0.583 of a white key's width (13.7 / 23.5 mm) and 0.63 of its length
// (95 / 150 mm), and they sit slightly off the boundary between their white neighbours (C#/F# left, D#/A# right, G# centred).
// The overall key length is shortened (about 3 : 1 instead of 6.4 : 1) so the keyboard stays compact.
import { C } from "./lib.mjs";

const OFF = { 1: -0.11, 3: 0.11, 6: -0.14, 8: 0, 10: 0.14 }; // black-key centre vs the white-key boundary, in white-key widths
const WHITE = new Set([0, 2, 4, 5, 7, 9, 11]);
export const isBlack = (m) => !WHITE.has(m % 12);
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const f2 = (n) => (Math.round(n * 100) / 100).toString();

// lo and hi are the MIDI numbers of the first and last WHITE key
export function layout(lo, hi) {
  const white = [], black = [];
  let i = 0;
  for (let m = lo; m <= hi; m++) {
    if (!isBlack(m)) { white.push({ midi: m, i }); i++; }
    else black.push({ midi: m, u: i + OFF[m % 12] }); // boundary between white i-1 and white i is at u = i
  }
  return { white, black, n: white.length };
}

export function defs(w, h) {
  const wk = w - 0.9, bw = 0.583 * w, bh = 0.63 * h;
  return `
<linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aab4bd"/><stop offset=".14" stop-color="#e3e9ee"/><stop offset=".8" stop-color="#edf1f4"/><stop offset="1" stop-color="#dfe5ea"/></linearGradient>
<linearGradient id="wf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d6dde3"/><stop offset="1" stop-color="#9ea9b3"/></linearGradient>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3540"/><stop offset="1" stop-color="#10171d"/></linearGradient>
<linearGradient id="bf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4856"/><stop offset="1" stop-color="#1b232b"/></linearGradient>
<linearGradient id="bs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="mw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea}" stop-opacity="0"/><stop offset=".55" stop-color="${C.sea}" stop-opacity=".34"/><stop offset="1" stop-color="${C.sea}" stop-opacity=".7"/></linearGradient>
<linearGradient id="mb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sea}" stop-opacity=".12"/><stop offset="1" stop-color="${C.sea}" stop-opacity=".92"/></linearGradient>
<linearGradient id="rl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3541"/><stop offset="1" stop-color="#121920"/></linearGradient>
<g id="wk"><path d="M0 0H${f2(wk)}V${f2(h - 2.4)}Q${f2(wk)} ${h} ${f2(wk - 2.4)} ${h}H2.4Q0 ${h} 0 ${f2(h - 2.4)}Z" fill="url(#wg)"/><path d="M0 ${f2(h - 6.5)}H${f2(wk)}V${f2(h - 2.4)}Q${f2(wk)} ${h} ${f2(wk - 2.4)} ${h}H2.4Q0 ${h} 0 ${f2(h - 2.4)}Z" fill="url(#wf)"/><rect width="${f2(wk)}" height="1" fill="#fff" fill-opacity=".5" y="${f2(h - 6.5)}"/></g>
<g id="bk"><rect x="${f2(bw)}" width="3.4" height="${f2(bh + 1)}" fill="url(#bs)"/><rect width="${f2(bw)}" height="${f2(bh)}" rx="1.1" fill="url(#bg)"/><rect y="${f2(bh * 0.78)}" width="${f2(bw)}" height="${f2(bh * 0.22)}" rx="1.1" fill="url(#bf)"/><rect width="1" height="${f2(bh)}" fill="#fff" fill-opacity=".11"/><rect x="1" width="${f2(bw - 2)}" height=".9" fill="#fff" fill-opacity=".09"/></g>
<g id="gw"><rect width="${f2(wk)}" height="${h}" rx="2" fill="url(#mw)"/><rect y="${f2(h - 2.4)}" width="${f2(wk)}" height="2.4" rx="1" fill="${C.sea}" fill-opacity=".95"/></g>
<radialGradient id="lm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.sea}" stop-opacity=".5"/><stop offset=".55" stop-color="${C.sea}" stop-opacity=".16"/><stop offset="1" stop-color="${C.sea}" stop-opacity="0"/></radialGradient>
<g id="gb"><rect width="${f2(bw)}" height="${f2(bh)}" rx="1.1" fill="url(#mb)"/></g>`;
}

// ---- timelines ------------------------------------------------------------------------------------------------
// presses: [[on, off, level], ...] in seconds, level 0..1 (how strongly the note is voiced). The score's timing is never
// changed: a key starts to move at the note's onset and starts to rise at its end; only the easing around those instants is
// shaped, so the picture stays locked to the notes.
const smooth = (t) => t * t * (3 - 2 * t);
function merge(ints, D) {
  const out = [];
  for (const [a, b, l = 1] of ints.sort((x, y) => x[0] - y[0])) {
    const last = out[out.length - 1];
    if (last && a < last[1] + 0.03) { last[1] = Math.max(last[1], b); last[2] = Math.max(last[2], l); } else out.push([a, b, l]);
  }
  return out.map(([a, b, l]) => [a, Math.min(b, D - 0.9), l]).filter(([a, b]) => b > a);
}
const fmtT = (t, D) => (t / D).toFixed(4).replace(/0+$/, "").replace(/\.$/, "").replace(/^0\./, ".").replace(/^$/, "0");
function emit(pts, D) { // pts: sorted [t, v]; times strictly increasing
  const out = [[0, pts[0][1]]];
  for (const [t, v] of pts) { const tt = Math.max(t, out[out.length - 1][0] + 0.0006 * D); if (tt >= D) break; out.push([tt, v]); }
  out.push([D, out[out.length - 1][1] === 0 ? 0 : 0]);
  return out;
}
const valueAt = (pts, t) => { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, v0] = pts[i - 1], [t1, v1] = pts[i]; return v0 + ((v1 - v0) * (t - t0)) / Math.max(1e-9, t1 - t0); } return pts.at(-1)[1]; };
// Physical key: eased descent over ~0.11 s, a held depth that settles slightly, a soft return over ~0.3 s.
function keyTrack(ints, D, depth) {
  const pts = [[0, 0]];
  for (const [a, b] of ints) {
    const back = pts.filter((p) => p[0] < a); const v0 = valueAt(pts, a); pts.length = 0; pts.push(...back, [a, v0]);
    [0.25, 0.6, 1].forEach((f) => pts.push([a + 0.11 * f, v0 + (1 - v0) * smooth(f)]));
    pts.push([Math.max(b, a + 0.2), 1]);
    [0.3, 0.65, 1].forEach((f) => pts.push([Math.max(b, a + 0.2) + 0.3 * f, 1 - smooth(f)]));
  }
  const e = emit(pts, D);
  return { keyTimes: e.map((p) => fmtT(p[0], D)).join(";"), values: e.map((p) => `0 ${+(p[1] * depth).toFixed(2)}`).join(";") };
}
// Light in the key: it swells with the note, eases down a little while the note is held, then lingers and fades after it ends.
function glowTrack(ints, D) {
  const pts = [[0, 0]];
  for (const [a, b, L] of ints) {
    const back = pts.filter((p) => p[0] < a); const v0 = valueAt(pts, a); pts.length = 0; pts.push(...back, [a, v0]);
    pts.push([a + 0.07, v0 + (L - v0) * 0.55], [a + 0.16, L]);
    const hold = Math.max(b, a + 0.2), held = hold - a > 0.6 ? L * 0.72 : L;
    if (held < L) pts.push([a + 0.16 + (hold - a - 0.16) * 0.5, L * 0.88]);
    pts.push([hold, held], [hold + 0.35, held * 0.42], [hold + 0.8, 0]);
  }
  const e = emit(pts, D);
  return { keyTimes: e.map((p) => fmtT(p[0], D)).join(";"), values: e.map((p) => +p[1].toFixed(2)).join(";") };
}

// parts: everything a page needs to put a keyboard at (x0, y0)
export function keyboard({ x0, y0, w, h, lo, hi, presses, D, still = [], dev = false, lamp = null }) {
  const L = layout(lo, hi), bw = 0.583 * w;
  const kbW = L.n * w;
  const wx = (k) => x0 + k.i * w + 0.45, bx = (k) => x0 + k.u * w - bw / 2;
  const cx = (m) => { const k = L.white.find((q) => q.midi === m); if (k) return wx(k) + (w - 0.9) / 2; const q = L.black.find((r) => r.midi === m); return bx(q) + bw / 2; };
  const dur = (id) => `dur="${D}s" repeatCount="indefinite"`;
  let wStatic = "", wAnim = "", wStill = "", bStatic = "", bAnim = "", bStill = "";
  const part = (k, black) => {
    const ints = merge(presses.get(k.midi) || [], D), on = still.includes(k.midi), X = black ? bx(k) : wx(k), id = black ? "bk" : "wk", g = black ? "gb" : "gw", depth = black ? 1.3 : 1.7;
    if (!ints.length && !on) return [`<use href="#${id}" x="${f2(X)}" y="${y0}"/>`, "", ""];
    let anim;
    if (ints.length) {
      const kt = keyTrack(ints, D, depth), gt = glowTrack(ints, D);
      anim = `<g transform="translate(${f2(X)} ${y0})"${dev ? ` data-m="${k.midi}"` : ""}><g><animateTransform attributeName="transform" type="translate" ${dur()} keyTimes="${kt.keyTimes}" values="${kt.values}"/><use href="#${id}"/><use href="#${g}" opacity="0"><animate attributeName="opacity" ${dur()} keyTimes="${gt.keyTimes}" values="${gt.values}"/></use></g></g>`;
    } else anim = `<use href="#${id}" x="${f2(X)}" y="${y0}"/>`;
    const st = `<g transform="translate(${f2(X)} ${y0 + (on ? depth : 0)})"><use href="#${id}"/>${on ? `<use href="#${g}"/>` : ""}</g>`;
    return [null, anim, st];
  };
  for (const k of L.white) { const [a, b, c] = part(k, false); if (a) wStatic += a; else { wAnim += b; wStill += c; } }
  for (const k of L.black) { const [a, b, c] = part(k, true); if (a) bStatic += a; else { bAnim += b; bStill += c; } }
  const slot = `<rect x="${f2(x0 - 1)}" y="${y0 - 1}" width="${f2(kbW + 2)}" height="${h + 2}" rx="3" fill="#05080b"/>`;
  const rail = `<rect x="${f2(x0 - 5)}" y="${y0 - 9}" width="${f2(kbW + 10)}" height="9" rx="2.5" fill="url(#rl)"/><rect x="${f2(x0 - 5)}" y="${y0 - 9}" width="${f2(kbW + 10)}" height="1" rx=".5" fill="#fff" fill-opacity=".1"/>`;
  return { kbW, n: L.n, rail, cx,
    layers: `${slot}<g>${wStatic}</g><g class="anim">${wAnim}</g><g class="still">${wStill}</g>${lamp ? `<g class="anim">${lamp}</g>` : ""}<g>${bStatic}</g><g class="anim">${bAnim}</g><g class="still">${bStill}</g>` };
}

export const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const noteName = (m) => names[m % 12] + (Math.floor(m / 12) - 1);
