"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DEFAULTS, type CinematicSceneConfig, type Inset } from "./types";

gsap.registerPlugin(ScrollTrigger);

const insetVars = (inset: Inset, radius: number) => ({
  "--win-t": `${inset[0]}%`,
  "--win-r": `${inset[1]}%`,
  "--win-b": `${inset[2]}%`,
  "--win-l": `${inset[3]}%`,
  "--win-rad": `${radius}px`,
});

export type CinematicRefs = {
  stage: RefObject<HTMLElement | null>;
  background: RefObject<HTMLDivElement | null>;
  window: RefObject<HTMLDivElement | null>;
  windowVideo: RefObject<HTMLVideoElement | null>;
  title: RefObject<HTMLDivElement | null>;
  subtitle: RefObject<HTMLParagraphElement | null>;
  meta: RefObject<HTMLDivElement | null>;
  overlay: RefObject<HTMLDivElement | null>;
  scrim: RefObject<HTMLDivElement | null>;
  reveal: RefObject<HTMLDivElement | null>;
};

/**
 * Línea de tiempo maestra de la escena (§11): una sola timeline con scrub,
 * la sección fijada mientras dura. La ventana se abre con clip-path — no se
 * toca ni width ni height, así el vídeo no se re-encuadra y no hay layout.
 *
 *   0 ──────────── fullscreenAt ───────── 1
 *   ventana se abre · fondo se aclara     velo + cierre entran · se mantiene
 *   titular sube y se apaga
 */
export function useCinematicScroll(refs: CinematicRefs, scene: CinematicSceneConfig, enabled: boolean) {
  useEffect(() => {
    const stage = refs.stage.current;
    if (!enabled || !stage) return;

    const bg = { ...DEFAULTS.background, ...scene.background };
    const bgEnd = { ...DEFAULTS.backgroundEnd, ...scene.background?.end };
    const win = { ...DEFAULTS.window, ...scene.window };
    const anim = { ...DEFAULTS.animation, ...scene.animation };

    const mm = gsap.matchMedia(stage);

    mm.add({ mobile: "(max-width: 767px)", desktop: "(min-width: 768px)" }, (ctx) => {
      const mobile = Boolean(ctx.conditions?.mobile);
      const inset = mobile ? win.mobileInset : win.inset;
      const radius = mobile ? win.mobileRadius : win.radius;
      const length = mobile ? anim.mobileLength : anim.length;
      const open = anim.fullscreenAt;

      const el = {
        background: refs.background.current,
        window: refs.window.current,
        windowVideo: refs.windowVideo.current,
        title: refs.title.current,
        subtitle: refs.subtitle.current,
        meta: refs.meta.current,
        overlay: refs.overlay.current,
        scrim: refs.scrim.current,
        reveal: refs.reveal.current,
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: `+=${length}`,
          scrub: anim.scrub,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Estados iniciales explícitos (fromTo, no set): al refrescar, ScrollTrigger
      // relee los valores de partida y con `set` los tomaría de la CSS por defecto
      // (GSAP no restaura variables CSS al revertir). El recorte va en variables
      // y no en el string de clip-path: ver cinematic.css.
      tl.fromTo(
        el.window,
        insetVars(inset, radius),
        { ...insetVars([0, 0, 0, 0], 0), duration: open, ease: "power1.inOut", immediateRender: true },
        0,
      )
        .fromTo(el.windowVideo, { scale: win.scale }, { scale: 1, duration: open, ease: "power1.inOut", immediateRender: true }, 0)
        .fromTo(
          el.background,
          { scale: bg.scale, opacity: bg.opacity, filter: `blur(${bg.blur}px) brightness(${bg.brightness})` },
          {
            scale: bgEnd.scale,
            opacity: bgEnd.opacity,
            filter: `blur(${bgEnd.blur}px) brightness(${bgEnd.brightness})`,
            duration: open,
            immediateRender: true,
          },
          0,
        )
        // Tipografía y UI: cada capa a su velocidad (§12) para que haya profundidad
        .to(el.title, { yPercent: -70, opacity: 0, duration: open * 0.7, ease: "power1.in" }, 0)
        .to(el.subtitle, { y: 70, opacity: 0, duration: open * 0.55, ease: "power1.in" }, 0)
        .to(el.meta, { opacity: 0, duration: open * 0.35 }, 0)
        .to(el.overlay, { y: 90, opacity: 0, duration: open * 0.5, ease: "power1.in" }, 0.03)
        // Cierre: velo, texto y CTA sobre la película a pantalla completa
        .to(el.scrim, { opacity: 1, duration: 0.2 }, open - 0.05)
        .fromTo(el.reveal, { opacity: 0, y: 56 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, open + 0.05)
        .set(el.reveal, { pointerEvents: "auto" }, open + 0.12)
        // Reposo: la escena se queda abierta un tramo antes de soltar el pin
        .to({}, { duration: 1 - (open + 0.27) });
    });

    return () => mm.revert();
  }, [refs, scene, enabled]);
}
