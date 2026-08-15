#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist/bf7 dist/bf8 dist/assets

cp index.html .nojekyll dist/

for game in bf7 bf8; do
  cp "$game/index.html" "dist/$game/"
  cp -r "$game/css" "dist/$game/"
  cp -r "$game/js" "$game/vendor" "dist/$game/"
done

cp bf7/_dev/s06_斯大林格勒新街区.png dist/assets/cover.png
cp bf7/_dev/s01_基线_原版纹理.png dist/assets/shot1.png
cp bf7/_dev/s02_SVG纹理+合批.png dist/assets/shot2.png
cp bf7/_dev/s03_移动端新触控布局.png dist/assets/shot3.png
cp bf7/_dev/s05_士兵近景与面部.png dist/assets/shot4.png
cp bf8/_dev/s04_98K机瞄.png dist/assets/shot5.png
