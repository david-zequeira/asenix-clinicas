/* =====================================================================
   LA CONSULTA — la asistente de Aruma, dentro de la página.
   Las respuestas rápidas las contesta la propia ficha de la clínica al
   instante (y escriben la página: tratamientos, zonas, la ficha); lo que se
   escribe con palabras propias va al canal web de ng-agent:
   POST /api/chat { sessionId, message, tenant } → { reply }.
   La ficha (zonas, tratamientos, objetivos) acaba en la petición de cita;
   si la agenda no responde, la misma ficha sale por WhatsApp.
   ===================================================================== */
import gsap from "gsap";
import { clinic, img } from "@/data/clinic";
import { factLine } from "@/data/format";
import type { Answer, Zone } from "@/data/types";
import { $, $$, reducedMotion, sessionId } from "./session";

const REPLY_TIMEOUT_MS = 45_000;
const LOG_KEY = "aruma.consulta.log";
const FICHA_KEY = "aruma.ficha";

type Msg = { role: "user" | "agent" | "note"; text: string; cards?: string[]; book?: boolean };
type Ficha = { zones: string[]; treatments: string[]; goals: string[] };

export type ConsultaApi = {
  ask: (text: string) => void;
  focus: () => void;
  addZone: (id: string) => void;
  toggleZone: (id: string) => boolean;
  hasZone: (id: string) => boolean;
  setOpenZone: (fn: (id: string) => void) => void;
  destroy: () => void;
};

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

export function initConsulta(): ConsultaApi {
  const ac = new AbortController();
  const on = (t: EventTarget, ev: string, fn: (e: never) => void, o: AddEventListenerOptions = {}) => t.addEventListener(ev, fn as EventListener, { ...o, signal: ac.signal });
  const { url, tenant } = clinic.agent;
  const T = clinic.treatments;
  const zones = clinic.atlas.zones as Zone[];
  const answers = clinic.consulta.answers as Answer[];
  const sid = sessionId();
  const log = $("[data-cs-log]"), form = $<HTMLFormElement>("[data-cs-form]"), input = $<HTMLTextAreaElement>("[data-cs-input]"), send = $<HTMLButtonElement>("[data-cs-send]");
  const fZones = $("[data-f-zones]"), fTr = $("[data-f-tr]"), fGoals = $("[data-f-goals]"), fWa = $<HTMLAnchorElement>("[data-f-wa]");
  let openZone: (id: string) => void = () => {};
  let busy = false;
  let abort: AbortController | null = null;

  /* ---------- ficha ---------- */
  const load = <V,>(k: string, d: V): V => { try { const v = JSON.parse(sessionStorage.getItem(k) || "null"); return v ?? d; } catch { return d; } };
  const save = (k: string, v: unknown) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const ficha: Ficha = load(FICHA_KEY, { zones: [], treatments: [], goals: [] });
  const msgs: Msg[] = load(LOG_KEY, []);
  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id;
  const fichaText = () => {
    const parts = [
      ficha.zones.length && `zonas: ${ficha.zones.map(zoneName).join(", ").toLowerCase()}`,
      ficha.treatments.length && `me interesa: ${ficha.treatments.map((s) => T[s]?.name).join(", ")}`,
      ficha.goals.length && `busco: ${ficha.goals.join(", ").toLowerCase()}`,
    ].filter(Boolean);
    return parts.length ? parts.join("; ") : "";
  };
  const tag = (label: string, kind: keyof Ficha, v: string) => `<span class="tag">${label}<button type="button" aria-label="Quitar ${label}" data-f-del="${kind}:${v}">×</button></span>`;
  const renderFicha = () => {
    const empty = (t: string) => `<span class="empty">${t}</span>`;
    fZones.innerHTML = ficha.zones.map((z) => tag(zoneName(z), "zones", z)).join("") || empty("Elige zonas en el atlas");
    fTr.innerHTML = ficha.treatments.map((s) => tag(T[s]?.name ?? s, "treatments", s)).join("") || empty("Aparecerán al conversar");
    fGoals.innerHTML = ficha.goals.map((g) => tag(g, "goals", g)).join("") || empty("Cuéntalo a la izquierda");
    const text = `Hola, quiero reservar una valoración en Aruma Clinic.${fichaText() ? " Mi ficha — " + fichaText() + "." : ""}`;
    fWa.href = `https://wa.me/${clinic.contact.whatsapp}?text=${encodeURIComponent(text)}`;
    save(FICHA_KEY, ficha);
  };
  const add = (kind: keyof Ficha, v: string) => { if (!ficha[kind].includes(v)) { ficha[kind].push(v); renderFicha(); pulse(); } };
  const pulse = () => { if (!reducedMotion()) gsap.fromTo("[data-ficha]", { scale: 0.985 }, { scale: 1, duration: 0.8, ease: "elastic.out(1,.5)" }); };
  on($("[data-ficha]"), "click", (e: MouseEvent) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-f-del]"); if (!b) return;
    const [k, v] = (b.dataset.fDel || "").split(":") as [keyof Ficha, string];
    ficha[k] = ficha[k].filter((x) => x !== v); renderFicha();
  });

  /* ---------- conversación ---------- */
  const scrollTo = (el: Element) => { const r = el.getBoundingClientRect(); if (r.bottom > innerHeight - 120) el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" }); };
  const cardsHtml = (slugs: string[]) => `<div class="cs-cards">${slugs.filter((s) => T[s]).map((s) =>
    `<button type="button" class="cs-card" data-card="${s}"><small>${factLine(s) || "Según valoración"}</small><b>${T[s].name}</b><span>${T[s].summary}</span></button>`).join("")}</div>`;
  const render = (m: Msg, animate: boolean) => {
    const el = document.createElement("div");
    el.className = `cs-msg ${m.role}`;
    if (m.role === "user") { const p = document.createElement("p"); p.textContent = m.text; el.append(p); }
    else {
      el.innerHTML = `<div class="who"><img src="${img("isotipo", "png")}" alt=""><span class="mono">Aruma · asistente</span></div><p class="say"></p>`;
      const p = $(".say", el);
      // la respuesta del agente nunca se pinta como HTML: palabra a palabra con textContent
      m.text.split(/(\s+)/).forEach((w) => { if (/^\s+$/.test(w)) p.append(w); else if (w) { const s = document.createElement("span"); s.className = "w"; s.textContent = w; p.append(s); } });
      if (m.cards?.length) el.insertAdjacentHTML("beforeend", cardsHtml(m.cards));
      if (m.book) el.insertAdjacentHTML("beforeend", `<div class="cs-actions"><button type="button" class="pill solid" data-f-book>Reservar mi valoración ${ARROW}</button><a class="pill" href="${fWa.href}" target="_blank" rel="noopener">WhatsApp · ${clinic.contact.phone}</a></div>`);
    }
    log.append(el);
    if (animate && !reducedMotion()) {
      gsap.from(el.querySelectorAll(".say .w"), { opacity: 0, y: 14, filter: "blur(4px)", duration: 0.7, stagger: 0.022, ease: "power2.out", clearProps: "filter" });
      gsap.from(el.querySelectorAll(".cs-card, .cs-actions > *, p:not(.say)"), { opacity: 0, y: 18, duration: 0.8, stagger: 0.06, ease: "expo.out", delay: 0.3 });
    }
    if (animate) scrollTo(el);   // al repintar la conversación guardada, la página no se mueve
  };
  const push = (m: Msg) => { msgs.push(m); save(LOG_KEY, msgs.slice(-40)); render(m, true); };
  const typing = (on: boolean) => {
    const el = $(".cs-typing", log);
    if (on && !el) { log.insertAdjacentHTML("beforeend", '<div class="cs-typing" aria-label="Aruma está escribiendo"><i></i><i></i><i></i></div>'); scrollTo(log.lastElementChild as Element); }
    else if (!on && el) el.remove();
  };
  const setBusy = (b: boolean) => { busy = b; send.disabled = b || !input.value.trim(); };

  // respuesta rápida: la contesta la ficha de la clínica, al momento
  const answer = (a: Answer) => {
    $$("[data-answer]").forEach((b) => b.dataset.answer === a.id && b.setAttribute("aria-pressed", "true"));
    push({ role: "user", text: a.label });
    a.zones.forEach((z) => add("zones", z));
    add("goals", a.label);
    typing(true);
    setTimeout(() => {
      typing(false);
      a.treatments.forEach((s) => add("treatments", s));
      push({ role: "agent", text: a.reply, cards: a.treatments, book: a.id === "nose" });
    }, reducedMotion() ? 0 : 700);
  };

  // con palabras propias: al asistente de ng-agent
  async function ask(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    push({ role: "user", text });
    setBusy(true); typing(true);
    abort = new AbortController();
    const timer = setTimeout(() => abort?.abort(), REPLY_TIMEOUT_MS);
    try {
      const res = await fetch(`${url}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: sid, message: text, tenant }), signal: abort.signal });
      const data = await res.json().catch(() => ({}));
      typing(false);
      if (res.ok && typeof data.reply === "string" && data.reply.trim()) { push({ role: "agent", text: data.reply.trim() }); return; }
      push({ role: "note", text: data.reply || "Ahora mismo no consigo conectar con la agenda. Te dejo tu ficha lista para enviarla por WhatsApp, o llámanos y lo vemos contigo.", book: true });
    } catch {
      typing(false);
      push({ role: "note", text: "Ahora mismo no consigo conectar con la agenda. Te dejo tu ficha lista para enviarla por WhatsApp, o llámanos y lo vemos contigo.", book: true });
    } finally { clearTimeout(timer); abort = null; setBusy(false); }
  }
  const book = () => ask(`Quiero reservar una valoración con la Dra. Marroquín.${fichaText() ? " Mi ficha — " + fichaText() + "." : ""}`);

  /* ---------- cableado ---------- */
  on($("[data-cs-chips]"), "click", (e: MouseEvent) => { const b = (e.target as Element).closest<HTMLElement>("[data-answer]"); const a = answers.find((x) => x.id === b?.dataset.answer); if (a) answer(a); });
  on(log, "click", (e: MouseEvent) => {
    const c = (e.target as Element).closest<HTMLElement>("[data-card]");
    if (!c) return;
    const s = c.dataset.card || "";
    add("treatments", s);
    const z = zones.find((q) => q.treatments.includes(s));
    if (z) openZone(z.id);
    else { const row = $$<HTMLDetailsElement>(".idx-row").find((r) => r.querySelector("b")?.textContent === T[s]?.name); if (row) { row.open = true; row.scrollIntoView({ block: "center", behavior: "smooth" }); } }
  });
  on(document, "click", (e: MouseEvent) => {
    const t = e.target as Element | null;
    if (t?.closest("[data-f-book]")) { e.preventDefault(); book(); return; }
    const q = t?.closest<HTMLElement>("[data-ask-treatment]");
    if (q) { const s = q.dataset.askTreatment || ""; add("treatments", s); $("#consulta").scrollIntoView({ behavior: "smooth" }); setTimeout(() => ask(`Me interesa ${T[s].name}. ¿Cómo es y qué resultados puedo esperar?`), 800); return; }
    if (t?.closest("[data-voz-write]")) { $("[data-voz-close]")?.click(); setTimeout(() => { $("#consulta").scrollIntoView({ behavior: "smooth" }); input.focus({ preventScroll: true }); }, 400); }
  });
  const autosize = () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; send.disabled = busy || !input.value.trim(); };
  on(input, "input", autosize);
  on(input, "keydown", (e: KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  on(form, "submit", (e: SubmitEvent) => { e.preventDefault(); const t = input.value; input.value = ""; autosize(); ask(t); });
  on(window, "pagehide", () => abort?.abort());

  renderFicha();
  msgs.forEach((m) => render(m, false));
  setBusy(false);

  return {
    ask: (t) => { void ask(t); },
    focus: () => { input.focus({ preventScroll: true }); },
    addZone: (id) => add("zones", id),
    toggleZone: (id) => { if (ficha.zones.includes(id)) { ficha.zones = ficha.zones.filter((z) => z !== id); renderFicha(); return false; } add("zones", id); return true; },
    hasZone: (id) => ficha.zones.includes(id),
    setOpenZone: (fn) => { openZone = fn; },
    destroy: () => { ac.abort(); abort?.abort(); },
  };
}
