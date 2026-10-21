#!/usr/bin/env bash
# Medios de la web de Aruma Clinic a partir del material de la propia clínica
# (vídeo de la home y fotografías de arumaclinic.com).
# Uso: bash scripts/aruma-media.sh <dir-con-los-originales>
#
# La película de la clínica (clinica-inicio.mp4, 26 s, 1080p) tiene diez planos;
# de ella salen la portada, los dos vídeos de sección y los fotogramas fijos:
#
#   recepción · bienvenida · rostro · consulta · limpieza · hydrafacial ·
#   LED · ecografía · labios · sala de espera
#
#   clinica-1080|720.mp4           la película entera, sin audio (sección «La clínica»)
#   intro-1080|720.mp4             la entrada del atlas (0–4,6 s)
#   zona-*-1080|720.mp4            un clip por zona del atlas, ralentizado
#   still-*.webp                   fotogramas fijos para secciones y tarjetas
#   foto-*.webp                    fotografías de la clínica
set -euo pipefail
SRC="${1:?directorio con los originales}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media/aruma"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"
FILM="$SRC/clinica-inicio.mp4"
H264="-c:v libx264 -preset slow -pix_fmt yuv420p -profile:v high -level 4.1 -movflags +faststart -an"

webp() { cwebp -quiet -q "$3" -resize "$2" 0 "$1" -o "$4"; }   # origen ancho calidad destino

echo "== película completa (capítulos)"
ffmpeg -v error -y -i "$FILM" -vf "scale=1920:-2" $H264 -crf 22 "$OUT/clinica-1080.mp4"
ffmpeg -v error -y -i "$FILM" -vf "scale=1280:-2" $H264 -crf 25 "$OUT/clinica-720.mp4"
ffmpeg -v error -y -ss 0.6 -i "$FILM" -frames:v 1 -q:v 2 "$TMP/clinica-poster.jpg"
webp "$TMP/clinica-poster.jpg" 1600 78 "$OUT/clinica-poster.webp"

echo "== intro del atlas: recepción → bienvenida → el rostro (acaba en el fotograma de still-rostro)"
ffmpeg -v error -y -t 4.6 -i "$FILM" -vf "scale=1920:-2" $H264 -crf 21 "$OUT/intro-1080.mp4"
ffmpeg -v error -y -t 4.6 -i "$FILM" -vf "scale=1280:-2" $H264 -crf 24 "$OUT/intro-720.mp4"

echo "== clips del atlas: uno por zona, a pantalla completa (1080) y para el móvil (720)"
# nombre|inicio|duración|ralentí
for entry in "limpieza|7.4|3.2|1.25" "ecografia|18.7|2.8|1.25" "labios|22.0|2.5|1.3" "consulta|5.45|1.25|2" "hydrafacial|10.9|3.3|1.2" "led|14.5|3.4|1.2"; do
  IFS='|' read -r name ss t slow <<<"$entry"
  ffmpeg -v error -y -ss "$ss" -t "$t" -i "$FILM" -vf "setpts=$slow*PTS,scale=1920:-2" $H264 -crf 21 "$OUT/zona-$name-1080.mp4"
  ffmpeg -v error -y -ss "$ss" -t "$t" -i "$FILM" -vf "setpts=$slow*PTS,scale=1280:-2" $H264 -crf 24 "$OUT/zona-$name-720.mp4"
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

du -sh "$OUT"
