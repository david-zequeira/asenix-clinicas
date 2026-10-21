/** Tipos de la ficha de la clínica. Las imágenes son nombres de archivo de public/media/<cliente> sin extensión. */

export type Treatment = {
  slug: string;
  name: string;
  /** Una línea para listados. */
  summary: string;
  description: string;
  benefits: string[];
  /** Sesión, duración del efecto, nº de sesiones y precio, solo si la clínica los publica. */
  facts: { k: string; v: string }[];
  image: string;
  /** Ficha original en la web de la clínica. */
  url: string;
};

export type Area = {
  id: string;
  n: string;
  name: string;
  /** Título con `*cursiva*`. */
  title: string;
  intro: string;
  image: string;
  treatments: string[];
};

/** Elipse sobre el primer plano del rostro, en px del fotograma de 1920×1080: [cx, cy, rx, ry]. */
export type Ellipse = [number, number, number, number];

/** Una zona del atlas del rostro. */
export type Zone = {
  id: string;
  n: string;
  name: string;
  italic: string;
  /** Punto al que se acerca la cámara y donde va la cruz. */
  at: [number, number];
  /** Dónde se reconoce la zona al pasar el cursor; vacío = todo el rostro. */
  shape: Ellipse[];
  lead: string;
  /** Lo que se ve en la lupa: clip de la película y su pie de figura. */
  clip: string;
  fig: string;
  treatments: string[];
};

/** Respuesta rápida de la consulta: lo que contesta la clínica sin esperar al asistente. */
export type Answer = { id: string; label: string; reply: string; zones: string[]; treatments: string[] };

export type Chapter = { at: number; label: string };

export type Review = { quote: string; name: string };
