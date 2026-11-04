// Shared modules: stack, featured-work cards, piano signature, arcade label.
// Original code; layout conventions follow the same four-colour theme model as ryme.md (MIT).
import { Doc, C, panel, REDUCED_CSS } from "./lib.mjs";

const REVEAL = `@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`;

// Only tools that appear in the user's own repositories (SignalQuarry, CipherScore, NotCooked).
export async function stack() {
  const W = 560, H = 214;
  const d = new Doc(W, H, { title: "Tools I use: Python, TypeScript, React Native, Expo, Next.js, Tailwind CSS, Firebase, Streamlit, pytest, Vitest, Ruff, Git and GitHub Actions." });
  d.style(REDUCED_CSS + REVEAL);
  const cells = [
    ["LANGUAGES", "Python · TypeScript"], ["MOBILE", "React Native · Expo"],
    ["WEB", "Next.js · Tailwind CSS"], ["DATA & CLOUD", "Streamlit · Firebase"],
    ["QUALITY", "pytest · Vitest · Ruff"], ["TOOLING", "Git · GitHub Actions"],
  ];
  let css = "";
  d.add(panel(W, H));
  d.add(`<line x1="280" y1="26" x2="280" y2="${H - 26}" stroke="${C.steel}" stroke-opacity=".22"/>`);
  [78, 132].forEach((y) => d.add(`<line x1="40" y1="${y + 6}" x2="${W - 40}" y2="${y + 6}" stroke="${C.steel}" stroke-opacity=".16"/>`));
  cells.forEach(([label, value], i) => {
    const col = i % 2, row = Math.floor(i / 2), x = col ? 308 : 40, y = 46 + row * 54;
    css += `.c${i}{animation:rise .8s cubic-bezier(.2,.7,.2,1) ${0.1 + i * 0.09}s both}\n`;
    d.add(`<g class="c${i} rm">` +
      d.text(label, { fam: "mono", size: 12, fill: C.steel, x, y, ls: 2 }) +
      d.text(value, { fam: "sans", size: 19, fill: C.offwhite, weight: 500, x, y: y + 26 }) + `</g>`);
  });
  d.style(css);
  return d;
}

function arrow(x, y) {
  return `<path d="M${x} ${y + 16}L${x + 16} ${y}M${x + 2} ${y}H${x + 16}V${y + 14}" fill="none" stroke="${C.sea}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export async function cardNotCooked() {
  const W = 480, H = 214;
  const d = new Doc(W, H, { title: "NotCooked: a student planner that turns scattered coursework into a clear next step. Expo, React Native, Firebase. Private beta." });
  d.style(REDUCED_CSS + REVEAL + `@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}.bar{transform-box:fill-box;transform-origin:center;animation:grow .9s cubic-bezier(.2,.7,.2,1) .1s both}.a1{animation:rise .8s ease-out .2s both}.a2{animation:rise .8s ease-out .35s both}`);
  d.add(panel(W, H));
  d.add(`<rect class="bar rm" x="0.5" y="28" width="3" height="${H - 56}" fill="${C.sea}"/>`);
  d.add(`<g class="a1 rm">` + d.text("01 — FEATURED", { fam: "mono", size: 12, fill: C.steel, x: 32, y: 40, ls: 2 }) +
    d.text("NotCooked", { fam: "serif", size: 58, fill: C.offwhite, x: 30, y: 96, ls: -1 }) + `</g>` + arrow(W - 48, 26));
  d.add(`<g class="a2 rm">` +
    d.text("A student planner that turns scattered", { fam: "sans", size: 19, fill: C.offwhite, opacity: 0.9, x: 32, y: 134 }) +
    d.text("coursework into a clear next step.", { fam: "sans", size: 19, fill: C.offwhite, opacity: 0.9, x: 32, y: 160 }) +
    d.text("EXPO · REACT NATIVE · FIREBASE", { fam: "mono", size: 11, fill: C.steel, x: 32, y: 190, ls: 1.4 }) + `</g>`);
  d.add(`<g class="a2 rm"><rect x="${W - 140}" y="172" width="108" height="22" rx="11" fill="none" stroke="${C.sea}" stroke-opacity=".7"/>` +
    d.text("PRIVATE BETA", { fam: "mono", size: 11, fill: C.sea, x: W - 86, y: 187, anchor: "middle", ls: 1.3 }) + `</g>`);
  return d;
}

function small(idx, label, title, l1, l2, meta, alt) {
  return async () => {
    const W = 416, H = 200;
    const d = new Doc(W, H, { title: alt });
    d.style(REDUCED_CSS + REVEAL + `.a1{animation:rise .8s ease-out .2s both}.a2{animation:rise .8s ease-out .35s both}`);
    d.add(panel(W, H));
    d.add(`<g class="a1 rm">` + d.text(`0${idx} — ${label}`, { fam: "mono", size: 12, fill: C.steel, x: 32, y: 40, ls: 2 }) +
      d.text(title, { fam: "serif", size: 44, fill: C.offwhite, x: 31, y: 92, ls: -0.8 }) + `</g>` + arrow(W - 48, 26));
    d.add(`<g class="a2 rm">` +
      d.text(l1, { fam: "sans", size: 17, fill: C.offwhite, opacity: 0.9, x: 32, y: 128 }) +
      d.text(l2, { fam: "sans", size: 17, fill: C.offwhite, opacity: 0.9, x: 32, y: 152 }) +
      d.text(meta, { fam: "mono", size: 12, fill: C.steel, x: 32, y: 178, ls: 1.6 }) + `</g>`);
    return d;
  };
}
export const cardSignalQuarry = small(2, "SECURITY", "SignalQuarry", "Explainable security log analyzer:", "every alert shows its evidence.", "PYTHON · STREAMLIT",
  "SignalQuarry: an explainable security log analyzer where every alert shows its evidence. Python, Streamlit.");
export const cardCipherScore = small(3, "PRIVACY", "CipherScore", "Password checker and generator that", "runs entirely in your browser.", "NEXT.JS · TYPESCRIPT",
  "CipherScore: a password checker and generator that runs entirely in the browser. Next.js, TypeScript.");

// Piano-inspired signature: one octave, a quiet arpeggio of sea-glass key presses.
export async function signature() {
  const W = 340, H = 88;
  const d = new Doc(W, H, { title: "A small piano keyboard playing a quiet arpeggio, signed Julian." });
  d.style(REDUCED_CSS);
  d.add(panel(W, H, 14));
  const kx = 28, kw = 22, gap = 2, ky = 20, kh = 48, D = 5;
  let keys = "", press = "", blacks = "";
  for (let k = 0; k < 7; k++) keys += `<rect x="${kx + k * (kw + gap)}" y="${ky}" width="${kw}" height="${kh}" rx="3" fill="${C.offwhite}" fill-opacity=".92"/>`;
  [0, 1, 3, 4, 5].forEach((k) => (blacks += `<rect x="${kx + (k + 1) * (kw + gap) - gap / 2 - 7}" y="${ky}" width="14" height="29" rx="2" fill="${C.midnight}" stroke="${C.steel}" stroke-opacity=".5"/>`));
  const seq = [0, 2, 4, 2, 6, 4, 2, 0]; // C E G E B G E C
  seq.forEach((k, i) => {
    const t0 = i / seq.length, t1 = t0 + 0.07;
    const kt = i === 0 ? `0;${t1.toFixed(3)};${(t1 + 0.05).toFixed(3)};1` : `0;${t0.toFixed(3)};${t1.toFixed(3)};${(t1 + 0.05).toFixed(3)};1`;
    const vals = i === 0 ? "0.85;0.85;0;0" : "0;0;0.85;0;0";
    press += `<rect x="${kx + k * (kw + gap)}" y="${ky}" width="${kw}" height="${kh}" rx="3" fill="${C.sea}" opacity="0"><animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" keyTimes="${kt}" values="${vals}"/></rect>`;
  });
  d.add(`<g>${keys}<g class="anim">${press}</g>${blacks}</g>`);
  d.add(d.text("Julian", { fam: "serif", style: "italic", size: 40, fill: C.offwhite, x: 232, y: 58, ls: -0.5 }));
  return d;
}
