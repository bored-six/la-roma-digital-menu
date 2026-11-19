#!/usr/bin/env bash
# Builds the two WebP variants the app loads from each dish master in public/dishes/<slug>.jpg:
#   public/dishes/<slug>.webp     same pixel size, quality 80   (the plate and the exploded view)
#   public/dishes/t/<slug>.webp   320 px wide, quality 75       (the small option tiles)
# The masters stay in the repo; the variants are committed too, so CI and the build never need cwebp.
# Needs cwebp (brew install webp). Re-run after adding or replacing a master. Skips variants that are newer than their master;
# pass --force to rebuild everything.
set -euo pipefail

cd "$(dirname "$0")/../public/dishes"
command -v cwebp >/dev/null || { echo "cwebp not found: brew install webp" >&2; exit 1; }
force=0
[ "${1:-}" = "--force" ] && force=1
mkdir -p t

made=0
for src in *.jpg; do
  name="${src%.jpg}"
  if [ "$force" = 1 ] || [ ! -f "$name.webp" ] || [ "$src" -nt "$name.webp" ]; then
    cwebp -quiet -q 80 -m 6 -sharp_yuv "$src" -o "$name.webp"
    made=$((made + 1))
  fi
  if [ "$force" = 1 ] || [ ! -f "t/$name.webp" ] || [ "$src" -nt "t/$name.webp" ]; then
    cwebp -quiet -q 75 -m 6 -sharp_yuv -resize 320 0 "$src" -o "t/$name.webp"
    made=$((made + 1))
  fi
done
echo "wrote $made file(s); public/dishes: $(du -sh . | cut -f1) (masters + variants)"
