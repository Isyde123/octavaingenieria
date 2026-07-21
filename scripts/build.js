#!/usr/bin/env node
/*
 * Static site builder for Octava Ingeniería.
 * Reads content/es.json and content/en.json, renders both language pages
 * from the templates below, and writes index.html (ES) and en/index.html (EN).
 *
 * To edit site copy: change content/es.json / content/en.json, then run:
 *   node scripts/build.js
 * No other file needs to change for a text-only edit.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://octavaingenieria.com";

const LANGS = [
  { code: "es", jsonFile: "es.json", outFile: "index.html", urlPath: "/", altUrlPath: "/en/" },
  { code: "en", jsonFile: "en.json", outFile: "en/index.html", urlPath: "/en/", altUrlPath: "/" }
];

function esc(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
// Allow a small safe subset of inline markup (used for &amp; already-escaped copy in en.json titles)
function rich(str) {
  if (str === undefined || str === null) return "";
  return String(str);
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function renderStatRow(items) {
  return items
    .map(
      (s) => `
          <div class="stat">
            <div class="num">${esc(s.value)}</div>
            <div class="lbl">${esc(s.label)}</div>
          </div>`
    )
    .join("");
}

function renderHeroFigures(items) {
  return items
    .map(
      (s) => `
          <div class="hero-figure">
            <div class="num">${esc(s.value)}</div>
            <div class="lbl">${esc(s.label)}</div>
          </div>`
    )
    .join("");
}

function renderServiceFront(s, i) {
  const tagHtml = s.tag
    ? `<span class="tag bg-${s.color}" style="color:#0F1923">${esc(s.tag)}</span>`
    : "";
  const bullets = s.items
    .map((it) => `<li><span class="chev color-${s.color}">›</span><span>${rich(it)}</span></li>`)
    .join("");
  const hint = s.hasBack
    ? `<div class="flip-hint color-${s.color}">⟳ ${esc(s._flipHint)} →</div>`
    : "";
  return `
        <div class="flip-front" style="${!s.tag ? "" : ""}">
          <div class="bar bg-${s.color}"></div>
          <div class="row-top">
            <span class="idx color-${s.color}">${esc(s.num)}</span>
            ${tagHtml}
          </div>
          <h3>${rich(s.title)}</h3>
          <p>${rich(s.desc)}</p>
          <ul class="bullets">${bullets}</ul>
          ${hint}
        </div>`;
}

function renderServiceBack(s) {
  if (!s.hasBack) return "";
  const bullets = (s.backBullets || [])
    .map((b) => `<li><span class="chev color-${s.color}">›</span><span>${rich(b)}</span></li>`)
    .join("");
  const quote = s.backQuote
    ? `<div class="quote border-${s.color}">${rich(s.backQuote)}</div>`
    : "";
  return `
        <div class="flip-back border-${s.color}">
          <img src="/assets/img/${path.basename(s.backImg)}" alt="${esc(s.backAlt)}" loading="lazy">
          <div class="scrim"></div>
          <div class="content">
            <span class="cat bg-${s.color}">${esc(s.backCat)}</span>
            <div class="body">
              <ul class="bullets">${bullets}</ul>
              ${quote}
              <div class="loc"><span class="color-${s.color}">◆</span>${esc(s.backLoc)}</div>
              <div class="title">${rich(s.backTitle)}</div>
              <div>
                <div class="result-rule"></div>
                <div class="result-lbl">Resultado</div>
                <div class="result-val">${rich(s.backResult)}</div>
              </div>
            </div>
          </div>
        </div>`;
}

function renderServices(svc) {
  return svc.items
    .map((s, i) => {
      s._flipHint = svc.flipHint;
      const cardClass = "svc-card rv" + (s.hasBack ? " can-flip" : "");
      return `
      <div class="${cardClass}">
        <div class="flip-inner">${renderServiceFront(s, i)}${renderServiceBack(s)}
        </div>
      </div>`;
    })
    .join("");
}

function renderNosotros(items) {
  return items
    .map(
      (n) => `
          <div class="nos-item">
            <div class="num">${esc(n.num)}</div>
            <div>
              <h3>${rich(n.title)}</h3>
              <p>${rich(n.desc)}</p>
              <div class="nos-tags">${n.tags.map((t) => `<span>${rich(t)}</span>`).join("")}</div>
            </div>
          </div>`
    )
    .join("");
}

function renderStatsGrid(items) {
  const sizeBig = "clamp(34px,3.4vw,50px)";
  const sizeSmall = "clamp(22px,2vw,30px)";
  return items
    .map((s, i) => {
      const size = i === items.length - 1 ? sizeSmall : sizeBig;
      return `
        <div class="cell">
          <div class="val" style="font-size:${size}">${esc(s.value)}</div>
          <div class="lbl">${esc(s.label)}</div>
          <div class="sub">${esc(s.sub)}</div>
        </div>`;
    })
    .join("");
}

function renderTypeOptions(opts) {
  return opts.map((o) => `<option>${esc(o)}</option>`).join("");
}

function jsonLd(c, lang) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ElectricalUtility",
    "name": c.business.legalName,
    "alternateName": "Octava Ingeniería",
    "description": c.meta.description,
    "url": SITE_URL + (lang.urlPath === "/" ? "/" : lang.urlPath),
    "telephone": "+" + c.contactInfo.phoneWa,
    "email": c.contactInfo.email,
    "taxID": c.business.nit,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle 42C #88-64",
      "addressLocality": "Medellín",
      "addressRegion": "Antioquia",
      "addressCountry": "CO"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 6.2442, "longitude": -75.5812 },
    "areaServed": "CO",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "09:00", "closes": "13:00" }
    ],
    "sameAs": ["https://wa.me/" + c.contactInfo.phoneWa]
  };
  return JSON.stringify(data, null, 2);
}

function renderPage(c, lang, langs) {
  const other = langs.find((l) => l.code !== lang.code);
  const alt = { es: langs.find((l) => l.code === "es"), en: langs.find((l) => l.code === "en") };

  return `<!DOCTYPE html>
<html lang="${c.meta.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.meta.title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<meta name="keywords" content="${esc(c.meta.keywords)}">
<meta name="robots" content="index, follow">
<meta name="author" content="${esc(c.business.legalName)}">
<link rel="canonical" href="${SITE_URL}${lang.urlPath}">
<link rel="alternate" hreflang="es" href="${SITE_URL}${alt.es.urlPath}">
<link rel="alternate" hreflang="en" href="${SITE_URL}${alt.en.urlPath}">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}${alt.es.urlPath}">

<meta property="og:type" content="website">
<meta property="og:locale" content="${lang.code === "es" ? "es_CO" : "en_US"}">
<meta property="og:title" content="${esc(c.meta.ogTitle)}">
<meta property="og:description" content="${esc(c.meta.ogDescription)}">
<meta property="og:url" content="${SITE_URL}${lang.urlPath}">
<meta property="og:site_name" content="${esc(c.business.legalName)}">
<meta property="og:image" content="${SITE_URL}/assets/img/hero.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(c.meta.ogTitle)}">
<meta name="twitter:description" content="${esc(c.meta.ogDescription)}">
<meta name="twitter:image" content="${SITE_URL}/assets/img/hero.jpg">

<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230F1923'/%3E%3Cpath d='M2 16 L8 16 L11 8 L16 24 L19 16 L30 16' stroke='%23E8A020' stroke-width='2.5' fill='none' stroke-linecap='square'/%3E%3C/svg%3E">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">

<script type="application/ld+json">
${jsonLd(c, lang)}
</script>
</head>
<body>
<a class="skip-link" href="#main">${esc(c.skipLink)}</a>

<header class="site-nav">
  <div class="nav-row">
    <a href="${lang.urlPath}" class="nav-logo" aria-label="${esc(c.business.legalName)}">
      <img src="/assets/img/logo-blanco.png" alt="${esc(c.business.legalName)}" width="175" height="56">
    </a>
    <nav class="nav-links" aria-label="${lang.code === "es" ? "Navegación principal" : "Main navigation"}">
      <a class="nl" href="#servicios">${rich(c.nav.servicios)}</a>
      <a class="nl" href="#nosotros">${rich(c.nav.nosotros)}</a>
      <a class="nl" href="#contacto">${rich(c.nav.contacto)}</a>
    </nav>
    <div style="display:flex;align-items:center;gap:14px">
      <a class="lang-switch" href="${c.langSwitch.href}" hreflang="${other.code}">${esc(c.langSwitch.code)}</a>
      <a href="#contacto" class="btn btn-amber nav-cta btn-bulb">${rich(c.nav.cta)}</a>
      <button type="button" class="burger r-burger" data-burger aria-label="${esc(c.nav.openMenu)}" aria-expanded="false">☰</button>
    </div>
  </div>
  <nav class="mobile-menu" data-mobile-menu aria-label="${lang.code === "es" ? "Menú móvil" : "Mobile menu"}">
    <a href="#servicios">${rich(c.nav.servicios)}</a>
    <a href="#nosotros">${rich(c.nav.nosotros)}</a>
    <a href="#contacto">${rich(c.nav.contacto)}</a>
    <a class="mm-lang" href="${c.langSwitch.href}">${esc(c.langSwitch.code)}</a>
  </nav>
</header>

<main id="main">

  <!-- HERO -->
  <section class="hero" id="inicio" aria-label="Hero">
    <div class="hero-grid-bg"></div>
    <div class="wrap">
      <div class="hero-inner">
        <div>
          <div class="hero-in d1 hero-eyebrow glass"><span class="dot"></span>${rich(c.hero.eyebrow)}</div>
          <h1 class="hero-in d2">${rich(c.hero.titleLine)} <span class="accent">${rich(c.hero.titleAccent)}</span></h1>
          <p class="hero-sub hero-in d3">${rich(c.hero.subtitle)}</p>
          <div class="hero-ctas hero-in d4">
            <a href="#contacto" class="btn btn-amber btn-bulb">${rich(c.hero.ctaPrimary)} →</a>
            <a href="https://wa.me/${c.contactInfo.phoneWa}" target="_blank" rel="noopener" class="btn btn-outline btn-battery">${rich(c.hero.ctaWhatsapp)}</a>
          </div>
          <div class="hero-figures hero-in d5">${renderHeroFigures(c.hero.stats)}</div>
        </div>
        <div class="hero-photo">
          <div class="hero-photo-frame">
            <img id="heroImg" src="/assets/img/hero.jpg" alt="${esc(c.hero.imageAlt)}" width="960" height="1200">
          </div>
          <div class="hero-badge glass hero-in d5">
            <div class="lbl">${rich(c.hero.cardLabel)}</div>
            <div class="divider"></div>
            <div class="val">${esc(c.hero.cardValue)}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICIOS -->
  <section id="servicios" class="section" aria-label="${lang.code === "es" ? "Servicios" : "Services"}">
    <div class="section-inner">
      <div class="svc-head rv">
        <div class="copy">
          <div class="eyebrow">${rich(c.services.eyebrow)}</div>
          <h2 class="h2">${rich(c.services.title)}</h2>
          <p class="lead">${rich(c.services.subtitle)}</p>
        </div>
        <div class="svc-stats">${renderStatRow(c.services.statRow)}</div>
      </div>
      <div class="svc-grid r-svc">${renderServices(c.services)}</div>
    </div>
  </section>

  <!-- NOSOTROS -->
  <section id="nosotros" class="section" aria-label="${lang.code === "es" ? "Nosotros" : "About"}">
    <div class="section-inner nos-grid rv">
      <div class="nos-photo">
        <img src="/assets/img/about.jpg" alt="${esc(c.nosotros.imageAlt)}" width="900" height="1125" loading="lazy">
      </div>
      <div>
        <div class="eyebrow">${rich(c.nosotros.eyebrow)}</div>
        <h2 class="nos-title">${rich(c.nosotros.title)}</h2>
        <div class="nos-items">${renderNosotros(c.nosotros.items)}</div>
      </div>
    </div>
  </section>

  <!-- STATS -->
  <section class="section section-alt" aria-label="${lang.code === "es" ? "Estadísticas" : "Statistics"}">
    <div class="section-inner" style="padding-top:80px;padding-bottom:80px">
      <div class="eyebrow stats-eyebrow">${rich(c.stats.eyebrow)}</div>
      <div class="stats-grid rv">${renderStatsGrid(c.stats.items)}</div>
    </div>
  </section>

  <!-- CONTACTO -->
  <section id="contacto" class="section" aria-label="${lang.code === "es" ? "Contacto" : "Contact"}">
    <div class="section-inner contact-grid rv">
      <div>
        <div class="eyebrow">${rich(c.contact.eyebrow)}</div>
        <h2 class="h2">${rich(c.contact.title)}</h2>
        <p class="lead">${rich(c.contact.subtitle)}</p>

        <a href="https://wa.me/${c.contactInfo.phoneWa}" target="_blank" rel="noopener" class="wa-cta btn-battery bb-green">
          <span class="lbl">${rich(c.contact.whatsappLabel)}</span>
          <span class="cta">${rich(c.contact.whatsappCta)} →</span>
        </a>

        <div class="contact-links">
          <a href="mailto:${c.contactInfo.email}">
            <span class="lbl">${rich(c.contact.emailLabel)}</span>
            <span class="val">${esc(c.contactInfo.email)}</span>
          </a>
          <a href="tel:+${c.contactInfo.phoneWa}">
            <span class="lbl">WhatsApp / ${esc(c.contactInfo.phoneDisplay)}</span>
            <span class="val">${esc(c.contactInfo.phoneDisplay)}</span>
          </a>
        </div>

        <div class="contact-meta">
          <div class="row"><span class="lbl">${rich(c.contactInfo.addressLabel)}</span><span>${esc(c.contactInfo.address)}</span></div>
          <div class="row"><span class="lbl">${rich(c.contactInfo.hoursLabel)}</span><span>${esc(c.contactInfo.hours)}</span></div>
        </div>
      </div>

      <div class="contact-form">
        <div class="title">${rich(c.contact.formTitle)}</div>
        <div class="sub">${rich(c.contact.formSub)}</div>
        <form
          name="contacto"
          method="POST"
          data-netlify="true"
          netlify-honeypot="empresa"
          action="${lang.code === "es" ? "/gracias.html" : "/en/thank-you.html"}"
          data-contact-form
          data-sending-label="${esc(c.contact.form.sending)}"
          data-success-message="${esc(c.contact.form.success)}"
          data-error-message="${esc(c.contact.form.error)}"
        >
          <input type="hidden" name="form-name" value="contacto">
          <input type="hidden" name="idioma" value="${c.meta.lang}">
          <p class="hp-field"><label>No llenar / Do not fill<input name="empresa" tabindex="-1" autocomplete="off"></label></p>
          <div class="form-row2">
            <label class="field">
              <span>${rich(c.contact.form.name)}</span>
              <input type="text" name="nombre" required placeholder="${esc(c.contact.form.namePlaceholder)}">
            </label>
            <label class="field">
              <span>${rich(c.contact.form.phone)}</span>
              <input type="tel" name="telefono" required placeholder="${esc(c.contact.form.phonePlaceholder)}">
            </label>
          </div>
          <label class="field">
            <span>${rich(c.contact.form.email)}</span>
            <input type="email" name="correo" required placeholder="${esc(c.contact.form.emailPlaceholder)}">
          </label>
          <label class="field">
            <span>${rich(c.contact.form.type)}</span>
            <select name="tipo_proyecto">${renderTypeOptions(c.contact.form.typeOptions)}</select>
          </label>
          <label class="field">
            <span>${rich(c.contact.form.message)}</span>
            <textarea rows="3" name="mensaje" placeholder="${esc(c.contact.form.messagePlaceholder)}"></textarea>
          </label>
          <button type="submit" class="form-submit btn-bulb">${rich(c.contact.form.submit)} →</button>
          <p class="form-note" data-form-note role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>
  </section>

</main>

<!-- FOOTER -->
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="/assets/img/logo-blanco.png" alt="${esc(c.business.legalName)}" width="220" height="72">
        <p>${rich(c.footer.slogan)}</p>
      </div>
      <div class="footer-col">
        <h4>${rich(c.footer.navTitle)}</h4>
        <div class="links">
          <a href="#servicios">${rich(c.nav.servicios)}</a>
          <a href="#nosotros">${rich(c.nav.nosotros)}</a>
          <a href="#contacto">${rich(c.nav.contacto)}</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>${rich(c.footer.contactTitle)}</h4>
        <div class="links">
          <a href="https://wa.me/${c.contactInfo.phoneWa}" target="_blank" rel="noopener">WhatsApp</a>
          <a href="mailto:${c.contactInfo.email}">${esc(c.contactInfo.email)}</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>${rich(c.footer.socialTitle)}</h4>
        <div class="footer-social">
          <a href="https://wa.me/${c.contactInfo.phoneWa}" target="_blank" rel="noopener" aria-label="WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm0 18.03h-.01a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 0 1-1.26-4.33c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.8.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.09 0 1.23.9 2.42 1.02 2.59.12.17 1.77 2.71 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(c.footer.rightsLine)}</span>
      <span>${esc(c.footer.locationLine)}</span>
    </div>
  </div>
</footer>

<a href="https://wa.me/${c.contactInfo.phoneWa}" target="_blank" rel="noopener" class="wa-float" aria-label="${esc(c.waFloatLabel)}">
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2zm0 18.03h-.01a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.14.82.84-3.06-.2-.32a8.2 8.2 0 0 1-1.26-4.33c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.24 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.65.81-.8.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.09 0 1.23.9 2.42 1.02 2.59.12.17 1.77 2.71 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>
  <span>${esc(c.waFloatLabel)}</span>
</a>

<script src="/assets/js/main.js"></script>
</body>
</html>
`;
}

function build() {
  const contents = {};
  for (const l of LANGS) {
    contents[l.code] = readJSON(path.join(ROOT, "content", l.jsonFile));
  }

  for (const l of LANGS) {
    const html = renderPage(contents[l.code], l, LANGS);
    const outPath = path.join(ROOT, l.outFile);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, "utf8");
    console.log("Wrote " + l.outFile);
  }
}

build();
