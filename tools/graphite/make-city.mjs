// Builds city.svg (skyline + districts).
//   node tools/graphite/make-city.mjs --out dist [--login NAME] [--fixture file.json]
// Live mode needs the `gh` CLI and a token in GH_TOKEN (the workflow passes GITHUB_TOKEN, or a read:user token if configured).
import fs from "node:fs";
import path from "node:path";
import { renderCity } from "./city.mjs";
import { fetchCalendar, fetchRepos } from "./github.mjs";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const arg = (n) => { const i = process.argv.indexOf("--" + n); return i > -1 ? process.argv[i + 1] : undefined; };
const out = path.resolve(arg("out") || "dist");
const config = JSON.parse(fs.readFileSync(path.join(HERE, "city.config.json"), "utf8"));

let days, repos, mode;
if (arg("fixture")) {
  const f = JSON.parse(fs.readFileSync(arg("fixture"), "utf8"));
  days = f.days; repos = f.repos.map((r) => ({ name: r.name, files: r.files, sealed: (f.sealed || {})[r.name] })); mode = "fixture";
} else {
  const login = arg("login") || process.env.GITHUB_REPOSITORY_OWNER;
  const token = process.env.GH_TOKEN;
  if (!login || !token) throw new Error("need --login (or GITHUB_REPOSITORY_OWNER) and GH_TOKEN");
  const cal = await fetchCalendar({ login, token, historyYears: config.historyYears });
  days = cal.days; repos = await fetchRepos({ login, token, config }); mode = "live";
  console.log(`calendar: ${days.length} days, restricted contributions reported by GitHub: ${cal.restrictedContributions}`);
}
const doc = await renderCity({ days, repos, visibleWeeks: config.visibleWeeks });
const svg = await doc.render();
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "city.svg.tmp"), svg);
fs.renameSync(path.join(out, "city.svg.tmp"), path.join(out, "city.svg")); // never leave a half-written file behind
fs.writeFileSync(path.join(out, "city.meta.json"), JSON.stringify({ mode, repos: repos.map((r) => r.name), ...doc.meta }, null, 1));
console.log(`city.svg ${Buffer.byteLength(svg)} bytes (${mode})`, JSON.stringify(doc.meta));
