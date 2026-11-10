/* =====================================================================
   VOZ — «Llamar a Aruma»: llamada web con la asistente de citas.

   Mismo flujo que Ozio: 1) micrófono, 2) token de un solo uso a ng-agent
   (POST /api/voice/web-call con el tenant de la clínica), 3) SDK oficial de
   Retell. El navegador nunca ve la API key de Retell. Si el agente pide el
   correo en pantalla (pedir_contacto_en_pantalla) se envía a
   POST /api/voice/web-call/:callId/contact.

   Retell v3 (18/10/2026): el backend crea la llamada con /v3/create-web-call
   y el navegador entra con el SDK 3.x pasando callId, transport e iceServers
   a startCall(). Por el transporte nuevo el SDK ya no reenvía `metadata` ni
   `update`: estado de herramienta, correo recibido y subtítulo llegan por el
   canal de interfaz del backend (GET /api/voice/web-call/:callId/events, SSE).
   ===================================================================== */
import { $, sessionId } from "./session";

type Cfg = { url: string; tenant: string; name: string };
type Listener = (...a: never[]) => void;
type RetellClient = {
  on: (ev: string, fn: Listener) => void;
  removeAllListeners: () => void;
  startCall: (o: {
    accessToken: string;
    callId?: string;
    transport?: "gateway" | "livekit";
    iceServers?: RTCIceServer[];
    emitRawAudioSamples?: boolean;
  }) => Promise<void>;
  startAudioPlayback: () => Promise<void>;
  stopCall: () => void;
  mute: () => void;
  unmute: () => void;
};
type Sdk = { RetellWebClient: new () => RetellClient };

const TOKEN_TIMEOUT_MS = 60_000; // arranque en frío de Render
// versión exacta: una publicación nueva del SDK no cambia la llamada sin probarla antes
const SDK_URLS = ["https://cdn.jsdelivr.net/npm/retell-client-js-sdk@3.0.4/+esm", "https://esm.sh/retell-client-js-sdk@3.0.4"];
// "hablando" → "te escucho" se infiere del nivel de audio del agente (el SDK ya no
// emite agent_stop_talking): este silencio seguido, tras el margen que se concede
// a cada frase para que el TTS empiece a sonar.
const AGENT_SILENCE_MS = 600;
const AGENT_TEXT_GRACE_MS = 1500;
const AGENT_LOUD_LEVEL = 0.06;
/** Respuesta de POST /api/voice/web-call (contrato del backend, Retell v3). */
type WebCallResponse = {
  accessToken?: string;
  callId?: string;
  transport?: string;
  iceServers?: RTCIceServer[];
  reply?: string;
  error?: string;
};
/** Eventos del canal de interfaz del backend. */
type UiEvent =
  | { type: "state"; state: string; tool?: string }
  | { type: "agent_text"; turn: string; text: string; done: boolean }
  | { type: "user_text"; text: string; final: boolean }
  | { type: "end" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOOL_LABELS: Record<string, "agenda" | "reserva" | "contacto"> = {
  consultar_disponibilidad: "agenda",
  crear_reserva: "reserva",
  pedir_contacto_en_pantalla: "contacto",
};

// import() de una URL: el empaquetador no debe intentar resolverla
const importUrl = (u: string): Promise<Sdk> => import(/* webpackIgnore: true */ /* turbopackIgnore: true */ u);

export function initVoz(cfg: Cfg): () => void {
  const AGENT_URL = cfg.url.replace(/\/$/, "");
  const MSG: Record<string, string> = {
    connecting: `Conectando con ${cfg.name}…`,
    listening: "Te escucho",
    thinking: "Un momento…",
    speaking: cfg.name,
    agenda: "Mirando la agenda de la doctora…",
    reserva: "Apuntando tu cita…",
    contacto: "Escribe tu correo aquí abajo",
    ended: "Llamada terminada",
  };
  const ERR = {
    mic_denied: "Necesito permiso para el micrófono. Actívalo en el navegador y vuelve a intentarlo.",
    insecure_context: "La llamada solo funciona en una página segura (https).",
    rate_limited: "Demasiadas llamadas seguidas. Prueba en un minuto.",
    unconfigured: "La llamada no está disponible ahora mismo. Puedes escribirnos o llamar al 652 538 353.",
    generic: "Se ha cortado la llamada. ¿Lo intentamos otra vez?",
    unavailable: "No consigo conectar ahora mismo. Puedes escribirnos o llamar al 652 538 353.",
  };

  const sid = sessionId();
  const overlay = $("[data-voz]"), orb = $("[data-voz-orb]"), statusEl = $("[data-voz-status]"), lineEl = $("[data-voz-line]");
  // Opcional: lo que dice el visitante, en vivo.
  const youEl = document.querySelector<HTMLElement>("[data-voz-you]");
  const setYou = (t: string) => { if (youEl) youEl.textContent = t; };
  const form = $<HTMLFormElement>("[data-voz-form]"), emailIn = $<HTMLInputElement>("[data-voz-email]"), formNote = $("[data-voz-form-note]");
  const muteBtn = $("[data-voz-mute]"), hangBtn = $("[data-voz-hang]"), closeBtn = $("[data-voz-close]"), retryBtn = $("[data-voz-retry]");

  let state = "idle";
  let client: RetellClient | null = null;
  let callId: string | null = null;
  let events: EventSource | null = null; // canal de interfaz (SSE)
  let agentTurn: { turn: string; text: string } | null = null; // respuesta en curso (subtítulo)
  let loudUntil = 0; // último instante en que el agente sonó (o margen concedido)
  let gen = 0;
  let muted = false;
  let abort: AbortController | null = null;
  let sdk: Promise<Sdk> | null = null;
  let level = 0;
  let raf = 0;

  const setState = (next: string, text?: string) => {
    state = next;
    overlay.dataset.state = next;
    statusEl.textContent = text ?? MSG[next] ?? "";
    const live = ["listening", "thinking", "speaking", "tool", "connecting"].includes(next);
    hangBtn.hidden = !live;
    muteBtn.hidden = !live || next === "connecting";
    closeBtn.hidden = live;
    retryBtn.hidden = !(next === "ended" || next === "error");
  };
  const open = () => { overlay.hidden = false; document.documentElement.classList.add("voz-open"); requestAnimationFrame(() => overlay.classList.add("on")); };
  const close = () => {
    hangup();
    overlay.classList.remove("on");
    document.documentElement.classList.remove("voz-open");
    setTimeout(() => { if (!overlay.classList.contains("on")) overlay.hidden = true; }, 500);
  };
  const fail = (text: string) => { stopOrb(); setState("error", text); };
  const showForm = (on: boolean) => { form.hidden = !on; if (on) { formNote.textContent = ""; emailIn.value = ""; setTimeout(() => emailIn.focus(), 60); } };

  /* orbe: nivel de voz del agente */
  const pushSamples = (samples: Float32Array) => {
    let sum = 0;
    for (let i = 0; i < samples.length; i += 4) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / (samples.length / 4));
    level = Math.max(level * 0.82, Math.min(1, rms * 4));
  };
  const loop = () => {
    level *= 0.94;
    orb.style.setProperty("--lv", level.toFixed(3));
    const now = Date.now();
    if (level > AGENT_LOUD_LEVEL) loudUntil = Math.max(loudUntil, now);
    if (state === "speaking" && now - loudUntil > AGENT_SILENCE_MS) setState("listening");
    raf = requestAnimationFrame(loop);
  };
  const startOrb = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };
  const stopOrb = () => { cancelAnimationFrame(raf); level = 0; orb.style.setProperty("--lv", "0"); };

  const loadSdk = () => {
    sdk ??= (async () => {
      let last: unknown;
      for (const url of SDK_URLS) { try { return await importUrl(url); } catch (e) { last = e; } }
      throw last;
    })();
    return sdk;
  };
  const closeEvents = () => { if (events) { events.close(); events = null; } };

  /* Canal de interfaz del backend (SSE). Best-effort: si falla, la llamada sigue
     y solo se pierden subtítulo, etiqueta de herramienta y apertura del correo. */
  const openEvents = (id: string, cancelled: () => boolean) => {
    if (typeof EventSource === "undefined") return;
    closeEvents();
    agentTurn = null; loudUntil = 0; setYou("");
    const es = new EventSource(`${AGENT_URL}/api/voice/web-call/${encodeURIComponent(id)}/events?sessionId=${encodeURIComponent(sid)}&tenant=${encodeURIComponent(cfg.tenant)}`);
    events = es;
    const onUi = (raw: MessageEvent) => {
      if (cancelled()) return;
      let ev: UiEvent;
      try { ev = JSON.parse(String(raw.data)) as UiEvent; } catch { return; }
      if (!ev || typeof ev !== "object") return;
      if (ev.type === "state") {
        if (ev.state === "contact_received") { formNote.textContent = "Recibido ✓"; setTimeout(() => showForm(false), 1200); return; }
        if (ev.state === "tool") {
          const label = TOOL_LABELS[ev.tool ?? ""];
          setState("tool", label ? MSG[label] : MSG.thinking);
          if (label === "contacto") showForm(true);
        } else if (ev.state === "answering" && state === "tool") setState("thinking");
      } else if (ev.type === "agent_text") {
        if (typeof ev.text !== "string" || !ev.text.trim()) return;
        const text = agentTurn && agentTurn.turn === ev.turn ? `${agentTurn.text} ${ev.text.trim()}` : ev.text.trim();
        agentTurn = { turn: ev.turn, text };
        lineEl.textContent = text;
        loudUntil = Math.max(loudUntil, Date.now() + AGENT_TEXT_GRACE_MS);
        setState("speaking");
      } else if (ev.type === "user_text") {
        // Lo que el visitante va diciendo, según lo transcribe Retell (parciales y final).
        if (typeof ev.text === "string" && ev.text.trim()) setYou(ev.text.trim());
        // Retell ya pidió respuesta: el cliente ha terminado de hablar.
        if (ev.final && state === "listening") setState("thinking");
      } else if (ev.type === "end") {
        es.close(); if (events === es) events = null;
      }
    };
    for (const t of ["state", "agent_text", "user_text", "end"]) es.addEventListener(t, onUi);
    es.onerror = () => {}; // EventSource reintenta solo
  };

  async function start() {
    if (state !== "idle" && state !== "ended" && state !== "error") return;
    open();
    lineEl.textContent = ""; setYou("");
    showForm(false);
    muted = false; muteBtn.setAttribute("aria-pressed", "false");
    callId = null;
    if (!AGENT_URL || !cfg.tenant) return fail(ERR.unconfigured);
    if (!window.isSecureContext) return fail(ERR.insecure_context);

    const my = ++gen;
    const cancelled = () => my !== gen;
    setState("connecting");
    const sdkP = loadSdk();
    sdkP.catch(() => {});

    // micrófono ANTES del token: el permiso lo contesta una persona y el token caduca en 30 s
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
    } catch (err) {
      if (cancelled()) return;
      if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) return fail(ERR.mic_denied);
    }
    if (cancelled()) return;

    abort = new AbortController();
    const timer = setTimeout(() => abort?.abort(), TOKEN_TIMEOUT_MS);
    try {
      const res = await fetch(`${AGENT_URL}/api/voice/web-call`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sid, tenant: cfg.tenant }),
        signal: abort.signal,
      });
      const data: WebCallResponse = await res.json().catch(() => ({}));
      if (cancelled()) return;
      callId = data.callId || null;
      if (!res.ok || !data.accessToken) {
        if (data.reply) return fail(data.reply);
        if (res.status === 429) return fail(ERR.rate_limited);
        if (data.error === "voice_unconfigured" || data.error === "voice_not_in_plan") return fail(ERR.unconfigured);
        return fail(ERR.unavailable);
      }

      // Canal de interfaz ANTES de entrar: el saludo sale nada más conectar.
      if (callId) openEvents(callId, cancelled);

      const { RetellWebClient } = await sdkP;
      if (cancelled()) return;
      const c = new RetellWebClient();
      client = c;
      // Solo desde "conectando": el saludo puede haber llegado ya por el canal.
      c.on("call_ready", () => { if (!cancelled()) { startOrb(); if (state === "connecting") setState("listening"); } });
      c.on("agent_start_talking", () => { if (!cancelled()) setState("speaking"); });
      c.on("agent_stop_talking", () => { if (!cancelled() && state === "speaking") setState("listening"); });
      c.on("audio", ((samples: Float32Array) => { if (!cancelled()) pushSamples(samples); }) as Listener);
      // `update` y `metadata` ya no llegan por el SDK (transporte v3): ver openEvents.
      c.on("call_ended", () => { stopOrb(); closeEvents(); if (cancelled()) return; client = null; setState("ended"); });
      c.on("error", () => {
        c.removeAllListeners();
        try { c.stopCall(); } catch {}
        stopOrb(); closeEvents();
        if (cancelled()) return;
        client = null;
        fail(ERR.generic);
      });
      // callId, transport e iceServers: la respuesta v3 que startCall() necesita
      // para conectar por el gateway (sin ellos intentaría el transporte antiguo).
      await c.startCall({
        accessToken: data.accessToken,
        callId: data.callId,
        transport: data.transport === "gateway" || data.transport === "livekit" ? data.transport : undefined,
        iceServers: data.iceServers,
        emitRawAudioSamples: true,
      });
      if (cancelled()) { try { c.stopCall(); } catch {} return; }
      try { await c.startAudioPlayback(); } catch {}
    } catch {
      if (cancelled()) return;
      client = null; closeEvents();
      fail(ERR.unavailable);
    } finally {
      clearTimeout(timer);
      abort = null;
    }
  }

  function hangup() {
    gen++;
    if (abort) { abort.abort(); abort = null; }
    const c = client; client = null;
    if (c) { c.removeAllListeners(); try { c.stopCall(); } catch {} }
    closeEvents();
    stopOrb();
    showForm(false);
    if (state !== "idle" && state !== "error") setState("ended");
  }

  async function submitEmail(e: SubmitEvent) {
    e.preventDefault();
    const email = emailIn.value.trim();
    if (!callId || !EMAIL_RE.test(email)) { formNote.textContent = "Revisa el correo, parece incompleto."; return; }
    formNote.textContent = "Enviando…";
    try {
      const res = await fetch(`${AGENT_URL}/api/voice/web-call/${encodeURIComponent(callId)}/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sid, email, tenant: cfg.tenant }),
      });
      if (!res.ok) throw new Error(String(res.status));
      formNote.textContent = "Recibido ✓";
      setTimeout(() => showForm(false), 1200);
    } catch {
      formNote.textContent = "No se ha podido enviar. Prueba otra vez.";
    }
  }

  const onDoc = (e: MouseEvent) => { if ((e.target as Element | null)?.closest("[data-voz-open]")) { e.preventDefault(); start(); } };
  const onMute = () => {
    if (!client) return;
    muted = !muted;
    try { if (muted) client.mute(); else client.unmute(); } catch { muted = !muted; return; }
    muteBtn.setAttribute("aria-pressed", String(muted));
    const s = muteBtn.querySelector("span");
    if (s) s.textContent = muted ? "Activar micro" : "Silenciar";
  };
  const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape" && !overlay.hidden) close(); };

  document.addEventListener("click", onDoc);
  hangBtn.addEventListener("click", hangup);
  retryBtn.addEventListener("click", start);
  closeBtn.addEventListener("click", close);
  form.addEventListener("submit", submitEmail);
  muteBtn.addEventListener("click", onMute);
  addEventListener("keydown", onEsc);
  addEventListener("pagehide", hangup);
  setState("idle", "");

  return () => {
    hangup();
    document.removeEventListener("click", onDoc);
    hangBtn.removeEventListener("click", hangup);
    retryBtn.removeEventListener("click", start);
    closeBtn.removeEventListener("click", close);
    form.removeEventListener("submit", submitEmail);
    muteBtn.removeEventListener("click", onMute);
    removeEventListener("keydown", onEsc);
    removeEventListener("pagehide", hangup);
  };
}
