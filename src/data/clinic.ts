import type { GalleryItem, HeroScene, Review, Zone } from "./types";
import { areas, treatments } from "./treatments";

/**
 * Ficha de la clínica: TODO lo que cambia entre clientes vive aquí y en
 * treatments.ts. Textos, contacto y reseñas salen de arumaclinic.com; los medios,
 * de su película y sus fotografías (scripts/aruma-media.sh).
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const MEDIA = `${BASE}/media/aruma`;
/** Ruta pública de un medio: `img("still-labios")` → …/still-labios.webp */
export const img = (name: string, ext = "webp") => `${MEDIA}/${name}.${ext}`;

export const clinic = {
  name: "Aruma Clinic",
  tagline: "Ciencia & Serenidad",
  description:
    "Aruma Clinic, medicina estética avanzada en Madrid. Tratamientos faciales, corporales y de calidad de piel con resultados naturales, de la mano de la Dra. Andrea Marroquín.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://david-zequeira.github.io/asenix-clinicas",
  city: "Madrid",

  /** Asistente de reservas (ng-agent): chat y llamada web con el mismo tenant. */
  agent: { url: "https://ng-agent-eu.onrender.com", tenant: "aruma-clinic", name: "Aruma" },

  contact: {
    address: "Calle Don Ramón de la Cruz 36, Bajo B\n28001 Madrid",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calle%20Don%20Ram%C3%B3n%20de%20la%20Cruz%2036%2C%2028001%20Madrid",
    phone: "652 538 353",
    whatsapp: "34652538353",
    email: "info@arumaclinic.com",
    instagram: "arumaclinic",
    facebook: "arumaclinic",
  },
  hours: [
    ["Días", "Lunes a viernes"],
    ["Horario", "10:00 – 20:00"],
    ["Cita", "Previa y personalizada"],
    ["Primera visita", "Valoración médica"],
  ] as [string, string][],
  legal: { company: "ROIA MEDICAL GROUP S.L.", cif: "B02715241", site: "https://arumaclinic.com" },

  /** Portada: un texto por plano de la película (recepción, el rostro, la consulta). */
  hero: [
    { title: "Ciencia", italic: "& serenidad", lead: "La belleza surge cuando el equilibrio se consolida." },
    { title: "Tu rostro,", italic: "en su mejor versión", lead: "Resultados naturales: que luzcas descansada, no diferente." },
    { title: "Bienvenida", italic: "a Aruma", lead: "Medicina estética avanzada en el corazón de Madrid.", ctas: true },
  ] satisfies HeroScene[],

  intro: {
    title: "Aquí, la belleza no se persigue:",
    italic: "surge cuando el bienestar se consolida.",
    text: "Un espacio donde la ciencia se encuentra con la serenidad. Precisión médica, sensibilidad artística y tiempo para escucharte.",
  },

  trat: {
    title: "Resultados",
    italic: "que transforman",
    text: "Veintiséis tratamientos en seis áreas, siempre tras una valoración médica personalizada. Pulsa un área para ver cada tratamiento, cuánto dura y qué esperar.",
  },

  /** 03 · La lectura del rostro: el primer plano de la película y sus zonas. */
  rostro: {
    still: "still-rostro",
    macro: "still-labios",
    /** centro del círculo, radio y punto al que se acerca la cámara (labios), en px del fotograma */
    geo: { w: 1920, h: 1080, cx: 1010, cy: 560, r: 470, zoom: [1060, 750] as [number, number] },
    zones: [
      { at: [1010, 150], side: "r", kicker: "Neuromoduladores", label: "Frente y entrecejo", short: "Frente" },
      { at: [700, 330], side: "l", kicker: "Toxina botulínica", label: "Patas de gallo", mobile: false },
      { at: [790, 500], side: "l", kicker: "Ácido hialurónico", label: "Pómulos" },
      { at: [1180, 500], side: "r", kicker: "Sin cirugía", label: "Rinomodelación", short: "Nariz" },
      { at: [1070, 745], side: "r", kicker: "Volumen e hidratación", label: "Labios" },
      { at: [640, 860], side: "l", kicker: "Contorno", label: "Marcación mandibular", short: "Mandíbula" },
      { at: [1080, 935], side: "r", kicker: "Proyección", label: "Mentón", mobile: false },
    ] satisfies Zone[],
  },

  /** 04 · El método: la película del cuidado y cuatro pasos. */
  metodo: [
    { h: "Escucha", p: "Una primera valoración médica sin prisa: qué te preocupa, qué esperas y qué es posible.", img: "still-consulta-960" },
    { h: "Diagnóstico", p: "Exploración del rostro y de la piel para entender el conjunto, no solo una zona.", img: "still-ecografia-960" },
    { h: "Tratamiento", p: "Precisión médica y sensibilidad artística, con productos de alta gama y técnica personalizada.", img: "still-hydrafacial-960" },
    { h: "Acompañamiento", p: "Seguimiento cercano después de cada sesión. Tu bienestar es el inicio, no el final.", img: "still-espera-960" },
  ],

  gallery: [
    { img: "espacio-3", alt: "Recepción de Aruma Clinic con el arco y el logotipo", caption: "La recepción", ar: 1.45, h: 0.5, y: -2.4, g: 3.7 },
    { img: "foto-0424", alt: "La doctora muestra el resultado a una paciente en un espejo", caption: "El resultado", ar: 0.67, h: 0.7, y: 2.9, g: 2.2 },
    { img: "espacio-1", alt: "Consulta con sillón de tratamiento y escritorio", caption: "La consulta", ar: 1.45, h: 0.6, y: -1, g: 6.4 },
    { img: "still-led", alt: "Tratamiento de luz LED en cabina", caption: "La luz", ar: 0.8, h: 0.8, y: 1.6, g: 2.4 },
    { img: "espacio-4", alt: "Sala de espera con butacas y hornacina iluminada", caption: "La espera", ar: 1.45, h: 0.53, y: -3.6, g: 5.3 },
    { img: "foto-0489", alt: "La Dra. Marroquín aplica un tratamiento facial", caption: "El cuidado", ar: 0.67, h: 0.69, y: 2.2, g: 2.7 },
    { img: "espacio-2", alt: "Sillón de tratamiento con el isotipo de Aruma", caption: "La cabina", ar: 1.45, h: 0.49, y: -2, g: 4.9 },
    { img: "still-espera", alt: "Zona de descanso luminosa con plantas", caption: "La calma", ar: 1.1, h: 0.57, y: 3.6, g: 1.2 },
    { img: "espacio-6", alt: "Rincón de lectura con butacas blancas", caption: "El detalle", ar: 1.45, h: 0.6, y: 0, g: 4.9 },
  ] satisfies GalleryItem[],

  stats: [
    { value: 26, label: "Tratamientos médico-estéticos" },
    { value: 10, label: "Años ejerciendo la medicina", suffix: "+" },
    { value: 57, label: "Reseñas en Google" },
    { value: 6, label: "Áreas de tratamiento" },
  ],

  doctora: {
    name: "Dra. Andrea",
    italic: "Marroquín",
    role: "Directora médica",
    quote: "La medicina estética contribuye a mejorar ese estado de bienestar y de plenitud.",
    text: "Licenciada en Medicina en la Universidad San Carlos de Guatemala y Máster en Medicina Estética y Antiaging por la Universidad Complutense de Madrid. Lleva más de diez años ejerciendo la medicina y está especializada en armonización facial personalizada y en el aumento, la definición y la hidratación de los labios.",
    tags: ["Máster en Medicina Estética · UCM", "Máster en Nutrición Clínica", "Máster en Láser y dispositivos · AMIR", "Diplomado en Dermatología"],
    photo: "foto-0578",
    inset: "foto-0717",
  },

  reviews: [
    { quote: "Trato excelente desde el minuto uno. Tanto la doctora como Aly son muy cercanas y atentas. Me traté las ojeras y el resultado fue muy natural y bonito.", name: "Carmen Herranz Benito", role: "Reseña de Google", photo: "foto-0424" },
    { quote: "Una atención muy profesional y cercana por parte de la Dra. Andrea Marroquín. Te sientes segura y cómoda en sus manos.", name: "Ana María Ferrer", role: "Reseña de Google", photo: "doctora-5" },
    { quote: "Un servicio excelente de principio a fin. El resultado del retoque ha superado mis expectativas: muy natural y justo como quería.", name: "David Antonov Dimitrov", role: "Reseña de Google", photo: "still-consulta" },
    { quote: "Una clínica cinco estrellas. Desde el primer momento me sentí en las mejores manos. Recomiendo 100 % este lugar.", name: "Marcia Bosquez", role: "Reseña de Google", photo: "espacio-3" },
    { quote: "El bótox lo pone de maravilla: el resultado es muy natural. Nunca intenta hacer tratamientos innecesarios y siempre busca el resultado más favorecedor.", name: "Aida Gómez", role: "Reseña de Google", photo: "doctora-1" },
  ] satisfies Review[],

  experiencia: {
    text: "Del primer saludo en recepción al seguimiento después de cada sesión: un recorrido pensado para tu bienestar, tu privacidad y tu confianza.",
    list: ["Valoración médica personalizada", "Plan de tratamiento a tu medida", "Seguimiento cercano"],
  },

  reserva: {
    title: "Tu consulta",
    italic: "te espera",
    text: "Reserva tu valoración con la Dra. Marroquín. Nuestra asistente te atiende al momento, por escrito o por voz, a cualquier hora.",
  },

  /** Sugerencias del chat. */
  chips: ["Quiero una primera valoración", "¿Cuánto dura el aumento de labios?", "¿Qué me recomiendas para las ojeras?"],

  areas,
  treatments,
};

export type Clinic = typeof clinic;
