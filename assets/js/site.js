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

  function bindLanguageMenus(root) {
    var menus = root.querySelectorAll(".language-menu");
    if (!menus.length) return;
    root.addEventListener("click", function (event) { menus.forEach(function (menu) { if (!menu.contains(event.target)) menu.removeAttribute("open"); }); });
    root.addEventListener("keydown", function (event) { if (event.key !== "Escape") return; menus.forEach(function (menu) { if (!menu.open) return; menu.removeAttribute("open"); var summary = menu.querySelector("summary"); if (summary) summary.focus(); }); });
  }
  bindLanguageMenus(document);

  /* Başlık decode efekti: harfler Morse sembollerinden çözülür */
  var SYMS = ["•", "—", "•", "—", "·"];

  function buildDecode(el) {
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
    el.__spans = spans;
  }

  function runDecode(el) {
    if (reduceMotion || !el.__spans) return;
    el.__spans.forEach(function (s, i) {
      if (s.__iv) clearInterval(s.__iv);
      var finalCh = s.getAttribute("data-final") || s.textContent;
      s.setAttribute("data-final", finalCh);
      var ticks = 0;
      var maxTicks = 3 + Math.floor(i * 0.9);
      s.textContent = SYMS[i % SYMS.length];
      s.classList.add("raw");
      s.__iv = setInterval(function () {
        ticks++;
        if (ticks >= maxTicks) {
          clearInterval(s.__iv);
          s.__iv = null;
          s.textContent = finalCh;
          s.classList.remove("raw");
        } else {
          s.textContent = SYMS[(Math.random() * SYMS.length) | 0];
        }
      }, 70);
    });
  }

  document.querySelectorAll(".decode").forEach(function (el) {
    buildDecode(el);
    runDecode(el);
  });

  /* PRESS START: sinyal patlaması + başlığı yeniden çöz */
  var pressStart = document.querySelector(".press-start");
  if (pressStart) {
    pressStart.addEventListener("click", function () {
      var h1 = document.querySelector("h1.decode");
      if (h1) runDecode(h1);
      if (!reduceMotion) {
        document.body.classList.add("burst");
        if (window.__signalBurst) window.__signalBurst();
        setTimeout(function () { document.body.classList.remove("burst"); }, 1800);
      }
    });
  }

  /* ??? kartı easter egg: şifre çözme denemesi -> ERİŞİM REDDEDİLDİ */
  var eggCard = document.querySelector(".app-card.future");
  if (eggCard) {
    var eggTitle = eggCard.querySelector("h3");
    var eggBusy = false;
    eggCard.setAttribute("role", "button");
    eggCard.setAttribute("tabindex", "0");
    if (eggCard.getAttribute("data-egg-hint")) {
      eggCard.setAttribute("aria-label", eggCard.getAttribute("data-egg-hint"));
    }

    function tryDecrypt() {
      if (eggBusy || !eggTitle) return;
      eggBusy = true;
      var original = "???";
      var denied = eggCard.getAttribute("data-egg-fail") || "ERİŞİM REDDEDİLDİ";
      eggCard.classList.add("denied");

      if (reduceMotion) {
        eggTitle.textContent = denied;
        setTimeout(function () {
          eggTitle.textContent = original;
          eggCard.classList.remove("denied");
          eggBusy = false;
        }, 1600);
        return;
      }

      var ticks = 0;
      var iv = setInterval(function () {
        ticks++;
        var scramble = "";
        for (var i = 0; i < denied.length; i++) {
          scramble += SYMS[(Math.random() * SYMS.length) | 0];
        }
        eggTitle.textContent = scramble;
        if (ticks >= 12) {
          clearInterval(iv);
          eggTitle.textContent = denied;
          setTimeout(function () {
            eggTitle.textContent = original;
            eggCard.classList.remove("denied");
            eggBusy = false;
          }, 1800);
        }
      }, 80);
    }

    eggCard.addEventListener("click", tryDecrypt);
    eggCard.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tryDecrypt(); }
    });
  }

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

/* --- Reklam raylari ---------------------------------------------------
   Genis ekranlarda (>=1760px) sag ve sol raya, ekran yuksekligine gore
   sigabildigi kadar yuva dizer. Ustte 300x600 (uzun), alti 300x250.
   Her yuvanin kimligi sayfaya ozel: "<sayfa>-<taraf>-<sira>".
   Boylece her sayfaya ve her yuvaya ayri reklam baglanabilir. */
(function () {
  var rails = document.querySelectorAll(".ad-rail .ad-rail-sticky");
  if (!rails.length) return;

  var slug = location.pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";

  /* Sayfadaki mevcut etiket metnini koru (TR/EN/AR... hangisiyse) */
  var firstTag = document.querySelector(".ad-slot .ad-slot-tag");
  var tagText = firstTag ? firstTag.textContent : "Reklam Alanı";

  function sideOf(rail) {
    var aside = rail.closest(".ad-rail");
    return aside && aside.classList.contains("ad-rail-right") ? "right" : "left";
  }

  function makeSlot(h, id) {
    var d = document.createElement("div");
    d.className = "ad-slot" + (h === 600 ? " ad-slot--tall" : "");
    d.setAttribute("data-ad-slot", id);
    var tag = document.createElement("span");
    tag.className = "ad-slot-tag";
    tag.textContent = tagText;
    var dim = document.createElement("span");
    dim.className = "ad-slot-dim";
    dim.textContent = "300 × " + h;
    d.appendChild(tag);
    d.appendChild(dim);
    return d;
  }

  /* Sabit duzen: her rayda ust uste iki 300x600.
     Sayfanin ustune yerlesir, kaydirinca icerikle birlikte akar. */
  var HEIGHTS = [600, 600];

  function fill() {
    rails.forEach(function (rail) {
      if (rail.getAttribute("data-ad-plan")) return;
      rail.setAttribute("data-ad-plan", HEIGHTS.join(","));
      rail.classList.add("ad-rail-filled");
      var side = sideOf(rail);
      rail.textContent = "";
      HEIGHTS.forEach(function (hh, i) {
        rail.appendChild(makeSlot(hh, slug + "-" + side + "-" + (i + 1)));
      });
    });
  }

  fill();
})();
