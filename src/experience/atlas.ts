/* =====================================================================
   ATLAS DEL ROSTRO — versión cinematográfica
   1) Entrada: bandas de cinemascope, «Aruma Clinic presenta», y la película
      de la clínica (recepción → bienvenida → el rostro).
   2) La película se congela en el primer plano: un barrido de luz recorre el
      rostro y aparecen sus zonas sobre la piel real.
   3) Pasar por una zona la ilumina y apaga el resto; pulsarla es un empujón de
      cámara hasta la zona y un corte a su plano a pantalla completa, con el
      título del plano abajo y sus tratamientos en un panel de cristal.
   El fotograma y la película comparten un lienzo de 1920×1080 que el motor
   mueve (escala + traslación), así la cámara y las cruces van siempre juntas.
   ===================================================================== */
import gsap from "gsap";
import type Lenis from "lenis";
import { clinic, img } from "@/data/clinic";
import { factLine } from "@/data/format";
import type { Zone } from "@/data/types";
import { $, $$ } from "./session";
import type { ConsultaApi } from "./consulta";

const [IW, IH] = clinic.atlas.frame;
type Ctx = { lenis: Lenis | null; consulta: ConsultaApi; reduce: boolean };

export function initAtlas({ lenis, consulta, reduce }: Ctx): { open: (id: string) => void; destroy: () => void } {
  const ac = new AbortController();
  const on = (t: EventTarget, ev: string, fn: (e: never) => void, o: AddEventListenerOptions = {}) => t.addEventListener(ev, fn as EventListener, { ...o, signal: ac.signal });
  const zones = clinic.atlas.zones as Zone[];
  const T = clinic.treatments;
  const sec = $("[data-atlas]"), cine = $("[data-cine]"), frame = $("[data-frame]");
  const intro = $<HTMLVideoElement>("[data-intro-video]"), spot = $("[data-spot]"), marks = $$("[data-marks] .zm");
  const zmedia = $("[data-zmedia]"), zvideo = $<HTMLVideoElement>("[data-zvideo]"), zimg = $<HTMLImageElement>("[data-zimg]");
  const panel = $("[data-zpanel]"), copy = $("[data-atlas-copy]"), zindex = $("[data-zindex]"), zcap = $("[data-zcap]");
  const bars = [$("[data-bar-t]"), $("[data-bar-b]")];
  const mobile = () => innerWidth <= 900;
  const BIG = innerWidth > 900 && Math.max(innerWidth, innerHeight) * Math.min(devicePixelRatio || 1, 2) > 1400;

  /* ---------- cámara: qué punto del fotograma va a qué punto de la pantalla ---------- */
  let W = 0, H = 0, k0 = 1;
  const S = { k: 1, px: 1010, py: 540, fx: 0, fy: 0, blur: 0 };
  let open: Zone | null = null, hover: Zone | null = null, ready = false;
  const cover = () => Math.max(W / IW, H / IH);
  const base = () => {
    const k = cover();
    // el rostro a la derecha del titular, sin dejar ver los bordes del fotograma
    let fx = mobile() ? W * 0.5 : W * 0.6;
    fx = Math.min(1010 * k, Math.max(W - (IW - 1010) * k, fx));
    return { k, px: 1010, py: 540, fx, fy: H * 0.5 };
  };
  const isClip = (z: Zone) => z.clip.startsWith("zona-");
  const isFrame = (z: Zone) => z.clip === clinic.atlas.still;
  const focusOf = (z: Zone) => ({ k: k0 * (isFrame(z) ? 2.1 : 2.4), px: z.at[0], py: z.at[1], fx: mobile() ? W * 0.5 : W * 0.4, fy: mobile() ? H * 0.32 : H * 0.48 });
  // el respiro del plano congelado (Ken Burns muy lento)
  const breath = { s: 1 };
  const toScr = (x: number, y: number) => [S.fx + (x - S.px) * S.k, S.fy + (y - S.py) * S.k];
  const toImg = (x: number, y: number) => [S.px + (x - S.fx) / S.k, S.py + (y - S.fy) / S.k];
  const placeSpot = (z: Zone) => {
    const [cx, cy, rx, ry] = z.shape[0] ?? [1010, 540, 600, 520];
    const [x, y] = toScr(cx, cy);
    spot.style.setProperty("--sx", x + "px"); spot.style.setProperty("--sy", y + "px");
    spot.style.setProperty("--sw", rx * S.k * 1.7 + "px"); spot.style.setProperty("--sh", ry * S.k * 1.9 + "px");
  };
  const apply = () => {
    const k = S.k * breath.s;
    const tx = S.fx - S.px * k, ty = S.fy - S.py * k;
    frame.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${k.toFixed(5)})`;
    frame.style.filter = S.blur > 0.05 ? `blur(${S.blur.toFixed(2)}px)` : "";
    marks.forEach((m) => {
      const [x, y] = toScr(...((m.dataset.at || "0,0").split(",").map(Number) as [number, number]));
      m.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      m.classList.toggle("l", x > W * 0.72);
    });
    if (hover) placeSpot(hover);
  };
  const measure = () => {
    W = cine.clientWidth; H = cine.clientHeight; k0 = base().k;
    if (!gsap.isTweening(S)) Object.assign(S, open ? focusOf(open) : base());
    apply();
  };

  /* ---------- foco al pasar ---------- */
  const zoneAt = (x: number, y: number) => {
    const [ix, iy] = toImg(x, y);
    return zones.find((z) => z.shape.some(([cx, cy, rx, ry]) => ((ix - cx) / rx) ** 2 + ((iy - cy) / ry) ** 2 <= 1)) || null;
  };
  const setHover = (z: Zone | null) => {
    if (z === hover || open || !ready) return;
    hover = z;
    marks.forEach((m) => m.classList.toggle("hot", !!z && m.dataset.zoneOpen === z.id));
    $$("[data-zone-hover]").forEach((b) => b.classList.toggle("hot", !!z && b.dataset.zoneHover === z.id));
    if (z) placeSpot(z);
    gsap.to(spot, { opacity: z ? 1 : 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
    cine.style.cursor = z ? "pointer" : "";
  };
  const setHoverOff = () => {
    hover = null;
    marks.forEach((m) => m.classList.remove("hot"));
    $$("[data-zone-hover]").forEach((b) => b.classList.remove("hot"));
    gsap.to(spot, { opacity: 0, duration: 0.3, overwrite: "auto" });
    cine.style.cursor = "";
  };
  on(cine, "pointermove", (e: PointerEvent) => { if (e.pointerType === "mouse") { const r = cine.getBoundingClientRect(); setHover(zoneAt(e.clientX - r.left, e.clientY - r.top)); } });
  on(cine, "pointerleave", () => setHover(null));
  on(cine, "click", (e: MouseEvent) => {
    if (open || !ready) return;
    const id = (e.target as Element).closest<HTMLElement>("[data-zone-open]")?.dataset.zoneOpen;
    const r = cine.getBoundingClientRect();
    const z = id ? zones.find((q) => q.id === id) : zoneAt(e.clientX - r.left, e.clientY - r.top);
    if (z) openZone(z);
  });
  $$("[data-zone-hover]").forEach((b) => {
    on(b, "mouseenter", () => setHover(zones.find((z) => z.id === b.dataset.zoneHover) || null));
    on(b, "mouseleave", () => setHover(null));
    on(b, "click", () => { const z = zones.find((q) => q.id === b.dataset.zoneOpen); if (z) openZone(z); });
  });

  /* ---------- una zona: empujón de cámara y corte a su plano ---------- */
  const zpLead = $("[data-zp-lead]"), zpTr = $("[data-zp-tr]"), zpN = $("[data-zp-n]"), zpAdd = $("[data-zp-add]");
  const zcFig = $("[data-zc-fig]"), zcTitle = $("[data-zc-title]");
  const fill = (z: Zone) => {
    zpN.textContent = `Zona ${z.n} / ${String(zones.length).padStart(2, "0")}`;
    zcFig.textContent = `Zona ${z.n} · ${z.fig}`;
    zcTitle.innerHTML = `${z.name} <em>${z.italic}</em>`;
    zpLead.textContent = z.lead;
    zpTr.innerHTML = z.treatments.map((s, i) => `<details${i === 0 ? " open" : ""}><summary><b>${T[s].name}</b><small>${factLine(s) || "Según valoración médica"}</small><i>+</i></summary><div>${T[s].description}<ul>${T[s].benefits.slice(0, 4).map((b) => `<li>${b}</li>`).join("")}</ul></div></details>`).join("");
    $("[data-zp-body]").scrollTop = 0;
    zpAdd.setAttribute("aria-pressed", String(consulta.hasZone(z.id)));
  };
  const loadMedia = (z: Zone) => {
    zvideo.pause();
    if (isClip(z)) {
      zimg.hidden = true; zvideo.hidden = false;
      zvideo.poster = img(z.clip.replace("zona-", "still-"));
      zvideo.src = img(`${z.clip}-${BIG ? "1080" : "720"}`, "mp4");
      zvideo.play().catch(() => {});
    } else if (!isFrame(z)) { zvideo.hidden = true; zimg.hidden = false; zimg.src = img(z.clip); }
  };
  const barsIn = (show: boolean, d = 1) => gsap.to(bars, { scaleY: show ? 1 : 0, duration: d, ease: "expo.inOut", overwrite: "auto" });
  const panelTo = (show: boolean) => (mobile() ? { x: 0, y: 0, xPercent: 0, yPercent: show ? 0 : 102 } : { x: 0, y: 0, yPercent: 0, xPercent: show ? 0 : 102 });

  function openZone(z: Zone) {
    if (open === z || !ready) return;
    const first = !open;
    open = z;
    setHoverOff();
    fill(z);
    document.documentElement.classList.add("zone-open"); sec.classList.add("zoned");
    const go = () => {
      lenis?.stop();
      kbPause();
      const t = focusOf(z);
      const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
      if (first) {
        tl.to([copy, zindex], { autoAlpha: 0, y: 20, duration: 0.5, ease: "power2.in" }, 0)
          .to("[data-marks]", { autoAlpha: 0, duration: 0.35 }, 0)
          // empujón de cámara: acelera hacia la zona y se emborrona al llegar, como un enfoque rápido
          .to(S, { ...t, duration: 1.25, ease: "power3.in", onUpdate: apply }, 0.05)
          .to(S, { blur: isFrame(z) ? 0 : 10, duration: 0.45, ease: "power2.in", onUpdate: apply }, 0.85)
          .add(barsIn(true, 1.1), 0.3);
      } else {
        // de una zona a otra: fundido a negro, la cámara viaja por debajo y entra el plano nuevo
        tl.to(zmedia, { opacity: 0, duration: 0.45, ease: "power2.in" }, 0)
          .to(zcap.children, { opacity: 0, y: -14, duration: 0.35, stagger: 0.05, ease: "power2.in" }, 0)
          .to(S, { ...t, blur: isFrame(z) ? 0 : 10, duration: 0.9, ease: "power3.inOut", onUpdate: apply }, 0.2);
      }
      const cut = first ? 1.2 : 1.0;
      tl.call(() => loadMedia(z), undefined, cut - 0.15);
      if (!isFrame(z)) tl.fromTo(zmedia, { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1.02, duration: 1.6, ease: "expo.out" }, cut);
      else tl.to(S, { blur: 0, duration: 0.5, onUpdate: apply }, cut);
      tl.fromTo(zcap.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: "expo.out" }, cut + 0.2);
      if (first) tl.to(panel, { ...panelTo(true), duration: 1.1, ease: "expo.out" }, cut + 0.1)
        .fromTo(panel.querySelectorAll(".zp-body > *, .zp-tr details"), { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out" }, cut + 0.35);
      else tl.fromTo(panel.querySelectorAll(".zp-body > *, .zp-tr details"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "expo.out" }, 0.3);
    };
    if (first && scrollY > 2) {
      if (lenis) { lenis.start(); lenis.scrollTo(0, { duration: 0.9, force: true, onComplete: () => { scrollTo(0, 0); go(); } }); }
      else { scrollTo(0, 0); go(); }
    } else go();
  }
  function closeZone() {
    if (!open) return;
    open = null;
    gsap.timeline({ defaults: { ease: "expo.inOut" }, onComplete: () => { zvideo.pause(); lenis?.start(); kbPlay(); } })
      .to(zcap.children, { opacity: 0, y: -14, duration: 0.4, stagger: 0.05, ease: "power2.in" }, 0)
      .to(panel, { ...panelTo(false), duration: 0.8 }, 0)
      .to(zmedia, { opacity: 0, duration: 0.6, ease: "power2.in" }, 0.1)
      .to(S, { ...base(), blur: 0, duration: 1.4, onUpdate: apply }, 0.3)
      .add(barsIn(false, 1), 0.5)
      .to([copy, zindex], { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, 1.1)
      .to("[data-marks]", { autoAlpha: 1, duration: 0.6 }, 1.3)
      .call(() => { document.documentElement.classList.remove("zone-open"); sec.classList.remove("zoned"); }, undefined, 1.2);
  }
  const step = (d: number) => { if (!open) return; const i = zones.indexOf(open); openZone(zones[(i + d + zones.length) % zones.length]); };
  on($("[data-zp-close]"), "click", closeZone);
  on($("[data-zp-prev]"), "click", () => step(-1));
  on($("[data-zp-next]"), "click", () => step(1));
  on(window, "keydown", (e: KeyboardEvent) => { if (!open) return; if (e.key === "Escape") closeZone(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
  on(zpAdd, "click", () => { if (open) zpAdd.setAttribute("aria-pressed", String(consulta.toggleZone(open.id))); });
  const toConsulta = (then: () => void) => {
    const z = open; closeZone(); if (z) consulta.addZone(z.id);
    setTimeout(() => { if (lenis) lenis.scrollTo("#consulta", { duration: 1.6, offset: -20 }); else $("#consulta").scrollIntoView({ behavior: "smooth" }); setTimeout(then, 900); }, 1400);
  };
  on($("[data-zp-form]"), "submit", (e: SubmitEvent) => {
    e.preventDefault();
    const input = $<HTMLInputElement>("[data-zp-input]"), q = input.value.trim(), z = open;
    if (!q || !z) return;
    input.value = "";
    toConsulta(() => consulta.ask(`Sobre ${z.name.toLowerCase()} (${z.italic}): ${q}`));
  });
  on($("[data-zp-book]"), "click", (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); toConsulta(() => consulta.focus()); }, { capture: true });
  gsap.set(panel, panelTo(false));
  gsap.set(zcap.children, { opacity: 0 });

  /* ---------- el plano congelado respira: un 3 % en 14 s, ida y vuelta ---------- */
  measure();
  on(window, "resize", measure);
  const kb = reduce ? null : gsap.to(breath, { s: 1.03, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true, onUpdate: () => { if (!gsap.isTweening(S)) apply(); } });
  let visible = true;
  const kbPlay = () => { if (ready && !open && visible) kb?.play(); };
  const kbPause = () => kb?.pause();
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (!visible) { kbPause(); zvideo.pause(); } else { kbPlay(); if (open && isClip(open)) zvideo.play().catch(() => {}); }
  });
  io.observe(sec);

  /* ---------- entrada: la película, el congelado y el barrido ---------- */
  let introTl: gsap.core.Timeline | null = null;
  const settle = (fast: boolean) => {
    if (ready) return;
    ready = true;
    introTl?.kill();
    document.documentElement.classList.remove("intro");
    $("[data-skip]").hidden = true;
    const tl = gsap.timeline();
    if (!fast) tl.to("[data-flash]", { opacity: 0.14, duration: 0.08 }, 0).to("[data-flash]", { opacity: 0, duration: 0.7 }, 0.08);
    tl.to(intro, { opacity: 0, duration: fast ? 0.01 : 0.4 }, 0)
      .to(".cards p", { opacity: 0, duration: 0.3 }, 0)
      .add(barsIn(false, fast ? 0.01 : 1.2), 0.1)
      // un barrido de luz descubre las zonas, de la frente al mentón
      .fromTo("[data-scan]", { opacity: 0, y: H * 0.06 }, { opacity: 1, y: H * 0.94, duration: fast ? 0.01 : 1.6, ease: "power2.inOut" }, 0.3)
      .to("[data-scan]", { opacity: 0, duration: 0.3 }, fast ? 0.31 : 1.75);
    marks.forEach((m, i) => {
      const [, y] = toScr(...((m.dataset.at || "0,0").split(",").map(Number) as [number, number]));
      const at = fast ? 0.2 : 0.3 + Math.max(0, Math.min(1, y / H)) * 1.6;
      m.style.setProperty("--d", (i * 0.35).toFixed(2) + "s");
      tl.fromTo(m.querySelector(".ring"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2.4)" }, at)
        .fromTo(m.querySelector(".ln"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, at + 0.1)
        .fromTo(m.querySelector(".lb"), { opacity: 0, x: m.classList.contains("l") ? 12 : -12 }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" }, at + 0.2);
    });
    tl.fromTo("[data-atlas-title] .line-m > span", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.12, ease: "expo.out" }, fast ? 0 : 0.9)
      .fromTo("[data-atlas-copy] [data-in], [data-zindex] [data-in]", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.05, ease: "expo.out" }, fast ? 0 : 1.3)
      .call(() => { kbPlay(); lenis?.start(); }, undefined, fast ? 0 : 1.8);
  };
  on($("[data-skip]"), "click", () => { intro.pause(); settle(true); });

  if (reduce) {
    intro.remove(); $("[data-skip]").hidden = true;
    ready = true;
  } else {
    document.documentElement.classList.add("intro");
    lenis?.stop();
    gsap.set("[data-atlas-copy] [data-in], [data-zindex] [data-in]", { opacity: 0 });
    gsap.set("[data-atlas-title] .line-m > span", { yPercent: 110, opacity: 0 });
    gsap.set([".zm .ring", ".zm .lb"], { opacity: 0 });
    gsap.set(".zm .ln", { scaleX: 0 });
    gsap.set(bars, { scaleY: 1 });
    intro.src = (BIG ? intro.dataset.hd : intro.dataset.sd) || "";
    // si la película no arranca (ahorro de datos, autoplay bloqueado), se va directo al rostro
    const fallback = window.setTimeout(() => settle(true), 7000);
    let started = false;
    const run = () => {
      if (started || ready) return;
      started = true; clearTimeout(fallback);
      // red de seguridad: si la película se pausa por su cuenta (pestaña en segundo plano, ahorro de
      // energía), la entrada no se queda colgada: al acabar su tiempo se pasa al rostro
      window.setTimeout(() => settle(false), 9500);
      introTl = gsap.timeline()
        .fromTo('[data-card="0"]', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.2)
        .to('[data-card="0"]', { opacity: 0, duration: 0.6 }, 1.5)
        .call(() => { intro.play().catch(() => settle(true)); }, undefined, 1.7)
        .fromTo(intro, { scale: 1.06 }, { scale: 1, duration: 4.6, ease: "none" }, 1.7)
        .fromTo('[data-card="1"]', { opacity: 0, y: 20, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power2.out" }, 2.5)
        .to('[data-card="1"]', { opacity: 0, y: -12, filter: "blur(4px)", duration: 0.8, ease: "power2.in" }, 4.7);
    };
    gsap.set(intro, { transformOrigin: "1010px 540px" });
    on(intro, "ended", () => settle(false));
    on(intro, "canplaythrough", run, { once: true });
    intro.load();
  }

  return {
    open: (id: string) => { const z = zones.find((q) => q.id === id); if (z) openZone(z); },
    destroy: () => { ac.abort(); io.disconnect(); kb?.kill(); introTl?.kill(); gsap.killTweensOf(S); zvideo.pause(); intro.pause(); },
  };
}
