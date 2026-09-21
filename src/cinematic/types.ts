/**
 * Asenix Cinematic Experience Engine (ACEE) — contrato de una escena.
 *
 * Una escena es un vídeo tratado dos veces (§2 del documento del motor):
 * una copia ampliada y desenfocada de fondo, y una copia nítida vista a
 * través de una «ventana» que el scroll abre hasta ocupar la pantalla.
 * Todo lo que cambia entre clientes vive aquí; los componentes no llevan
 * texto ni rutas.
 */

/** Recorte de la ventana: [arriba, derecha, abajo, izquierda] en % del escenario. */
export type Inset = [number, number, number, number];

export type CinematicMedia = {
  /** Vídeo nítido para escritorio (H.264, sin audio). */
  src: string;
  /** Vídeo nítido para pantallas estrechas; si falta se usa `src`. */
  mobileSrc?: string;
  /** Copia para la capa de fondo. Va desenfocada: 480p sobra y ahorra GPU. */
  backgroundSrc?: string;
  /** Variante VP9 para navegadores que la prefieran (solo escritorio). */
  webm?: string;
  /** Primer fotograma: pinta antes de que llegue el vídeo. */
  poster: string;
  /** object-position de la ventana (§13: pequeña diferencia entre capas). */
  position?: string;
  /** object-position del fondo. */
  backgroundPosition?: string;
};

export type CinematicBackgroundConfig = {
  /** Desenfoque inicial en px (15–40). */
  blur?: number;
  /** Escala inicial (1.05–1.20). */
  scale?: number;
  /** Opacidad inicial (0.45–0.80). */
  opacity?: number;
  /** Brillo inicial (0–1): oscurece el entorno. */
  brightness?: number;
  /** Estado al final de la transición (la ventana ya lo tapa casi todo). */
  end?: { blur?: number; scale?: number; opacity?: number; brightness?: number };
};

export type CinematicWindowConfig = {
  /** Recorte inicial en escritorio. */
  inset?: Inset;
  /** Recorte inicial en móvil. */
  mobileInset?: Inset;
  /** Radio inicial de las esquinas en px. */
  radius?: number;
  /** Radio en móvil. */
  mobileRadius?: number;
  /** Escala inicial del vídeo dentro de la ventana (>1 = plano más cerrado). */
  scale?: number;
};

export type CinematicAnimationConfig = {
  /** Píxeles de scroll que dura la escena fijada en escritorio. */
  length?: number;
  /** Ídem en móvil. */
  mobileLength?: number;
  /** Retardo del scrub de ScrollTrigger (segundos). */
  scrub?: number;
  /** Fracción de la línea de tiempo en la que la ventana llega a pantalla completa. */
  fullscreenAt?: number;
};

export type CinematicReveal = {
  eyebrow?: string;
  title: string;
  text?: string;
  cta?: { label: string; href: string };
};

export type CinematicCard = {
  label: string;
  value: string;
  note?: string;
};

export type CinematicSceneConfig = {
  id: string;
  media: CinematicMedia;
  eyebrow?: string;
  /** Titular. `*palabra*` la pone en cursiva. */
  title: string;
  subtitle?: string;
  /** Etiquetas pequeñas de la esquina inferior derecha. */
  meta?: string[];
  /** Tarjeta flotante sobre la ventana (solo escritorio). */
  card?: CinematicCard;
  /** Contenido que aparece cuando la ventana ya ocupa la pantalla. */
  reveal?: CinematicReveal;
  background?: CinematicBackgroundConfig;
  window?: CinematicWindowConfig;
  animation?: CinematicAnimationConfig;
};

export const DEFAULTS = {
  background: { blur: 28, scale: 1.14, opacity: 0.85, brightness: 0.55 },
  backgroundEnd: { blur: 6, scale: 1, opacity: 0, brightness: 0.8 },
  window: {
    inset: [24, 8, 20, 8] as Inset,
    mobileInset: [30, 6, 28, 6] as Inset,
    radius: 28,
    mobileRadius: 20,
    scale: 1.08,
  },
  animation: { length: 2400, mobileLength: 1500, scrub: 0.8, fullscreenAt: 0.55 },
} as const;
