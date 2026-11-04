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
<g id="gb"><rect width="${f2(bw)}" height="${f2(bh)}" rx="1.1" fill="url(#mb)"/></g>`;
}

// Press timeline for one key: [[on, off], ...] in seconds, merged and clamped to the loop.
function merge(ints, D) {
  const out = [];
  for (const [a, b] of ints.sort((x, y) => x[0] - y[0])) {
    const last = out[out.length - 1];
    if (last && a < last[1] + 0.14) last[1] = Math.max(last[1], b); else out.push([a, b]);
  }
  return out.map(([a, b]) => [a, Math.min(b, D - 0.35)]).filter(([a, b]) => b > a);
}
function track(ints, D, depth) {
  const DOWN = 0.07, UP = 0.24, kt = [0], y = [0], o = [0];
  const push = (t, v) => { const tt = Math.min(D, Math.max(kt[kt.length - 1] + 0.0004 * D, t)); kt.push(tt); y.push(v); o.push(v); };
  for (const [a, b] of ints) {
    if (a > kt[kt.length - 1] + 0.01) push(a, 0);
    push(a + DOWN, 1); push(Math.max(a + DOWN + 0.02, b), 1); push(b + UP, 0);
  }
  if (kt[kt.length - 1] < D) { kt.push(D); y.push(0); o.push(0); }
  const keyTimes = kt.map((t) => f2(Math.min(1, t / D)).replace(/^0\./, ".").replace(/^0$/, "0")).join(";");
  // finer precision where needed: re-emit with 4 decimals
  const kt4 = kt.map((t) => (t / D).toFixed(4).replace(/0+$/, "").replace(/\.$/, "").replace(/^0\./, ".")).map((s) => (s === "" ? "0" : s)).join(";");
  return { keyTimes: kt4, trans: y.map((v) => `0 ${v ? depth : 0}`).join(";"), opac: o.join(";") };
}

// parts: everything a page needs to put a keyboard at (x0, y0)
export function keyboard({ x0, y0, w, h, lo, hi, presses, D, still = [], dev = false }) {
  const L = layout(lo, hi), bw = 0.583 * w, bh = 0.63 * h;
  const kbW = L.n * w;
  const pressed = (m) => (presses.get(m) || []);
  const wx = (k) => x0 + k.i * w + 0.45, bx = (k) => x0 + k.u * w - bw / 2;
  const ring = (id) => `<use href="#${id}"/>`;
  let wStatic = "", wAnim = "", wStill = "", bStatic = "", bAnim = "", bStill = "";
  for (const k of L.white) {
    const ints = merge(pressed(k.midi).map(([a, b]) => [a, b]), D);
    if (!ints.length && !still.includes(k.midi)) { wStatic += `<use href="#wk" x="${f2(wx(k))}" y="${y0}"/>`; continue; }
    if (ints.length) { const t = track(ints, D, 1.7); wAnim += `<g transform="translate(${f2(wx(k))} ${y0})"${dev ? ` data-m="${k.midi}"` : ""}><g><animateTransform attributeName="transform" type="translate" dur="${D}s" repeatCount="indefinite" keyTimes="${t.keyTimes}" values="${t.trans}"/><use href="#wk"/><use href="#gw" opacity="0"><animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" keyTimes="${t.keyTimes}" values="${t.opac}"/></use></g></g>`; }
    else wAnim += `<use href="#wk" x="${f2(wx(k))}" y="${y0}"/>`;
    wStill += `<g transform="translate(${f2(wx(k))} ${y0 + (still.includes(k.midi) ? 1.7 : 0)})"><use href="#wk"/>${still.includes(k.midi) ? `<use href="#gw"/>` : ""}</g>`;
  }
  for (const k of L.black) {
    const ints = merge(pressed(k.midi).map(([a, b]) => [a, b]), D);
    if (!ints.length && !still.includes(k.midi)) { bStatic += `<use href="#bk" x="${f2(bx(k))}" y="${y0}"/>`; continue; }
    if (ints.length) { const t = track(ints, D, 1.3); bAnim += `<g transform="translate(${f2(bx(k))} ${y0})"${dev ? ` data-m="${k.midi}"` : ""}><g><animateTransform attributeName="transform" type="translate" dur="${D}s" repeatCount="indefinite" keyTimes="${t.keyTimes}" values="${t.trans.replace(/ 1\.7/g, " 1.3")}"/><use href="#bk"/><use href="#gb" opacity="0"><animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" keyTimes="${t.keyTimes}" values="${t.opac}"/></use></g></g>`; }
    else bAnim += `<use href="#bk" x="${f2(bx(k))}" y="${y0}"/>`;
    bStill += `<g transform="translate(${f2(bx(k))} ${y0 + (still.includes(k.midi) ? 1.3 : 0)})"><use href="#bk"/>${still.includes(k.midi) ? `<use href="#gb"/>` : ""}</g>`;
  }
  const slot = `<rect x="${f2(x0 - 1)}" y="${y0 - 1}" width="${f2(kbW + 2)}" height="${h + 2}" rx="3" fill="#05080b"/>`;
  const rail = `<rect x="${f2(x0 - 5)}" y="${y0 - 9}" width="${f2(kbW + 10)}" height="9" rx="2.5" fill="url(#rl)"/><rect x="${f2(x0 - 5)}" y="${y0 - 9}" width="${f2(kbW + 10)}" height="1" rx=".5" fill="#fff" fill-opacity=".1"/>`;
  return { kbW, n: L.n, rail,
    layers: `${slot}<g>${wStatic}</g><g class="anim">${wAnim}</g><g class="still">${wStill}</g><g>${bStatic}</g><g class="anim">${bAnim}</g><g class="still">${bStill}</g>` };
}

export const names = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const noteName = (m) => names[m % 12] + (Math.floor(m / 12) - 1);
