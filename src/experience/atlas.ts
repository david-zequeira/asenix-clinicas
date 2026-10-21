/* =====================================================================
   ATLAS DEL ROSTRO
   El primer plano de la película convertido en un grabado de puntos
   (WebGL): cada punto crece con lo oscuro de la imagen. Una lupa sigue al
   cursor y deja ver la piel real debajo. Las zonas se reconocen al pasar
   por encima; al pulsar una, la cámara se acerca, los puntos se agrandan
   como bajo un microscopio y se abre la película de esa zona en un círculo.
   ===================================================================== */
import gsap from "gsap";
import type Lenis from "lenis";
import { clinic, img } from "@/data/clinic";
import type { Zone } from "@/data/types";
import { $, $$ } from "./session";
import { factLine } from "@/data/format";
import type { ConsultaApi } from "./consulta";

const STEP = 13; // separación de la retícula, en px del fotograma de 1920
const [IW, IH] = clinic.atlas.frame;
const ZOOM = 2.5;

const VERT = `
attribute vec2 a_p; attribute float a_d; attribute float a_r;
uniform vec2 u_res; uniform float u_dpr; uniform float u_k; uniform vec2 u_P; uniform vec2 u_F;
uniform float u_t; uniform float u_intro; uniform vec2 u_m; uniform float u_lr;
uniform vec4 u_h1; uniform vec4 u_h2; uniform float u_ha; uniform float u_all; uniform float u_fade;
varying float v_a; varying float v_h;
void main() {
  vec2 s = u_F + (a_p - u_P) * u_k;
  float st = clamp(u_intro * 1.7 - a_r * 0.7, 0.0, 1.0);
  st = 1.0 - pow(1.0 - st, 3.0);
  vec2 from = s + (vec2(fract(a_r * 53.17), fract(a_r * 91.73)) - 0.5) * u_res * 1.3;
  s = mix(from, s, st);
  float size = u_k * ${STEP}.0 * (0.1 + 0.82 * pow(a_d, 1.1));
  size *= 1.0 + 0.09 * sin(u_t * 1.3 + a_r * 6.2831);
  float dm = distance(s, u_m);
  size *= smoothstep(u_lr * 0.6, u_lr * 1.08, dm);
  vec2 q1 = (a_p - u_h1.xy) / max(u_h1.zw, vec2(1.0));
  vec2 q2 = (a_p - u_h2.xy) / max(u_h2.zw, vec2(1.0));
  float h = max(1.0 - smoothstep(0.6, 1.0, length(q1)), 1.0 - smoothstep(0.6, 1.0, length(q2)));
  h = max(h, u_all) * u_ha;
  size *= 1.0 + 0.55 * h;
  // el grabado vive en un óvalo, como el espejo de la consulta (y deja fuera los guantes del borde)
  float e = 1.0 - smoothstep(0.78, 1.0, length((a_p - vec2(1000.0, 520.0)) / vec2(660.0, 600.0)));
  // bajo el titular (a la izquierda) el grabado se desvanece para que se lea
  float left = mix(1.0, smoothstep(u_res.x * 0.26, u_res.x * 0.5, s.x), u_fade);
  v_a = st * e * left; v_h = h;
  gl_PointSize = size * u_dpr;
  vec2 c = s / u_res * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;
const FRAG = `
precision mediump float;
varying float v_a; varying float v_h;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.36, r) * v_a;
  vec3 ink = vec3(0.30, 0.24, 0.19);
  vec3 hot = vec3(0.63, 0.45, 0.31);
  float o = mix(0.72, 0.95, v_h);
  gl_FragColor = vec4(mix(ink, hot, v_h) * a * o, a * o);
}`;

type Ctx = { lenis: Lenis | null; consulta: ConsultaApi; reduce: boolean };

export function initAtlas({ lenis, consulta, reduce }: Ctx): { open: (id: string) => void; destroy: () => void } {
  const ac = new AbortController();
  const on = (t: EventTarget, ev: string, fn: (e: never) => void, o: AddEventListenerOptions = {}) => t.addEventListener(ev, fn as EventListener, { ...o, signal: ac.signal });
  const zones = clinic.atlas.zones as Zone[];
  const sec = $("[data-atlas]"), stage = $("[data-atlas-stage]"), photo = $<HTMLImageElement>("[data-atlas-photo]");
  const cv = $<HTMLCanvasElement>("[data-atlas-dots]"), lensEl = $("[data-atlas-lens]"), marks = $$("[data-atlas-marks] .mk-z");
  const loupe = $("[data-loupe]"), lv = $("[data-loupe-lv]"), ring = $("[data-loupe-ring]"), loupeVid = $<HTMLVideoElement>("[data-loupe-video]"), fig = $("[data-loupe-fig]");
  const panel = $("[data-zpanel]"), copy = $("[data-atlas-copy]");
  const tag = document.createElement("div"); tag.className = "atlas-tag"; tag.innerHTML = "<small></small><b></b><span></span>"; document.body.append(tag);
  const mobile = () => innerWidth <= 900;

  /* ---------- geometría: dónde cae el fotograma en pantalla ---------- */
  let W = 0, H = 0, k0 = 1;
  const S = { k: 1, px: 1010, py: 560, fx: 0, fy: 0, intro: reduce ? 1 : 0, ha: 0, all: 0, lr: 0, fade: 1 };
  const base = () => ({ k: k0, px: 1010, py: 540, fx: mobile() ? W * 0.5 : W * 0.64, fy: mobile() ? H * 0.52 : H * 0.54, fade: mobile() ? 0 : 1 });
  const focusOf = (z: Zone) => ({ k: k0 * (z.shape.length ? ZOOM : 1.35), px: z.at[0], py: z.at[1], fx: mobile() ? W * 0.5 : (W - Math.min(560, W * 0.44)) * 0.5, fy: mobile() ? Math.min(H * 0.27, 165) : H * 0.5, fade: 0 });
  const measure = () => {
    W = stage.clientWidth; H = stage.clientHeight;
    // en escritorio el rostro entero cabe a la derecha, con aire de lámina; en el móvil, más cerca
    k0 = mobile() ? Math.min((W * 0.98) / 840, (H * 0.96) / 1040) : Math.min(W * 0.62 / IW * 1.25, H / IH * 0.98);
    if (open) Object.assign(S, focusOf(open)); else Object.assign(S, base());
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl?.viewport(0, 0, cv.width, cv.height);
  };
  const toImg = (x: number, y: number) => [S.px + (x - S.fx) / S.k, S.py + (y - S.fy) / S.k];
  const toScr = (x: number, y: number) => [S.fx + (x - S.px) * S.k, S.fy + (y - S.py) * S.k];

  /* ---------- WebGL ---------- */
  const gl = cv.getContext("webgl", { antialias: true, premultipliedAlpha: true, alpha: true });
  let prog: WebGLProgram | null = null, count = 0;
  const U: Record<string, WebGLUniformLocation | null> = {};
  if (!gl) sec.classList.add("nogl");
  const shader = (type: number, src: string) => { const s = gl!.createShader(type)!; gl!.shaderSource(s, src); gl!.compileShader(s); return s; };
  const buildDots = (im: HTMLImageElement) => {
    if (!gl) return;
    const sw = im.naturalWidth, sh = im.naturalHeight, f = sw / IW;
    const c = document.createElement("canvas"); c.width = sw; c.height = sh;
    const x2 = c.getContext("2d", { willReadFrequently: true })!; x2.drawImage(im, 0, 0);
    const px = x2.getImageData(0, 0, sw, sh).data;
    const data: number[] = [];
    for (let row = 0, y = STEP / 2; y < IH; y += STEP * 0.866, row++) {
      for (let x = (row % 2 ? STEP : STEP / 2); x < IW; x += STEP) {
        const i = (Math.min(sh - 1, Math.round(y * f)) * sw + Math.min(sw - 1, Math.round(x * f))) * 4;
        const lum = (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]) / 255;
        const d = Math.min(1, Math.max(0, (1 - lum - 0.06) * 1.75));
        data.push(x, y, d, Math.random());
      }
    }
    count = data.length / 4;
    prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { sec.classList.add("nogl"); prog = null; return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const attr = (n: string, size: number, off: number) => { const l = gl.getAttribLocation(prog!, n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 16, off * 4); };
    attr("a_p", 2, 0); attr("a_d", 1, 2); attr("a_r", 1, 3);
    ["u_res", "u_dpr", "u_k", "u_P", "u_F", "u_t", "u_intro", "u_m", "u_lr", "u_h1", "u_h2", "u_ha", "u_all", "u_fade"].forEach((n) => (U[n] = gl.getUniformLocation(prog!, n)));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  };

  /* ---------- puntero, lupa y zona bajo el cursor ---------- */
  const M = { x: -999, y: -999, tx: -999, ty: -999, active: false, last: 0 };
  let hover: Zone | null = null, hl: Zone | null = null, open: Zone | null = null;
  const zoneAt = (x: number, y: number) => {
    const [ix, iy] = toImg(x, y);
    return zones.find((z) => z.shape.some(([cx, cy, rx, ry]) => ((ix - cx) / rx) ** 2 + ((iy - cy) / ry) ** 2 <= 1)) || null;
  };
  const setHot = (z: Zone | null) => {
    marks.forEach((m) => m.classList.toggle("hot", !!z && m.dataset.zoneOpen === z.id));
    $$("[data-zone-hover]").forEach((b) => b.classList.toggle("hot", !!z && b.dataset.zoneHover === z.id));
    if (z !== hl) { hl = z; gsap.to(S, { ha: z ? 1 : 0, duration: 0.5, ease: "power2.out", overwrite: "auto" }); S.all = z && !z.shape.length ? 1 : 0; }
  };
  const showTag = (z: Zone | null, e?: PointerEvent) => {
    if (!z || open || mobile()) { gsap.to(tag, { opacity: 0, duration: 0.25 }); return; }
    (tag.children[0] as HTMLElement).textContent = `Zona ${z.n}`;
    (tag.children[1] as HTMLElement).textContent = z.name;
    (tag.children[2] as HTMLElement).textContent = `${z.treatments.length} ${z.treatments.length === 1 ? "tratamiento" : "tratamientos"} · pulsa`;
    gsap.to(tag, { opacity: 1, duration: 0.25 });
    if (e) gsap.to(tag, { x: e.clientX + 18, y: e.clientY + 18, duration: 0.35, ease: "power3.out" });
  };
  on(stage, "pointermove", (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    M.tx = e.clientX - r.left; M.ty = e.clientY - r.top; M.active = true; M.last = performance.now();
    if (open) return;
    hover = zoneAt(M.tx, M.ty);
    setHot(hover); showTag(hover, e);
    stage.style.cursor = hover ? "pointer" : "none";
  });
  on(stage, "pointerleave", () => { M.active = false; hover = null; if (!open) setHot(null); showTag(null); });
  on(stage, "click", (e: MouseEvent) => {
    if (open) return;
    const r = stage.getBoundingClientRect();
    const z = (e.target as Element).closest<HTMLElement>("[data-zone-open]")?.dataset.zoneOpen;
    const hit = z ? zones.find((q) => q.id === z) : zoneAt(e.clientX - r.left, e.clientY - r.top);
    if (hit) openZone(hit);
  });
  $$("[data-zone-hover]").forEach((b) => {
    on(b, "mouseenter", () => { if (!open) setHot(zones.find((z) => z.id === b.dataset.zoneHover) || null); });
    on(b, "mouseleave", () => { if (!open) setHot(null); });
  });
  on(document, "click", (e: MouseEvent) => {
    const b = (e.target as Element | null)?.closest<HTMLElement>("[data-zlist] [data-zone-open]");
    if (b) { const z = zones.find((q) => q.id === b.dataset.zoneOpen); if (z) openZone(z); }
  });

  /* ---------- abrir una zona ---------- */
  const zpTitle = $("[data-zp-title]"), zpLead = $("[data-zp-lead]"), zpTr = $("[data-zp-tr]"), zpN = $("[data-zp-n]"), zpAdd = $("[data-zp-add]");
  const T = clinic.treatments;
  const fill = (z: Zone) => {
    zpN.textContent = `Zona ${z.n} / ${String(zones.length).padStart(2, "0")}`;
    zpTitle.innerHTML = `${z.name} <em>${z.italic}</em>`;
    zpLead.textContent = z.lead;
    zpTr.innerHTML = z.treatments.map((s, i) => `<details${i === 0 ? " open" : ""}><summary><b>${T[s].name}</b><small>${factLine(s) || "Según valoración médica"}</small><i>+</i></summary><div>${T[s].description}<ul>${T[s].benefits.slice(0, 4).map((b) => `<li>${b}</li>`).join("")}</ul></div></details>`).join("");
    zpAdd.setAttribute("aria-pressed", String(consulta.hasZone(z.id)));
    fig.textContent = `fig. ${z.n} — ${z.fig}`;
  };
  const R = () => (mobile() ? Math.min(W * 0.3, 112) : Math.min(W * 0.2, H * 0.32));
  const placeLoupe = () => { loupe.style.transform = `translate(${S.fx}px, ${S.fy}px)`; loupe.style.setProperty("--R", R() + "px"); };
  // el fotograma fijo del mismo plano hace de póster mientras llega el clip
  const playClip = (z: Zone) => { loupeVid.poster = img(z.clip.replace("zona-", "still-") + "-960"); loupeVid.src = img(z.clip, "mp4"); loupeVid.load(); loupeVid.play().catch(() => {}); };
  function openZone(z: Zone) {
    if (open === z) return;
    const first = !open;
    open = z;
    hover = null; setHot(z); showTag(null);
    fill(z);
    document.documentElement.classList.add("zone-open"); sec.classList.add("zoned");
    const go = () => {
      lenis?.stop();
      const t = focusOf(z);
      const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
      if (first) {
        tl.to(copy, { autoAlpha: 0, x: -30, duration: 0.6, ease: "power2.in" }, 0)
          .to(".atlas-foot, .atlas-hint, [data-atlas-marks]", { autoAlpha: 0, duration: 0.4 }, 0)
          .to(S, { ...t, duration: 1.5, onUpdate: placeLoupe }, 0.05)
          .to(panel, { xPercent: 0, yPercent: 0, x: 0, y: 0, duration: 1.1, ease: "expo.out" }, 0.55)
          .fromTo(panel.querySelectorAll(".zp-body > *, .zp-tr details"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "expo.out" }, 0.8)
          .call(() => playClip(z), undefined, 0.9)
          .fromTo(lv, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)", duration: 1.2 }, 1.0)
          .to(S, { lr: R() * 1.02, duration: 1.2 }, 1.0)
          .fromTo(ring, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.2, ease: "expo.out" }, 1.3)
          .fromTo(fig, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 1.5);
      } else {
        // de una zona a otra: la lupa se cierra, la cámara viaja y se vuelve a abrir
        tl.to(lv, { clipPath: "circle(0% at 50% 50%)", duration: 0.5, ease: "power2.in" }, 0)
          .to(fig, { opacity: 0, duration: 0.3 }, 0)
          .to(S, { ...t, lr: 0, duration: 1.2, onUpdate: placeLoupe }, 0.3)
          .call(() => playClip(z), undefined, 1.1)
          .to(lv, { clipPath: "circle(50% at 50% 50%)", duration: 1 }, 1.3)
          .to(S, { lr: R() * 1.02, duration: 1 }, 1.3)
          .to(fig, { opacity: 1, duration: 0.6 }, 1.6)
          .fromTo(panel.querySelectorAll(".zp-body > *, .zp-tr details"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "expo.out" }, 0.4);
      }
    };
    // si la página no está arriba del todo, primero se sube al atlas (scrollY manda: puede haberse movido sin Lenis)
    if (first && scrollY > 2) {
      if (lenis) { lenis.start(); lenis.scrollTo(0, { duration: 0.9, force: true, onComplete: () => { scrollTo(0, 0); go(); } }); }
      else { scrollTo(0, 0); go(); }
    } else go();
  }
  function closeZone() {
    if (!open) return;
    open = null;
    gsap.timeline({ defaults: { ease: "expo.inOut" }, onComplete: () => { loupeVid.pause(); lenis?.start(); } })
      .to(lv, { clipPath: "circle(0% at 50% 50%)", duration: 0.6, ease: "power2.in" }, 0)
      .to([ring, fig], { opacity: 0, duration: 0.4 }, 0)
      .to(panel, mobile() ? { yPercent: 102, duration: 0.8 } : { xPercent: 102, duration: 0.8 }, 0)
      .to(S, { ...base(), lr: 0, duration: 1.4 }, 0.2)
      .to(copy, { autoAlpha: 1, x: 0, duration: 1, ease: "expo.out" }, 0.9)
      .to(".atlas-foot, .atlas-hint, [data-atlas-marks]", { autoAlpha: 1, duration: 0.6 }, 1.1)
      .call(() => { document.documentElement.classList.remove("zone-open"); sec.classList.remove("zoned"); setHot(null); }, undefined, 1.2);
  }
  const step = (d: number) => { if (!open) return; const i = zones.indexOf(open); openZone(zones[(i + d + zones.length) % zones.length]); };
  on($("[data-zp-close]"), "click", closeZone);
  on($("[data-zp-prev]"), "click", () => step(-1));
  on($("[data-zp-next]"), "click", () => step(1));
  on(window, "keydown", (e: KeyboardEvent) => { if (!open) return; if (e.key === "Escape") closeZone(); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
  on(zpAdd, "click", () => { if (!open) return; const onNow = consulta.toggleZone(open.id); zpAdd.setAttribute("aria-pressed", String(onNow)); });
  const toConsulta = (then: () => void) => { const z = open; closeZone(); if (z) consulta.addZone(z.id); setTimeout(() => { if (lenis) lenis.scrollTo("#consulta", { duration: 1.6, offset: -40 }); else $("#consulta").scrollIntoView({ behavior: "smooth" }); setTimeout(then, 900); }, 1300); };
  on($("[data-zp-form]"), "submit", (e: SubmitEvent) => {
    e.preventDefault();
    const input = $<HTMLInputElement>("[data-zp-input]"), q = input.value.trim(), z = open;
    if (!q || !z) return;
    input.value = "";
    toConsulta(() => consulta.ask(`Sobre ${z.name.toLowerCase()} (${z.italic}): ${q}`));
  });
  on($("[data-zp-book]"), "click", (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); toConsulta(() => consulta.focus()); }, { capture: true });
  // un panel en el móvil empieza escondido abajo; en escritorio, a la derecha
  gsap.set(panel, mobile() ? { yPercent: 102 } : { xPercent: 102 });

  /* ---------- bucle ---------- */
  const t0 = performance.now();
  let raf = 0, visible = true;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
  io.observe(sec);
  const lensR = () => (mobile() ? 78 : 118);
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const now = performance.now(), t = reduce ? 0 : (now - t0) / 1000;
    // la lupa: sigue al cursor; si nadie la mueve, pasea despacio por el rostro
    if (!open) {
      const idle = !M.active || now - M.last > 2600;
      if (idle && !reduce) {
        const [ax, ay] = toScr(1010 + Math.sin(t * 0.37) * 300, 520 + Math.sin(t * 0.53 + 1) * 260);
        M.tx = ax; M.ty = ay;
      }
      M.x += (M.tx - M.x) * 0.14; M.y += (M.ty - M.y) * 0.14;
      S.lr += ((S.intro >= 1 ? lensR() : 0) - S.lr) * 0.08;
    } else { M.x = S.fx; M.y = S.fy; }
    // la fotografía real, con su máscara en coordenadas del propio fotograma
    const tx = S.fx - S.px * S.k, ty = S.fy - S.py * S.k;
    photo.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${S.k})`;
    photo.style.setProperty("--lx", ((M.x - tx) / S.k).toFixed(1) + "px");
    photo.style.setProperty("--ly", ((M.y - ty) / S.k).toFixed(1) + "px");
    photo.style.setProperty("--lr", (S.lr / S.k).toFixed(1) + "px");
    lensEl.style.transform = `translate3d(${M.x}px,${M.y}px,0)`;
    lensEl.style.setProperty("--lr", (open ? 0 : S.lr) + "px");
    // cruces de las zonas
    marks.forEach((m) => { const [x, y] = toScr(...((m.dataset.at || "0,0").split(",").map(Number) as [number, number])); m.style.left = x + "px"; m.style.top = y + "px"; });
    if (!gl || !prog) return;
    const h = hl?.shape ?? [];
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.u_res, W, H); gl.uniform1f(U.u_dpr, cv.width / Math.max(1, W)); gl.uniform1f(U.u_k, S.k);
    gl.uniform2f(U.u_P, S.px, S.py); gl.uniform2f(U.u_F, S.fx, S.fy); gl.uniform1f(U.u_t, t); gl.uniform1f(U.u_intro, S.intro);
    gl.uniform2f(U.u_m, M.x, M.y); gl.uniform1f(U.u_lr, S.lr);
    gl.uniform4f(U.u_h1, ...((h[0] ?? [-999, -999, 1, 1]) as [number, number, number, number]));
    gl.uniform4f(U.u_h2, ...((h[1] ?? [-999, -999, 1, 1]) as [number, number, number, number]));
    gl.uniform1f(U.u_ha, S.ha); gl.uniform1f(U.u_all, S.all); gl.uniform1f(U.u_fade, S.fade);
    gl.drawArrays(gl.POINTS, 0, count);
  };

  /* ---------- arranque: los puntos se reúnen en el rostro ---------- */
  measure();
  on(window, "resize", measure);
  const sample = new Image(); sample.decoding = "async"; sample.src = img(clinic.atlas.sample);
  const counter = $("[data-dot-count]");
  const start = () => {
    buildDots(sample);
    photo.style.opacity = "1";
    raf = requestAnimationFrame(frame);
    const n = { v: 0 };
    if (reduce) { counter.textContent = String(count); return; }
    document.documentElement.classList.add("intro");
    gsap.timeline({ onComplete: () => document.documentElement.classList.remove("intro") })
      .to(S, { intro: 1, duration: 2.8, ease: "power2.inOut" }, 0)
      .to(n, { v: count, duration: 2.6, ease: "power2.inOut", onUpdate: () => (counter.textContent = String(Math.round(n.v)).padStart(5, "0")) }, 0)
      .fromTo("[data-intro-title] .line-m > span", { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.12, ease: "expo.out" }, 0.9)
      .fromTo("[data-intro-in]", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.05, ease: "expo.out" }, 1.3)
      .fromTo(marks, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, stagger: 0.08, ease: "back.out(2)" }, 2.2);
  };
  if (sample.complete && sample.naturalWidth) start(); else { sample.onload = start; sample.onerror = () => { sec.classList.add("nogl"); photo.style.opacity = "1"; }; }

  return {
    open: (id: string) => { const z = zones.find((q) => q.id === id); if (z) openZone(z); },
    destroy: () => { ac.abort(); cancelAnimationFrame(raf); io.disconnect(); tag.remove(); gsap.killTweensOf(S); },
  };
}
