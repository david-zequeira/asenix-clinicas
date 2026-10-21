/* =====================================================================
   MOVIMIENTO DE LA PÁGINA (todo lo que no es el atlas)
   Lenis + ScrollTrigger en un solo rAF; titulares que suben línea a línea,
   la película por capítulos, el índice filtrable, las voces en marquesina.
   Ritmo editorial: sin pines ni escenas fijadas, la página respira.
   ===================================================================== */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { $, $$ } from "./session";

export function startEngine(reduce: boolean): { lenis: Lenis | null; destroy: () => void } {
  gsap.registerPlugin(ScrollTrigger);
  const ac = new AbortController();
  const on = (t: EventTarget, ev: string, fn: (e: never) => void, o: AddEventListenerOptions = {}) => t.addEventListener(ev, fn as EventListener, { ...o, signal: ac.signal });
  const ctx = gsap.context(() => {});
  const tickers: gsap.TickerCallback[] = [];
  const fine = matchMedia("(pointer:fine)").matches;

  /* la película por capítulos: corre solo en pantalla, la línea avanza con ella */
  const film = $<HTMLVideoElement>("[data-film-video]"), chapters = $$<HTMLButtonElement>("[data-chapters] button"), tc = $("[data-film-tc]"), chBar = $("[data-chapters]");
  const fio = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!film.src) { film.src = (innerWidth > 900 ? film.dataset.hd : film.dataset.sd) || ""; film.loop = true; } film.play().catch(() => {}); } else film.pause();
  }, { threshold: 0.25 });
  fio.observe(film);
  const at = chapters.map((c) => +(c.dataset.at || 0));
  on(film, "timeupdate", () => {
    const t = film.currentTime, d = film.duration || 26.4;
    tc.textContent = `00:${String(Math.floor(t)).padStart(2, "0")} / 00:${String(Math.round(d)).padStart(2, "0")}`;
    chBar.style.setProperty("--p", String(t / d));
    let k = 0; at.forEach((a, i) => { if (t >= a) k = i; });
    chapters.forEach((c, i) => c.classList.toggle("on", i === k));
  });
  chapters.forEach((c, i) => on(c, "click", () => { if (!film.src) film.src = film.dataset.hd || ""; film.currentTime = at[i]; film.play().catch(() => {}); }));

  /* índice: filtro por área */
  const tabs = $$("[data-idx-tabs] button"), rows = $$<HTMLDetailsElement>(".idx-row");
  tabs.forEach((b) => on(b, "click", () => {
    const a = b.dataset.area || "";
    tabs.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const show = rows.filter((r) => !a || (r.dataset.areas || "").split(" ").includes(a));
    rows.forEach((r) => { r.hidden = !show.includes(r); if (r.hidden) r.open = false; });
    if (!reduce) gsap.fromTo(show, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.025, ease: "expo.out", clearProps: "all" });
    ScrollTrigger.refresh();
  }));

  /* la barra cambia de tinta sobre las secciones oscuras (atlas, consulta, película) */
  const nav = $("[data-nav]"), darks = $$("[data-dark]");
  const navInk = () => { const under = darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= 40 && r.bottom > 40; }); nav.classList.toggle("on-dark", under); };
  navInk(); on(window, "scroll", navInk, { passive: true }); on(window, "resize", navInk);

  /* la asistente se presenta un momento */
  const fab = $(".voz-fab");
  const hello = window.setTimeout(() => { fab.classList.add("hello"); window.setTimeout(() => fab.classList.remove("hello"), 3800); }, 5200);

  if (reduce) return { lenis: null, destroy: () => { ac.abort(); fio.disconnect(); clearTimeout(hello); } };

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000);
  tickers.push(raf); gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
  on(document, "click", (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute("href") || "";
    if (id.length < 2) return;
    e.preventDefault();
    lenis.scrollTo(id === "#atlas" ? 0 : id, { duration: 1.8, offset: id === "#atlas" ? 0 : -20, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  });

  ctx.add(() => {
    gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    // el menú marca la sección en la que estás
    const links = $$<HTMLAnchorElement>("[data-menu] a");
    links.forEach((l) => {
      const sec = $(l.getAttribute("href") || "");
      if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && links.forEach((x) => x.classList.toggle("on", x === l)) });
    });

    // titulares: cada línea sube desde su máscara
    $$("[data-cs-title], [data-film-title], [data-doc-title], [data-idx-title], [data-vi-addr]").forEach((h) =>
      gsap.fromTo($$(".line-m > span", h), { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } }));
    // reglas de cabecera que se dibujan
    $$(".sec-head").forEach((h) => gsap.fromTo(h, { "--rx": 0, opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 92%" } }));
    $$("[data-reveal], .cs-chips button, .cv li, .hours li, .idx-tabs button").forEach((el) =>
      gsap.from(el, { y: 26, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
    gsap.from(".ficha", { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".ficha", start: "top 85%" } });

    // la película se abre desde una franja, como un párpado
    gsap.fromTo("[data-film-frame]", { clipPath: "inset(18% 9% 18% 9% round 30px)", scale: 1.04 }, { clipPath: "inset(0% 0% 0% 0% round 30px)", scale: 1, ease: "none", scrollTrigger: { trigger: "[data-film-frame]", start: "top 95%", end: "top 25%", scrub: 0.6 } });
    gsap.fromTo("[data-film-video]", { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-film-frame]", start: "top bottom", end: "bottom top", scrub: true } });

    // la doctora: retrato que se descubre de abajo arriba y respira con el scroll
    gsap.fromTo("[data-doc-main]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-doc-main]", start: "top 80%" } });
    gsap.fromTo("[data-doc-img]", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: "[data-doctora]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from("[data-doc-inset]", { y: 90, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-doc-inset]", start: "top 95%" } });
    gsap.from(".idx-row", { y: 20, opacity: 0, duration: 0.9, stagger: 0.02, ease: "expo.out", scrollTrigger: { trigger: "[data-idx-rows]", start: "top 85%" } });
  });

  /* voces: dos marquesinas en sentidos opuestos que aceleran con el scroll */
  const mqs = $$("[data-mq]").map((el) => ({ el, dir: +(el.dataset.mq || 1), x: 0, w: 0 }));
  const measureMq = () => mqs.forEach((m) => (m.w = m.el.scrollWidth / 2));
  measureMq(); on(window, "resize", measureMq);
  let vel = 0, hoverMq = false;
  $$("[data-mq]").forEach((m) => { on(m, "mouseenter", () => (hoverMq = true)); on(m, "mouseleave", () => (hoverMq = false)); });
  const mqTick: gsap.TickerCallback = (_t, dt) => {
    vel += (Math.abs(lenis.velocity) * 0.6 - vel) * 0.08;
    const sp = (hoverMq ? 0.15 : 1) * (0.045 + vel * 0.02) * dt;
    // la tira está duplicada: al recorrer media anchura vuelve al principio sin que se note
    mqs.forEach((m) => { if (!m.w) return; m.x = (m.x + sp) % m.w; m.el.style.transform = `translate3d(${(m.dir > 0 ? -m.x : m.x - m.w).toFixed(1)}px,0,0)`; });
  };
  tickers.push(mqTick); gsap.ticker.add(mqTick);

  /* cursor: un punto de tinta (sobre el atlas manda la lupa) */
  if (fine) {
    const dot = $("[data-cursor] i");
    const qx = gsap.quickTo(dot, "x", { duration: 0.18 }), qy = gsap.quickTo(dot, "y", { duration: 0.18 });
    on(window, "mousemove", (e: MouseEvent) => { qx(e.clientX); qy(e.clientY); document.documentElement.classList.toggle("over-atlas", !!(e.target as Element).closest("[data-atlas-stage]")); });
    on(document, "mouseover", (e: MouseEvent) => { const t = (e.target as Element).closest("a, button, summary"); gsap.to(dot, { scale: t ? 3.2 : 1, opacity: t ? 0.35 : 1, duration: 0.4 }); });
  }
  on(window, "load", () => { measureMq(); ScrollTrigger.refresh(); });

  return {
    lenis,
    destroy: () => {
      ac.abort(); fio.disconnect(); clearTimeout(hello);
      tickers.forEach((t) => gsap.ticker.remove(t));
      ctx.revert(); ScrollTrigger.getAll().forEach((s) => s.kill());
      lenis.destroy();
    },
  };
}
