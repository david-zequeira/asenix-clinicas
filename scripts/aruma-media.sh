#!/usr/bin/env bash
# Medios de la web de Aruma Clinic a partir del material de la propia clínica
# (vídeo de la home y fotografías de arumaclinic.com).
# Uso: bash scripts/aruma-media.sh <dir-con-los-originales>
#
# La película de la clínica (clinica-inicio.mp4, 26 s, 1080p) tiene diez planos;
# de ella salen la portada, los dos vídeos de sección y los fotogramas fijos:
#
#   0,0–3,6   recepción → la doctora recibe a la paciente   ┐
#   3,6–5,4   el rostro (primer plano)                      ├ portada (fotogramas)
#   5,4–6,7   consulta                                       ┘
#   7,3–18,0  limpieza · hydrafacial · LED                  → cuidado-*.mp4
#   18,6–26,3 ecografía · labios · sala de espera           → experiencia-*.mp4
#
#   seq/hero-1920|1280/h-NNN.webp  portada: 24 fotogramas por segundo, se recorren con el scroll
#   <clip>-1080.mp4 / -720.mp4     H.264 sin audio (escritorio / móvil)
#   <clip>-poster.webp             primer fotograma
#   still-*.webp                   fotogramas fijos para secciones y tarjetas
#   foto-*.webp                    fotografías de la clínica
set -euo pipefail
SRC="${1:?directorio con los originales}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media/aruma"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT/seq/hero-1920" "$OUT/seq/hero-1280"
FILM="$SRC/clinica-inicio.mp4"
H264="-c:v libx264 -preset slow -pix_fmt yuv420p -profile:v high -level 4.1 -movflags +faststart -an"

webp() { cwebp -quiet -q "$3" -resize "$2" 0 "$1" -o "$4"; }   # origen ancho calidad destino

echo "== portada (fotogramas)"
ffmpeg -v error -y -ss 0 -t 6.7 -i "$FILM" -vf "fps=24" -q:v 2 "$TMP/f-%03d.jpg"
i=0
for f in "$TMP"/f-*.jpg; do
  n=$(printf '%03d' "$i")
  webp "$f" 1920 72 "$OUT/seq/hero-1920/h-$n.webp"
  webp "$f" 1280 70 "$OUT/seq/hero-1280/h-$n.webp"
  i=$((i + 1))
done
echo "   $i fotogramas"
webp "$TMP/f-001.jpg" 1920 78 "$OUT/hero-poster.webp"

echo "== vídeos de sección"
# nombre|inicio|duración
for entry in "cuidado|7.3|10.7" "experiencia|18.6|7.7"; do
  IFS='|' read -r name ss t <<<"$entry"
  ffmpeg -v error -y -ss "$ss" -t "$t" -i "$FILM" -vf "scale=1920:-2" $H264 -crf 21 "$OUT/$name-1080.mp4"
  ffmpeg -v error -y -ss "$ss" -t "$t" -i "$FILM" -vf "scale=1280:-2" $H264 -crf 24 "$OUT/$name-720.mp4"
  ffmpeg -v error -y -ss "$ss" -i "$FILM" -frames:v 1 -q:v 2 "$TMP/$name-poster.jpg"
  webp "$TMP/$name-poster.jpg" 1920 78 "$OUT/$name-poster.webp"
done

echo "== fotogramas fijos"
# nombre|segundo
for entry in "recepcion|0.6" "saludo|2.6" "rostro|4.6" "consulta|6.0" "limpieza|8.6" "hydrafacial|12.2" "led|16.2" "ecografia|19.6" "labios|23.0" "espera|25.9"; do
  IFS='|' read -r name at <<<"$entry"
  ffmpeg -v error -y -ss "$at" -i "$FILM" -frames:v 1 -q:v 2 "$TMP/s-$name.jpg"
  webp "$TMP/s-$name.jpg" 1920 80 "$OUT/still-$name.webp"
  webp "$TMP/s-$name.jpg" 960 76 "$OUT/still-$name-960.webp"
done

echo "== fotografías"
for f in DSC_0424 DSC_0489 DSC_0578 DSC_0717; do
  webp "$SRC/$f.jpg" 1400 80 "$OUT/foto-${f#DSC_}.webp"
done
for i in 1 2 3 4 5 6 7 8 9 10; do webp "$SRC/aruma-$i.jpg" 600 82 "$OUT/espacio-$i.webp"; done
for i in 1 2 3 4 5 6 7; do webp "$SRC/andrea-$i.jpg" 600 82 "$OUT/doctora-$i.webp"; done

echo "== marca"
# recortes ajustados al dibujo (los PNG originales son de 1600×1600 con mucho aire)
cwebp -quiet -q 90 -alpha_q 100 -crop 192 208 1216 1184 -resize 640 0 "$SRC/Logo-footer.png" -o "$OUT/logo-aruma.webp"          # isotipo + ARUMA CLINIC
cwebp -quiet -q 90 -alpha_q 100 -crop 192 860 1216 532 -resize 720 0 "$SRC/Logo-footer.png" -o "$OUT/logo-aruma-texto.webp"   # solo ARUMA CLINIC
cwebp -quiet -q 90 -alpha_q 100 -crop 272 188 1056 1224 -resize 560 0 "$SRC/logo-navbar.png" -o "$OUT/logo-aruma-firma.webp"  # con «by Dra. Andrea Marroquín»
ffmpeg -v error -y -i "$SRC/ARUMA_Isotipo_color_blanco_fondo_transparente.png" -vf "crop=1128:1116:236:240,scale=480:-2" "$OUT/isotipo.png"
ffmpeg -v error -y -i "$TMP/s-recepcion.jpg" -vf "scale=1200:-2,crop=1200:630" -q:v 3 "$OUT/og.jpg"

du -sh "$OUT" "$OUT/seq"/*
