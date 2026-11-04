// Reads the two things the city needs from GitHub, and nothing else:
//   1. the contribution calendar, exactly as GitHub counts it (dates and counts only);
//   2. the file tree of this account's PUBLIC repositories.
// Private repositories are never listed, opened or named. With the workflow's built-in GITHUB_TOKEN the calendar is the
// public one; if the account has switched on "Include private contributions on my profile" and the workflow is given a
// read:user token, GitHub itself returns the combined counts (still just dates and counts, never repository names).
import { execFileSync } from "node:child_process";

const GH = process.env.GH_BIN || "gh";
const run = (args, token) => execFileSync(GH, args, { encoding: "utf8", env: { ...process.env, GH_TOKEN: token }, maxBuffer: 1 << 27 });
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

const QUERY = `query($login:String!,$from:DateTime!,$to:DateTime!){ user(login:$login){ createdAt
  contributionsCollection(from:$from,to:$to){ restrictedContributionsCount
    contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount contributionLevel } } } } } }`;
const CREATED = `query($login:String!){ user(login:$login){ createdAt } }`;

const iso = (d) => d.toISOString();
const day = (d) => d.toISOString().slice(0, 10);

// GitHub limits a contributions query to one year: split [start, end] into consecutive chunks of at most 365 days.
export function yearChunks(start, end) {
  const out = [];
  let a = new Date(start);
  while (a <= end) {
    const b = new Date(Math.min(end.getTime(), a.getTime() + 364 * 864e5 + (864e5 - 1000)));
    out.push([new Date(a), b]);
    a = new Date(b.getTime() + 1000);
  }
  return out;
}

export function normalizeCalendar(chunks, startDay, endDay) {
  const byDate = new Map();
  for (const c of chunks) for (const w of c.contributionCalendar.weeks) for (const d of w.contributionDays) {
    if (d.date < startDay || d.date > endDay) continue;
    byDate.set(d.date, { date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 });
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function fetchCalendar({ login, token, historyYears = 3, now = new Date() }) {
  const created = JSON.parse(run(["api", "graphql", "-F", `login=${login}`, "-f", `query=${CREATED}`], token)).data.user.createdAt;
  const floor = new Date(now.getTime() - historyYears * 365 * 864e5);
  const start = new Date(Math.max(new Date(created.slice(0, 10) + "T00:00:00Z").getTime(), new Date(day(floor) + "T00:00:00Z").getTime()));
  const chunks = [], restricted = [];
  for (const [a, b] of yearChunks(start, now)) {
    const r = JSON.parse(run(["api", "graphql", "-F", `login=${login}`, "-F", `from=${iso(a)}`, "-F", `to=${iso(b)}`, "-f", `query=${QUERY}`], token));
    if (r.errors) throw new Error("GraphQL error: " + JSON.stringify(r.errors).slice(0, 300));
    chunks.push(r.data.user.contributionsCollection);
    restricted.push(r.data.user.contributionsCollection.restrictedContributionsCount);
  }
  return { days: normalizeCalendar(chunks, day(start), day(now)), createdAt: created.slice(0, 10), restrictedContributions: restricted.reduce((a, b) => a + b, 0) };
}

// Which repositories may appear. Defence in depth: the public listing can only return public repositories, and every
// entry is checked again here, so a private repository can never reach the drawing code.
export function selectRepos(list, { login, exclude = [], maxRepos = 5 }) {
  return list
    .filter((r) => r.private === false && (r.visibility === undefined || r.visibility === "public"))
    .filter((r) => !r.fork && !r.archived && !r.disabled)
    .filter((r) => r.name.toLowerCase() !== login.toLowerCase() && !exclude.map((e) => e.toLowerCase()).includes(r.name.toLowerCase()))
    .sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)))
    .slice(0, maxRepos)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}

export async function fetchRepos({ login, token, config }) {
  const list = JSON.parse(run(["api", `users/${login}/repos?type=owner&per_page=100&sort=pushed`], token));
  const chosen = selectRepos(list, { login, exclude: config.exclude, maxRepos: config.maxRepos });
  const sealed = config.sealed || {};
  const repos = [];
  for (const r of chosen) {
    if (sealed[r.name]) { repos.push({ name: r.name, files: [], sealed: sealed[r.name] }); continue; } // a sealed lot is never opened
    let files = [];
    try {
      const t = JSON.parse(run(["api", `repos/${login}/${r.name}/git/trees/${r.default_branch}?recursive=1`], token));
      files = t.tree.filter((n) => n.type === "blob").map((n) => ({ path: n.path, size: n.size || 0 }));
    } catch (e) { /* an empty repository has no tree: it simply gets an empty lot */ }
    repos.push({ name: r.name, files });
  }
  return repos;
}
