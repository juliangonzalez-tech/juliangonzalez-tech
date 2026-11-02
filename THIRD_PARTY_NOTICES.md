# Third-party notices

This profile combines ideas and tools from several open-source projects. Each was checked for a license before use. Full license texts follow the summary.

## Components

### capsule-render

- Source: https://github.com/kyechan99/capsule-render
- License: MIT
- Role: Animated banner, section ribbons and footer.
- Use: SVGs were generated once from the hosted service, then committed to `assets/` (`banner.svg`, `footer.svg`, `ribbon-*.svg`). Modified: wave opacity raised and letter-spacing added in the banner and footer so they look the same on light and dark pages. Vendored because the project's own README says the hosted service is best-effort and may be unstable.

### readme-typing-svg

- Source: https://github.com/DenverCoder1/readme-typing-svg
- License: MIT
- Role: Animated typing introduction.
- Use: SVG generated once from the hosted instance and committed as `assets/typing.svg`. Modified: the text fill was replaced with a cyan/violet/blue gradient so it stays legible on light and dark pages.

### skill-icons (skillicons.dev)

- Source: https://github.com/tandpfun/skill-icons
- License: MIT
- Role: Technology icons.
- Use: SVG generated once from skillicons.dev and committed as `assets/skills.svg`. Only tools that appear in the repositories shown on this profile are included. Each icon depicts a trademark or logo that belongs to its respective owner; the MIT license covers the project's code and assets, not those marks.

### github-profile-3d-contrib

- Source: https://github.com/yoshi389111/github-profile-3d-contrib
- License: MIT
- Role: 3D contribution visualization.
- Use: Run as a GitHub Action (v0.9.3, pinned commit `7d95e7d`) by `.github/workflows/profile-graphics.yml`. No code was copied. Colors are set through its supported settings file, `.github/profile-3d/settings.json`.

### GitHub Readme Stats Action

- Source: https://github.com/stats-organization/github-readme-stats-action
- License: MIT
- Role: Statistics, top languages and repository cards.
- Use: Run as a GitHub Action (v2.1.0, pinned commit `2c49884`, core 2.2.1) by the same workflow. No code was copied. It renders with GitHub Stats Extended, the maintained successor of anuraghazra/github-readme-stats.

### GitHub Stats Extended

- Source: https://github.com/stats-organization/github-stats-extended
- License: MIT
- Role: Card renderer used inside the action above (fork of github-readme-stats).
- Use: Not copied. Listed to preserve the original authors' attribution carried in its license.

### github-readme-stats (original)

- Source: https://github.com/anuraghazra/github-readme-stats
- License: MIT
- Role: Original project the statistics cards come from.
- Use: Not copied or run. As of June 2026 its README states the repository is no longer maintained and points to the successor above.

### awesome-github-readme

- Source: https://github.com/yerdaulet-damir/awesome-github-readme
- License: MIT
- Role: Curated list used to survey available widgets.
- Use: Used for discovery only. No code or assets were copied.

### pacman-contribution-graph (Arcade Contribution Graph Games)

- Source: https://github.com/abozanona/pacman-contribution-graph
- License: **none found.** The repository has no LICENSE file, no `license` field in `package.json`, and no license statement in its README (GitHub's license detection returns nothing).
- Role: animated Pac-Man contribution graph.
- Use: run unmodified as a published GitHub Action, pinned to commit `294c47e` in `.github/workflows/profile-graphics.yml`, as the project's README instructs for profile use. **No code, sprites or other files were copied into this repository, and the SVG is not edited.** Only the generated SVG of this profile's own contribution data is published. Because no license grants reuse rights, this is the narrowest use that is still the documented one. If the author adds a license, or asks for the usage to change, update this file accordingly.

## License texts

### capsule-render

https://github.com/kyechan99/capsule-render

```text
MIT License

Copyright (c) 2020 Ye-Chan Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### readme-typing-svg

https://github.com/DenverCoder1/readme-typing-svg

```text
MIT License

Copyright (c) 2021 Jonah Lawrence

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### skill-icons (skillicons.dev)

https://github.com/tandpfun/skill-icons

```text
MIT License

Copyright (c) 2022 tandpfun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### github-profile-3d-contrib

https://github.com/yoshi389111/github-profile-3d-contrib

```text
MIT License

(c) 2021 SATO, Yoshiyuki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### GitHub Readme Stats Action

https://github.com/stats-organization/github-readme-stats-action

```text
MIT License

Copyright (c) 2025 stats-organization

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### GitHub Stats Extended

https://github.com/stats-organization/github-stats-extended

```text
MIT License

Copyright (c) 2020 Anurag Hazra, Abhijit Gupta, martin-mfg

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### github-readme-stats (original)

https://github.com/anuraghazra/github-readme-stats

```text
MIT License

Copyright (c) 2020 Anurag Hazra

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### awesome-github-readme

https://github.com/yerdaulet-damir/awesome-github-readme

```text
MIT License

Copyright (c) 2025 Cool GitHub README Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
