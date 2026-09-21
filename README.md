# asenix-clinicas

Vertical **clínicas privadas** de Asenix (la primera de las tres de la estrategia). Por ahora,
la pieza que entra por los ojos: una web cinematográfica construida con el
**Asenix Cinematic Experience Engine (ACEE)**, el sistema de escenas con vídeo que se abre
al hacer scroll. La ficha de la clínica, los textos y las escenas viven en un solo archivo:
`src/data/clinic.ts`. Cambiar de cliente es cambiar ese archivo y los vídeos.

```
src/
├── cinematic/            el motor (reutilizable en cualquier vertical)
│   ├── CinematicScene    fondo + ventana + tipografía + UI + cierre, dirigido por config
│   ├── useCinematicScroll  timeline maestra con ScrollTrigger (pin + scrub)
│   ├── useSyncedVideo    los dos <video> de la escena van a la par
│   ├── useMediaSources   elige 1080/720 según pantalla, un solo archivo por visita
│   └── cinematic.css     estado inicial de las capas
├── data/clinic.ts        LA ficha: nombre, textos, contacto, escenas
├── components/           navbar, secciones editoriales, footer, providers
└── app/                  layout (fuentes, metadata) y página
public/media/clinica/     vídeos web (generados con scripts/media.sh, másters fuera del repo)
docs/                     acee.md (el motor) · video-prompts.md (cómo se generan las películas)
```

## Cómo funciona una escena

La misma película dos veces (§2 de `docs/acee.md`): detrás, ampliada, desenfocada y oscurecida;
delante, nítida y recortada por una **ventana**. La ventana es un `clip-path` sobre un vídeo a
pantalla completa: al hacer scroll el recorte se abre hasta desaparecer, así que el vídeo no se
re-encuadra nunca — solo se ve más de él — y no hay ni un cálculo de layout. Titular, subtítulo,
tarjeta y metadatos se mueven a velocidades distintas (profundidad). Cuando la ventana llega a
pantalla completa entra el cierre: un velo, un titular y el CTA.

```
scroll  0 ───────────── 55 % ─────────────── 100 %
        ventana se abre      cierre entra y se mantiene
        fondo se aclara
        titular sube y se apaga
```

- `prefers-reduced-motion`: sin pin ni animación; queda la composición inicial y el cierre pasa a
  un bloque normal debajo.
- Móvil: recorte, radio y longitud de scroll propios (`mobileInset`, `mobileLength`), sin tarjeta.
- Los vídeos solo se reproducen mientras la escena está en pantalla.

## Vídeos

```bash
npm run media -- ~/Downloads     # carpeta con los másters HEVC de Higgsfield
```

Genera por clip: `-1080.mp4` (ventana, escritorio), `-720.mp4` (móvil), `-480.mp4` (capa de
fondo: va desenfocada, no necesita más), `-1080.webm`, `-poster.jpg` y `-still.jpg`. Sin audio.
Los prompts con los que se generan las películas están en `docs/video-prompts.md` (§9, clínicas).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build      # export estático en out/
```

## Pendiente para venderla

- Conectar el WS Agent (`ng-agent`) como chat de la web y agente de WhatsApp de la clínica.
- Sustituir los datos de contacto de muestra y la marca «Clínica Aire» por los del cliente.
- Páginas legales reales (aviso legal, privacidad, cookies) y consentimiento.
- Fotografía o vídeo del cliente cuando lo haya; hasta entonces, las películas generadas.
