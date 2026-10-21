/* eslint-disable @next/next/no-img-element -- export estático: las imágenes ya salen optimizadas del pipeline */
import { Fragment } from "react";
import { clinic, img } from "@/data/clinic";
import { Arrow, ArrowLeft, Quote, Spark } from "./Icons";

/** `«Rellenos *dérmicos*»` → texto con la parte en cursiva. */
const Em = ({ text }: { text: string }) => (
  <>{text.split("*").map((t, i) => (i % 2 ? <em key={i}>{t}</em> : <Fragment key={i}>{t}</Fragment>))}</>
);
const tel = (p: string) => "tel:+34" + p.replace(/\D/g, "");
const lines = (s: string) => s.split("\n").map((l, i) => <Fragment key={i}>{i > 0 && <br />}{l}</Fragment>);

/* ---------- PORTADA ---------- */
export function Hero() {
  return (
    <section className="hero" id="top" data-hero data-bg="#1d1814">
      <div className="cam" data-cam>
        {/* el póster pinta al instante; el motor pone encima el lienzo con los fotogramas */}
        <img src={img("hero-poster")} alt="" aria-hidden="true" data-hero-poster fetchPriority="high" />
      </div>
      <div className="grad" />
      <div className="hero-copy" data-hero-copy>
        {clinic.hero.map((s, i) => {
          const H = i === clinic.hero.length - 1 ? "h1" : "h2";
          return (
            <div className="hero-scene" data-scene={i} key={i}>
              <H className="hero-t">{s.title}<em className="sc">{s.italic}</em></H>
              <p className="lead">{s.lead}</p>
              {s.ctas && (
                <div className="ctas">
                  <a className="btn-split" href="#reserva" data-magnetic><span className="l"><span>Reservar</span><span>Tu consulta</span></span></a>
                  <a className="btn-ghost" href="#tratamientos" data-cat-open data-magnetic>Tratamientos <span className="o"><Arrow /></span></a>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="side l">Medicina estética avanzada</div>
      <div className="intro" data-hero-intro><span>Desliza</span><i /></div>
      <div className="side r">Madrid · Barrio de Salamanca</div>
    </section>
  );
}

/* ---------- 01 · ARUMA ---------- */
export function Intro() {
  return (
    <section className="intro-s" id="aruma" data-intro data-bg="#e7ddd2">
      <img className="mk" src={img("isotipo", "png")} alt="" style={{ filter: "brightness(.35) sepia(.4)" }} data-reveal />
      <div className="eyebrow" data-reveal>01 — Aruma</div>
      <h2 data-intro-title>{clinic.intro.title} <em className="sc">{clinic.intro.italic}</em></h2>
      <p data-intro-p>{clinic.intro.text}</p>
      <span className="rule" data-rule />
    </section>
  );
}

/* ---------- 02 · TRATAMIENTOS ---------- */
export function Tratamientos() {
  const { areas, treatments } = clinic;
  return (
    <section className="trat" id="tratamientos" data-trat data-bg="#f7f3ee">
      <div className="head">
        <div>
          <div className="eyebrow" data-reveal>02 — Tratamientos</div>
          <h2 className="split" data-trat-title>{clinic.trat.title}<em className="sc">{clinic.trat.italic}</em></h2>
        </div>
        <div data-reveal>
          <p>{clinic.trat.text}</p>
          <button className="btn-fill" type="button" data-fill data-cat-open><span className="fill" /><span>Ver todos</span><Arrow /></button>
        </div>
      </div>
      <div className="areas" data-areas>
        {areas.map((a) => (
          <button className="area" type="button" key={a.id} data-cat-open={a.id} data-area={a.id}>
            <span className="n">{a.n}</span>
            <span className="th"><img src={img(a.image)} alt="" loading="lazy" /></span>
            <span className="nm"><Em text={a.title} /></span>
            <span className="ct">{a.treatments.length} {a.treatments.length === 1 ? "tratamiento" : "tratamientos"}</span>
            <span className="ar"><Arrow /></span>
          </button>
        ))}
      </div>
      <div className="trat-float" data-trat-float aria-hidden="true">
        {areas.map((a) => <img key={a.id} src={img(a.image)} alt="" loading="lazy" data-float={a.id} />)}
      </div>
      {/* índice legible sin JavaScript para buscadores */}
      <ul className="sr-only">
        {areas.map((a) => a.treatments.map((s) => <li key={a.id + s}><a href={treatments[s].url}>{treatments[s].name}</a>: {treatments[s].summary}</li>))}
      </ul>
    </section>
  );
}

/** Segunda vista: todos los tratamientos por área, con su ficha. La rellena el motor. */
export function Catalogo() {
  return (
    <div className="cat" data-cat role="dialog" aria-modal="true" aria-label="Tratamientos de Aruma Clinic" data-lenis-prevent>
      <div className="bg"><img src={img("still-recepcion-960")} alt="" aria-hidden="true" data-cat-bg /></div>
      <div className="top">
        <span className="brand"><img src={img("logo-aruma-texto")} alt={clinic.name} /></span>
        <button className="close" type="button" data-cat-close>Cerrar <i>✕</i></button>
      </div>
      <div className="wrap">
        <nav className="cat-areas" data-cat-areas aria-label="Áreas de tratamiento" />
        <div className="cat-list" data-cat-list />
        <aside className="cat-detail" data-cat-detail aria-live="polite">
          <button className="back" type="button" data-cat-back><ArrowLeft /> Volver</button>
          <div className="ph"><img alt="" data-cd-img /></div>
          <div className="body">
            <div className="k" data-cd-area />
            <h4 data-cd-name />
            <p data-cd-desc />
            <div className="facts" data-cd-facts />
            <ul className="ben" data-cd-ben />
          </div>
          <div className="cta">
            <button className="pri" type="button" data-cd-ask><Spark />Preguntar a Aruma</button>
            <button type="button" data-cd-book>Reservar</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------- 03 · LA LECTURA DEL ROSTRO ---------- */
export function Rostro() {
  const r = clinic.rostro;
  return (
    <section className="rostro" id="rostro" data-rostro data-bg="#1d1814">
      <div className="glow" data-face-glow />
      <div className="face" data-face>
        <div className="face-zoom" data-face-zoom>
          <img src={img(r.still)} alt="Primer plano del rostro de una paciente durante la valoración" data-face-img />
        </div>
      </div>
      <div className="macro" data-macro><img src={img(r.macro)} alt="La Dra. Marroquín durante un aumento de labios" loading="lazy" /></div>
      <div className="veil" data-veil />
      <div className="face-anno" data-face-anno>
        <div className="face-ring" data-face-ring />
        {r.zones.map((z, i) => (
          <div key={i} className={`callout ${z.side}${z.mobile === false ? " m-hide" : ""}`} data-callout data-at={z.at.join(",")}>
            <i /><span className="ln" /><span className="tx"><small>{z.kicker}</small><b data-short={z.short}>{z.label}</b></span>
          </div>
        ))}
      </div>
      <div className="rostro-copy">
        <div className="eyebrow" data-rostro-copy>03 — Armonización facial</div>
        <h2 className="split" data-rostro-title>Cada rostro,<em className="sc">una lectura propia.</em></h2>
        <p data-rostro-copy>Antes de tratar una zona, la Dra. Marroquín mira el conjunto: proporciones, volúmenes y expresión. Así el resultado se nota, pero no se ve.</p>
      </div>
      <div className="rostro-cap" data-cap="conjunto">
        <div className="eyebrow">Armonización facial</div>
        <h3>El conjunto,<em className="sc">no la suma de retoques.</em></h3>
      </div>
      <div className="rostro-cap" data-cap="labios">
        <div className="eyebrow">La especialidad de la doctora</div>
        <h3>Aumento de labios,<em className="sc">volumen justo.</em></h3>
        <p>Ácido hialurónico · 30 minutos · Efecto de 9 a 12 meses</p>
      </div>
    </section>
  );
}

/* ---------- 04 · EL MÉTODO ---------- */
export function Metodo() {
  return (
    <section className="metodo" id="metodo" data-metodo data-bg="#1d1814">
      <div className="vid" data-metodo-vid>
        <img src={img("cuidado-poster")} alt="" aria-hidden="true" />
        <video src={`${img("cuidado-1080", "mp4")}`} data-sd={img("cuidado-720", "mp4")} muted loop playsInline preload="none" poster={img("cuidado-poster")} data-lazy-video aria-hidden="true" />
      </div>
      <div className="shade" />
      <div className="eyebrow" data-reveal>04 — El método</div>
      <h2 className="split" data-metodo-title>Ciencia,<em className="sc">arte y serenidad.</em></h2>
      <div className="acc" data-acc>
        {clinic.metodo.map((m, i) => (
          <article className={`card${i === 0 ? " on" : ""}`} key={m.h}>
            <span className="n">({i + 1})</span>
            <div className="body">
              <div className="pic"><img src={img(m.img)} alt="" loading="lazy" /></div>
              <div className="txt"><h3>{m.h}</h3><p>{m.p}</p></div>
            </div>
            <i className="bar" />
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- 05 · EL ESPACIO ---------- */
export function Espacio() {
  const g = clinic.gallery;
  return (
    <section className="espacio" id="espacio" data-espacio data-bg="#e7ddd2">
      <div className="head">
        <div className="eyebrow" data-reveal>05 — El espacio</div>
        <h2 className="split" data-esp-title>Un entorno <em className="sc">diseñado para ti</em></h2>
        <p data-reveal>Cada rincón de Aruma Clinic está pensado para tu bienestar, tu privacidad y tu confianza.</p>
      </div>
      <div className="pgw" data-pgw>
        <div className="pg" data-pg data-cursor="Arrastra">
          <div className="track" data-track>
            {g.map((c) => (
              <figure className="gcard" key={c.img} style={{ "--ar": c.ar, "--h": c.h, "--y": c.y, "--g": c.g } as React.CSSProperties}>
                <div className="in"><img src={img(c.img)} alt={c.alt} loading="lazy" draggable={false} /></div>
                <figcaption>{c.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="count"><span data-g-n>01</span><i data-g-bar /><span>{String(g.length).padStart(2, "0")}</span></div>
      </div>
      <div className="lightbox" data-lightbox><div><img alt="" data-lb-img /><p data-lb-cap /></div></div>
    </section>
  );
}

/* ---------- CIFRAS ---------- */
export function Stats() {
  return (
    <section className="stats" data-stats>
      <div className="grid">
        {clinic.stats.map((s) => (
          <div className="stat" key={s.label}>
            <b>
              {[...String(s.value)].map((c, i) => (
                <span className="odo" key={i}><i data-d={c}>{Array.from({ length: 20 }, (_, k) => <em key={k}>{k % 10}</em>)}</i></span>
              ))}
              {"suffix" in s && <span>{s.suffix}</span>}
            </b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 06 · LA DOCTORA ---------- */
export function Doctora() {
  const d = clinic.doctora;
  return (
    <section className="doctora" id="doctora" data-doctora data-bg="#f7f3ee">
      <div className="doc-wrap">
        <div className="doc-ph" data-doc-ph><img src={img(d.photo)} alt="La Dra. Andrea Marroquín durante una rinomodelación" loading="lazy" data-doc-img /></div>
        <div className="doc-inset" data-doc-inset><img src={img(d.inset)} alt="La Dra. Andrea Marroquín en su despacho" loading="lazy" /></div>
      </div>
      <div className="doc-txt">
        <div className="eyebrow" data-reveal>06 — La doctora</div>
        <h2 className="split" data-doc-title>{d.name}<em className="sc">{d.italic}</em></h2>
        <div className="role" data-reveal>{d.role}</div>
        <blockquote data-reveal>«{d.quote}»</blockquote>
        <p data-reveal>{d.text}</p>
        <ul className="doc-tags" data-doc-tags>{d.tags.map((t) => <li key={t}>{t}</li>)}</ul>
        <img className="doc-sign" src={img("logo-aruma-firma")} alt="Aruma Clinic by Dra. Andrea Marroquín" loading="lazy" data-reveal />
      </div>
    </section>
  );
}

/* ---------- 07 · RESEÑAS ---------- */
export function Voces() {
  return (
    <section className="voces" id="voces" data-voces data-bg="#efe8df">
      <div className="eyebrow">07 — Reseñas</div>
      <div className="quote">
        <div className="ph" data-q-ph><img src={img(clinic.reviews[0].photo)} alt="" data-q-img loading="lazy" /><span className="tag">Google</span></div>
        <div className="qt">
          <div>
            <Quote />
            <blockquote data-q-text>{clinic.reviews[0].quote}</blockquote>
            <div className="foot">
              <div className="who"><b data-q-name>{clinic.reviews[0].name}</b><span data-q-role>{clinic.reviews[0].role}</span><div className="stars" aria-label="5 estrellas">★★★★★</div></div>
              <div className="metric"><b>57</b><span>reseñas · Excelente</span></div>
            </div>
          </div>
          <div className="ctrl">
            <div className="segs" data-q-bar aria-hidden="true">{clinic.reviews.map((_, i) => <i key={i} />)}</div>
            <div className="arrows">
              <button type="button" data-q-prev aria-label="Reseña anterior"><ArrowLeft /></button>
              <button type="button" data-q-next aria-label="Reseña siguiente"><Arrow w={1.6} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 08 · LA EXPERIENCIA + 09 · RESERVA ---------- */
export function Experiencia() {
  const c = clinic.contact;
  return (
    <>
      <section className="experiencia" id="experiencia" data-experiencia data-bg="#1d1814">
        <div className="ex-full" data-ex-full aria-hidden="true">
          <video muted playsInline preload="none" poster={img("experiencia-poster")} data-hd={img("experiencia-1080", "mp4")} data-sd={img("experiencia-720", "mp4")} data-ex-video />
          <i className="ex-shade" data-ex-shade />
        </div>
        <div className="aura" data-aura />
        <div className="top">
          <div className="eyebrow" data-reveal>08 — La experiencia</div>
          <p data-reveal>{clinic.experiencia.text}</p>
        </div>
        <div className="ex-stage">
          <div className="arch" data-ex-arch data-cursor="Aruma"><img src={img("still-recepcion-960")} alt="" loading="lazy" /></div>
          <h2 className="split" data-ex-title>La experiencia <em className="sc">Aruma</em></h2>
          <ul data-ex-list>{clinic.experiencia.list.map((l) => <li key={l}><Arrow w={1.6} />{l}</li>)}</ul>
        </div>
        <div className="ex-card">
          <div className="rcard" data-rcard role="region" aria-label="Reserva">
            <div className="glow" /><div className="aura" data-aura />
            <div className="grid">
              <div className="head">
                <div className="eyebrow">09 — Reserva</div>
                <h2 className="split" data-res-title>{clinic.reserva.title}<em className="sc">{clinic.reserva.italic}</em></h2>
                <p className="sub">{clinic.reserva.text}</p>
              </div>
              <ul className="hours" data-hours>{clinic.hours.map(([k, v]) => <li key={k}><span>{k}</span><b>{v}</b></li>)}</ul>
              <div className="btns">
                <button className="btn-fill" type="button" data-fill data-book><span className="fill" /><span>Reservar consulta</span><Arrow /></button>
                <button className="btn-ghost" type="button" data-voz-open>Llamar a Aruma <span className="o"><Spark /></span></button>
              </div>
              <div className="contact">
                <div><small>Dirección</small><a href={c.mapsUrl} target="_blank" rel="noopener">{lines(c.address)}</a></div>
                <div><small>Teléfono y WhatsApp</small><a href={tel(c.phone)}>{c.phone}</a><a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener">Escribir por WhatsApp</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div id="reserva" aria-hidden="true" />
    </>
  );
}

/* ---------- PIE ---------- */
export function Footer() {
  const c = clinic.contact;
  return (
    <footer data-footer>
      <div className="cols">
        <div>
          <a className="brand" href="#top" aria-label={`${clinic.name}, inicio`}><img src={img("logo-aruma-texto")} alt="" loading="lazy" /></a>
          <p className="claim">Donde la ciencia se encuentra con la serenidad.</p>
        </div>
        <div><h4>Aruma</h4><ul><li><a href="#aruma">La clínica</a></li><li><button type="button" data-cat-open>Tratamientos</button></li><li><a href="#doctora">La doctora</a></li><li><a href="#reserva">Reservas</a></li></ul></div>
        <div><h4>Contacto</h4><ul>
          <li><a href={c.mapsUrl} target="_blank" rel="noopener">¿Cómo llegar?</a></li>
          <li><a href={tel(c.phone)}>{c.phone}</a></li>
          <li><a href={`mailto:${c.email}`}>{c.email}</a></li>
          <li><button type="button" data-chat-open>Escribir a Aruma</button></li>
        </ul></div>
        <div><h4>Redes</h4><ul>
          <li><a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noopener">Instagram</a></li>
          <li><a href={`https://facebook.com/${c.facebook}`} target="_blank" rel="noopener">Facebook</a></li>
          <li><a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a></li>
        </ul></div>
      </div>
      <div className="legal">
        <span>© {new Date().getFullYear()} {clinic.name} · {clinic.legal.company} — {clinic.legal.cif}<br />
          <a href={`${clinic.legal.site}/aviso-legal/`} target="_blank" rel="noopener">Aviso legal</a> · <a href={`${clinic.legal.site}/politica-de-privacidad/`} target="_blank" rel="noopener">Privacidad</a> · <a href={`${clinic.legal.site}/politica-de-cookies/`} target="_blank" rel="noopener">Cookies</a></span>
        <span>Experiencia creada por <b>asenix</b></span>
      </div>
    </footer>
  );
}
