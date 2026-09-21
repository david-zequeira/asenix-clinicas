import type { CinematicSceneConfig } from "@/cinematic/types";

/**
 * Ficha de la clínica: TODO lo que cambia entre clientes vive en este archivo.
 * Nombre, textos, contacto y las tres escenas cinematográficas. Los datos de
 * contacto son de muestra hasta que haya cliente.
 */

const MEDIA = "/media/clinica";

const clip = (name: string) => ({
  src: `${MEDIA}/${name}-1080.mp4`,
  mobileSrc: `${MEDIA}/${name}-720.mp4`,
  backgroundSrc: `${MEDIA}/${name}-480.mp4`,
  webm: `${MEDIA}/${name}-1080.webm`,
  poster: `${MEDIA}/${name}-poster.jpg`,
  still: `${MEDIA}/${name}-still.jpg`,
});

export type Treatment = { n: string; name: string; text: string; still: string };
export type Step = { n: string; title: string; text: string };

export const clinic = {
  name: "Clínica Aire",
  tagline: "Odontología con calma",
  description:
    "Clínica dental en Madrid. Diagnóstico honesto, tratamientos explicados con calma y un espacio pensado para que cada visita pese menos.",
  // URL pública: la fija el workflow (variable NEXT_PUBLIC_SITE_URL); sin ella, GitHub Pages.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://david-zequeira.github.io/asenix-clinicas",
  city: "Madrid",
  contact: {
    phone: "+34 600 000 000",
    phoneHref: "tel:+34600000000",
    whatsapp: "https://wa.me/34600000000?text=Hola%2C%20quiero%20pedir%20una%20primera%20visita",
    email: "hola@clinica-aire.example",
    address: "Calle de Ejemplo 12, 28001 Madrid",
    hours: "Lunes a viernes · 9:00–20:00",
  },

  manifesto: {
    eyebrow: "La clínica",
    title: "Creemos que una clínica debería sentirse como una *casa bien hecha*: silenciosa, luminosa y con cada cosa en su sitio.",
    text: "Por eso no verás vitrinas ni máquinas a la vista. Verás piedra, roble y luz. Y detrás de todo eso, un equipo que se toma el tiempo de explicarte qué pasa y qué opciones tienes.",
    facts: [
      { value: "Primera visita", label: "con diagnóstico completo" },
      { value: "Presupuesto", label: "cerrado y por escrito" },
      { value: "Respuesta", label: "en menos de cinco minutos" },
    ],
  },

  treatments: [
    { n: "01", name: "Implantología", text: "Reposición de piezas con planificación digital y cirugía guiada.", still: clip("consulta").still },
    { n: "02", name: "Ortodoncia invisible", text: "Alineadores transparentes con seguimiento cada pocas semanas.", still: clip("recepcion").still },
    { n: "03", name: "Estética dental", text: "Carillas, blanqueamiento y pequeños ajustes con resultados naturales.", still: clip("equipo").still },
    { n: "04", name: "Odontopediatría", text: "Primeras visitas sin prisa para que volver no cueste.", still: clip("consulta").still },
    { n: "05", name: "Higiene y prevención", text: "Revisiones periódicas y limpiezas: la parte más importante y la más olvidada.", still: clip("recepcion").still },
  ] satisfies Treatment[],

  method: {
    eyebrow: "Cómo trabajamos",
    title: "Tres pasos. *Ninguna sorpresa.*",
    steps: [
      { n: "01", title: "Primera visita", text: "Exploración completa, radiografía y una conversación sin prisas sobre lo que ves tú y lo que vemos nosotros." },
      { n: "02", title: "Plan claro", text: "Un plan de tratamiento por escrito, con fases, plazos y precio cerrado antes de empezar." },
      { n: "03", title: "Seguimiento", text: "Recordatorios, revisiones y un canal directo con tu especialista. Volver es fácil." },
    ] satisfies Step[],
  },

  booking: {
    eyebrow: "Primera visita",
    title: "Reserva tu *primera visita*",
    text: "Escríbenos por WhatsApp o llámanos. Respondemos en minutos, también fuera de horario, y te proponemos un hueco a tu medida.",
  },

  scenes: {
    hero: {
      id: "inicio",
      media: clip("recepcion"),
      eyebrow: "Clínica dental · Madrid",
      title: "La calma también *se diseña.*",
      subtitle: "Odontología de precisión en un espacio pensado para que el tiempo pase despacio.",
      meta: ["Madrid", "Desde 2026"],
      card: { label: "Primera visita", value: "60 min", note: "Diagnóstico completo" },
      reveal: {
        eyebrow: "Bienvenido a Clínica Aire",
        title: "Un lugar al que *no da miedo* volver.",
        text: "Diagnóstico honesto, tratamientos explicados con calma y un espacio construido para que cada visita pese menos que la anterior.",
        cta: { label: "Reservar primera visita", href: "#reserva" },
      },
      animation: { length: 2600 },
    },
    consulta: {
      id: "espacio",
      media: clip("consulta"),
      eyebrow: "El espacio",
      title: "Consultas que *no parecen* consultas.",
      subtitle: "Piedra natural, roble, luz indirecta y tecnología que no se ve hasta que hace falta.",
      meta: ["Gabinetes", "Luz natural"],
      card: { label: "Cada gabinete", value: "Privado", note: "Equipamiento integrado" },
      reveal: {
        title: "Todo a la vista. *Nada que asuste.*",
        text: "Cada gabinete integra el equipamiento en la arquitectura: menos ruido visual, más atención en ti.",
      },
      window: { inset: [18, 14, 18, 14], radius: 20, mobileInset: [26, 8, 26, 8] },
      background: { blur: 34, scale: 1.18, brightness: 0.5 },
    },
    equipo: {
      id: "equipo",
      media: clip("equipo"),
      eyebrow: "El equipo",
      title: "Te acompañamos *hasta la puerta.*",
      subtitle: "Especialistas que explican, escuchan y no tienen prisa.",
      meta: ["Equipo propio", "Sin rotación"],
      reveal: {
        eyebrow: "Empieza aquí",
        title: "Tu primera visita *empieza hoy.*",
        text: "Cuéntanos qué necesitas. Te respondemos en minutos, también por WhatsApp, y te proponemos un hueco a tu medida.",
        cta: { label: "Reservar ahora", href: "#reserva" },
      },
      // Portal: la ventana empieza como un arco alto y estrecho sobre el pasillo
      window: { inset: [6, 34, 6, 34], radius: 240, mobileInset: [10, 18, 10, 18], mobileRadius: 160, scale: 1.12 },
      background: { blur: 30, scale: 1.16, brightness: 0.45 },
      animation: { length: 2800, fullscreenAt: 0.6 },
    },
  } satisfies Record<string, CinematicSceneConfig>,
};
