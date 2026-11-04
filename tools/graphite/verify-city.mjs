// Gate before anything is published: refuses an SVG that is too big, contains active or external content,
// or shows any text that is not an expected caption or the label of a repository we meant to draw.
//   node tools/graphite/verify-city.mjs dist/city.svg dist/city.meta.json
import fs from "node:fs";
import { FIXED_CHARS } from "./lib.mjs";
import { safeLabel } from "./city.mjs";

export const MAX_BYTES = 96 * 1024;
const CAPTIONS = [/^[A-Z]{3} \d{4} - [A-Z]{3} \d{4}$/, /^1 WEEK = 1 BUILDING \/ LIT WINDOW = ACTIVE DAY$/, /^1 BLOCK = 1 PUBLIC REPOSITORY \/ 1 BUILDING = 1 FILE( \(LARGEST SHOWN\))?$/, /^(SOURCE|TESTS|DOCS|CONFIG)$/];

export function verifyCity(svg, meta) {
  const problems = [];
  if (Buffer.byteLength(svg) > MAX_BYTES) problems.push(`too large: ${Buffer.byteLength(svg)} bytes`);
  const bare = svg.replace('xmlns="http://www.w3.org/2000/svg"', "");
  for (const [re, why] of [[/<script/i, "script element"], [/<foreignObject/i, "foreignObject"], [/<image[\s>]/i, "image element"], [/\bon\w+\s*=/i, "event handler attribute"],
    [/\bhref\s*=/i, "href attribute"], [/xlink:/i, "xlink"], [/@import/i, "@import"], [/url\(\s*['"]?(?!#|data:font\/woff2)/i, "external url()"], [/https?:\/\//i, "external URL"]])
    if (re.test(bare)) problems.push(why);
  if (!/role="img"/.test(svg) || !/<title>/.test(svg)) problems.push("missing accessible name");
  if (!/prefers-reduced-motion/.test(svg)) problems.push("missing reduced-motion rule");
  // a label may be shortened to fit; it must still be the start of a repository we meant to draw
  const names = (meta.repos || []).map((n) => safeLabel(n, 200));
  const allowedLabel = (t) => names.some((n) => n === t || (t.endsWith(".") && n.startsWith(t.slice(0, -1))));
  const sealed = /^SOURCE PRIVATE$/;
  for (const m of svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)) {
    const t = m[1].replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/ {2,}/g, " ").trim();
    if ([...t].some((c) => !FIXED_CHARS.includes(c))) problems.push(`glyph outside alphabet in "${t}"`);
    if (!CAPTIONS.some((re) => re.test(t)) && !allowedLabel(t) && !sealed.test(t)) problems.push(`unexpected text "${t}"`);
  }
  return problems;
}

if (process.argv[1] && process.argv[1].endsWith("verify-city.mjs")) {
  const [svgPath, metaPath] = process.argv.slice(2);
  const problems = verifyCity(fs.readFileSync(svgPath, "utf8"), JSON.parse(fs.readFileSync(metaPath, "utf8")));
  if (problems.length) { console.error("city.svg rejected:\n - " + problems.join("\n - ")); process.exit(1); }
  console.log("city.svg verified");
}
