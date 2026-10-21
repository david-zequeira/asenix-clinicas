/* eslint-disable @next/next/no-img-element -- export estático: las imágenes ya salen optimizadas del pipeline */
import { clinic, img } from "@/data/clinic";
import { fact } from "@/data/format";
import { Arrow, ArrowLeft, Close, Mic } from "./Icons";

const { areas, treatments } = clinic;
const tel = (p: string) => "tel:+34" + p.replace(/\D/g, "");
const areaOf = (slug: string) => areas.find((a) => a.treatments.includes(slug)) ?? areas[0];

/* =================== 01 · EL ATLAS DEL ROSTRO =================== */
export function Atlas() {
  const a = clinic.atlas;
  return (
    <section className="atlas dark" id="atlas" data-atlas data-dark aria-label="Atlas del rostro">
      <div className="cine" data-cine>
        {/* el fotograma y la película de entrada comparten encuadre: 1920×1080 movidos por el motor */}
        <div className="frame" data-frame>
          <img className="still" src={img(a.still)} alt="Primer plano del rostro de una paciente de Aruma Clinic" data-still fetchPriority="high" />
          <video className="intro-v" muted playsInline preload="auto" data-hd={img(`${a.intro}-1080`, "mp4")} data-sd={img(`${a.intro}-720`, "mp4")} data-intro-video aria-hidden="true" />
        </div>
        <div className="spot" data-spot aria-hidden="true" />
        <div className="marks" data-marks>
          {a.zones.filter((z) => z.shape.length).map((z) => (
            <button type="button" className="zm" key={z.id} data-zone-open={z.id} data-at={z.at.join(",")} aria-label={`Zona ${z.n}: ${z.name} ${z.italic}`}>
              <i className="ring" /><i className="ln" /><span className="lb"><small>{z.n}</small>{z.name}</span>
            </button>
          ))}
        </div>
        <div className="zmedia" data-zmedia aria-hidden="true">
          <video muted loop playsInline preload="none" data-zvideo />
          <img alt="" data-zimg />
        </div>
        <div className="grade" aria-hidden="true" />
        <i className="scan" data-scan aria-hidden="true" />
        <div className="bars" aria-hidden="true"><i data-bar-t /><i data-bar-b /></div>
        <div className="flash" data-flash aria-hidden="true" />
      </div>

      <div className="cards" aria-hidden="true">
        <p className="mono" data-card="0">Aruma Clinic presenta</p>
        <p className="serif" data-card="1">Ciencia <em>&amp; serenidad</em></p>
      </div>
      <button type="button" className="skip mono" data-skip>Saltar intro</button>

      <div className="atlas-copy" data-atlas-copy>
        <div className="mono" data-in>fig. 01 — Madrid · medicina estética avanzada</div>
        <h1 className="h-xl" data-atlas-title><span className="line-m"><span>Atlas</span></span><span className="line-m"><span><em>del rostro</em></span></span></h1>
        <p className="lead" data-in>Cada rostro es un mapa propio. Elige una zona y te enseñamos cómo la tratamos.</p>
      </div>
      <nav className="zindex" data-zindex aria-label="Zonas del rostro">
        {a.zones.map((z) => (
          <button type="button" key={z.id} data-zone-open={z.id} data-zone-hover={z.id} data-in>
            <small>{z.n}</small><span>{z.name}</span>
          </button>
        ))}
      </nav>

      <div className="zcap" data-zcap aria-live="polite">
        <div className="mono" data-zc-fig />
        <h2 className="h-l" data-zc-title />
      </div>
      <aside className="zpanel" data-zpanel data-lenis-prevent>
        <div className="zp-top">
          <div className="mono" data-zp-n>Zona 01 / 07</div>
          <div className="nav-z">
            <button type="button" data-zp-prev aria-label="Zona anterior"><ArrowLeft /></button>
            <button type="button" data-zp-next aria-label="Zona siguiente"><Arrow /></button>
            <button type="button" className="zp-close" data-zp-close aria-label="Volver al rostro"><Close /></button>
          </div>
        </div>
        <div className="zp-body" data-zp-body>
          <p className="lead" data-zp-lead />
          <div className="zp-tr" data-zp-tr />
        </div>
        <div className="zp-ask">
          <form data-zp-form>
            <input type="text" placeholder="Pregúntale a esta zona…" aria-label="Tu pregunta sobre esta zona" data-zp-input />
            <button className="pill solid" type="submit">Preguntar</button>
          </form>
          <div className="row">
            <button type="button" className="zp-add" data-zp-add aria-pressed="false"><i>✓</i>Añadir a mi ficha</button>
            <a className="mono link" href="#consulta" data-zp-book>Reservar valoración</a>
          </div>
        </div>
      </aside>
    </section>
  );
}

/* =================== 02 · LA CONSULTA =================== */
export function Consulta() {
  const c = clinic.consulta;
  return (
    <section className="sec consulta dark" id="consulta" data-consulta data-dark>
      <div className="sec-head"><span className="mono">02 — La consulta</span><span className="mono">Te atiende la asistente de Aruma · 24 h</span></div>
      <div className="cs-grid">
        <div className="cs-main">
          <h2 className="h-l cs-q" data-cs-title><span className="line-m"><span>{c.title}</span></span><span className="line-m"><span><em>{c.italic}</em></span></span></h2>
          <div className="cs-chips" data-cs-chips>
            {c.answers.map((a) => <button type="button" key={a.id} data-answer={a.id} aria-pressed="false">{a.label}</button>)}
          </div>
          <div className="cs-log" data-cs-log aria-live="polite" />
          <form className="cs-form" data-cs-form>
            <textarea rows={1} maxLength={2000} placeholder="Escribe con tus palabras… (p. ej. «me veo cansada»)" aria-label="Tu mensaje para Aruma" data-cs-input enterKeyHint="send" />
            <button type="button" className="ic" data-voz-open aria-label="Hablar por voz"><Mic /></button>
            <button type="submit" className="ic send" data-cs-send aria-label="Enviar" disabled><Arrow w={1.8} /></button>
          </form>
          <p className="mono cs-legal">Asistente virtual · no sustituye a la valoración médica · guardamos la conversación para gestionar tu cita</p>
        </div>
        <aside className="ficha" data-ficha>
          <div className="mono">Ficha · se rellena sola</div>
          <h3>Tu <em>ficha</em></h3>
          <dl>
            <div><dt>Zonas</dt><dd data-f-zones /></div>
            <div><dt>Tratamientos de interés</dt><dd data-f-tr /></div>
            <div><dt>Lo que buscas</dt><dd data-f-goals /></div>
          </dl>
          <div className="go">
            <button type="button" className="pill solid" data-f-book>Reservar mi valoración <Arrow /></button>
            <a className="pill" href={`https://wa.me/${clinic.contact.whatsapp}`} target="_blank" rel="noopener" data-f-wa>Enviar por WhatsApp</a>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* =================== 03 · LA CLÍNICA, EN 26 SEGUNDOS =================== */
export function Film() {
  return (
    <section className="sec film dark" id="clinica" data-film data-dark>
      <div className="sec-head"><span className="mono">03 — La clínica</span><span className="mono">Don Ramón de la Cruz 36 · Madrid</span></div>
      <div className="film-cap">
        <h2 className="h-l" data-film-title><span className="line-m"><span>Veintiséis segundos</span></span><span className="line-m"><span><em>de serenidad</em></span></span></h2>
        <p className="lead">Un recorrido real por Aruma, de la recepción a la sala de espera. Pulsa un capítulo para ir a él.</p>
      </div>
      <div className="film-frame" data-film-frame>
        <video muted playsInline preload="none" poster={img("clinica-poster")} data-hd={img("clinica-1080", "mp4")} data-sd={img("clinica-720", "mp4")} data-film-video aria-label="Película de la clínica" />
        <span className="mono tc" data-film-tc>00:00 / 00:26</span>
        <span className="mono rec"><i />Aruma · en directo</span>
      </div>
      <div className="chapters" data-chapters>
        {clinic.film.chapters.map((c, i) => (
          <button type="button" key={c.label} data-at={c.at}><small>{String(i + 1).padStart(2, "0")} · 00:{String(Math.floor(c.at)).padStart(2, "0")}</small><span>{c.label}</span></button>
        ))}
      </div>
    </section>
  );
}

/* =================== 04 · QUIEN TRAZA EL ATLAS =================== */
export function Doctora() {
  const d = clinic.doctora;
  return (
    <section className="sec" id="doctora" data-doctora>
      <div className="sec-head"><span className="mono">04 — Quien traza el atlas</span><span className="mono">{d.role}</span></div>
      <div className="doc">
        <figure className="doc-ph">
          <div className="main" data-doc-main><img src={img(d.photo)} alt="La Dra. Andrea Marroquín durante un tratamiento" loading="lazy" data-doc-img /></div>
          <figcaption className="mono"><span>fig. 04</span><span>La doctora, en consulta</span></figcaption>
          <div className="inset" data-doc-inset><img src={img(d.inset)} alt="La Dra. Andrea Marroquín en su despacho" loading="lazy" /></div>
        </figure>
        <div className="doc-tx">
          <h2 className="h-l" data-doc-title><span className="line-m"><span>{d.name}</span></span><span className="line-m"><span><em>{d.italic}</em></span></span></h2>
          <blockquote data-reveal>«{d.quote}»</blockquote>
          <p className="lead" data-reveal>{d.text}</p>
          <ol className="cv" data-cv>{d.cv.map(([y, t]) => <li key={t}><small>{y}</small><span>{t}</span></li>)}</ol>
          <img className="doc-sign" src={img("logo-aruma-firma")} alt="Aruma Clinic by Dra. Andrea Marroquín" loading="lazy" data-reveal />
        </div>
      </div>
    </section>
  );
}

/* =================== 05 · ÍNDICE =================== */
export function Indice() {
  const all = areas.flatMap((a) => a.treatments).filter((s, i, arr) => arr.indexOf(s) === i);
  return (
    <section className="sec" id="indice" data-indice>
      <div className="sec-head"><span className="mono">05 — Índice</span><span className="mono">{all.length} tratamientos · {areas.length} áreas</span></div>
      <h2 className="h-l" style={{ marginBottom: "calc(var(--u) * 50)" }} data-idx-title><span className="line-m"><span>Todo lo que</span></span><span className="line-m"><span><em>hacemos, por escrito</em></span></span></h2>
      <div className="idx-tabs" data-idx-tabs>
        <button type="button" data-area="" aria-pressed="true">Todos</button>
        {areas.map((a) => <button type="button" key={a.id} data-area={a.id} aria-pressed="false">{a.name}</button>)}
      </div>
      <div className="idx-head mono"><span>Nº</span><span>Tratamiento</span><span>Área</span><span>Sesión</span><span>Efecto</span><span>Desde</span></div>
      <div data-idx-rows>
        {all.map((s, i) => {
          const t = treatments[s];
          const inAreas = areas.filter((a) => a.treatments.includes(s)).map((a) => a.id).join(" ");
          return (
            <details className="idx-row" key={s} data-areas={inAreas}>
              <summary>
                <small>{String(i + 1).padStart(2, "0")}</small>
                <b>{t.name}</b>
                <span className="m">{areaOf(s).name}</span>
                <span className="m hide-m">{fact(s, "Sesión") ?? "—"}</span>
                <span className="m hide-m">{fact(s, "Efecto") ?? "—"}</span>
                <span className="m hide-m">{fact(s, "Precio")?.replace("Desde ", "").replace(" · por ", " / ").replace(" · primera sesión", " · 1.ª") ?? "Valoración"}</span>
              </summary>
              <div className="body">
                <p>{t.description}</p>
                <ul>{t.benefits.slice(0, 4).map((b) => <li key={b}>{b}</li>)}</ul>
                <div className="acts">
                  <img src={img(t.image)} alt="" loading="lazy" />
                  <button type="button" className="pill" data-ask-treatment={s}>Preguntar a Aruma <Arrow /></button>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

/* =================== 06 · VOCES =================== */
export function Voces() {
  const r = clinic.reviews;
  const row = (list: typeof r) => list.map((v, i) => <figure key={i}><blockquote>{v.quote}</blockquote><figcaption>{v.name}</figcaption></figure>);
  return (
    <section className="sec voces" id="voces" data-voces>
      <div className="sec-head"><span className="mono">06 — Voces</span><span className="mono">Reseñas verificadas en Google</span></div>
      <div className="mq" data-mq="1">{row(r)}{row(r)}</div>
      <div className="mq alt" data-mq="-1">{row([...r].reverse())}{row([...r].reverse())}</div>
      <div className="score"><b>57</b><span className="mono">reseñas · valoración «Excelente» en Google</span></div>
    </section>
  );
}

/* =================== 07 · VISITA =================== */
export function Visita() {
  const c = clinic.contact;
  return (
    <section className="sec visita" id="visita" data-visita>
      <div className="sec-head"><span className="mono">07 — Visita</span><span className="mono">Barrio de Salamanca · Madrid</span></div>
      <div className="vi-grid">
        <div>
          <p className="vi-addr" data-vi-addr><span className="line-m"><span>Don Ramón</span></span><span className="line-m"><span>de la Cruz, <em>36</em></span></span></p>
          <div className="vi-ctas">
            <a className="pill solid" href="#consulta">Empezar mi consulta <Arrow /></a>
            <button type="button" className="pill" data-voz-open>Llamar a Aruma</button>
            <a className="pill" href={c.mapsUrl} target="_blank" rel="noopener">Cómo llegar</a>
          </div>
        </div>
        <div>
          <ul className="hours">{clinic.hours.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul>
          <div className="vi-contact">
            <span className="mono">{c.street} · {c.city}</span>
            <a className="link" href={tel(c.phone)}>{c.phone}</a>
            <a className="link" href={`mailto:${c.email}`}>{c.email}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const c = clinic.contact;
  return (
    <footer>
      <div className="big">
        <img src={img("logo-aruma-texto")} alt={clinic.name} loading="lazy" />
        <p>Donde la ciencia se encuentra con la serenidad.</p>
      </div>
      <div className="cols">
        <div><h4>Aruma</h4><ul><li><a href="#atlas">Atlas del rostro</a></li><li><a href="#consulta">La consulta</a></li><li><a href="#doctora">La doctora</a></li><li><a href="#indice">Tratamientos</a></li></ul></div>
        <div><h4>Contacto</h4><ul><li><a href={tel(c.phone)}>{c.phone}</a></li><li><a href={`mailto:${c.email}`}>{c.email}</a></li><li><a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a></li></ul></div>
        <div><h4>Redes</h4><ul><li><a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener">Instagram</a></li><li><a href={`https://facebook.com/${c.facebook}`} target="_blank" rel="noopener">Facebook</a></li></ul></div>
      </div>
      <div className="legal">
        <span>© {new Date().getFullYear()} {clinic.name} · {clinic.legal.company} · {clinic.legal.cif} · <a href={`${clinic.legal.site}/aviso-legal/`} target="_blank" rel="noopener">Aviso legal</a> · <a href={`${clinic.legal.site}/politica-de-privacidad/`} target="_blank" rel="noopener">Privacidad</a></span>
        <span>Experiencia creada por asenix</span>
      </div>
    </footer>
  );
}
