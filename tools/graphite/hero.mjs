// Candidate A: Sleek / editorial hero.
// Adapted from the structure of ryanpolasky/ryme.md `sleek-header` (MIT, (c) 2026 Ryan Polasky):
// accent rule that sweeps in, corner brackets, uppercase letter-spaced meta line, reveal-once text.
// Changes: left-aligned, embedded fonts, phone-legible proportions. Static: no animation, no moving elements.
import { Doc, C, panel } from "./lib.mjs";

export async function heroA() {
  const W = 480, H = 226, X0 = 32;
  const d = new Doc(W, H, {
    title: "Julian Gonzalez. High school student building software, AI and security tools. Founder of NotCooked.",
  });
  d.add(panel(W, H));
  // corner brackets (technical, quiet)
  d.add(`<g fill="none" stroke="${C.steel}" stroke-opacity=".55" stroke-width="1.5" stroke-linecap="square">` +
    `<path d="M18 30V18H30"/><path d="M${W - 18} ${H - 30}V${H - 18}H${W - 30}"/></g>`);

  // eyebrow: live marker + meta line
  d.add(`<g><rect x="${X0}" y="35" width="7" height="7" fill="${C.sea}"/>` +
    d.text("AI · SECURITY · SOFTWARE · PIANO", { fam: "mono", size: 12, fill: C.steel, x: X0 + 17, y: 43, ls: 1.8 }) + `</g>`);

  // name (roman + italic, the editorial move)
  const name = `<text x="${X0 - 2}" y="108" font-size="66" fill="${C.offwhite}" letter-spacing="-1.5" font-family="'GA Serif','Instrument Serif',Georgia,serif">` +
    d.span("Julian ", { fam: "serif" }) + d.span("Gonzalez", { fam: "serif", style: "italic", fill: C.offwhite }) + `</text>`;
  d.add(`<g>${name}</g>`);

  // natural introduction (three short lines keep the measure phone-legible at 19px)
  d.add(`<g>` +
    d.text("High school student building", { fam: "sans", size: 19, fill: C.offwhite, opacity: 0.92, x: X0, y: 150 }) +
    d.text("software, AI and security tools.", { fam: "sans", size: 19, fill: C.offwhite, opacity: 0.92, x: X0, y: 176 }) + `</g>`);
  const l3 = `<text x="${X0}" y="202" font-size="19" fill="${C.offwhite}" fill-opacity=".92" font-family="'GA Sans',Inter,system-ui,sans-serif">` +
    d.span("Founder of ", { fam: "sans" }) + d.span("NotCooked", { fam: "sans", weight: 500, fill: C.sea }) + d.span(".", { fam: "sans" }) + `</text>`;
  d.add(`<g>${l3}</g>`);
  return d;
}
