// Graphite Arcade design system: shared palette, type, and SVG builder.
// Structure adapted from ryanpolasky/ryme.md (MIT, Copyright (c) 2026 Ryan Polasky):
// four-colour theme (bg/fg/accent/muted), per-section SVG modules with baked-in CSS keyframes,
// and a loopText-style "reveal once" option. All code in this file is original.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const C = {
  midnight: "#0B1016",
  offwhite: "#E8EDF2",
  sea: "#70E3C4",
  steel: "#687988",
};

// Fonts (all SIL OFL 1.1, served as subsets by Google Fonts).
export const FONTS = {
  serif: { family: "Instrument Serif", css: "Instrument+Serif:ital@0;1", stack: "'GA Serif','Instrument Serif',Georgia,serif" },
  sans: { family: "Inter", css: "Inter:wght@400;500", stack: "'GA Sans',Inter,system-ui,-apple-system,'Segoe UI',sans-serif" },
  mono: { family: "JetBrains Mono", css: "JetBrains+Mono:wght@400;500", stack: "'GA Mono','JetBrains Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace" },
};

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const CACHE = path.resolve(path.dirname(new URL(import.meta.url).pathname), ".font-cache");
fs.mkdirSync(CACHE, { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export const escapeXml = esc;

export function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
export function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

async function fetchSubset(famKey, text) {
  const f = FONTS[famKey];
  const chars = [...new Set(text)].sort().join("");
  const key = crypto.createHash("sha1").update(famKey + "|" + chars).digest("hex").slice(0, 16);
  const file = path.join(CACHE, key + ".json");
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const url = `https://fonts.googleapis.com/css2?family=${f.css}&text=${encodeURIComponent(chars)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const faces = [];
  for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const b = m[1];
    const style = /font-style:\s*(\w+)/.exec(b)?.[1] ?? "normal";
    const weight = /font-weight:\s*(\d+)/.exec(b)?.[1] ?? "400";
    const src = /url\(([^)]+)\)\s*format\('woff2'\)/.exec(b)?.[1];
    if (!src) continue;
    const buf = Buffer.from(await (await fetch(src, { headers: { "User-Agent": UA } })).arrayBuffer());
    faces.push({ style, weight, b64: buf.toString("base64"), bytes: buf.length });
  }
  fs.writeFileSync(file, JSON.stringify(faces));
  return faces;
}

// SVG document builder that records which glyphs each font actually needs.
export class Doc {
  constructor(w, h, { title = "", desc = "" } = {}) {
    this.w = w; this.h = h; this.title = title; this.desc = desc;
    this.body = []; this.css = []; this.used = {}; // famKey -> {chars:Set, faces:Set("weight|style")}
  }
  add(s) { this.body.push(s); return this; }
  style(s) { this.css.push(s); return this; }
  // text element; records glyph usage. opts: fam, weight, style, size, fill, x, y, anchor, ls, cls, opacity
  text(content, o) {
    const u = (this.used[o.fam] ??= { chars: new Set(), faces: new Set() });
    for (const ch of content) u.chars.add(ch);
    u.faces.add(`${o.weight ?? 400}|${o.style ?? "normal"}`);
    const attrs = [
      `x="${o.x}"`, `y="${o.y}"`, `font-family="${FONTS[o.fam].stack.replace(/"/g, "'")}"`,
      `font-size="${o.size}"`, `fill="${o.fill}"`,
    ];
    if (o.weight && o.weight !== 400) attrs.push(`font-weight="${o.weight}"`);
    if (o.style === "italic") attrs.push(`font-style="italic"`);
    if (o.anchor) attrs.push(`text-anchor="${o.anchor}"`);
    if (o.ls) attrs.push(`letter-spacing="${o.ls}"`);
    if (o.opacity !== undefined) attrs.push(`fill-opacity="${o.opacity}"`);
    if (o.cls) attrs.push(`class="${o.cls}"`);
    return `<text ${attrs.join(" ")}>${o.raw ? content : esc(content)}</text>`;
  }
  // Inline run inside a <text>: records glyphs, returns tspan markup.
  span(content, o) {
    const u = (this.used[o.fam] ??= { chars: new Set(), faces: new Set() });
    for (const ch of content) u.chars.add(ch);
    u.faces.add(`${o.weight ?? 400}|${o.style ?? "normal"}`);
    const a = [];
    if (o.fill) a.push(`fill="${o.fill}"`);
    if (o.weight && o.weight !== 400) a.push(`font-weight="${o.weight}"`);
    if (o.style) a.push(`font-style="${o.style}"`);
    if (o.fam) a.push(`font-family="${FONTS[o.fam].stack.replace(/"/g, "'")}"`);
    return `<tspan ${a.join(" ")}>${esc(content)}</tspan>`;
  }
  async render() {
    let faceCss = "";
    const namePrefix = { serif: "GA Serif", sans: "GA Sans", mono: "GA Mono" };
    let fontBytes = 0;
    for (const [fam, u] of Object.entries(this.used)) {
      const faces = await fetchSubset(fam, [...u.chars].join(""));
      for (const f of faces) {
        if (!u.faces.has(`${f.weight}|${f.style}`)) continue;
        fontBytes += f.bytes;
        faceCss += `@font-face{font-family:'${namePrefix[fam]}';font-style:${f.style};font-weight:${f.weight};src:url(data:font/woff2;base64,${f.b64}) format('woff2')}`;
      }
    }
    this.fontBytes = fontBytes;
    const css = faceCss + this.css.join("\n");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-label="${esc(this.title)}">` +
      (this.title ? `<title>${esc(this.title)}</title>` : "") +
      (this.desc ? `<desc>${esc(this.desc)}</desc>` : "") +
      `<style>${css}</style>\n${this.body.join("\n")}\n</svg>\n`;
  }
}

// Shared panel chrome: midnight fill + steel hairline (the same on every module).
export function panel(w, h, r = 16) {
  return `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${C.midnight}" stroke="${C.steel}" stroke-opacity="0.32"/>`;
}

// Pac-Man mark (original drawing): body path morphs open/closed.
export const PAC_OPEN = "M0,0 L5.74,-3.99 A7,7 0 1,0 5.74,3.99 Z";
export const PAC_SHUT = "M0,0 L6.99,-0.35 A7,7 0 1,0 6.99,0.35 Z";

// Reduced-motion switch used by every animated module: .anim is hidden and .still shown.
export const REDUCED_CSS =
  `.still{display:none}@media (prefers-reduced-motion: reduce){.anim{display:none}.still{display:inline}.rm{animation:none!important;opacity:1!important}.live,.cur{animation:none!important}}`;
