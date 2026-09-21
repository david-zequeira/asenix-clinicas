"use client";

import { useEffect, useState } from "react";
import type { CinematicMedia } from "./types";
import { withBase } from "./utils";

export type ResolvedSources = { mp4: string; webm?: string };

/**
 * Elige la versión del vídeo según el ancho de pantalla. Se decide en cliente
 * y se inyectan los <source> después de hidratar: así cada visitante descarga
 * un solo archivo (el `media` de <source> no es fiable en todos los navegadores).
 */
export function useMediaSources(media: CinematicMedia) {
  const [sources, setSources] = useState<{ window: ResolvedSources; background: ResolvedSources } | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const sharp = mobile && media.mobileSrc ? media.mobileSrc : media.src;
    setSources({
      window: { mp4: withBase(sharp), webm: !mobile && media.webm ? withBase(media.webm) : undefined },
      background: { mp4: withBase(media.backgroundSrc ?? sharp) },
    });
  }, [media]);

  return sources;
}
