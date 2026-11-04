# Graphite builder

Two kinds of graphics live here.

**Static modules** (hero, project cards, stack, piano signature) are built by hand and committed to `assets/`:

    node tools/graphite/build.mjs            # all of them
    node tools/graphite/build.mjs stack.svg  # only the named ones; the others stay byte-identical

Needs Node 20+ and an internet connection (font subsets from Google Fonts are embedded). Edit the hero in `hero.mjs` and the stack, cards and signature in `modules.mjs` (`STACK` holds the languages and tools). The hero's structure is adapted from ryme.md (MIT).

**The city** (`city.svg`: night skyline + project districts) is rebuilt by GitHub Actions and is not committed:

    node --test tools/graphite/test/*.test.mjs                                   # 18 tests, no network
    node tools/graphite/make-city.mjs --out dist --fixture some.json   # offline, from a JSON file
    GH_TOKEN=... node tools/graphite/make-city.mjs --out dist --login juliangonzalez-tech
    node tools/graphite/verify-city.mjs dist/city.svg dist/city.meta.json

- `city.mjs` draws it, `github.mjs` reads the data, `verify-city.mjs` is the gate before publishing, `city.config.json` holds the settings, `fonts/` holds the committed font subset so Actions never needs a network font fetch.
- Palette: Midnight `#0B1016`, Off-white `#E8EDF2`, Sea-glass `#70E3C4`, Muted steel `#687988` (ornaments only; small text uses `#8393a3`, 5.9:1 on Midnight).
- See `docs/how-it-updates.md` for what is read, what counts, and how to include private contribution counts.
