/* =====================================================================
   MOTOR DE MOVIMIENTO — la web de Aruma como una sola película.
   Mismo motor que Ozio (GSAP + ScrollTrigger + Lenis en un único rAF),
   con las escenas de una clínica: la portada fotograma a fotograma, la
   lectura del rostro, el método, el espacio y la reserva dentro del arco.
   Todo el contenido sale de src/data/clinic.ts.
   ===================================================================== */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { clinic, img, MEDIA } from "@/data/clinic";
import { $, $$ } from "./session";
import type { ChatApi } from "./chat";

type Ctx = { chat: ChatApi };
type LenisLike = Lenis & { velocity: number; scroll: number };

const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
const emHtml = (s: string) => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* split en letras con máscara; dentro de la cursiva (.sc) cada palabra va entera para no recortar la inclinación */
function splitChars(el: HTMLElement) {
  if (el.dataset.split) return;
  el.dataset.split = "1";
  const walk = (node: Node, whole: boolean) =>
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (n.textContent || "").split(/(\s+)/).forEach((word) => {
          if (!word) return;
          if (/^\s+$/.test(word)) { frag.append(document.createTextNode(" ")); return; }
          const m = document.createElement("span");
          m.className = "mask";
          (whole ? [word] : [...word]).forEach((c) => { const s = document.createElement("span"); s.className = "ch"; s.textContent = c; m.append(s); });
          frag.append(m);
        });
        (n as ChildNode).replaceWith(frag);
      } else if (n.nodeType === 1 && !(n as Element).classList.contains("mask")) walk(n, whole || (n as Element).classList.contains("sc"));
    });
  walk(el, false);
}
function wrapWords(el: Element) {
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 1) return wrapWords(n as Element);
    if (n.nodeType !== 3) return;
    const f = document.createDocumentFragment();
    (n.textContent || "").split(/(\s+)/).forEach((t) => {
      if (!t) return;
      if (/^\s+$/.test(t)) f.append(" ");
      else { const s = document.createElement("span"); s.className = "w"; s.textContent = t; f.append(s); }
    });
    (n as ChildNode).replaceWith(f);
  });
}

export function startEngine({ chat }: Ctx): () => void {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const ac = new AbortController();
  const on = (t: EventTarget, ev: string, fn: (e: never) => void, o: AddEventListenerOptions = {}) =>
    t.addEventListener(ev, fn as EventListener, { ...o, signal: ac.signal });
  const tickers: gsap.TickerCallback[] = [];
  const tick = (fn: gsap.TickerCallback) => { tickers.push(fn); gsap.ticker.add(fn); };
  const timers: number[] = [];
  gsap.registerPlugin(ScrollTrigger);
  const ctx = gsap.context(() => {});
  const add = (fn: () => void) => ctx.add(fn);
  let lenis: LenisLike | null = null;

  /* =================== EL CATÁLOGO (segunda vista) =================== */
  const { areas, treatments } = clinic;
  const cat = $("[data-cat]"), catAreas = $("[data-cat-areas]"), catList = $("[data-cat-list]");
  const cd = { img: $<HTMLImageElement>("[data-cd-img]"), area: $("[data-cd-area]"), name: $("[data-cd-name]"), desc: $("[data-cd-desc]"), facts: $("[data-cd-facts]"), ben: $("[data-cd-ben]") };
  catAreas.innerHTML = areas.map((a, i) => `<button type="button" data-i="${i}" aria-pressed="false"><small>${a.n}</small><span>${esc(a.name)}</span></button>`).join("");
  let aIdx = -1, tSlug = "", catOpen = false;
  const showTreatment = (slug: string, animate = true) => {
    tSlug = slug;
    const t = treatments[slug];
    $$("[data-slug]", catList).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.slug === slug)));
    const set = () => {
      cd.img.src = img(t.image); cd.img.alt = t.name;
      cd.area.textContent = areas[aIdx].name;
      cd.name.textContent = t.name;
      cd.desc.textContent = t.description;
      cd.facts.innerHTML = t.facts.map((f) => `<div><small>${esc(f.k)}</small><span>${esc(f.v)}</span></div>`).join("");
      cd.facts.hidden = !t.facts.length;
      cd.ben.innerHTML = t.benefits.map((b) => `<li>${esc(b)}</li>`).join("");
    };
    if (!animate || reduce) return set();
    gsap.timeline()
      .to(".cat-detail .body > *, .cat-detail .ph img", { opacity: 0, y: -10, duration: 0.25, stagger: 0.02 })
      .call(set)
      .fromTo(".cat-detail .ph img", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "expo.out" })
      .fromTo(".cat-detail .body > *", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: "expo.out" }, "<0.05");
  };
  const showArea = (i: number, animate = true) => {
    if (i === aIdx) return;
    aIdx = i;
    const a = areas[i];
    $$("button", catAreas).forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    catList.innerHTML = `<div class="kick">${a.n} — ${a.treatments.length} ${a.treatments.length === 1 ? "tratamiento" : "tratamientos"}</div><h3>${emHtml(a.title)}</h3><p class="intro">${esc(a.intro)}</p>`
      + a.treatments.map((s) => `<button class="tr" type="button" data-slug="${s}" aria-pressed="false"><b>${esc(treatments[s].name)}</b><p>${esc(treatments[s].summary)}</p><i>${ARROW}</i></button>`).join("");
    catList.scrollTop = 0;
    $<HTMLImageElement>("[data-cat-bg]").src = img(a.image);
    showTreatment(a.treatments[0], animate);
    if (animate && !reduce) gsap.fromTo(catList.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.035, ease: "expo.out", clearProps: "transform,opacity" });
  };
  on(catAreas, "click", (e: MouseEvent) => { const b = (e.target as Element).closest<HTMLElement>("button"); if (b) showArea(+(b.dataset.i || 0)); });
  on(catList, "click", (e: MouseEvent) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-slug]"); if (!b) return;
    showTreatment(b.dataset.slug || "");
    cat.classList.add("detail-on");
  });
  on($("[data-cat-back]"), "click", () => cat.classList.remove("detail-on"));
  const openCat = (e: MouseEvent | null, areaId?: string) => {
    const i = Math.max(0, areas.findIndex((a) => a.id === areaId));
    if (catOpen) { showArea(i); return; }
    catOpen = true;
    gsap.killTweensOf(cat);                                   // un cierre a medias no debe rematar después
    aIdx = -1; showArea(i, false);
    cat.classList.remove("detail-on");
    const x = e?.clientX || innerWidth / 2, y = e?.clientY || innerHeight / 2;
    cat.style.setProperty("--cx", x + "px"); cat.style.setProperty("--cy", y + "px");
    cat.classList.add("open"); document.documentElement.classList.add("cat-open"); lenis?.stop();
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    if (reduce) { cat.style.clipPath = "none"; return; }
    gsap.timeline()
      .fromTo(cat, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 1.1, ease: "expo.inOut" })
      // fromTo con limpieza: un from() repetido partiría de un estado a medias y se quedaría ahí
      .fromTo(".cat-areas button", { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out", clearProps: "transform,opacity" }, 0.45)
      .fromTo(".cat-list > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.04, ease: "expo.out", clearProps: "transform,opacity" }, 0.5)
      .fromTo(".cat-detail", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", clearProps: "transform,opacity" }, 0.6)
      .fromTo(".cat .top", { opacity: 0 }, { opacity: 1, duration: 0.6, clearProps: "opacity" }, 0.8);
  };
  const closeCat = (then?: () => void) => {
    if (!catOpen) return; catOpen = false;
    gsap.killTweensOf(cat);
    const done = () => { cat.classList.remove("open"); document.documentElement.classList.remove("cat-open"); gsap.set(cat, { clearProps: "clipPath" }); lenis?.start(); then?.(); };
    if (reduce) return done();
    const cx = cat.style.getPropertyValue("--cx") || "50%", cy = cat.style.getPropertyValue("--cy") || "50%";
    gsap.to(cat, { clipPath: `circle(0px at ${cx} ${cy})`, duration: 0.9, ease: "expo.inOut", onComplete: done });
  };
  on(document, "click", (e: MouseEvent) => {
    const o = (e.target as Element | null)?.closest<HTMLElement>("[data-cat-open]");
    if (o) { e.preventDefault(); e.stopPropagation(); openCat(e, o.dataset.catOpen || undefined); return; }
    if ((e.target as Element | null)?.closest("[data-cat-close]")) { e.preventDefault(); closeCat(); }
  }, { capture: true });
  on(window, "keydown", (e: KeyboardEvent) => { if (catOpen && e.key === "Escape") { if (cat.classList.contains("detail-on")) cat.classList.remove("detail-on"); else closeCat(); } });
  on($("[data-cd-ask]"), "click", () => { const n = treatments[tSlug].name; closeCat(() => chat.ask(`Me interesa ${n}. ¿Cómo es el tratamiento y qué resultados puedo esperar?`)); });
  on($("[data-cd-book]"), "click", () => { const n = treatments[tSlug].name; closeCat(() => chat.ask(`Quiero reservar una valoración para ${n}.`)); });

  /* reservar: la asistente por escrito, con la petición ya hecha */
  on($("[data-book]"), "click", () => chat.ask("Quiero reservar una primera valoración con la Dra. Marroquín."));

  /* =================== RESEÑAS =================== */
  const R = clinic.reviews; let rI = 0;
  const q = { text: $("[data-q-text]"), name: $("[data-q-name]"), role: $("[data-q-role]"), img: $<HTMLImageElement>("[data-q-img]") };
  const qSegs = $$("i", $("[data-q-bar]"));
  const showQ = (i: number, animate: boolean) => {
    rI = (i + R.length) % R.length; const r = R[rI];
    const set = () => { q.text.textContent = r.quote; q.name.textContent = r.name; q.role.textContent = r.role; q.img.src = img(r.photo);
      qSegs.forEach((s, j) => { s.classList.toggle("done", j < rI); s.classList.toggle("on", j === rI); }); };
    if (!animate || reduce) return set();
    gsap.timeline().to([q.text, q.name, q.role], { opacity: 0, y: -14, duration: 0.35, stagger: 0.04 })
      .call(set).fromTo([q.text, q.name, q.role], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "expo.out" })
      .fromTo("[data-q-ph]", { clipPath: "inset(0 0 100% 0 round 24px)" }, { clipPath: "inset(0 0 0% 0 round 24px)", duration: 0.9, ease: "expo.inOut" }, 0.3);
  };
  showQ(0, false);

  /* =================== vídeos: solo en pantalla =================== */
  const small = innerWidth <= 809;
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    if (e.isIntersecting) { if (v.preload === "none") { if (small && v.dataset.sd) v.src = v.dataset.sd; v.preload = "auto"; v.load(); } v.play().catch(() => {}); } else v.pause();
  }), { rootMargin: "200px 0px" });
  $$<HTMLVideoElement>("[data-lazy-video]").forEach((v) => vio.observe(v));

  /* botón con relleno que nace donde entra el cursor */
  $$("[data-fill]").forEach((b) => on(b, "pointerenter", (e: PointerEvent) => {
    const r = b.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
    b.style.setProperty("--x", x + "px"); b.style.setProperty("--y", y + "px");
    b.style.setProperty("--s", String(Math.ceil(Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) / 5) + 1));
  }));

  /* acordeón del método */
  const acc = $$("[data-acc] .card"); let accUser = false;
  const accBars = acc.map((c) => $(".bar", c));
  let aT: gsap.core.Timeline | null = null;
  const setAcc = (i: number) => acc.forEach((c, j) => c.classList.toggle("on", j === i));
  acc.forEach((c, i) => on(c, "click", () => { setAcc(i); accUser = true; aT?.pause(); accBars.forEach((b, j) => b.style.setProperty("--p", j === i ? "1" : "0")); }));

  /* portada: un texto por plano */
  const heroScenes = $$("[data-scene]");
  let sceneI = -1, sceneOut = false;
  const showScene = (i: number, force = false) => {
    if (i === sceneI && !force) return;
    const prev = heroScenes[sceneI] || null, next = heroScenes[i]; sceneI = i; sceneOut = false;
    heroScenes.forEach((s, j) => { s.classList.toggle("on", j === i); s.setAttribute("aria-hidden", String(j !== i)); });
    if (reduce) return;
    gsap.killTweensOf([next, ...next.children, ...(prev ? [prev, ...prev.children] : [])]);
    if (prev && prev !== next) gsap.to(prev, { autoAlpha: 0, y: -14, filter: "blur(4px)", duration: 0.6, ease: "power2.inOut" });
    gsap.set(next, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
    gsap.fromTo(next.children, { autoAlpha: 0, y: 22, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.4, stagger: 0.22, ease: "power2.out", delay: 0.1, clearProps: "filter" });
  };
  const leaveScene = () => {
    if (sceneOut || sceneI < 0) return; sceneOut = true;
    if (reduce) return;
    const s = heroScenes[sceneI]; gsap.killTweensOf([s, ...s.children]);
    gsap.to(s, { autoAlpha: 0, y: -14, filter: "blur(4px)", duration: 0.7, ease: "power2.inOut" });
  };

  if (reduce) {
    showScene(heroScenes.length - 1);
    document.body.classList.remove("is-loading"); $("[data-loader]")?.remove();
    $$<HTMLElement>(".odo i").forEach((i) => (i.style.transform = `translateY(-${+(i.dataset.d || 0)}em)`));
    const exSec = $("[data-experiencia]"); exSec.classList.remove("ex-live");
    return () => { ac.abort(); vio.disconnect(); };
  }

  /* =================== a partir de aquí, movimiento =================== */
  ScrollTrigger.config({ ignoreMobileResize: true });
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true }) as LenisLike;
  const L = lenis;
  L.on("scroll", ScrollTrigger.update);
  tick((t) => L.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  L.stop();

  // anclas por Lenis; #reserva lleva al punto del arco donde ya se ve la tarjeta
  let reserveY: (() => number) | null = null;
  on(document, "click", (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.hasAttribute("data-cat-open")) return;
    const id = a.getAttribute("href") || "";
    if (id.length < 2 && id !== "#") return;
    e.preventDefault();
    const to: number | string = id === "#top" || id === "#" ? 0 : id === "#reserva" && reserveY ? reserveY() : id;
    L.scrollTo(to as number, { duration: 2.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  });

  // la barra se esconde al bajar y vuelve al subir
  const nav = $("[data-nav]") as HTMLElement & { _hidden?: boolean };
  L.on("scroll", ({ scroll, direction }: { scroll: number; direction: number }) => {
    const hide = direction === 1 && scroll > innerHeight * 0.4;
    if (hide !== nav._hidden) { nav._hidden = hide; gsap.to(nav, { yPercent: hide ? -110 : 0, duration: 0.7, ease: "expo.out", overwrite: "auto" }); }
  });

  add(() => {
    gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    $$(".split").forEach(splitChars);
  });

  /* =================== PORTADA: la película fotograma a fotograma ===================
     161 fotogramas (0–6,7 s de la película a 24 por segundo): recepción → saludo,
     el rostro y la consulta. La imagen avanza al ritmo del scroll; entre dos
     fotogramas se funde el siguiente encima, así el movimiento es continuo. */
  const hero = $("[data-hero]"), cam = $("[data-cam]");
  const cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true"); cam.append(cv);
  const c2d = cv.getContext("2d") as CanvasRenderingContext2D;
  const N = 161;
  const BIG = innerWidth > 809 && Math.max(innerWidth, innerHeight) * Math.min(devicePixelRatio || 1, 2) > 1400;
  const DIR = BIG ? "hero-1920" : "hero-1280", MAXPX = BIG ? 2400 : 1600;
  // planos: 0–86 (recepción y saludo), 87–129 (el rostro), 130–160 (la consulta)
  const B = [0, 86.5, 129.5, N - 1], CUT = new Set([87, 130]), LEN = [1.7, 1.3, 1.3], SOFT = 0.3;
  const SCROLL = LEN.reduce((a, b) => a + b);
  const ease = (u: number) => (1 - SOFT) * u + SOFT * Math.sin((u * Math.PI) / 2);
  const frameAt = (y: number) => { let k = 0; while (k < 2 && y > LEN[k]) y -= LEN[k++]; return B[k] + (B[k + 1] - B[k]) * ease(Math.max(0, Math.min(1, y / LEN[k]))); };
  const src = (i: number) => `${MEDIA}/seq/${DIR}/h-${String(i).padStart(3, "0")}.webp`;
  // guardados comprimidos (blobs) y descomprimidos solo los cercanos (ImageBitmap)
  const blobs: Blob[] = new Array(N), ok = new Uint8Array(N), bm = new Map<number, ImageBitmap>(), busy = new Set<number>();
  const AHEAD = BIG ? 18 : 12, BEHIND = BIG ? 8 : 6, KEEP = BIG ? 26 : 18;
  let cur = 0, want = 0, shownKey = -1, sc = -2, loaded = 0, dir = 1;
  let rect: { x: number; y: number; w: number; h: number } | null = null;
  const seqLoad = { p: 0 };
  const nearBm = (i: number) => { for (let d = 0; d <= 4; d++) { if (bm.has(i - d)) return i - d; if (bm.has(i + d)) return i + d; } return -1; };
  const layout = () => { const s = Math.max(cv.width / 16, cv.height / 9); const w = 16 * s, h = 9 * s; rect = { x: (cv.width - w) / 2, y: (cv.height - h) / 2, w, h }; };
  const cover = (b: ImageBitmap) => { if (rect) c2d.drawImage(b, rect.x, rect.y, rect.w, rect.h); };
  const draw = () => {
    const f = Math.max(0, Math.min(N - 1, cur));
    let i = Math.floor(f), a = f - i;
    if (CUT.has(i + 1)) { if (a >= 0.5) i++; a = 0; }
    const qq = Math.round(a * 48), key = i * 64 + qq;
    if (key === shownKey) return;
    const base = bm.has(i) ? i : nearBm(i); if (base < 0) return;
    if (!rect) layout();
    c2d.globalAlpha = 1; cover(bm.get(base) as ImageBitmap);
    if (qq && base === i && bm.has(i + 1)) { c2d.globalAlpha = qq / 48; cover(bm.get(i + 1) as ImageBitmap); c2d.globalAlpha = 1; }
    shownKey = base === i && (!qq || bm.has(i + 1)) ? key : -1;
  };
  const prime = () => {
    const c = Math.round(cur), lo = Math.max(0, c - (dir > 0 ? BEHIND : AHEAD)), hi = Math.min(N - 1, c + (dir > 0 ? AHEAD : BEHIND));
    for (const [k, b] of bm) if (k < c - KEEP || k > c + KEEP) { b.close?.(); bm.delete(k); }
    const need: number[] = [];
    for (let k = lo; k <= hi; k++) if (ok[k] && !bm.has(k) && !busy.has(k)) need.push(k);
    need.sort((x, y) => Math.abs(x - cur) - Math.abs(y - cur));
    for (const k of need) {
      if (busy.size >= 4) break;
      busy.add(k);
      createImageBitmap(blobs[k]).then((b) => {
        busy.delete(k);
        if (Math.abs(k - cur) > KEEP) { b.close?.(); return; }
        bm.set(k, b); if (Math.abs(k - cur) < 2) { shownKey = -1; draw(); }
      }).catch(() => busy.delete(k));
    }
  };
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, MAXPX / Math.max(1, cv.clientWidth), 2);
    cv.width = Math.round(cv.clientWidth * d); cv.height = Math.round(cv.clientHeight * d);
    c2d.imageSmoothingEnabled = true; c2d.imageSmoothingQuality = "high"; layout(); shownKey = -1; draw();
  };
  // primero el plano 1 en orden, luego uno de cada 4 del resto y después los huecos
  const all = Array.from({ length: N }, (_, i) => i);
  const order = [...all.filter((i) => i < 87), ...all.filter((i) => i >= 87 && i % 4 === 0), ...all.filter((i) => i >= 87 && i % 4)];
  timers.push(window.setTimeout(() => { seqLoad.p = 1; }, 9000));
  let nextI = 0;
  const pump = () => {
    if (nextI >= order.length || ac.signal.aborted) return;
    const i = order[nextI++];
    fetch(src(i), { signal: ac.signal }).then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => { blobs[i] = b; ok[i] = 1; prime(); })
      .catch(() => {})
      .finally(() => { loaded++; seqLoad.p = Math.max(seqLoad.p, loaded / N); pump(); });
  };
  for (let k = 0; k < 6; k++) pump();
  size(); on(window, "resize", size);
  const TXT_AT = [0.3, 0.3, 0.22];
  const sceneFor = (f: number) => { for (let k = 0; k < 3; k++) if (f < B[k + 1] || k === 2) return f >= B[k] + (B[k + 1] - B[k]) * TXT_AT[k] ? k : -1; return -1; };
  let seqST: ScrollTrigger | null = null;
  add(() => {
    seqST = ScrollTrigger.create({ trigger: hero, start: "top top", end: () => "+=" + innerHeight * SCROLL, pin: true, anticipatePin: 1, onUpdate: (st) => { want = frameAt(st.progress * SCROLL); } });
  });
  tick(() => {
    prime();
    if (Math.abs(want - cur) < 0.01) { if (shownKey < 0) draw(); return; }
    if (Math.abs(want - cur) > 0.05) dir = want > cur ? 1 : -1;
    cur = want; draw();
    const s = sceneFor(cur);
    if (s !== sc) { sc = s; if (s < 0) leaveScene(); else showScene(s, true); }
  });
  add(() => {
    const st = () => seqST as ScrollTrigger;
    gsap.timeline({ scrollTrigger: { trigger: hero, start: () => st().end, end: () => st().end + hero.offsetHeight, scrub: true } })
      .to(cam, { scale: 1.12, yPercent: 10, ease: "none", duration: 1 }, 0)
      .fromTo("[data-hero-copy]", { yPercent: 0, opacity: 1 }, { yPercent: -22, opacity: 0, ease: "power1.in", duration: 0.55, immediateRender: false }, 0.4);
    gsap.to("[data-hero-intro], .hero .side", { opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "+=300", scrub: true } });
    ScrollTrigger.create({ start: () => st().end + hero.offsetHeight - 70, end: "max", onToggle: (s) => nav.classList.toggle("scrolled", s.isActive) });
  });
  if (fine) { gsap.set(cv, { scale: 1.05 }); on(hero, "mousemove", (e: MouseEvent) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    gsap.to(cv, { x: x * -20, y: y * -12, duration: 1.6, ease: "power3.out" });
  }); }

  /* =================== CARGADOR =================== */
  const intro = () => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    const counter = { v: 0 }, cEl = $("[data-count-loader]"), bar = $("[data-loader-bar]");
    // la cuenta es la de verdad: nunca pasa de lo que llevan cargado los fotogramas
    const showCount = () => { const v = Math.round(Math.min(counter.v, seqLoad.p * 100)); cEl.textContent = String(v).padStart(2, "0"); bar.style.transform = `scaleX(${v / 100})`; };
    tl.from("[data-ld-mark]", { scale: 0.5, rotate: -90, opacity: 0, duration: 1.3 }, 0.05)
      .fromTo("[data-ld-word]", { clipPath: "inset(0 100% 0 0)", x: -16 }, { clipPath: "inset(0 0% 0 0)", x: 0, duration: 1.1, ease: "expo.inOut" }, 0.35)
      .to(counter, { v: 100, duration: 1.2, ease: "power2.inOut", onUpdate: showCount }, 0)
      .call(() => { if (seqLoad.p >= 1) return; tl.pause();
        const wait = () => { showCount(); if (seqLoad.p >= 1) { gsap.ticker.remove(wait); tl.play(); } };
        gsap.ticker.add(wait); }, undefined, 1.2)
      .to("[data-loader-word]", { y: -30, opacity: 0, duration: 0.5, ease: "expo.in" }, 1.35)
      .to(".loader .meta, [data-loader-bar]", { opacity: 0, duration: 0.3 }, 1.2)
      .to(".loader .panel.t", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, 1.55)
      .to(".loader .panel.b", { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, 1.55)
      .fromTo(cam, { scale: 1.22 }, { scale: 1, duration: 2.4, ease: "expo.out" }, 1.55)
      .from("[data-nav]", { yPercent: -100, opacity: 0, duration: 1.1 }, 2.0)
      .from("[data-hero-intro], .hero .side", { y: 24, opacity: 0, duration: 1.1, stagger: 0.08 }, 2.1)
      .call(() => { $("[data-loader]")?.remove(); document.body.classList.remove("is-loading"); L.start(); ScrollTrigger.refresh(); }, undefined, 2.5);
  };
  if (new URLSearchParams(location.search).has("noloader") || !$("[data-loader]")) { $("[data-loader]")?.remove(); document.body.classList.remove("is-loading"); L.start(); }
  else (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(intro));

  /* el sello de la asistente se presenta un momento al entrar */
  const fab = $(".voz-fab");
  timers.push(window.setTimeout(() => { fab.classList.add("hello"); timers.push(window.setTimeout(() => fab.classList.remove("hello"), 3800)); }, 3400));

  add(() => {
    /* =================== 01 · ARUMA: las palabras se encienden =================== */
    const iTitle = $("[data-intro-title]");
    if (!iTitle.querySelector(".w")) wrapWords(iTitle);
    gsap.timeline({ scrollTrigger: { trigger: "[data-intro]", start: "top top", end: "+=160%", scrub: 0.6, pin: true, anticipatePin: 1 } })
      .to($$(".w", iTitle), { color: "#1d1814", stagger: 0.15, ease: "none", duration: 0.3 })
      .fromTo("[data-intro-p]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3 }, 0.75)
      .fromTo("[data-rule]", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.3);

    /* =================== 02 · TRATAMIENTOS =================== */
    gsap.fromTo("[data-trat-title] .ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.025, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: "[data-trat]", start: "top 70%" } });
    gsap.from(".area", { clipPath: "inset(0 0 100% 0)", y: 40, duration: 1.2, stagger: 0.08, ease: "expo.out", clearProps: "clipPath", scrollTrigger: { trigger: "[data-areas]", start: "top 80%" } });
  });
  // la foto del área sigue al cursor, con algo de inercia y giro según la velocidad
  if (fine) {
    const fl = $("[data-trat-float]"), fx = gsap.quickTo(fl, "x", { duration: 0.6, ease: "power3" }), fy = gsap.quickTo(fl, "y", { duration: 0.6, ease: "power3" });
    const fr = gsap.quickTo(fl, "rotate", { duration: 0.8, ease: "power3" });
    let lx = 0;
    on($("[data-areas]"), "mousemove", (e: MouseEvent) => { fx(e.clientX); fy(e.clientY); fr(Math.max(-12, Math.min(12, (e.clientX - lx) * 0.6))); lx = e.clientX; });
    $$("[data-area]").forEach((a) => on(a, "mouseenter", () => { $$("[data-float]", fl).forEach((im) => im.classList.toggle("on", im.dataset.float === a.dataset.area)); }));
    on($("[data-areas]"), "mouseenter", (e: MouseEvent) => { gsap.set(fl, { x: e.clientX, y: e.clientY }); gsap.to(fl, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }); });
    on($("[data-areas]"), "mouseleave", () => gsap.to(fl, { opacity: 0, scale: 0.6, duration: 0.5, ease: "expo.out" }));
  }

  /* =================== 03 · LA LECTURA DEL ROSTRO ===================
     La sección se fija: el rostro entra en un círculo (el espejo, el isotipo),
     salen las zonas una a una, el círculo se abre al plano entero y la cámara
     se acerca a los labios hasta fundirse con el aumento de labios. */
  const rostro = $("[data-rostro]");
  const PL = clinic.rostro.geo;
  const faceImg = $("[data-face-img]"), callouts = $$("[data-callout]"), ring = $("[data-face-ring]");
  const g = { W: 0, H: 0, R: 0, full: 0, small: false };
  const faceScale = () => (g.W <= 600 ? 0.74 : g.small ? 0.82 : 0.86);
  const layoutFace = () => {
    const W = rostro.clientWidth, H = rostro.clientHeight;
    const k = Math.max(W / (PL.cx * 2), H / ((PL.h - PL.cy) * 2), W / ((PL.w - PL.cx) * 2), H / (PL.cy * 2));
    const X = (px: number) => W / 2 + (px - PL.cx) * k, Y = (py: number) => H / 2 + (py - PL.cy) * k;
    Object.assign(faceImg.style, { width: PL.w * k + "px", height: PL.h * k + "px", left: X(0) + "px", top: Y(0) + "px" });
    $("[data-face-zoom]").style.transformOrigin = X(PL.zoom[0]) + "px " + Y(PL.zoom[1]) + "px";
    Object.assign(g, { W, H, R: PL.r * k, full: Math.hypot(W, H) / 2 + 20, small: W <= 900 });
    Object.assign(ring.style, { width: PL.r * k * 2 + 26 + "px", height: PL.r * k * 2 + 26 + "px" });
    $$<HTMLElement>("[data-short]", rostro).forEach((b) => { if (!b.dataset.short) return; b.dataset.full = b.dataset.full || b.textContent || ""; b.textContent = W <= 600 ? b.dataset.short : b.dataset.full; });
    const s = faceScale(), sx = (x: number) => W / 2 + (x - W / 2) * s;
    callouts.forEach((c) => {
      const [px, py] = (c.dataset.at || "0,0").split(",").map(Number), x = X(px), w = c.offsetWidth;
      c.dataset.side = c.dataset.side || (c.classList.contains("l") ? "l" : "r");
      let l = c.dataset.side === "l";
      if (l && sx(x - w) < 8) l = false; else if (!l && sx(x + w) > W - 8) l = true;
      c.classList.toggle("l", l); c.classList.toggle("r", !l);
      c.style.top = Y(py) + "px";
      if (l) { c.style.right = W - x + "px"; c.style.left = "auto"; } else { c.style.left = x + "px"; c.style.right = "auto"; }
    });
  };
  layoutFace(); on(window, "resize", layoutFace); ScrollTrigger.addEventListener("refreshInit", layoutFace);
  const circle = (r: number) => `circle(${r}px at 50% 50%)`;
  const both = "[data-face], [data-face-anno]";
  add(() => {
    const t = gsap.timeline({ scrollTrigger: { trigger: rostro, start: "top top", end: "+=420%", scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
    t.fromTo("[data-face]", { clipPath: () => circle(g.R) }, { clipPath: () => circle(g.R), duration: 0.01 }, 0)
      .fromTo(both, { scale: 0.4, opacity: 0, x: () => (g.small ? 0 : g.W * 0.16), y: () => (g.small ? g.H * 0.5 : g.H * 0.3) },
        { scale: () => (g.small ? 0.62 : 0.6), opacity: 1, x: () => (g.small ? 0 : g.W * 0.16), y: () => (g.small ? g.H * 0.1 : 0), duration: 1, ease: "power3.out" }, 0)
      .fromTo("[data-face-ring]", { rotate: -40, opacity: 0 }, { rotate: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 0.1)
      .fromTo("[data-face-glow]", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1 }, 0)
      .fromTo("[data-rostro-title] .ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.02, duration: 0.5, ease: "power3.out" }, 0.1)
      .fromTo("[data-rostro-copy]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0.3)
      .fromTo(".rostro-copy", { opacity: 1, x: 0 }, { opacity: 0, x: -40, duration: 0.35, immediateRender: false }, 1.25)
      .to(both, { scale: faceScale, x: 0, y: 0, duration: 0.5, ease: "power2.inOut" }, 1.25);
    callouts.forEach((c, i) => {
      const at = 1.8 + i * 0.28, left = c.classList.contains("l");
      t.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.15 }, at)
        .fromTo($("i", c), { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(3)" }, at)
        .fromTo($(".ln", c), { scaleX: 0 }, { scaleX: 1, duration: 0.3 }, at + 0.05)
        .fromTo($(".tx", c), { x: left ? 24 : -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, at + 0.15);
    });
    t.to(callouts, { opacity: 0, duration: 0.3, stagger: 0.03 }, 3.85)
      .to("[data-face-ring]", { opacity: 0, scale: 1.4, duration: 0.5 }, 3.95)
      .to("[data-face]", { clipPath: () => circle(g.full), duration: 0.8, ease: "power2.inOut" }, 4.0)
      .to(both, { scale: 1, duration: 0.8, ease: "power2.inOut" }, 4.0)
      .to("[data-face-glow]", { opacity: 0, duration: 0.4 }, 4.0)
      .to("[data-veil]", { opacity: 1, duration: 0.5 }, 4.35)
      .fromTo('[data-cap="conjunto"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 4.55)
      .to('[data-cap="conjunto"]', { opacity: 0, y: -30, duration: 0.3 }, 5.25)
      .to("[data-face-zoom]", { scale: 2.8, duration: 1, ease: "power2.in" }, 5.25)
      .fromTo("[data-macro]", { opacity: 0, scale: 1.35, filter: "blur(8px)" }, { opacity: 1, scale: 1.05, filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, 5.85)
      .fromTo('[data-cap="labios"]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 6.25)
      .to("[data-macro]", { scale: 1, duration: 0.8, ease: "none" }, 6.55)
      .to({}, { duration: 0.2 });

    /* =================== 04 · EL MÉTODO =================== */
    gsap.fromTo("[data-metodo-vid] > *", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: "[data-metodo]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo("[data-metodo-title] .ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.025, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "[data-metodo]", start: "top 45%" } });
    gsap.from(acc, { y: 60, opacity: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: "[data-metodo]", start: "top 35%" } });
    aT = gsap.timeline({ repeat: -1, paused: true });
    acc.forEach((_, i) => (aT as gsap.core.Timeline).call(() => setAcc(i), undefined, i * 4).fromTo(accBars[i], { "--p": 0 }, { "--p": 1, duration: 4, ease: "none" }, i * 4));
    ScrollTrigger.create({ trigger: "[data-metodo]", start: "top 60%", end: "bottom top", onToggle: (st) => (st.isActive && !accUser ? aT?.play() : aT?.pause()) });
    // en el móvil las tarjetas pasan por debajo del chat y la voz: mientras se ven, los botones se apartan
    ScrollTrigger.create({ trigger: "[data-acc]", start: "top bottom", end: "bottom top", onToggle: (st) => document.documentElement.classList.toggle("fab-off", st.isActive && innerWidth <= 809) });
  });

  /* =================== 05 · EL ESPACIO: galería infinita con paralaje =================== */
  const pg = $("[data-pg]"), track = $("[data-track]"), gN = $("[data-g-n]"), gBar = $("[data-g-bar]");
  const baseCards = $$(".gcard", track).filter((c) => !c.classList.contains("clone")), nBase = baseCards.length;
  let setW = 0; let geo: { img: HTMLElement; l: number; w: number; n: number }[] = [];
  const buildLoop = () => {
    $$(".gcard.clone", track).forEach((c) => c.remove());
    const last = baseCards[nBase - 1];
    setW = last.offsetLeft + last.offsetWidth + parseFloat(getComputedStyle(last).marginRight) - baseCards[0].offsetLeft;
    for (let k = 0; track.scrollWidth < setW + innerWidth * 1.5 && k < 6; k++) baseCards.forEach((c) => { const d = c.cloneNode(true) as HTMLElement; d.classList.add("clone"); d.setAttribute("aria-hidden", "true"); track.append(d); });
    geo = $$(".gcard", track).map((c, i) => ({ img: $("img", c), l: c.offsetLeft, w: c.offsetWidth, n: i % nBase }));
  };
  buildLoop();
  const G2 = { pos: 0, boost: 0, auto: 32, k: 0.95, tau: 0.2, drag: null as null | { x: number; t: number; moved: number; v: number }, inView: false, lastY: scrollY, wheelAt: -1e9, rt: 0 };
  on(window, "resize", () => { clearTimeout(G2.rt); G2.rt = window.setTimeout(buildLoop, 200); });
  add(() => {
    ScrollTrigger.create({ trigger: "[data-pgw]", start: "center center", end: "+=100%", pin: true, anticipatePin: 1 });
    ScrollTrigger.create({ trigger: "[data-pgw]", start: "top bottom", end: "bottom top", onToggle: (st) => { G2.inView = st.isActive; G2.lastY = scrollY; } });
    gsap.from(baseCards, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.5, stagger: 0.08, ease: "expo.inOut", clearProps: "clipPath", scrollTrigger: { trigger: "[data-pgw]", start: "top 75%" } });
    gsap.fromTo("[data-esp-title] .ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.03, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: "[data-espacio]", start: "top 70%" } });
  });
  const kick = (px: number) => { G2.boost += (px * G2.k) / G2.tau; };
  const lb = $("[data-lightbox]"), lbImg = $<HTMLImageElement>("[data-lb-img]"), lbCap = $("[data-lb-cap]");
  const openLb = (c: Element) => { const im = $<HTMLImageElement>("img", c); lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = $("figcaption", c).textContent; lb.classList.add("on"); L.stop(); };
  const closeLb = () => { lb.classList.remove("on"); L.start(); };
  on(lb, "click", closeLb); on(window, "keydown", (e: KeyboardEvent) => { if (e.key === "Escape" && lb.classList.contains("on")) closeLb(); });
  on(pg, "pointerdown", (e: PointerEvent) => { G2.drag = { x: e.clientX, t: e.timeStamp, moved: 0, v: 0 }; pg.setPointerCapture(e.pointerId); pg.classList.add("drag"); G2.boost = 0; });
  on(pg, "pointermove", (e: PointerEvent) => { const d = G2.drag; if (!d) return; const dx = e.clientX - d.x, dt = Math.max(1, e.timeStamp - d.t);
    d.moved += Math.abs(dx); d.v = d.v * 0.5 + (dx / dt) * 1000 * 0.5; d.x = e.clientX; d.t = e.timeStamp; G2.pos -= dx; });
  const endDrag = (e: PointerEvent) => { const d = G2.drag; if (!d) return; G2.drag = null; pg.classList.remove("drag");
    if (e.timeStamp - d.t < 80) G2.boost = -d.v;
    if (d.moved < 6) { const c = document.elementFromPoint(e.clientX, e.clientY)?.closest(".gcard"); if (c) openLb(c); } };
  on(pg, "pointerup", endDrag); on(pg, "pointercancel", endDrag);
  const wpx = (d: number, e: WheelEvent) => d * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  on(window, "wheel", (e: WheelEvent) => { if (!G2.inView || G2.drag) return; G2.wheelAt = performance.now(); if (Math.abs(e.deltaY) >= Math.abs(e.deltaX)) kick(wpx(e.deltaY, e)); }, { passive: true });
  on(pg, "wheel", (e: WheelEvent) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { kick(wpx(e.deltaX, e)); e.preventDefault(); } }, { passive: false });
  const loopX = (v: number) => ((v % setW) + setW) % setW;
  tick((_t, dtMs) => {
    const y = scrollY, dy = y - G2.lastY; G2.lastY = y;
    if (!G2.inView || !setW) return;
    const dt = Math.min(dtMs, 100) / 1000;
    if (!G2.drag) {
      if (dy && performance.now() - G2.wheelAt > 1200) kick(Math.max(-120, Math.min(120, dy)) * 1.05);
      G2.pos += (G2.auto + G2.boost) * dt;
      G2.boost *= Math.exp(-dt / G2.tau);
    }
    const x = -loopX(G2.pos);
    track.style.transform = `translate3d(${x}px,0,0)`;
    const vw = innerWidth, mid = vw / 2; let best = 0, bestD = 1e9;
    for (const gg of geo) {
      const cx = gg.l + gg.w / 2 + x;
      if (cx < -gg.w || cx > vw + gg.w) continue;
      const rel = Math.max(-1, Math.min(1, (cx - mid) / (mid + gg.w / 2)));
      gg.img.style.transform = `translate3d(${(rel * -11.5).toFixed(3)}%,0,0)`;
      const d = Math.abs(cx - mid); if (d < bestD) { bestD = d; best = gg.n; }
    }
    gN.textContent = String(best + 1).padStart(2, "0");
    gBar.style.setProperty("--p", String((best + 1) / nBase));
  });

  add(() => {
    /* =================== CIFRAS =================== */
    ScrollTrigger.create({ trigger: "[data-stats]", start: "top 80%", once: true, onEnter: () =>
      $$<HTMLElement>(".odo i").forEach((w, i) => gsap.fromTo(w, { y: 0 }, { y: () => `-${10 + +(w.dataset.d || 0)}em`, duration: 2.2 + (i % 4) * 0.15, ease: "expo.out", delay: (i % 4) * 0.05 })) });
    gsap.from(".stat", { y: 30, opacity: 0, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: "[data-stats]", start: "top 85%" } });

    /* =================== 06 · LA DOCTORA =================== */
    gsap.fromTo("[data-doc-ph]", { clipPath: "inset(100% 0% 0% 0% round 9999px 9999px 18px 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 9999px 9999px 18px 18px)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: "[data-doctora]", start: "top 70%" } });
    gsap.fromTo("[data-doc-img]", { yPercent: -6, scale: 1.15 }, { yPercent: 6, scale: 1, ease: "none", scrollTrigger: { trigger: "[data-doctora]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from("[data-doc-inset]", { y: 80, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-doctora]", start: "top 45%" } });
    gsap.fromTo("[data-doc-title] .ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.025, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: "[data-doctora]", start: "top 65%" } });
    gsap.from("[data-doc-tags] li", { y: 20, opacity: 0, duration: 0.9, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: "[data-doc-tags]", start: "top 90%" } });

    /* =================== 07 · RESEÑAS =================== */
    if (R.length > 1) {
      const qAuto = gsap.fromTo("[data-q-bar]", { "--p": 0 }, { "--p": 1, duration: 7, ease: "none", repeat: -1, paused: true, onRepeat: () => showQ(rI + 1, true) });
      on($("[data-q-next]"), "click", () => { showQ(rI + 1, true); qAuto.restart(); });
      on($("[data-q-prev]"), "click", () => { showQ(rI - 1, true); qAuto.restart(); });
      ScrollTrigger.create({ trigger: "[data-voces]", start: "top 70%", end: "bottom top", onToggle: (st) => (st.isActive ? qAuto.play() : qAuto.pause()) });
    }
    gsap.fromTo("[data-q-ph]", { clipPath: "inset(0 0 100% 0 round 24px)" }, { clipPath: "inset(0 0 0% 0 round 24px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-voces]", start: "top 70%" } });
    gsap.fromTo("[data-q-img]", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-voces]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".quote .qt > div > *", { y: 30, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: "[data-voces]", start: "top 60%" } });
  });

  /* =================== 08 · LA EXPERIENCIA + 09 · RESERVA ===================
     El arco (el de la recepción de Aruma) se descubre con la película dentro; la
     sección se fija y el arco se abre hasta la pantalla completa; al terminar la
     película, en la sala de espera, entra encima la tarjeta de reserva. */
  const exSec = $("[data-experiencia]"), exFull = $("[data-ex-full]"), exVid = $<HTMLVideoElement>("[data-ex-video]"), exArch = $("[data-ex-arch]"), exShade = $("[data-ex-shade]");
  exSec.classList.add("ex-live"); exVid.loop = false;
  exVid.src = (BIG ? exVid.dataset.hd : exVid.dataset.sd) || "";
  const EX = { r: 0, e: 0, a: null as null | { l: number; t: number; w: number; h: number; W: number; H: number }, full: false, card: false };
  const exMeasure = () => { const s = exSec.getBoundingClientRect(), a = exArch.getBoundingClientRect();
    EX.a = { l: a.left - s.left, t: a.top - s.top, w: a.width, h: a.height, W: exFull.clientWidth, H: exFull.clientHeight }; };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const exDraw = () => {
    const A = EX.a; if (!A) return; const e = EX.e, r = EX.r;
    const top0 = A.t + A.h * (1 - r), rad0 = Math.min(A.w / 2, A.h * r);
    const T = lerp(top0, 0, e), Lf = lerp(A.l, 0, e), Rt = lerp(A.W - A.l - A.w, 0, e), Bt = lerp(A.H - A.t - A.h, 0, e), rad = lerp(rad0, 0, e);
    exFull.style.clipPath = `inset(${T.toFixed(1)}px ${Rt.toFixed(1)}px ${Bt.toFixed(1)}px ${Lf.toFixed(1)}px round ${rad.toFixed(1)}px ${rad.toFixed(1)}px 0px 0px)`;
    exVid.style.transform = `scale(${(1.25 - 0.25 * r).toFixed(4)})`;
    exArch.style.pointerEvents = e > 0.05 ? "none" : "";
  };
  exMeasure(); exDraw();
  ScrollTrigger.addEventListener("refresh", () => { exMeasure(); exDraw(); });
  add(() => {
    gsap.to(EX, { r: 1, ease: "power2.out", onUpdate: exDraw, scrollTrigger: { trigger: exSec, start: "top 75%", end: "top top", scrub: 1 } });
    gsap.fromTo("[data-ex-title] .ch", { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.02, ease: "power3.out", scrollTrigger: { trigger: exSec, start: "top 55%", end: "top 5%", scrub: 1 } });
    gsap.from("[data-ex-list] li", { y: 36, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: "[data-ex-list]", start: "top 92%" } });
  });
  const cardTL = gsap.timeline({ paused: true })
    .to(exShade, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0)
    .fromTo("[data-rcard]", { autoAlpha: 0, y: 50, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out" }, 0.1)
    .fromTo("[data-res-title] .ch", { yPercent: 115 }, { yPercent: 0, stagger: 0.02, duration: 0.9, ease: "expo.out" }, 0.3)
    .fromTo("[data-hours] li", { x: 24, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: "expo.out" }, 0.35)
    .fromTo(".rcard .sub, .rcard .btns > *, .rcard .contact > *", { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "expo.out" }, 0.4);
  const showCard = () => { if (EX.card) return; EX.card = true; exVid.pause(); cardTL.timeScale(1).play(); };
  const hideCard = () => { if (!EX.card) return; EX.card = false; cardTL.timeScale(1.8).reverse(); };
  const startFull = () => { if (EX.full) return; EX.full = true; if (!EX.card) exVid.play().catch(() => {}); };
  const resetFull = () => { if (!EX.full) return; EX.full = false; hideCard(); exVid.play().catch(() => {}); };
  on(exVid, "ended", () => { if (EX.full) showCard(); else { exVid.currentTime = 0; exVid.play().catch(() => {}); } });
  let exTL: gsap.core.Timeline | null = null;
  const exPhase = (p: number) => {
    if (p >= 0.56) startFull(); else if (p < 0.45) resetFull();
    if (p >= 0.88) showCard();
    else if (p < 0.8 && EX.card && !exVid.ended) { hideCard(); exVid.play().catch(() => {}); }
  };
  add(() => {
    ScrollTrigger.create({ trigger: exSec, start: "top 75%", onEnter: () => { if (EX.full || EX.card) return; try { exVid.currentTime = 0; } catch {} exVid.play().catch(() => {}); },
      onLeaveBack: () => { exVid.pause(); try { exVid.currentTime = 0; } catch {} } });
    exTL = gsap.timeline({ scrollTrigger: { trigger: exSec, start: "top top", end: "+=220%", pin: true, scrub: 1, anticipatePin: 1, onUpdate: (st) => exPhase(st.progress) } })
      .to([".experiencia .top", "[data-ex-title]", "[data-ex-list]"], { autoAlpha: 0, y: -30, duration: 0.2, stagger: 0.03, ease: "power1.in" }, 0)
      .to(".experiencia > .aura", { autoAlpha: 0, duration: 0.2 }, 0)
      .to(EX, { e: 1, duration: 0.45, ease: "power2.inOut", onUpdate: exDraw }, 0.08)
      .to({}, { duration: 0.47 });
    reserveY = () => (exTL?.scrollTrigger?.end ?? 0) - 4;
    ScrollTrigger.create({ trigger: exSec, start: "top bottom+=400", end: "bottom top", onToggle: (st) => {
      if (st.isActive) { if (exVid.preload === "none") { exVid.preload = "auto"; exVid.load(); } if (!EX.card) exVid.play().catch(() => {}); } else exVid.pause(); } });
  });
  // red de seguridad: mientras el arco se abre, la película tiene que estar en marcha
  const exKick = () => { const st = exTL?.scrollTrigger; if (!st) return; const y = L.scroll;
    if (y >= st.start - innerHeight * 0.75 && y <= st.end && !EX.card && exVid.paused && !exVid.ended && exVid.readyState >= 2) exVid.play().catch(() => {}); };
  on(exVid, "canplay", exKick); L.on("scroll", exKick);
  $$("[data-aura]").forEach((a) => {
    const host = a.parentElement as HTMLElement;
    const ax = gsap.quickTo(a, "x", { duration: 1.1, ease: "power3" }), ay = gsap.quickTo(a, "y", { duration: 1.1, ease: "power3" });
    gsap.set(a, { x: host.clientWidth * 0.5, y: host.clientHeight * 0.3 });
    if (fine) on(host, "mousemove", (e: MouseEvent) => { const r = host.getBoundingClientRect(); ax(e.clientX - r.left); ay(e.clientY - r.top); });
    else add(() => gsap.to(a, { x: () => host.clientWidth * 0.7, y: () => host.clientHeight * 0.6, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  });

  add(() => {
    /* el fondo cambia de color entre secciones: sin cortes, como una sola pieza */
    const bgm = $("[data-bgm]"), bgSecs = $$("[data-bg]");
    bgSecs.forEach((sec, i) => {
      if (!i) return;
      const rgb = (h: string) => "rgb(" + (h.match(/\w\w/g) || []).map((x) => parseInt(x, 16)).join(",") + ")";
      const mix = gsap.utils.interpolate(rgb(bgSecs[i - 1].dataset.bg || ""), rgb(sec.dataset.bg || ""));
      ScrollTrigger.create({ trigger: sec, start: "top 40%", end: "top 5%", onUpdate: (st) => (bgm.style.backgroundColor = mix(st.progress)),
        onLeave: () => (bgm.style.backgroundColor = sec.dataset.bg || ""), onLeaveBack: () => (bgm.style.backgroundColor = bgSecs[i - 1].dataset.bg || "") });
    });
    /* apariciones */
    $$("[data-reveal]").forEach((el) => gsap.from(el, { y: 40, opacity: 0, duration: 1.3, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse", pinnedContainer: (el.closest("[data-intro],[data-pgw]") as Element) || undefined } }));
  });

  /* cursor y botones magnéticos */
  if (fine) {
    const dot = $("[data-dot]"), ringC = $("[data-ring]");
    const dx = gsap.quickTo(dot, "x", { duration: 0.15 }), dy = gsap.quickTo(dot, "y", { duration: 0.15 });
    const rx = gsap.quickTo(ringC, "x", { duration: 0.55, ease: "power3" }), ry = gsap.quickTo(ringC, "y", { duration: 0.55, ease: "power3" });
    on(window, "mousemove", (e: MouseEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    on(document, "mouseover", (e: MouseEvent) => { const t = (e.target as Element).closest<HTMLElement>("[data-cursor]"); if (t) { ringC.textContent = t.dataset.cursor || ""; gsap.to(ringC, { scale: 1, duration: 0.5, ease: "expo.out" }); gsap.to(dot, { scale: 0, duration: 0.3 }); } });
    on(document, "mouseout", (e: MouseEvent) => { const t = (e.target as Element).closest("[data-cursor]"); if (t && !t.contains(e.relatedTarget as Node)) { gsap.to(ringC, { scale: 0, duration: 0.4, ease: "expo.out" }); gsap.to(dot, { scale: 1, duration: 0.3 }); } });
    $$("[data-magnetic]").forEach((b) => {
      on(b, "mousemove", (e: MouseEvent) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.6, ease: "power3.out" }); });
      on(b, "mouseleave", () => gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,.4)" }));
    });
  }
  on(window, "load", () => ScrollTrigger.refresh());

  return () => {
    ac.abort();
    vio.disconnect();
    timers.forEach(clearTimeout);
    tickers.forEach((t) => gsap.ticker.remove(t));
    cardTL.kill(); aT?.kill();
    ctx.revert();
    ScrollTrigger.getAll().forEach((s) => s.kill());
    bm.forEach((b) => b.close?.());
    cv.remove();
    L.destroy();
  };
}
