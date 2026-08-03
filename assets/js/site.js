/* TroyApps — site.js : menü + görünüm animasyonları */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobil menü */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Başlık decode efekti: harfler Morse sembollerinden çözülür */
  var decodeEls = document.querySelectorAll(".decode");
  decodeEls.forEach(function (el) {
    var text = el.getAttribute("data-text") || el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var inner = document.createElement("span");
    inner.setAttribute("aria-hidden", "true");
    el.appendChild(inner);

    var spans = [];
    text.split(" ").forEach(function (word, wi, arr) {
      var w = document.createElement("span");
      w.className = "word";
      word.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = ch;
        w.appendChild(s);
        spans.push(s);
      });
      inner.appendChild(w);
      if (wi < arr.length - 1) inner.appendChild(document.createTextNode(" "));
    });

    if (reduceMotion) return;

    var SYMS = ["•", "—", "•", "—", "·"];
    spans.forEach(function (s, i) {
      var finalCh = s.textContent;
      var ticks = 0;
      var maxTicks = 3 + Math.floor(i * 0.9);
      s.textContent = SYMS[i % SYMS.length];
      s.classList.add("raw");
      var iv = setInterval(function () {
        ticks++;
        if (ticks >= maxTicks) {
          clearInterval(iv);
          s.textContent = finalCh;
          s.classList.remove("raw");
        } else {
          s.textContent = SYMS[(Math.random() * SYMS.length) | 0];
        }
      }, 70);
    });
  });

  /* Kaydırınca beliren bölümler */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }
})();
