/* TroyApps — mascot.js : "Bit" — sitede yaşayan piksel yaratık.
   Gezer, sıkılır, kartları yer, uzanır; tıklayınca geri kusar ve özür diler.
   Kütüphanesiz. prefers-reduced-motion açıksa hiç doğmaz. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var TR = document.documentElement.lang === "tr";
  var SAY = {
    sorry: TR ? ["pardon... geri verdim :(", "özür dilerim başkan", "bi daha yemem söz"]
              : ["sorry... gave them back :(", "my bad, boss", "won't eat them again, promise"],
    idle: TR ? ["...", "sinyal var mı?", "sıkıldım", "beep boop", "ışık güzelmiş"]
             : ["...", "any signal?", "so bored", "beep boop", "nice light here"],
    yum: TR ? ["nom nom", "mmm piksel", "lezizmiş"] : ["nom nom", "mmm pixels", "tasty"],
    zzz: "z z z"
  };

  /* ---------- DOM ---------- */

  var el = document.createElement("div");
  el.id = "mascot";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    '<div class="m-bubble" hidden></div>' +
    '<div class="m-tongue" hidden></div>' +
    '<div class="m-scale">' +
    '<svg class="m-body" viewBox="0 0 32 24" width="64" height="48">' +
      '<g class="m-blob">' +
        '<rect class="m-skin" x="6" y="6" width="20" height="14"/>' +
        '<rect class="m-skin" x="4" y="8" width="2" height="10"/>' +
        '<rect class="m-skin" x="26" y="8" width="2" height="10"/>' +
        '<rect class="m-skin" x="8" y="4" width="16" height="2"/>' +
        '<rect class="m-skin-hi" x="6" y="6" width="20" height="2"/>' +
        '<rect class="m-skin-dk" x="8" y="20" width="4" height="2"/>' +
        '<rect class="m-skin-dk" x="20" y="20" width="4" height="2"/>' +
        '<g class="m-eye-open">' +
          '<rect x="11" y="9" width="4" height="5" fill="#04120b"/>' +
          '<rect x="19" y="9" width="4" height="5" fill="#04120b"/>' +
          '<rect x="12" y="10" width="2" height="2" fill="#eaffff"/>' +
          '<rect x="20" y="10" width="2" height="2" fill="#eaffff"/>' +
        '</g>' +
        '<g class="m-eye-closed" style="display:none">' +
          '<rect x="11" y="12" width="4" height="1.6" fill="#04120b"/>' +
          '<rect x="19" y="12" width="4" height="1.6" fill="#04120b"/>' +
        '</g>' +
        '<rect class="m-mouth" x="14" y="16" width="6" height="1.6" fill="#04120b"/>' +
      '</g>' +
    '</svg>' +
    '</div>';
  document.body.appendChild(el);

  var bubble = el.querySelector(".m-bubble");
  var tongue = el.querySelector(".m-tongue");
  var eyesOpen = el.querySelector(".m-eye-open");
  var eyesClosed = el.querySelector(".m-eye-closed");
  var mouth = el.querySelector(".m-mouth");
  var blob = el.querySelector(".m-blob");

  var W = 64;
  var x = Math.min(window.innerWidth * 0.3, 300);
  var dir = 1;
  var belly = [];      /* yenen kartlar: {card, tag} */
  var interrupted = false;
  var sleeping = false;

  el.style.left = x + "px";

  function px(v) { return v + "px"; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function sleep(ms) {
    return new Promise(function (r) {
      var t0 = performance.now();
      setTimeout(function tick() {
        if (interrupted || performance.now() - t0 >= ms) return r();
        setTimeout(tick, 80);
      }, 0);
    });
  }

  function say(text, ms) {
    bubble.textContent = text;
    bubble.hidden = false;
    clearTimeout(say.t);
    say.t = setTimeout(function () { bubble.hidden = true; }, ms || 2200);
  }

  function setEyes(open) {
    eyesOpen.style.display = open ? "" : "none";
    eyesClosed.style.display = open ? "none" : "";
  }

  function setFat() {
    /* her yemekte gözle görülür şişme: 1 → 1.22 → 1.44 → 1.66 → 1.88 */
    var s = Math.min(1 + belly.length * 0.22, 1.9);
    el.style.setProperty("--bitscale", s);
  }

  /* ---------- Hareket ---------- */

  var walkToken = 0;

  function walkTo(targetX, speed) {
    var myToken = ++walkToken; /* yeni yürüyüş eskisini iptal eder */
    return new Promise(function (resolve) {
      targetX = Math.max(8, Math.min(window.innerWidth - W - 8, targetX));
      dir = targetX > x ? 1 : -1;
      el.classList.add("m-walk");
      el.classList.toggle("m-flip", dir < 0);
      (function step() {
        if (interrupted || myToken !== walkToken) { el.classList.remove("m-walk"); return resolve(); }
        var d = targetX - x;
        if (Math.abs(d) < 5) { el.classList.remove("m-walk"); return resolve(); }
        x += Math.sign(d) * (speed || 2.2);
        el.style.left = px(x);
        setTimeout(step, 24);
      })();
    });
  }

  /* ---------- Kart yeme ---------- */

  function edibleCards() {
    var all = document.querySelectorAll(".app-card, .card");
    var out = [];
    all.forEach(function (c) {
      if (c.dataset.eaten) return;
      var r = c.getBoundingClientRect();
      if (r.top > 40 && r.bottom < window.innerHeight - 90 && r.width > 0) out.push({ c: c, r: r });
    });
    return out;
  }

  async function eatCard(item) {
    var card = item.c;
    var r = card.getBoundingClientRect();
    await walkTo(r.left + r.width / 2 - W / 2, 3);
    if (interrupted) return;

    /* dil uzat */
    var mx = x + W / 2;
    var my = window.innerHeight - 40;
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var len = Math.hypot(cx - mx, cy - my);
    var ang = Math.atan2(cy - my, cx - mx) * 180 / Math.PI;
    tongue.style.width = px(len);
    tongue.style.transform = "rotate(" + ang + "deg)";
    tongue.hidden = false;
    mouth.setAttribute("height", "5");

    /* kartı ağza çek */
    card.style.transition = "transform 0.55s ease-in, opacity 0.55s ease-in";
    card.style.transformOrigin = "center";
    card.style.transform = "translate(" + (mx - cx) + "px," + (my - cy) + "px) scale(0.05) rotate(20deg)";
    card.style.opacity = "0";
    await sleep(580);

    card.style.visibility = "hidden";
    card.dataset.eaten = "1";
    belly.push(card);
    tongue.hidden = true;
    mouth.setAttribute("height", "1.6");
    setFat();
    say(pick(SAY.yum), 1500);
    el.classList.add("m-chew");
    await sleep(900);
    el.classList.remove("m-chew");
  }

  /* ---------- Geri kusma (tıklayınca) ---------- */

  function spitAll() {
    if (!belly.length) { say(pick(SAY.idle), 1600); return; }
    interrupted = true;
    sleeping = false;
    el.classList.remove("m-lie", "m-walk");
    setEyes(true);
    el.classList.add("m-spit");
    mouth.setAttribute("height", "6");

    belly.forEach(function (card, i) {
      setTimeout(function () {
        card.style.transition = "none";
        card.style.visibility = "";
        card.style.opacity = "0";
        void card.offsetWidth;
        card.style.transition = "transform 0.5s cubic-bezier(.2,1.6,.4,1), opacity 0.4s ease";
        card.style.transform = "";
        card.style.opacity = "";
        delete card.dataset.eaten;
      }, 120 * i);
    });
    belly = [];

    setTimeout(function () {
      el.classList.remove("m-spit");
      mouth.setAttribute("height", "1.6");
      setFat();
      say(pick(SAY.sorry), 2600);
      setTimeout(function () { interrupted = false; }, 400);
    }, 700);
  }

  el.addEventListener("click", spitAll);

  /* ---------- Yaşam döngüsü ---------- */

  var stats = { wander: 0, idle: 0, eatTry: 0, eatOk: 0, lie: 0, loops: 0 };

  async function live() {
    for (;;) {
      stats.loops++;
      if (interrupted) { await delay(400); continue; }
      var roll = Math.random();

      if (roll < 0.3 && belly.length < 4) {
        /* canı sıkıldı: kart ye */
        stats.eatTry++;
        var cards = edibleCards();
        if (cards.length) { stats.eatOk++; await eatCard(pick(cards)); }
        else await sleep(700);
      } else if (roll < 0.62) {
        /* gezin (kısa mesafe, yüksek tempo) */
        stats.wander++;
        await walkTo(x + rand(-300, 300), rand(3, 4.5));
        await sleep(rand(400, 1000));
      } else if (roll < 0.82) {
        /* dur, göz kırp, saçmala */
        stats.idle++;
        setEyes(false); await sleep(160); setEyes(true);
        if (Math.random() < 0.5) say(pick(SAY.idle), 1800);
        await sleep(rand(800, 1800));
      } else {
        stats.lie++;
        /* olduğu yerde kenara uzan, zzz */
        await walkTo(x + rand(-120, 120), 3);
        if (interrupted) continue;
        sleeping = true;
        el.classList.add("m-lie");
        setEyes(false);
        say(SAY.zzz, 3500);
        await sleep(rand(3500, 5500));
        el.classList.remove("m-lie");
        setEyes(true);
        sleeping = false;
      }
      await sleep(rand(300, 900));
    }
  }

  window.addEventListener("resize", function () {
    x = Math.min(x, window.innerWidth - W - 8);
    el.style.left = px(x);
  });

  /* ---------- Bukalemun modu: altındaki panelin rengini al ---------- */

  var lastColorKey = "";

  function parseRgb(str) {
    var m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(str || "");
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  }

  function boost(c) {
    /* rengi canlandır: HSL'de doygunluğu ve parlaklığı yükselt */
    var r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2, h = 0, s = 0, d = max - min;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    s = Math.max(s, 0.85); l = 0.56;
    function f(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return {
      r: Math.round(f(p, q, h + 1 / 3) * 255),
      g: Math.round(f(p, q, h) * 255),
      b: Math.round(f(p, q, h - 1 / 3) * 255)
    };
  }

  function shade(c, k) {
    return "rgb(" + Math.min(255, Math.round(c.r * k)) + "," + Math.min(255, Math.round(c.g * k)) + "," + Math.min(255, Math.round(c.b * k)) + ")";
  }

  function sampleZoneColor() {
    if (!document.elementsFromPoint) return null;
    var cx = x + W / 2;
    var ys = [window.innerHeight - 34, window.innerHeight - 110, window.innerHeight - 190];
    for (var yi = 0; yi < ys.length; yi++) {
      var els = document.elementsFromPoint(cx, ys[yi]);
      for (var i = 0; i < els.length; i++) {
        if (el.contains(els[i])) continue;
        var t = els[i].closest && els[i].closest(
          ".app-card, .card, .morse-demo, .gallery-grid figure, .btn, .ticker, .phone, .morse-input, .app-icon-badge, .site-footer");
        if (!t) continue;
        var c = parseRgb(getComputedStyle(t).borderColor || getComputedStyle(t).borderTopColor);
        if (c && c.a > 0.05 && c.r + c.g + c.b > 40) return c;
      }
    }
    return null;
  }

  function chameleon() {
    var c = sampleZoneColor();
    if (!c) return;
    var key = c.r + "," + c.g + "," + c.b;
    if (key === lastColorKey) return;
    lastColorKey = key;
    var v = boost(c);
    el.style.setProperty("--bitc", "rgb(" + v.r + "," + v.g + "," + v.b + ")");
    el.style.setProperty("--bitc-hi", shade(v, 1.35));
    el.style.setProperty("--bitc-dk", shade(v, 0.62));
  }

  setInterval(chameleon, 350);

  /* test/debug kancası */
  window.__bit = {
    eat: function () { var c = edibleCards(); if (c.length) return eatCard(pick(c)); },
    spit: spitAll,
    belly: function () { return belly.length; },
    stats: function () { return stats; },
    walk: function (tx) { return walkTo(tx, 6); },
    color: function () { return el.style.getPropertyValue("--bitc"); }
  };

  setTimeout(function () {
    live().catch(function (e) {
      /* yaşam döngüsü bir hatayla ölürse yaratık uyur, sayfa etkilenmez */
      el.classList.add("m-lie");
      if (window.console && console.warn) console.warn("mascot uyudu:", e);
    });
  }, 2500);
})();
