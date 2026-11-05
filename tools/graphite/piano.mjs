// The piano signature: a realistic keyboard that plays bars 1-8 of Beethoven's Pathétique Sonata (II. Adagio cantabile)
// in sync with the notes of a public-domain score, as an animated SVG with a static twin for reduced motion.
// Note data: tools/graphite/data/pathetique-2.json, from the Mutopia Project (Public Domain), see data/SOURCES.md.
import fs from "node:fs";
import { Doc, C, panel } from "./lib.mjs";
import { keyboard, defs, noteName } from "./keyboard.mjs";

const LABEL = "#8393a3";
const DATA = JSON.parse(fs.readFileSync(new URL("./data/pathetique-2.json", import.meta.url), "utf8"));
export const PIANO = { startBar: 1, endBar: 8, bpm: 32, lo: 31, hi: 71, keys: 24, w: 15.4, ratio: 3.8, W: 416 };
const REDUCED = `.still{display:none}@media (prefers-reduced-motion: reduce){.anim{display:none}.still{display:inline}}`;
const arrow = (x, y) => `<path d="M${x} ${y + 16}L${x + 16} ${y}M${x + 2} ${y}H${x + 16}V${y + 14}" fill="none" stroke="${C.sea}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

// notes of the excerpt -> press intervals per key, in seconds of the loop
export function pressesFor(d = DATA, { startBar, endBar, bpm, lo, hi } = PIANO) {
  const t0 = (startBar - 1) * d.barTicks, t1 = endBar * d.barTicks, sec = (t) => ((t - t0) / d.ppq) * 60 / bpm;
  const map = new Map(), outside = [];
  const melody = [];
  for (const [tick, dur, midi, staff] of d.notes) {
    if (tick < t0 || tick >= t1) continue;
    if (midi < lo - 1 || midi > hi + 1) { outside.push(midi); continue; }
    const on = sec(tick), off = on + Math.max(0.2, sec(Math.min(tick + dur, t1)) - on - 0.04);
    // how strongly the note is voiced: the singing line (upper staff, long notes) leads, accompaniment and bass sit back
    const q = dur / d.ppq, level = staff === 0 ? (q >= 0.45 ? 1 : 0.6) : q >= 0.45 ? 0.8 : 0.58;
    (map.get(midi) ?? map.set(midi, []).get(midi)).push([on, off, level]);
    if (staff === 0 && q >= 0.45) melody.push({ on, off, midi });
  }
  return { map, melody, seconds: sec(t1), outside, count: [...map.values()].reduce((s, a) => s + a.length, 0) };
}

// A soft mint light that rides along the melody: it glides from each sung note to the next (never ahead of the score: a glide
// starts at the note's onset), brightens while the note is held and fades in the rests. Its position is only decoration.
function lamp(melody, cx, D, y) {
  if (!melody.length) return "";
  const GL = 0.5, pos = [[0, cx(melody[0].midi)]], op = [[0, 0]];
  melody.forEach((n, i) => {
    const x = cx(n.midi), prev = pos.at(-1);
    if (i === 0) { pos.push([Math.max(0.001, n.on), x]); } else if (x !== prev[1]) { pos.push([Math.max(prev[0] + 0.001, n.on), prev[1]]); pos.push([n.on + GL, x]); }
    const hold = Math.max(n.off, n.on + 0.25), next = melody[i + 1], gap = next ? next.on - hold : 99;
    op.push([Math.max(op.at(-1)[0] + 0.001, n.on), op.at(-1)[1]], [n.on + 0.25, 0.9], [hold, 0.7]);
    if (gap > 0.35) op.push([hold + 0.6, 0]);
  });
  const end = Math.min(D - 0.01, op.at(-1)[0] + 0.7); op.push([Math.max(op.at(-1)[0] + 0.01, Math.min(end, D - 0.02)), 0]);
  const fix = (a) => { const o = [a[0]]; for (const p of a.slice(1)) if (p[0] > o.at(-1)[0] && p[0] < D) o.push(p); o.push([D, o.at(-1)[1]]); return o; };
  const P = fix(pos), O = fix(op), kt = (a) => a.map((p) => (p[0] / D).toFixed(4).replace(/0+$/, "").replace(/\.$/, "").replace(/^0\./, ".") || "0").join(";");
  const spl = Array(P.length - 1).fill("0.45 0 0.2 1").join(";");
  return `<ellipse cx="0" cy="${y}" rx="26" ry="15" fill="url(#lm)" opacity="0"><animate attributeName="cx" dur="${D}s" repeatCount="indefinite" calcMode="spline" keySplines="${spl}" keyTimes="${kt(P)}" values="${P.map((p) => p[1].toFixed(1)).join(";")}"/><animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" keyTimes="${kt(O)}" values="${O.map((p) => p[1]).join(";")}"/></ellipse>`;
}

export async function piano({ dev = false } = {}) {
  const d = DATA, P = pressesFor(d);
  if (P.outside.length) throw new Error(`notes outside the keyboard window: ${P.outside.map(noteName).join(",")}`);
  const D = Math.round((P.seconds + 2.4) * 10) / 10, W = PIANO.W, w = PIANO.w, h = Math.round(w * PIANO.ratio);
  const kbWidth = w * PIANO.keys, x0 = Math.round(((W - kbWidth) / 2) * 10) / 10, y0 = 66, H = 145;
  const stillTick = 0, sounding = d.notes.filter(([t, dur]) => t <= stillTick && stillTick < t + dur).map((n) => n[2]);
  const probe = keyboard({ x0, y0, w, h, lo: PIANO.lo, hi: PIANO.hi, presses: new Map(), D });
  const kb = keyboard({ x0, y0, w, h, lo: PIANO.lo, hi: PIANO.hi, presses: P.map, D, still: sounding, dev, lamp: lamp(P.melody, probe.cx, D, y0 + h - 10) });
  const doc = new Doc(W, H, {
    title: "A piano keyboard playing the opening of Beethoven's Pathétique Sonata, second movement, in sync with the notes of the score, signed Julian. Select it to open the full 88-key player.",
    desc: `Bars ${PIANO.startBar} to ${PIANO.endBar} of the public-domain score (${d.source.name}), looped. Pressed keys light up in sea-glass.`,
  });
  doc.style(REDUCED + `@keyframes rise{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}.hd{animation:rise .9s cubic-bezier(.2,.7,.2,1) .1s both}@media (prefers-reduced-motion: reduce){.hd{animation:none}}`);
  doc.add(panel(W, H));
  doc.add(`<defs>${defs(w, h)}</defs>`);
  // header: the signature, the piece (large enough to stay legible when the panel shrinks on a phone), and the card arrow
  doc.add(`<g class="hd">${doc.text("Julian", { fam: "serif", style: "italic", size: 34, fill: C.offwhite, x: 24, y: 42, ls: -0.5 })}${doc.text("BEETHOVEN  /  PATHÉTIQUE", { fam: "mono", size: 12, fill: LABEL, x: W - 58, y: 31, anchor: "end", ls: 1.3 })}${doc.text("ADAGIO CANTABILE", { fam: "mono", size: 11, fill: LABEL, x: W - 58, y: 47, anchor: "end", ls: 1.3 })}${arrow(W - 40, 22)}</g>`);
  doc.add(kb.rail); doc.add(kb.layers);
  doc.meta = { W, H, loop: D, keys: kb.n, presses: P.count, x0, w, y0, lo: PIANO.lo, hi: PIANO.hi };
  return doc;
}
