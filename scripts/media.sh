#!/usr/bin/env bash
# Pipeline de vídeo web (§18 del ACEE): de los másters HEVC de Higgsfield a las
# versiones que carga la web. Uso: bash scripts/media.sh <dir-con-masters>
#
#   <nombre>-1080.mp4   ventana nítida en escritorio (H.264, sin audio)
#   <nombre>-720.mp4    ventana nítida en móvil
#   <nombre>-480.mp4    capa de fondo: va desenfocada, no necesita más píxeles
#   <nombre>-1080.webm  VP9 para navegadores que lo prefieran
#   <nombre>-poster.jpg primer fotograma, pinta antes de que llegue el vídeo
#   <nombre>-still.jpg  fotograma editorial para tarjetas
set -euo pipefail
SRC="${1:?directorio con los másters}"
OUT="$(dirname "$0")/../public/media/clinica"
mkdir -p "$OUT"

# nombre|máster|segundo del fotograma editorial
CLIPS=(
  "recepcion|hf_20260921_122404_c0543465-ff7d-4e3a-9a60-8beb785f2b21.mp4|11"
  "consulta|hf_20260921_124645_52134171-ddc3-40b5-bafb-4cdef99d727a.mp4|9.5"
  "equipo|hf_20260921_153713_a7221713-9a69-4808-92b1-62d64e3d2151.mp4|9"
)

H264="-c:v libx264 -preset slow -pix_fmt yuv420p -profile:v high -level 4.1 -movflags +faststart -an"

for entry in "${CLIPS[@]}"; do
  IFS='|' read -r name file still <<<"$entry"
  in="$SRC/$file"
  echo "== $name"
  ffmpeg -v error -y -i "$in" -vf "scale=1920:-2" $H264 -crf 22 "$OUT/$name-1080.mp4"
  ffmpeg -v error -y -i "$in" -vf "scale=1280:-2" $H264 -crf 24 "$OUT/$name-720.mp4"
  ffmpeg -v error -y -i "$in" -vf "scale=854:-2"  $H264 -crf 27 "$OUT/$name-480.mp4"
  ffmpeg -v error -y -ss 0.1 -i "$in" -frames:v 1 -vf "scale=1920:-2" -q:v 3 "$OUT/$name-poster.jpg"
  ffmpeg -v error -y -ss "$still" -i "$in" -frames:v 1 -vf "scale=1600:-2" -q:v 3 "$OUT/$name-still.jpg"
  ffmpeg -v error -y -i "$in" -vf "scale=1920:-2" -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -an "$OUT/$name-1080.webm"
done
ls -la "$OUT"
