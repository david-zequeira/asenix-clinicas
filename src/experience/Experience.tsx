"use client";

import { useEffect } from "react";
import { clinic } from "@/data/clinic";
import { initConsulta } from "./consulta";
import { initAtlas } from "./atlas";
import { initVoz } from "./voz";
import { startEngine } from "./engine";
import { sessionId } from "./session";

/**
 * Enciende la página: el movimiento, la consulta (la asistente por escrito),
 * el atlas del rostro, la voz y la medición. El marcado lo pinta el servidor.
 */
export default function Experience() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const engine = startEngine(reduce);
    const consulta = initConsulta();
    const atlas = initAtlas({ lenis: engine.lenis, consulta, reduce });
    consulta.setOpenZone(atlas.open);
    const stopVoz = initVoz(clinic.agent);
    const stopTrack = track();
    return () => { stopTrack(); stopVoz(); atlas.destroy(); consulta.destroy(); engine.destroy(); };
  }, []);
  return null;
}

/* MEDICIÓN: visitas y clics que importan, al panel de la clínica en ng-agent.
   Sin cookies ni datos personales; si falla, la web sigue igual. */
function track() {
  const { url, tenant } = clinic.agent;
  const q = new URLSearchParams(location.search);
  const base: Record<string, string> = { sessionId: sessionId(), tenant, path: (location.pathname + location.hash).slice(0, 300) || "/" };
  if (document.referrer && !document.referrer.startsWith(location.origin)) base.referrer = document.referrer.slice(0, 500);
  [["utm_source", "utmSource"], ["utm_medium", "utmMedium"], ["utm_campaign", "utmCampaign"]].forEach(([k, n]) => { const v = q.get(k); if (v) base[n] = v.slice(0, 100); });
  const send = (event?: string) => {
    try { fetch(`${url}/api/track`, { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify(event ? { ...base, event } : base) }).catch(() => {}); } catch {}
  };
  send();
  const once = new Set<string>();
  const onClick = (e: MouseEvent) => {
    const t = (e.target as Element | null)?.closest('[data-f-book],[data-voz-open],[data-zone-open],[data-answer],[data-ask-treatment],a[href^="tel:"],a[href^="mailto:"],a[href*="wa.me"],a[href*="google.com/maps"]');
    if (!t) return;
    const ev = t.matches("[data-f-book]") ? "cta_reservar" : t.matches("[data-voz-open]") ? "llamada_abierta" : t.matches("[data-zone-open]") ? "atlas_zona"
      : t.matches("[data-answer],[data-ask-treatment]") ? "chat_abierto" : t.matches('a[href^="tel:"]') ? "clic_telefono" : t.matches('a[href^="mailto:"]') ? "clic_email"
      : t.matches('a[href*="wa.me"]') ? "clic_whatsapp" : "clic_como_llegar";
    if (!once.has(ev)) { once.add(ev); send(ev); }
  };
  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}
