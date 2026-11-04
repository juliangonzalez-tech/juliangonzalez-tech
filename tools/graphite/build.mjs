// Builds the profile's SVG modules into ../../assets. Needs Node 20+ and internet (font subsets from Google Fonts).
//   node tools/graphite/build.mjs
// Structure adapted from ryanpolasky/ryme.md (MIT). See THIRD_PARTY_NOTICES.md.
import fs from "node:fs";
import path from "node:path";
import { heroA } from "./hero.mjs";
import { stack, cardNotCooked, cardSignalQuarry, cardCipherScore, signature } from "./modules.mjs";

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../assets");
fs.mkdirSync(OUT, { recursive: true });
const modules = {
  "hero.svg": heroA,
  "stack.svg": stack,
  "work-notcooked.svg": cardNotCooked,
  "work-signalquarry.svg": cardSignalQuarry,
  "work-cipherscore.svg": cardCipherScore,
  "signature.svg": signature,
};
for (const [name, make] of Object.entries(modules)) {
  const doc = await make();
  const svg = await doc.render();
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log(name.padEnd(24), String(Buffer.byteLength(svg)).padStart(6), "bytes");
}
