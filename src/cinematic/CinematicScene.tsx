"use client";

import { useMemo, useRef } from "react";
import clsx from "clsx";
import CinematicBackground from "./CinematicBackground";
import CinematicWindow from "./CinematicWindow";
import CinematicTypography from "./CinematicTypography";
import CinematicOverlay from "./CinematicOverlay";
import CinematicReveal from "./CinematicReveal";
import { useCinematicScroll, type CinematicRefs } from "./useCinematicScroll";
import { useSyncedVideo } from "./useSyncedVideo";
import { useMediaSources } from "./useMediaSources";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import type { CinematicSceneConfig } from "./types";

type Props = {
  scene: CinematicSceneConfig;
  /** Escena de portada: h1 y vídeo con prioridad de carga. */
  priority?: boolean;
  className?: string;
};

/**
 * Escenario completo, dirigido por configuración (§22): fondo + ventana +
 * tipografía + UI + cierre. Con reduced-motion no se fija ni se anima:
 * queda la composición inicial y el cierre pasa a un bloque normal debajo.
 */
export default function CinematicScene({ scene, priority = false, className }: Props) {
  const stage = useRef<HTMLElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const backgroundVideo = useRef<HTMLVideoElement>(null);
  const window = useRef<HTMLDivElement>(null);
  const windowVideo = useRef<HTMLVideoElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const subtitle = useRef<HTMLParagraphElement>(null);
  const meta = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);

  const refs = useMemo<CinematicRefs>(
    () => ({ stage, background, window, windowVideo, title, subtitle, meta, overlay, scrim, reveal }),
    [],
  );

  const reduced = usePrefersReducedMotion();
  const sources = useMediaSources(scene.media);

  useCinematicScroll(refs, scene, !reduced);
  useSyncedVideo(windowVideo, backgroundVideo, stage);

  return (
    <>
      <section
        ref={stage}
        id={scene.id}
        className={clsx("cine-stage", reduced && "is-static", className)}
        data-nav="dark"
        aria-label={scene.title.replace(/\*/g, "")}
      >
        <CinematicBackground ref={background} videoRef={backgroundVideo} media={scene.media} sources={sources?.background ?? null} />
        <CinematicWindow ref={window} videoRef={windowVideo} media={scene.media} sources={sources?.window ?? null} priority={priority} />
        <CinematicTypography
          titleRef={title}
          subtitleRef={subtitle}
          eyebrow={scene.eyebrow}
          title={scene.title}
          subtitle={scene.subtitle}
          level={priority ? "h1" : "h2"}
        />
        <CinematicOverlay overlayRef={overlay} metaRef={meta} card={scene.card} meta={scene.meta} />
        <div ref={scrim} className="cine-layer cine-scrim" aria-hidden />
        {scene.reveal && !reduced && <CinematicReveal ref={reveal} reveal={scene.reveal} />}
      </section>
      {scene.reveal && reduced && <CinematicReveal reveal={scene.reveal} variant="static" />}
    </>
  );
}
