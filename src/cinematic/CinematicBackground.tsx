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
};

/** Capa A: la película ampliada, desenfocada y oscurecida. */
export default function CinematicBackground({ ref, videoRef, media, sources }: Props) {
  return (
    <div ref={ref} className="cine-layer cine-bg" aria-hidden>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={withBase(media.poster)}
        style={{ objectPosition: media.backgroundPosition ?? media.position }}
      >
        {sources && <source src={sources.mp4} type="video/mp4" />}
      </video>
    </div>
  );
}
