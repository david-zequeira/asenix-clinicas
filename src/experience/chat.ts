/* =====================================================================
   CHAT — «Escribir a Aruma»: la misma asistente de citas, por escrito.

   Habla con el canal web de ng-agent:
   POST /api/chat { sessionId, message, tenant } → { reply }.
   La respuesta llega entera y en texto plano. La conversación vive en el
   backend por sessionId; aquí solo se guarda una copia en sessionStorage para
   repintarla si se cierra y se abre.
   ===================================================================== */
import { $, reducedMotion, sessionId } from "./session";

type Msg = { role: "user" | "agent"; text: string };
type Cfg = { url: string; tenant: string; name: string };

const REPLY_TIMEOUT_MS = 45_000;
const MAX_LEN = 2000;
const LOG_KEY = "aruma.chat.log";
const LOG_MAX = 60;

export type ChatApi = { open: (e?: Event) => void; ask: (text: string) => void; destroy: () => void };

export function initChat(cfg: Cfg): ChatApi {
  const AGENT_URL = cfg.url.replace(/\/$/, "");
  const MSG = {
    hello: `¡Hola! Soy la asistente de ${cfg.name}. Puedo ayudarte a reservar una valoración con la Dra. Marroquín, contarte cómo es cada tratamiento o resolver cualquier duda. ¿En qué te ayudo?`,
    typing: `${cfg.name} está escribiendo…`,
    err: {
      rate_limited: "Vas muy rápido. Espera un momento y vuelve a escribir.",
      unconfigured: "El chat no está disponible ahora mismo. Puedes llamarnos o escribirnos por WhatsApp al 652 538 353.",
      timeout: "Está tardando más de la cuenta. ¿Lo intentamos otra vez?",
      unavailable: "No consigo conectar ahora mismo. ¿Lo intentamos otra vez?",
      too_long: "El mensaje es demasiado largo. Resúmelo un poco, por favor.",
    },
  };
  const sid = sessionId();
  const panel = $("[data-chat]"), list = $("[data-chat-list]"), chips = $("[data-chat-chips]");
  const form = $<HTMLFormElement>("[data-chat-form]"), input = $<HTMLTextAreaElement>("[data-chat-input]");
  const sendBtn = $<HTMLButtonElement>("[data-chat-send]"), closeBtn = $("[data-chat-close]"), live = $("[data-chat-live]");

  let log: Msg[] = [];
  let busy = false;
  let returnFocus: HTMLElement | null = null;
  let abort: AbortController | null = null;

  const loadLog = (): Msg[] => { try { const v = JSON.parse(sessionStorage.getItem(LOG_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
  const saveLog = () => { try { sessionStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-LOG_MAX))); } catch {} };
  const scrollDown = () => list.scrollTo({ top: list.scrollHeight, behavior: reducedMotion() ? "auto" : "smooth" });

  // Solo textContent: la respuesta del agente nunca se pinta como HTML.
  const bubble = (role: Msg["role"], text: string, announce = false) => {
    const el = document.createElement("div");
    el.className = `chat-msg ${role}`;
    const p = document.createElement("p");
    p.textContent = text;
    el.append(p);
    list.append(el);
    if (announce) live.textContent = text;
    scrollDown();
  };
  const typing = (on: boolean) => {
    let el: HTMLElement | null = $<HTMLElement>(".chat-typing", list);
    if (on && !el) {
      el = document.createElement("div");
      el.className = "chat-msg agent chat-typing";
      el.setAttribute("aria-label", MSG.typing);
      el.innerHTML = "<p><i></i><i></i><i></i></p>";
      list.append(el);
      live.textContent = MSG.typing;
      scrollDown();
    } else if (!on && el) el.remove();
  };
  const showError = (text: string, retry?: string | null) => {
    const el = document.createElement("div");
    el.className = "chat-note";
    const p = document.createElement("p");
    p.textContent = text;
    el.append(p);
    if (retry) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "Reintentar";
      b.addEventListener("click", () => { el.remove(); send(retry, true); });
      el.append(b);
    }
    list.append(el);
    live.textContent = text;
    scrollDown();
  };
  const setBusy = (on: boolean) => { busy = on; panel.dataset.busy = String(on); sendBtn.disabled = on || !input.value.trim(); };
  const render = () => { list.textContent = ""; bubble("agent", MSG.hello); log.forEach((m) => bubble(m.role, m.text)); chips.hidden = log.length > 0; };

  const isOpen = () => !panel.hidden && panel.classList.contains("on");
  function open(e?: Event) {
    // si viene de la llamada (sin micro, error…), se cierra la llamada primero
    const voz = $("[data-voz]");
    if (voz && !voz.hidden) $("[data-voz-close]")?.click();
    const t = e?.currentTarget;
    returnFocus = t instanceof HTMLElement && !t.closest("[data-voz]") ? t : $<HTMLElement>(".chat-fab");
    if (isOpen()) { input.focus(); return; }
    panel.hidden = false;
    document.documentElement.classList.add("chat-open");
    requestAnimationFrame(() => {
      panel.classList.add("on");
      list.scrollTop = list.scrollHeight;
      // en móvil el foco abre el teclado y tapa el saludo
      if (matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
      else closeBtn.focus({ preventScroll: true });
    });
  }
  function close() {
    if (panel.hidden) return;
    panel.classList.remove("on");
    document.documentElement.classList.remove("chat-open");
    const done = () => { if (!panel.classList.contains("on")) panel.hidden = true; };
    if (reducedMotion()) done(); else setTimeout(done, 450);
    returnFocus?.focus({ preventScroll: true });
  }

  async function send(raw: string, again = false) {
    const text = (raw || "").trim();
    if (!text || busy) return;
    if (text.length > MAX_LEN) { showError(MSG.err.too_long); return; }
    chips.hidden = true;
    if (!again) { bubble("user", text); log.push({ role: "user", text }); saveLog(); }
    if (!AGENT_URL || !cfg.tenant) { showError(MSG.err.unconfigured); return; }

    setBusy(true);
    typing(true);
    abort = new AbortController();
    const timer = setTimeout(() => abort?.abort(), REPLY_TIMEOUT_MS);
    try {
      const res = await fetch(`${AGENT_URL}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sid, message: text, tenant: cfg.tenant }),
        signal: abort.signal,
      });
      const data = await res.json().catch(() => ({}));
      typing(false);
      if (res.ok && typeof data.reply === "string" && data.reply.trim()) {
        const reply = data.reply.trim();
        bubble("agent", reply, true);
        log.push({ role: "agent", text: reply }); saveLog();
        return;
      }
      // 429/503 del guardarraíl traen un texto humano en `reply`
      if (data.reply) { showError(data.reply, res.status === 429 ? null : text); return; }
      if (res.status === 429) { showError(MSG.err.rate_limited); return; }
      if (res.status === 401 || res.status === 404) { showError(MSG.err.unconfigured); return; }
      showError(MSG.err.unavailable, text);
    } catch (err) {
      typing(false);
      showError(err instanceof DOMException && err.name === "AbortError" ? MSG.err.timeout : MSG.err.unavailable, text);
    } finally {
      clearTimeout(timer);
      abort = null;
      setBusy(false);
    }
  }

  const autosize = () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
    input.style.overflowY = input.scrollHeight > 140 ? "auto" : "hidden";
    sendBtn.disabled = busy || !input.value.trim();
  };

  log = loadLog();
  render();

  const onDoc = (e: MouseEvent) => {
    const b = (e.target as Element | null)?.closest("[data-chat-open]");
    if (b) { e.preventDefault(); open({ currentTarget: b } as unknown as Event); }
  };
  const onChip = (e: MouseEvent) => { const b = (e.target as Element).closest("button"); if (b) send(b.textContent || ""); };
  const onSubmit = (e: SubmitEvent) => { e.preventDefault(); const t = input.value; if (!t.trim() || busy) return; input.value = ""; autosize(); send(t); };
  // Intro envía; Mayús+Intro hace salto de línea. No se envía mientras se compone (IME).
  const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } };
  const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen()) { e.stopPropagation(); close(); } };
  // Tab no se escapa del panel en móvil (pantalla completa)
  const onTrap = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !matchMedia("(max-width: 560px)").matches) return;
    const f = [...panel.querySelectorAll<HTMLElement>("button:not([disabled]):not([hidden]),textarea")].filter((el) => el.offsetParent);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const onHide = () => abort?.abort();

  document.addEventListener("click", onDoc);
  closeBtn.addEventListener("click", close);
  chips.addEventListener("click", onChip);
  form.addEventListener("submit", onSubmit);
  input.addEventListener("keydown", onKey);
  input.addEventListener("input", autosize);
  addEventListener("keydown", onEsc);
  panel.addEventListener("keydown", onTrap);
  addEventListener("pagehide", onHide);
  setBusy(false);

  return {
    open,
    // desde el catálogo: abre el chat y pregunta por el tratamiento
    ask: (text) => { open(); setTimeout(() => send(text), 350); },
    destroy: () => {
      document.removeEventListener("click", onDoc);
      closeBtn.removeEventListener("click", close);
      chips.removeEventListener("click", onChip);
      form.removeEventListener("submit", onSubmit);
      input.removeEventListener("keydown", onKey);
      input.removeEventListener("input", autosize);
      removeEventListener("keydown", onEsc);
      panel.removeEventListener("keydown", onTrap);
      removeEventListener("pagehide", onHide);
      abort?.abort();
    },
  };
}
