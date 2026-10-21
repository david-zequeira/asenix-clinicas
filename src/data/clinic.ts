import type { Answer, Chapter, Review, Zone } from "./types";
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
    "Aruma Clinic, medicina estética avanzada en Madrid. Recorre el atlas del rostro, cuéntanos qué buscas y reserva tu valoración con la Dra. Andrea Marroquín.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://david-zequeira.github.io/asenix-clinicas",
  city: "Madrid",

  /** Asistente de citas (ng-agent): la consulta escrita y la llamada usan el mismo tenant. */
  agent: { url: "https://ng-agent-eu.onrender.com", tenant: "aruma-clinic", name: "Aruma" },

  contact: {
    street: "Calle Don Ramón de la Cruz 36, Bajo B",
    city: "28001 Madrid",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Calle%20Don%20Ram%C3%B3n%20de%20la%20Cruz%2036%2C%2028001%20Madrid",
    phone: "652 538 353",
    whatsapp: "34652538353",
    email: "info@arumaclinic.com",
    instagram: "arumaclinic",
    facebook: "arumaclinic",
  },
  hours: [
    ["Lunes a viernes", "10:00 – 20:00"],
    ["Sábado y domingo", "Cerrado"],
    ["Cita", "Previa y personalizada"],
  ] as [string, string][],
  legal: { company: "ROIA MEDICAL GROUP S.L.", cif: "B02715241", site: "https://arumaclinic.com" },

  /* =================== 01 · EL ATLAS DEL ROSTRO =================== */
  atlas: {
    /** la película de entrada acaba exactamente en este fotograma, que se congela */
    intro: "intro",
    still: "still-rostro",
    frame: [1920, 1080] as [number, number],
    zones: [
      { id: "frente", n: "01", name: "Frente", italic: "y entrecejo", at: [1010, 175], shape: [[1010, 160, 300, 105]],
        lead: "Las líneas de expresión se suavizan relajando el músculo, sin perder la expresión. El objetivo es que luzcas descansada, no diferente.",
        clip: "foto-0578", fig: "Neuromoduladores en el entrecejo", treatments: ["arrugas", "inductores-de-colageno"] },
      { id: "mirada", n: "02", name: "Mirada", italic: "y patas de gallo", at: [880, 345], shape: [[880, 340, 190, 70], [1240, 330, 140, 60]],
        lead: "Arrugas perioculares muy finas que se tratan con toxina botulínica o con microinyecciones superficiales de ácido hialurónico.",
        clip: "zona-limpieza", fig: "Limpieza y preparación de la mirada", treatments: ["arrugas", "blanching"] },
      { id: "pomulos", n: "03", name: "Pómulos", italic: "y volumen", at: [790, 520], shape: [[790, 520, 150, 110]],
        lead: "Reponer el volumen que se pierde con los años devuelve un aspecto descansado. Antes de tratar, se estudia lo que hay bajo la piel.",
        clip: "zona-ecografia", fig: "Ecografía facial · bajo la piel", treatments: ["aumento-de-pomulos", "inductores-de-colageno", "armonizacion-facial"] },
      { id: "nariz", n: "04", name: "Nariz", italic: "sin cirugía", at: [1135, 500], shape: [[1135, 470, 75, 160]],
        lead: "Rectificar el caballete, elevar la punta o corregir asimetrías con ácido hialurónico, viendo el resultado en tiempo real.",
        clip: "still-rostro", fig: "El perfil, en primer plano", treatments: ["rinomodelacion"] },
      { id: "labios", n: "05", name: "Labios", italic: "volumen justo", at: [1065, 745], shape: [[1065, 745, 165, 70]],
        lead: "La especialidad de la Dra. Marroquín: definir, dar volumen o simplemente hidratar, siempre en proporción con el resto del rostro.",
        clip: "zona-labios", fig: "Aumento de labios con ácido hialurónico", treatments: ["relleno-de-labios", "hidratacion-de-labios", "codigo-de-barras"] },
      { id: "contorno", n: "06", name: "Contorno", italic: "mentón y mandíbula", at: [700, 840], shape: [[1060, 940, 170, 80], [640, 820, 120, 140]],
        lead: "El perfil se construye entre mentón y mandíbula; a veces un pequeño cambio en uno equilibra todo el conjunto.",
        clip: "zona-consulta", fig: "Lectura del contorno en consulta", treatments: ["aumento-de-menton", "marcacion-mandibular", "masculinizacion-facial", "bruxismo"] },
      { id: "piel", n: "07", name: "La piel", italic: "entera", at: [1010, 560], shape: [],
        lead: "La base sobre la que todo lo demás se ve mejor: limpiar, hidratar, regenerar y dar luz, casi siempre sin tiempo de baja.",
        clip: "zona-hydrafacial", fig: "Hydrafacial · limpieza e hidratación", treatments: ["hydrafacial", "skinbooster", "polinucleotidos", "plasma-rico-en-plaqueta", "vitaminas-faciales", "dermapen", "peeling-quimico", "laser-fraccionado-no-ablativo", "luz-pulsada-intensa", "radiofrecuencia"] },
    ] satisfies Zone[],
  },

  /* =================== 02 · LA CONSULTA =================== */
  consulta: {
    title: "¿Qué te gustaría cambiar…",
    italic: "o qué prefieres conservar?",
    answers: [
      { id: "luz", label: "Más luz en la piel", zones: ["piel"], treatments: ["hydrafacial", "skinbooster", "vitaminas-faciales", "polinucleotidos"],
        reply: "Para devolver luz a la piel empezamos por su calidad: limpiar en profundidad, hidratar y regenerar. Son tratamientos sin tiempo de baja." },
      { id: "lineas", label: "Líneas de expresión", zones: ["frente", "mirada"], treatments: ["arrugas", "blanching", "codigo-de-barras"],
        reply: "Las líneas de la frente, el entrecejo y las patas de gallo se suavizan relajando el músculo, sin perder expresión. Descansada, no diferente." },
      { id: "labios", label: "Labios", zones: ["labios"], treatments: ["relleno-de-labios", "hidratacion-de-labios"],
        reply: "Es la especialidad de la doctora: definir, dar volumen justo o simplemente hidratar, siempre en proporción con el resto del rostro." },
      { id: "contorno", label: "Contorno y perfil", zones: ["pomulos", "contorno", "nariz"], treatments: ["aumento-de-pomulos", "aumento-de-menton", "marcacion-mandibular", "rinomodelacion"],
        reply: "El perfil se construye entre pómulos, nariz, mentón y mandíbula. A menudo un cambio pequeño en uno equilibra todo el conjunto." },
      { id: "prevenir", label: "Solo prevenir", zones: ["piel"], treatments: ["skinbooster", "inductores-de-colageno", "dermapen", "peeling-quimico"],
        reply: "Prevenir es cuidar la calidad de la piel y estimular su propio colágeno antes de tener que corregir nada." },
      { id: "nose", label: "Aún no lo sé", zones: [], treatments: ["armonizacion-facial"],
        reply: "Es lo más habitual, y la mejor manera de empezar: en la valoración la doctora mira el conjunto y te propone solo lo que tiene sentido para ti." },
    ] satisfies Answer[],
  },

  /* =================== 03 · LA CLÍNICA, EN 26 SEGUNDOS =================== */
  film: {
    chapters: [
      { at: 0, label: "Recepción" },
      { at: 1.9, label: "Bienvenida" },
      { at: 3.6, label: "El rostro" },
      { at: 5.4, label: "Valoración" },
      { at: 7.2, label: "Limpieza" },
      { at: 10.8, label: "Hydrafacial" },
      { at: 14.4, label: "Luz LED" },
      { at: 18.4, label: "Ecografía" },
      { at: 21.9, label: "Labios" },
      { at: 24.9, label: "Calma" },
    ] satisfies Chapter[],
  },

  doctora: {
    name: "Dra. Andrea",
    italic: "Marroquín",
    role: "Directora médica",
    quote: "La medicina estética contribuye a mejorar ese estado de bienestar y de plenitud.",
    text: "Nació en Guatemala, donde estudió Medicina y Cirugía, y se formó como médico estético en la Universidad Complutense de Madrid. Lleva más de diez años ejerciendo la medicina y está especializada en armonización facial personalizada y en el aumento, la definición y la hidratación de los labios.",
    cv: [
      ["2005–2011", "Licenciada en Medicina · Universidad San Carlos de Guatemala"],
      ["2016–2017", "Máster en Medicina Estética y Antiaging · Universidad Complutense de Madrid"],
      ["2020–2021", "Experto en Técnicas de Imagen en Medicina y Cirugía Estética · Universidad de Alcalá"],
      ["2020–2021", "Máster en Nutrición Clínica · Universidad Cardenal Herrera"],
      ["2021–2023", "Diplomado en Dermatología · AMIR – Océano Medicina"],
      ["2023–2024", "Máster en Láser y Dispositivos Basados en Energía · AMIR"],
    ] as [string, string][],
    photo: "foto-0578",
    inset: "foto-0717",
  },

  reviews: [
    { quote: "Me traté las ojeras y el resultado fue muy natural y bonito.", name: "Carmen Herranz Benito" },
    { quote: "Te sientes segura y cómoda en sus manos.", name: "Ana María Ferrer" },
    { quote: "El resultado del retoque ha superado mis expectativas: muy natural y justo como quería.", name: "David Antonov Dimitrov" },
    { quote: "Desde el primer momento me sentí en las mejores manos.", name: "Marcia Bosquez" },
    { quote: "Nunca intenta hacer tratamientos innecesarios y siempre busca el resultado más favorecedor.", name: "Aida Gómez" },
    { quote: "Genial trato y profesionalidad. Repetiré el año siguiente de nuevo.", name: "Guadalupe Ríos López" },
  ] satisfies Review[],

  areas,
  treatments,
};

export type Clinic = typeof clinic;
