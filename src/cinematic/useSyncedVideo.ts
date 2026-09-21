"use client";

import { useEffect, type RefObject } from "react";

const MAX_DRIFT = 0.12;

/**
 * Fondo y ventana son dos <video> con la misma película. La ventana manda:
 * si el fondo se desvía más de 120 ms se le vuelve a alinear. Ambos se
 * reproducen solo mientras el escenario está en pantalla.
 */
export function useSyncedVideo(
  master: RefObject<HTMLVideoElement | null>,
  follower: RefObject<HTMLVideoElement | null>,
  stage: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const m = master.current;
    const f = follower.current;
    const el = stage.current;
    if (!m || !el) return;

    const videos = [m, f].filter((v): v is HTMLVideoElement => !!v);
    const play = () => videos.forEach((v) => v.play().catch(() => undefined));
    const pause = () => videos.forEach((v) => v.pause());

    const sync = () => {
      if (f && Math.abs(f.currentTime - m.currentTime) > MAX_DRIFT) f.currentTime = m.currentTime;
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()), {
      threshold: 0.02,
    });
    io.observe(el);

    m.addEventListener("timeupdate", sync);
    m.addEventListener("seeked", sync);
    m.addEventListener("play", play);

    return () => {
      io.disconnect();
      m.removeEventListener("timeupdate", sync);
      m.removeEventListener("seeked", sync);
      m.removeEventListener("play", play);
      pause();
    };
  }, [master, follower, stage]);
}
