"use client";

import type { RefObject } from "react";
import type { CinematicMedia } from "./types";
import type { ResolvedSources } from "./useMediaSources";
import { withBase } from "./utils";

type Props = {
  ref: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  media: CinematicMedia;
  sources: ResolvedSources | null;
  /** Escena de portada: el vídeo se pide entero desde el principio. */
  priority?: boolean;
};

/** Capa B: la película nítida, recortada por la ventana que el scroll abre. */
export default function CinematicWindow({ ref, videoRef, media, sources, priority }: Props) {
  return (
    <div ref={ref} className="cine-layer cine-window" aria-hidden>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        autoPlay
        preload={priority ? "auto" : "metadata"}
        poster={withBase(media.poster)}
        style={{ objectPosition: media.position }}
      >
        {sources?.webm && <source src={sources.webm} type="video/webm" />}
        {sources && <source src={sources.mp4} type="video/mp4" />}
      </video>
    </div>
  );
}
