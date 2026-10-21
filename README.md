# asenix-clinicas

Vertical **clínicas privadas** de Asenix. Primer cliente: **Aruma Clinic** (medicina estética,
Madrid). Guion propio, distinto del de Ozio: **«Atlas del rostro» + «La consulta»**, inspirado en
webs premiadas que usan el cuerpo como navegación (Neko Health, Vibrant Wellness) y la IA dentro
del contenido (Lóvi).

Cambiar de clínica es cambiar `src/data/clinic.ts`, `src/data/treatments.ts` y los medios.

```
src/
├── data/clinic.ts        LA ficha: zonas del atlas, respuestas de la consulta, capítulos, doctora, reseñas, agente
├── data/treatments.ts    áreas y tratamientos (generado del contenido de arumaclinic.com)
├── components/           marcado de cada sección (servidor): Chrome, Sections, Agent
├── experience/           lo que da vida a la página (cliente)
│   ├── atlas.ts          la entrada de cine, el rostro congelado con sus zonas y el corte a cada plano
│   ├── consulta.ts       la asistente dentro de la página y la ficha que se rellena sola
│   ├── engine.ts         Lenis + ScrollTrigger: titulares, película por capítulos, índice, voces
│   ├── voz.ts            llamada web con Retell vía ng-agent
│   └── Experience.tsx    lo enciende todo y mide visitas y clics (/api/track)
├── cinematic/            el motor ACEE de la primera versión, disponible
└── app/                  layout (Cormorant Garamond + Manrope + DM Mono) y página
```

## La página

| | Sección | Qué pasa |
|---|---|---|
| 01 | Atlas del rostro | entrada de cine: bandas de cinemascope, «Aruma Clinic presenta» y la película (recepción → bienvenida → el rostro); se congela en el primer plano, un barrido de luz descubre siete zonas sobre la piel real. Al pasar, la zona se ilumina y el resto se apaga; al pulsar, empujón de cámara con desenfoque y corte a su plano a pantalla completa (ecografía, labios, hydrafacial…), con el título del plano y sus tratamientos en un panel de cristal |
| 02 | La consulta | una pregunta en grande, respuestas rápidas que contesta la ficha al instante (y escriben la página) y texto libre al asistente; la ficha lateral (zonas, tratamientos, objetivos) acaba en la cita o en WhatsApp |
| 03 | La clínica | la película entera en 10 capítulos navegables |
| 04 | Quien traza el atlas | la doctora, con su formación como un currículum de lámina |
| 05 | Índice | los 26 tratamientos en una tabla filtrable por área |
| 06 | Voces | reseñas reales de Google en dos marquesinas que aceleran con el scroll |
| 07 | Visita | dirección, horario, llamada y cómo llegar |

`prefers-reduced-motion`: sin película de entrada; el rostro y sus zonas quedan quietos y todo sigue funcionando.

## La asistente (ng-agent)

La consulta y la llamada hablan con `https://ng-agent-eu.onrender.com` con el tenant `aruma-clinic`
(`clinic.agent` en la ficha). «Pregúntale a esta zona», «Preguntar a Aruma» del índice y «Reservar mi
valoración» escriben en la consulta. Si la agenda no responde, la ficha sale por WhatsApp.

Para que responda hace falta, en ng-agent:

1. Dar de alta el tenant con la ficha `profiles/aruma-clinic.json` (`POST /api/admin/tenants`
   o la pestaña Alta de `/agencia`).
2. Añadir el dominio de la web a `CORS_ORIGINS` (`https://david-zequeira.github.io` en Pages).
3. Para la llamada, que el plan del tenant incluya voz.

## Medios

```bash
bash scripts/aruma-media.sh <carpeta>   # clinica-inicio.mp4 y las fotos de arumaclinic.com
```

Saca la entrada del atlas (`intro-*.mp4`), la película entera (`clinica-*.mp4`), un clip por zona (`zona-*-1080|720.mp4`) y los
fotogramas fijos; convierte fotos y logotipos a WebP. Solo material propio de la clínica (varias
imágenes de su web antigua son de otras clínicas y no se usan).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build      # export estático en out/
```

## Pendiente

- Alta del tenant `aruma-clinic` en ng-agent y CORS (ver arriba).
- Confirmar con la clínica precios publicados con discrepancias en su web (labios: 250 € en el texto
  y 390 €/vial en la caja; blanching y código de barras: 320 € y 390 €/vial).
- Fotografías en más resolución del espacio (las de su web son de 600×400).
