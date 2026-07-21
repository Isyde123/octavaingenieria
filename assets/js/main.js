(function () {
  "use strict";

  document.documentElement.classList.add("anim-ready");

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector("[data-burger]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.textContent = open ? "✕" : "☰";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        burger.textContent = "☰";
      });
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
  var heroImg = document.getElementById("heroImg");
  if (heroImg) {
    window.addEventListener(
      "scroll",
      function () {
        var y = Math.min(window.scrollY, 900);
        heroImg.style.transform = "translateY(" + y * 0.07 + "px) scale(1.1)";
      },
      { passive: true }
    );
  }

  /* ---------- flip cards (tap-to-flip for touch) ---------- */
  document.querySelectorAll(".svc-card.can-flip").forEach(function (card) {
    card.addEventListener("click", function () {
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
        .then(function () {
          form.reset();
          if (note) { note.textContent = successMsg; note.classList.add("ok"); }
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
