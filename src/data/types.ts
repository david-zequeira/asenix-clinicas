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

export type HeroScene = { title: string; italic: string; lead: string; ctas?: boolean };

/** Etiqueta sobre el rostro: punto en px del fotograma de 1920×1080. */
export type Zone = { at: [number, number]; side: "l" | "r"; kicker: string; label: string; short?: string; mobile?: boolean };

export type Review = { quote: string; name: string; role: string; photo: string };

export type GalleryItem = { img: string; alt: string; caption: string; ar: number; h: number; y: number; g: number };
