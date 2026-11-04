# Graphite builder

Generates the profile's animated SVG modules (hero, stack, project cards, piano signature) into `assets/`.

    node tools/graphite/build.mjs

Needs Node 20+ and an internet connection (it fetches font subsets from Google Fonts and embeds them in each SVG).

- Edit the hero copy in `hero.mjs`, and the stack and project text in `modules.mjs`.
- Palette and fonts are defined once in `lib.mjs`: Midnight `#0B1016`, Off-white `#E8EDF2`, Sea-glass `#70E3C4`, Muted steel `#687988`.
- Keep intro lines short: the layout is tuned so informative text stays at least 12px on a phone.

The hero's structure is adapted from ryme.md (MIT); see `THIRD_PARTY_NOTICES.md` at the repository root.
