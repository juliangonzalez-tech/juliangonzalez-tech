# How the city updates itself

`city.svg` is rebuilt by `.github/workflows/profile-graphics.yml` every six hours, on manual dispatch, and whenever the generators change, then published to the `generated` branch. GitHub's image cache can hold the previous picture for a few minutes.

## What it reads

| Needed for | Source | Notes |
|---|---|---|
| The skyline | The contribution calendar, from GitHub's GraphQL API | GitHub's own counts and levels. Dates and numbers only. |
| The districts | File trees of your **public** repositories, via the REST API | Forks, archived repositories, this profile repository and anything in `exclude` are skipped. A repository listed in `sealed` (NotCooked) is never opened. |

Private repositories are never listed, opened or named by any step. The generator also refuses to draw any text that is not a known caption or the name of a public repository it chose to draw (`verify-city.mjs`).

## What counts as a contribution

GitHub decides, not this repository. Per GitHub's documentation, a commit counts when it is on the repository's default branch (or `gh-pages`), is authored with an email linked to your account, and is not in a fork that has not been merged upstream. Commits on other branches do not count. The skyline therefore shows GitHub's number even when it is lower than the number of commits you made.

## Including private contributions

By default the workflow uses the built-in `GITHUB_TOKEN`, which sees only public activity. To include private contribution **counts** (never names, files or messages) two things are needed, and both are yours to do:

1. In your GitHub profile settings turn on **Include private contributions on my profile**. Until this is on, GitHub itself reports no private contributions for your account.
2. Add a repository secret named `PROFILE_READ_TOKEN`: a personal access token (classic) with **only** the `read:user` scope, which cannot read private repositories. It is expected to be enough for GitHub to return your combined calendar; the first run after you add it confirms that. If the secret is absent the workflow quietly falls back to the public calendar.

## If something fails

Each job fails safe: if the city cannot be built or fails verification, the previous `city.svg` stays on the `generated` branch. A failed run does not change the profile.

## Keeping the schedule alive

GitHub can pause scheduled workflows in a repository with no activity for 60 days. The publish step writes `heartbeat.txt` (the current month) to the `generated` branch monthly. That is a commit by the Actions bot on a non-default branch; it never appears in your contribution graph. Whether GitHub counts a push to a non-default branch as "activity" is not documented; if the schedule ever stops, run the workflow once by hand.

## Adjusting

`tools/graphite/city.config.json`: `exclude`, `sealed`, `maxRepos`, `visibleWeeks`, `historyYears`.
