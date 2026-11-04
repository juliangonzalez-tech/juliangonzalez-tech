// The piano signature: a realistic keyboard that plays bars 1-8 of Beethoven's Pathétique Sonata (II. Adagio cantabile)
// in sync with the notes of a public-domain score, as an animated SVG with a static twin for reduced motion.
// Note data: tools/graphite/data/pathetique-2.json, from the Mutopia Project (Public Domain), see data/SOURCES.md.
import fs from "node:fs";
import { Doc, C, panel } from "./lib.mjs";
import { keyboard, defs, noteName } from "./keyboard.mjs";

const LABEL = "#8393a3";
const DATA = JSON.parse(fs.readFileSync(new URL("./data/pathetique-2.json", import.meta.url), "utf8"));
export const PIANO = { startBar: 1, endBar: 8, bpm: 32, lo: 31, hi: 71, keys: 24, w: 15.4, ratio: 3.7, W: 416 };
const REDUCED = `.still{display:none}@media (prefers-reduced-motion: reduce){.anim{display:none}.still{display:inline}}`;
const arrow = (x, y) => `<path d="M${x} ${y + 16}L${x + 16} ${y}M${x + 2} ${y}H${x + 16}V${y + 14}" fill="none" stroke="${C.sea}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

// notes of the excerpt -> press intervals per key, in seconds of the loop
export function pressesFor(d = DATA, { startBar, endBar, bpm, lo, hi } = PIANO) {
  const t0 = (startBar - 1) * d.barTicks, t1 = endBar * d.barTicks, sec = (t) => ((t - t0) / d.ppq) * 60 / bpm;
  const map = new Map(), outside = [];
  for (const [tick, dur, midi] of d.notes) {
    if (tick < t0 || tick >= t1) continue;
    if (midi < lo - 1 || midi > hi + 1) { outside.push(midi); continue; }
    const on = sec(tick), off = on + Math.max(0.2, sec(Math.min(tick + dur, t1)) - on - 0.04);
    (map.get(midi) ?? map.set(midi, []).get(midi)).push([on, off]);
  }
  return { map, seconds: sec(t1), outside, count: [...map.values()].reduce((s, a) => s + a.length, 0) };
}

export async function piano({ dev = false } = {}) {
  const d = DATA, P = pressesFor(d);
  if (P.outside.length) throw new Error(`notes outside the keyboard window: ${P.outside.map(noteName).join(",")}`);
  const D = Math.round((P.seconds + 2.4) * 10) / 10, W = PIANO.W, w = PIANO.w, h = Math.round(w * PIANO.ratio);
  const kbWidth = w * PIANO.keys, x0 = Math.round(((W - kbWidth) / 2) * 10) / 10, y0 = 60, H = 145;
  const stillTick = 0, sounding = d.notes.filter(([t, dur]) => t <= stillTick && stillTick < t + dur).map((n) => n[2]);
  const kb = keyboard({ x0, y0, w, h, lo: PIANO.lo, hi: PIANO.hi, presses: P.map, D, still: sounding, dev });
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
  const py = H - 14;   // a hairline with one slow dot shows where the loop is (hidden under reduced motion)
  doc.add(`<line x1="${x0}" y1="${py}" x2="${x0 + kbWidth}" y2="${py}" stroke="${C.steel}" stroke-opacity=".3"/><g class="anim"><circle cx="${x0}" cy="${py}" r="2" fill="${C.sea}"><animate attributeName="cx" dur="${D}s" repeatCount="indefinite" values="${x0};${x0 + kbWidth}" keyTimes="0;1"/></circle></g>`);
  doc.meta = { W, H, loop: D, keys: kb.n, presses: P.count, x0, w, y0, lo: PIANO.lo, hi: PIANO.hi };
  return doc;
}
