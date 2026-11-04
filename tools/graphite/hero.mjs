// Candidate A: Sleek / editorial hero.
// Adapted from the structure of ryanpolasky/ryme.md `sleek-header` (MIT, (c) 2026 Ryan Polasky):
// accent rule that sweeps in, corner brackets, uppercase letter-spaced meta line, reveal-once text.
// Changes: left-aligned, embedded fonts, phone-legible proportions, pac-dot rule, WebKit-safe animation.
import { Doc, C, panel, PAC_OPEN, PAC_SHUT, REDUCED_CSS } from "./lib.mjs";

export async function heroA() {
  const W = 480, H = 252, X0 = 32, X1 = 448, RY = 132;
  const d = new Doc(W, H, {
    title: "Julian Gonzalez. High school student building software, AI and security tools. Founder of NotCooked.",
  });
  d.style(REDUCED_CSS);
  d.style(`
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes blink{0%,55%{opacity:1}56%,100%{opacity:.15}}
.r1{animation:rise 1s cubic-bezier(.2,.7,.2,1) .15s both}
.r2{animation:rise 1s cubic-bezier(.2,.7,.2,1) .35s both}
.r3{animation:rise 1s cubic-bezier(.2,.7,.2,1) .95s both}
.r4{animation:rise 1s cubic-bezier(.2,.7,.2,1) 1.15s both}
.live{animation:blink 1.6s steps(1) infinite}
`);

  d.add(panel(W, H));
  // corner brackets (technical, quiet)
  d.add(`<g fill="none" stroke="${C.steel}" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="square">` +
    `<path d="M18 30V18H30"/><path d="M${W - 18} ${H - 30}V${H - 18}H${W - 30}"/></g>`);

  // eyebrow: live marker + meta line
  d.add(`<g class="r1 rm"><rect class="live" x="${X0}" y="35" width="7" height="7" fill="${C.sea}"/>` +
    d.text("AI · SECURITY · SOFTWARE · PIANO", { fam: "mono", size: 12, fill: C.steel, x: X0 + 17, y: 43, ls: 1.8 }) + `</g>`);

  // name (roman + italic, the editorial move)
  const name = `<text x="${X0 - 2}" y="108" font-size="66" fill="${C.offwhite}" letter-spacing="-1.5" font-family="'GA Serif','Instrument Serif',Georgia,serif">` +
    d.span("Julian ", { fam: "serif" }) + d.span("Gonzalez", { fam: "serif", style: "italic", fill: C.offwhite }) + `</text>`;
  d.add(`<g class="r2 rm">${name}</g>`);

  // pac-dot rule: animated (.anim) with a static twin (.still) for reduced motion
  const N = 20, dx = (X1 - X0) / N; // dots at X0+dx*i
  const D = 9; // seconds per loop
  let dots = "";
  for (let i = 1; i <= N; i++) {
    const x = X0 + dx * i, f = 0.5 * (i / N);
    dots += `<circle cx="${x}" cy="${RY}" r="2.3" fill="${C.steel}" fill-opacity=".6">` +
      `<animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" values="1;1;0;0;1;1" keyTimes="0;${(f - 0.003).toFixed(4)};${f.toFixed(4)};0.9;0.97;1"/></circle>`;
  }
  const pac = `<g><animateTransform attributeName="transform" type="translate" dur="${D}s" repeatCount="indefinite" ` +
    `values="${X0} ${RY};${X1} ${RY};${X1} ${RY};${X0} ${RY};${X0} ${RY}" keyTimes="0;0.5;0.6;0.61;1"/>` +
    `<animate attributeName="opacity" dur="${D}s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.52;0.58;0.94;1"/>` +
    `<path fill="${C.sea}" d="${PAC_OPEN}"><animate attributeName="d" dur=".36s" repeatCount="indefinite" values="${PAC_OPEN};${PAC_SHUT};${PAC_OPEN}"/></path></g>`;
  d.add(`<line x1="${X0}" y1="${RY}" x2="${X1}" y2="${RY}" stroke="${C.steel}" stroke-opacity=".22"/>`);
  d.add(`<g class="anim">${dots}${pac}</g>`);
  let still = "";
  for (let i = 1; i <= N; i++) still += `<circle cx="${X0 + dx * i}" cy="${RY}" r="2.3" fill="${C.steel}" fill-opacity=".6"/>`;
  d.add(`<g class="still">${still}<g transform="translate(${X0} ${RY})"><path fill="${C.sea}" d="${PAC_OPEN}"/></g></g>`);

  // natural introduction (three short lines keep the measure phone-legible at 19px)
  d.add(`<g class="r3 rm">` +
    d.text("High school student building", { fam: "sans", size: 19, fill: C.offwhite, opacity: 0.92, x: X0, y: 172 }) +
    d.text("software, AI and security tools.", { fam: "sans", size: 19, fill: C.offwhite, opacity: 0.92, x: X0, y: 198 }) + `</g>`);
  const l3 = `<text x="${X0}" y="224" font-size="19" fill="${C.offwhite}" fill-opacity=".92" font-family="'GA Sans',Inter,system-ui,sans-serif">` +
    d.span("Founder of ", { fam: "sans" }) + d.span("NotCooked", { fam: "sans", weight: 500, fill: C.sea }) + d.span(".", { fam: "sans" }) + `</text>`;
  d.add(`<g class="r4 rm">${l3}</g>`);
  return d;
}
