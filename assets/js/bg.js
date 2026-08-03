/* TroyApps — bg.js : arka planda süzülen Morse ışık akışları + imleç ışığı */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("bg-signal");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var trails = [];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Bir "akış": ekranda soldan sağa süzülen nokta/çizgi dizisi */
  function makeTrail(randY) {
    var speed = 0.25 + Math.random() * 0.6;
    var pattern = [];
    var n = 6 + Math.floor(Math.random() * 8);
    for (var i = 0; i < n; i++) pattern.push(Math.random() > 0.55);
    return {
      x: randY ? Math.random() * W : -240,
      y: Math.random() * H,
      speed: speed,
      size: 1.5 + Math.random() * 1.6,
      alpha: 0.05 + Math.random() * 0.12,
      cyan: Math.random() > 0.5,
      pattern: pattern
    };
  }

  function drawTrail(t) {
    var x = t.x;
    ctx.fillStyle = t.cyan
      ? "rgba(46,230,255," + t.alpha + ")"
      : "rgba(47,125,255," + t.alpha + ")";
    for (var i = 0; i < t.pattern.length; i++) {
      var isDash = t.pattern[i];
      var w = isDash ? t.size * 7 : t.size * 1.6;
      var h = t.size;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, t.y, w, h, h / 2);
      else ctx.rect(x, t.y, w, h);
      ctx.fill();
      x += w + t.size * 4;
    }
    t.w = x - t.x;
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < trails.length; i++) {
      var t = trails[i];
      t.x += t.speed;
      drawTrail(t);
      if (t.x > W + 40) {
        trails[i] = makeTrail(false);
        trails[i].y = Math.random() * H;
      }
    }
    requestAnimationFrame(frame);
  }

  resize();
  var count = Math.max(10, Math.min(22, Math.floor(W / 80)));
  for (var i = 0; i < count; i++) trails.push(makeTrail(true));

  window.addEventListener("resize", function () { resize(); });

  if (reduceMotion) {
    /* Hareket azaltılmışsa tek kare statik doku çiz */
    for (var j = 0; j < trails.length; j++) drawTrail(trails[j]);
  } else {
    requestAnimationFrame(frame);
  }

  /* İmleç ışığı */
  var glow = document.getElementById("cursor-glow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var gx = W / 2, gy = H / 3, tx = gx, ty = gy;
    document.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function glowFrame() {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      glow.style.transform = "translate(" + gx + "px," + gy + "px)";
      requestAnimationFrame(glowFrame);
    })();
  }
})();
