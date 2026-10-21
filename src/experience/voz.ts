/* =====================================================================
   VOZ — «Llamar a Aruma»: llamada web con la asistente de citas.

   Mismo flujo que Ozio: 1) micrófono, 2) token de un solo uso a ng-agent
   (POST /api/voice/web-call con el tenant de la clínica), 3) SDK oficial de
   Retell. El navegador nunca ve la API key de Retell. Si el agente pide el
   correo en pantalla (pedir_contacto_en_pantalla) se envía a
   POST /api/voice/web-call/:callId/contact.
   ===================================================================== */
import { $, sessionId } from "./session";

type Cfg = { url: string; tenant: string; name: string };
type Listener = (...a: never[]) => void;
type RetellClient = {
  on: (ev: string, fn: Listener) => void;
  removeAllListeners: () => void;
  startCall: (o: { accessToken: string; emitRawAudioSamples?: boolean }) => Promise<void>;
  startAudioPlayback: () => Promise<void>;
  stopCall: () => void;
  mute: () => void;
  unmute: () => void;
};
type Sdk = { RetellWebClient: new () => RetellClient };

const TOKEN_TIMEOUT_MS = 60_000; // arranque en frío de Render
const SDK_URLS = ["https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2/+esm", "https://esm.sh/retell-client-js-sdk@2"];
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
  const form = $<HTMLFormElement>("[data-voz-form]"), emailIn = $<HTMLInputElement>("[data-voz-email]"), formNote = $("[data-voz-form-note]");
  const muteBtn = $("[data-voz-mute]"), hangBtn = $("[data-voz-hang]"), closeBtn = $("[data-voz-close]"), retryBtn = $("[data-voz-retry]");

  let state = "idle";
  let client: RetellClient | null = null;
  let callId: string | null = null;
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
  const loop = () => { level *= 0.94; orb.style.setProperty("--lv", level.toFixed(3)); raf = requestAnimationFrame(loop); };
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
  type Payload = { metadata?: Record<string, string>; transcript?: { role: string; content: string }[] } & Record<string, unknown>;
  const readMeta = (p: Payload | null) => (p && typeof p === "object" ? ((p.metadata && typeof p.metadata === "object" ? p.metadata : p) as Record<string, string>) : null);
  const lastAgentLine = (p: Payload | null) => {
    const turns = p && Array.isArray(p.transcript) ? p.transcript : [];
    for (let i = turns.length - 1; i >= 0; i--) {
      const t = turns[i];
      if (t && (t.role === "agent" || t.role === "assistant") && typeof t.content === "string" && t.content.trim()) return t.content.trim();
    }
    return null;
  };

  async function start() {
    if (state !== "idle" && state !== "ended" && state !== "error") return;
    open();
    lineEl.textContent = "";
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
      const data = await res.json().catch(() => ({}));
      if (cancelled()) return;
      callId = data.callId || null;
      if (!res.ok || !data.accessToken) {
        if (data.reply) return fail(data.reply);
        if (res.status === 429) return fail(ERR.rate_limited);
        if (data.error === "voice_unconfigured" || data.error === "voice_not_in_plan") return fail(ERR.unconfigured);
        return fail(ERR.unavailable);
      }

      const { RetellWebClient } = await sdkP;
      if (cancelled()) return;
      const c = new RetellWebClient();
      client = c;
      c.on("call_ready", () => { if (!cancelled()) { startOrb(); setState("listening"); } });
      c.on("agent_start_talking", () => { if (!cancelled()) setState("speaking"); });
      c.on("agent_stop_talking", () => { if (!cancelled() && state === "speaking") setState("listening"); });
      c.on("audio", ((samples: Float32Array) => { if (!cancelled()) pushSamples(samples); }) as Listener);
      c.on("update", ((payload: Payload) => { if (cancelled()) return; const line = lastAgentLine(payload); if (line) lineEl.textContent = line; }) as Listener);
      c.on("metadata", ((payload: Payload) => {
        if (cancelled()) return;
        const m = readMeta(payload);
        if (!m) return;
        if (m.state === "contact_received") { formNote.textContent = "Recibido ✓"; setTimeout(() => showForm(false), 1200); return; }
        if (m.state === "tool") {
          const label = TOOL_LABELS[m.tool];
          setState("tool", label ? MSG[label] : MSG.thinking);
          if (label === "contacto") showForm(true);
        } else if (m.state === "answering" && state === "tool") setState("thinking");
      }) as Listener);
      c.on("call_ended", () => { stopOrb(); if (cancelled()) return; client = null; setState("ended"); });
      c.on("error", () => {
        c.removeAllListeners();
        try { c.stopCall(); } catch {}
        if (cancelled()) return;
        client = null;
        fail(ERR.generic);
      });
      await c.startCall({ accessToken: data.accessToken, emitRawAudioSamples: true });
      if (cancelled()) { try { c.stopCall(); } catch {} return; }
      try { await c.startAudioPlayback(); } catch {}
    } catch {
      if (cancelled()) return;
      client = null;
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
