# asenix-clinicas

Vertical **clínicas privadas** de Asenix. Primer cliente: **Aruma Clinic** (medicina estética,
Madrid). Una web «luxury experience» con el mismo motor y el mismo lenguaje visual que la de
Ozio, más la asistente de citas de `ng-agent` (chat y llamada) dentro de la propia página.

Cambiar de clínica es cambiar `src/data/clinic.ts`, `src/data/treatments.ts` y los medios.

```
src/
├── data/clinic.ts        LA ficha: textos, contacto, horario, reseñas, doctora, rostro, galería, agente
├── data/treatments.ts    áreas y tratamientos (generado del contenido de arumaclinic.com)
├── components/           marcado de cada sección (servidor): Chrome, Sections, Agent
├── experience/           lo que da vida a la página (cliente)
│   ├── engine.ts         motor de movimiento: GSAP + ScrollTrigger + Lenis en un solo rAF
│   ├── chat.ts / voz.ts  la asistente: POST /api/chat y llamada web con Retell vía ng-agent
│   └── Experience.tsx    lo enciende todo y mide visitas y clics (/api/track)
├── cinematic/            el motor ACEE de la primera versión (escena con ventana), disponible
└── app/                  layout (Cormorant Garamond + Manrope, metadata) y página
public/media/aruma/       medios web (scripts/aruma-media.sh)
```

## La película

| | Sección | Qué pasa al hacer scroll |
|---|---|---|
| — | Cargador | isotipo y logotipo; la cuenta sigue la carga real de la portada |
| — | Portada | 161 fotogramas de la película de la clínica (recepción → saludo → rostro → consulta) que avanzan con el scroll; un texto por plano |
| 01 | Aruma | las palabras del manifiesto se encienden |
| 02 | Tratamientos | seis áreas; la foto sigue al cursor; cada área abre el catálogo (26 fichas) con un círculo |
| 03 | Armonización facial | el rostro entra en un espejo, salen las zonas, se abre el plano y la cámara llega a los labios |
| 04 | El método | la película del cuidado a pantalla completa y un acordeón de cuatro pasos |
| 05 | El espacio | galería infinita con paralaje, arrastre y visor |
| — | Cifras | odómetro sobre el taupe de la marca |
| 06 | La doctora | retrato en arco, formación y firma |
| 07 | Reseñas | reseñas reales de Google |
| 08–09 | Experiencia y reserva | el arco de la recepción se abre a la película y al terminar entra la tarjeta de reserva |

`prefers-reduced-motion`: sin cargador ni pines; queda la composición estática.
`?noloader` salta el cargador (útil para revisar).

## La asistente (ng-agent)

Chat y llamada hablan con `https://ng-agent-eu.onrender.com` con el tenant `aruma-clinic`
(`clinic.agent` en la ficha). «Reservar consulta», «Preguntar a Aruma» y «Reservar» de cada
tratamiento abren el chat con la petición ya escrita.

Para que responda hace falta, en ng-agent:

1. Dar de alta el tenant con la ficha `profiles/aruma-clinic.json` (`POST /api/admin/tenants`
   o la pestaña Alta de `/agencia`).
2. Añadir el dominio de la web a `CORS_ORIGINS` (`https://david-zequeira.github.io` en Pages).
3. Para la llamada, que el plan del tenant incluya voz.

## Medios

```bash
bash scripts/aruma-media.sh <carpeta>   # clinica-inicio.mp4 y las fotos de arumaclinic.com
```

Corta la película en la portada por fotogramas, `cuidado-*.mp4`, `experiencia-*.mp4` y los
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
