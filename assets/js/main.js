(function () {
  "use strict";

  document.documentElement.classList.add("anim-ready");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector("[data-burger]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (burger && mobileMenu) {
    var setMenu = function (open) {
      mobileMenu.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.textContent = open ? "✕" : "☰";
    };
    burger.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("open"));
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    // Salidas claras: tecla Esc o tocar fuera del menú
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) { setMenu(false); burger.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (mobileMenu.classList.contains("open") && !mobileMenu.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- encabezado: línea inferior solo cuando hay contenido debajo ---------- */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    var updateNav = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  /* ---------- sección actual resaltada en el menú ---------- */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');
  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          navLinks.forEach(function (a) {
            var current = a.getAttribute("href") === id;
            a.classList.toggle("is-current", current);
            if (current) { a.setAttribute("aria-current", "location"); } else { a.removeAttribute("aria-current"); }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["servicios", "nosotros", "contacto"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionIo.observe(el);
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- hero parallax ---------- */
  // Sincronizado con el refresco de pantalla y desactivado si la persona pidió menos movimiento
  var heroImg = document.getElementById("heroImg");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 900);
          heroImg.style.transform = "translate3d(0," + (y * 0.07).toFixed(1) + "px,0) scale(1.1)";
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- flip cards (tap-to-flip for touch) ---------- */
  document.querySelectorAll(".svc-card.can-flip").forEach(function (card) {
    // Con mouse la tarjeta gira al pasar por encima (CSS); el clic solo la gira en pantallas táctiles
    card.addEventListener("click", function () {
      if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      card.classList.toggle("flipped");
    });
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  });

  /* ---------- aviso de cookies ----------
     Analytics solo se carga si el visitante acepta (ver analyticsSnippet en scripts/build.js). */
  var CONSENT_KEY = "octava_cookie_consent";
  function getConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }
  function clearGaCookies() {
    var host = location.hostname;
    var domains = ["", "; domain=" + host, "; domain=." + host.replace(/^www\./, "")];
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") === 0) {
        domains.forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }

  var banner = document.querySelector("[data-cookie-banner]");
  if (banner) {
    var acceptBtn = banner.querySelector("[data-cookie-accept]");
    var rejectBtn = banner.querySelector("[data-cookie-reject]");
    if (!getConsent()) banner.hidden = false;

    acceptBtn.addEventListener("click", function () {
      setConsent("granted");
      if (typeof window.octavaConsent === "function") window.octavaConsent("granted");
      banner.hidden = true;
    });
    rejectBtn.addEventListener("click", function () {
      setConsent("denied");
      if (typeof window.octavaConsent === "function") window.octavaConsent("denied");
      clearGaCookies();
      banner.hidden = true;
    });
    document.querySelectorAll("[data-cookie-settings]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        banner.hidden = false;
        acceptBtn.focus();
      });
    });
  }

  /* ---------- Google Analytics 4: eventos de contacto ----------
     Solo se envían si el visitante aceptó las cookies analíticas. */
  function track(name, params) {
    if (!window.octavaGaActive) return;
    var tags = window.octavaTags || {};
    // Etiqueta directa de Google Analytics (gtag.js)
    if (tags.ga && typeof window.gtag === "function") { window.gtag("event", name, params || {}); }
    // Google Tag Manager: evento personalizado para usar como activador
    if (tags.gtm && window.dataLayer) {
      var data = { event: name };
      for (var k in params || {}) { data[k] = params[k]; }
      window.dataLayer.push(data);
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("wa.me/") !== -1) {
      track("click_whatsapp");
    } else if (href.indexOf("mailto:") === 0) {
      track("click_email");
    }
  });

  /* ---------- contact form (Netlify Forms, AJAX submit) ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var submitBtn = form.querySelector("[type=submit]");
    var note = form.querySelector("[data-form-note]");
    var submitLabel = submitBtn ? submitBtn.textContent : "";
    var sendingLabel = form.getAttribute("data-sending-label") || submitLabel;
    var successMsg = form.getAttribute("data-success-message") || "Thank you.";
    var errorMsg = form.getAttribute("data-error-message") || "Something went wrong.";

    function encode(data) {
      return Object.keys(data)
        .map(function (key) { return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]); })
        .join("&");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = sendingLabel; }
      if (note) { note.textContent = ""; note.className = ""; note.classList.add("form-note"); }

      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) { payload[key] = value; });

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(payload)
      })
        .then(function (res) {
          // Netlify puede responder con error (p. ej. 404 si no detectó el formulario):
          // en ese caso no se borra lo escrito y se muestra el mensaje de error.
          if (!res || !res.ok) { throw new Error("HTTP " + (res ? res.status : "?")); }
          form.reset();
          if (note) { note.textContent = successMsg; note.classList.add("ok"); }
          track("generate_lead", { form_name: "contacto", language: document.documentElement.lang });
        })
        .catch(function () {
          if (note) { note.textContent = errorMsg; note.classList.add("err"); }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
        });
    });
  }
})();
