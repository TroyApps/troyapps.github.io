/* TroyApps — site.js
   Ust menu vurgusu, ikon -> acilir gorsel seridi, buyume yonu,
   buyuk gorunum (lightbox), e-posta kopyala. Kutuphane yok. */
(function () {
  "use strict";

  /* Ust logo + menu vurgusu */
  var pills = [].slice.call(document.querySelectorAll(".pill a[data-nav]"));
  var indexLinks = [].slice.call(document.querySelectorAll(".index a[data-for]"));

  function setNav(id) {
    pills.forEach(function (a) { a.classList.toggle("on", a.dataset.nav === id); });
    indexLinks.forEach(function (a) { a.classList.toggle("on", a.dataset.for === id); });
  }

  addEventListener("scroll", function () {
    document.body.classList.toggle("scrolled", scrollY > innerHeight * 0.6);
    if (scrollY < innerHeight * 0.5) setNav("top");
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setNav(e.target.dataset.index); });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-index]").forEach(function (s) { so.observe(s); });
  }

  /* Ikona tikla -> altinda gorseller acilir; tekrar tikla kapanir */
  var btns = [].slice.call(document.querySelectorAll(".app-btn"));
  var panels = [].slice.call(document.querySelectorAll(".panel"));

  function setApp(id) {
    btns.forEach(function (b) {
      var on = b.dataset.app === id;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", String(on));
      var tap = b.querySelector(".tap");
      if (tap) tap.textContent = on ? (b.dataset.openText || "") : (b.dataset.closedText || "");
    });
    panels.forEach(function (p) { p.classList.toggle("open", p.dataset.panel === id); });
    if (id) {
      var p = document.querySelector('.panel[data-panel="' + id + '"]');
      if (p) setTimeout(function () { p.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 320);
    }
  }
  btns.forEach(function (b) {
    b.addEventListener("click", function () { setApp(b.classList.contains("on") ? null : b.dataset.app); });
  });
  /* /#morse-flash veya /#airmousehand ile gelen dogrudan acar */
  var hashApp = (location.hash || "").replace("#", "");
  if (hashApp && document.querySelector('.app-btn[data-app="' + hashApp + '"]')) setApp(hashApp);

  /* Buyume ekran disina tasmasin: kenardakiler kenardan buyur */
  var thumbs = [].slice.call(document.querySelectorAll(".thumb"));
  thumbs.forEach(function (t) {
    t.tabIndex = 0;
    t.addEventListener("mouseenter", function () {
      var r = t.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
      var ox = r.left < vw * 0.22 ? "left" : (r.right > vw * 0.78 ? "right" : "center");
      var oy = r.top < vh * 0.3 ? "top" : (r.bottom > vh * 0.78 ? "bottom" : "center");
      t.style.transformOrigin = ox + " " + oy;
    });
  });

  /* Tiklayinca buyuk gorunum + ok tuslari */
  var lb = document.getElementById("lb");
  if (lb) {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".cap");
    var group = [], at = 0;
    function show(i) {
      at = (i + group.length) % group.length;
      var t = group[at], img = t.querySelector("img");
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = t.dataset.cap || "";
    }
    function open(t) {
      group = [].slice.call(t.parentElement.querySelectorAll(".thumb"));
      show(group.indexOf(t));
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".close").focus();
    }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () { open(t); });
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(t); } });
    });
    lb.querySelector(".prev").addEventListener("click", function () { show(at - 1); });
    lb.querySelector(".next").addEventListener("click", function () { show(at + 1); });
    lb.querySelector(".close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
  }

  /* E-posta kopyala */
  var copyBtn = document.querySelector(".copy");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.dataset.copy, old = copyBtn.textContent;
      var p = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject();
      p.then(function () { copyBtn.textContent = copyBtn.dataset.done || "✓"; }, function () { copyBtn.textContent = text; });
      setTimeout(function () { copyBtn.textContent = old; }, 1600);
    });
  }
})();
