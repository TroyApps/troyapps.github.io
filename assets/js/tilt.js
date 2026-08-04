/* TroyApps — tilt.js : kartlarda 3D eğilme efekti (kütüphanesiz)
   Yalnız hassas işaretçili cihazlarda; prefers-reduced-motion'da kapalı. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion || !finePointer) return;

  var MAX_DEG = 7;
  var els = document.querySelectorAll(".app-card, .phone, .gallery-grid figure, .code-card");

  els.forEach(function (el) {
    var rect = null;
    var raf = null;
    var pending = null;

    function apply(e) {
      raf = null;
      if (!rect) rect = el.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var ry = (px - 0.5) * 2 * MAX_DEG;   /* sağ-sol */
      var rx = (0.5 - py) * 2 * MAX_DEG;   /* yukarı-aşağı */
      el.style.transform =
        "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-3px)";
    }

    el.addEventListener("pointerenter", function () {
      rect = el.getBoundingClientRect();
      el.style.transition = "transform 0.08s ease-out";
      el.style.willChange = "transform";
    });

    el.addEventListener("pointermove", function (e) {
      pending = e;
      if (!raf) raf = requestAnimationFrame(function () { apply(pending); });
    });

    el.addEventListener("pointerleave", function () {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      rect = null;
      el.style.transition = "transform 0.35s ease";
      el.style.transform = "";
      el.style.willChange = "";
    });
  });
})();
