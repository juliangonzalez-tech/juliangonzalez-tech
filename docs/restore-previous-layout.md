# Restoring the previous bottom of the profile

The 340×88 piano-signature panel and the 520-wide stack were replaced by one row: the stack (416 wide) beside the animated piano (416 wide). Nothing was deleted:

- `archive/graphite-arcade/signature.svg` is the old signature; `archive/graphite-arcade/stack.svg` is the six-cell stack; `stackWide()` and `stackGrid()` in `tools/graphite/modules.mjs` regenerate the other stack layouts.
- To go back, copy the files into `assets/` and use the two paragraphs from `archive/graphite-arcade/README.md`.
