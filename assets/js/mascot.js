/* TroyApps — mascot.js : "Bit" (yeşil) vs "Bug" (pembe) — maskot düellosu
   İki piksel yaratık sayfanın her yerinde özgürce gezer. Birbirlerinden
   uzaklaşınca merak edip birbirlerini arar, bulunca önce uzaktan ateş eder
   (ıskalayan atışlar ekranı çatlatır), sonra göğüs göğüse kavgaya tutuşur.
   Herhangi birine tıklayınca ayrılırlar, sersemler ve ateşkes ilan edilir.
   Kütüphanesiz. prefers-reduced-motion açıksa hiç doğmazlar. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.getElementById("duel")) return;

  var TR = document.documentElement.lang !== "en";
  var SMALL = window.innerWidth < 640;

  /* ---------- Sözlük ---------- */

  var SAY = TR ? {
    idle:  ["...", "sinyal var mı?", "beep boop", "hava güzelmiş", "sıkıldım", "burası boş"],
    lost:  ["neredesin ulan?", "hani nerede bu?", "kaçtın mı sen?", "kayboldu galiba", "yine mi saklandın"],
    found: ["buldum seni!", "işte buradasın!", "gel bakalım", "yakaladım", "kaçış yok"],
    shoot: ["al bakalım!", "pew pew", "eğil!", "sıkı dur", "bu senin için"],
    miss:  ["ıskaladın!", "ekranı vurdun salak", "yandaki cama gitti", "nişancıya bak"],
    hit:   ["ayy!", "of!", "hile bu", "canım yandı"],
    melee: ["POW!", "BAM!", "PAT!", "KÜT!", "GÜM!", "ŞAK!"],
    truce: ["tamam tamam", "ayırdılar bizi", "başkan kızdı", "barıştık say", "bu iş burada bitmez"],
    tired: ["yeter be", "nefesim kesildi", "beraberlik", "bi mola"],
    chase: ["hey, sayfa kaçıyor!", "bekle bizi!", "dur nereye?!", "koş koş koş", "bırak kavgayı, yetiş!"],
    resume: ["nerede kalmıştık?", "hah, evet — kavga!", "geldik, devam", "sen bana vuruyordun"],
    ask:   ["Ne arıyorsun?", "Bir şey mi lazım?", "Nereye gidelim?", "Yardım edeyim mi?"],
    bye:   ["hadi bakalım", "iyi gezmeler", "tamamdır", "buradayız, çağır yeter"]
  } : {
    idle:  ["...", "any signal?", "beep boop", "nice weather", "so bored", "quiet here"],
    lost:  ["where are you?", "where'd he go?", "did you run off?", "lost him again", "hiding again huh"],
    found: ["found you!", "there you are!", "come here", "gotcha", "no escape"],
    shoot: ["take this!", "pew pew", "duck!", "hold still", "this one's for you"],
    miss:  ["you missed!", "you hit the screen!", "nice shot, genius", "look at this marksman"],
    hit:   ["ouch!", "oof!", "that's cheating", "that hurt"],
    melee: ["POW!", "BAM!", "WHAM!", "THWACK!", "BOOM!", "SMACK!"],
    truce: ["okay okay", "they pulled us apart", "the boss is mad", "call it a truce", "this isn't over"],
    tired: ["enough already", "out of breath", "it's a draw", "need a break"],
    chase: ["hey, the page is running!", "wait for us!", "where are you going?!", "run run run", "forget the fight, catch up!"],
    resume: ["where were we?", "right — the fight!", "ok, back to it", "you were hitting me"],
    ask:   ["What are you after?", "Need something?", "Where to?", "Want a hand?"],
    bye:   ["off you go", "enjoy", "sure thing", "we're here, just holler"]
  };

  /* SVG elemanlarinda .hidden IDL ozelligi yok; attribute uzerinden gizle */
  function show(el, on) {
    if (on) el.removeAttribute("hidden");
    else el.setAttribute("hidden", "");
  }

  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- Sahne ---------- */

  var root = document.createElement("div");
  root.id = "duel";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    '<svg id="duel-cracks" xmlns="http://www.w3.org/2000/svg"></svg>' +
    '<div id="duel-fx"></div>';
  document.body.appendChild(root);

  var cracksSvg = root.querySelector("#duel-cracks");
  var fx = root.querySelector("#duel-fx");

  var W = SMALL ? 46 : 60;
  var H = W * 0.75;

  function sprite() {
    return '<svg class="d-body" viewBox="0 0 32 24" width="' + W + '" height="' + H + '">' +
      '<g class="d-blob">' +
        '<rect class="d-skin" x="6" y="6" width="20" height="14"/>' +
        '<rect class="d-skin" x="4" y="8" width="2" height="10"/>' +
        '<rect class="d-skin" x="26" y="8" width="2" height="10"/>' +
        '<rect class="d-skin" x="8" y="4" width="16" height="2"/>' +
        '<rect class="d-hi" x="6" y="6" width="20" height="2"/>' +
        '<rect class="d-dk" x="8" y="20" width="4" height="2"/>' +
        '<rect class="d-dk" x="20" y="20" width="4" height="2"/>' +
        '<g class="d-eyes">' +
          '<rect x="11" y="9" width="4" height="5"/>' +
          '<rect x="19" y="9" width="4" height="5"/>' +
          '<rect class="d-gleam" x="12" y="10" width="2" height="2"/>' +
          '<rect class="d-gleam" x="20" y="10" width="2" height="2"/>' +
        '</g>' +
        '<g class="d-eyes-x" hidden>' +
          '<rect x="11" y="9" width="4" height="1.6" transform="rotate(38 13 11)"/>' +
          '<rect x="11" y="9" width="4" height="1.6" transform="rotate(-38 13 11)"/>' +
          '<rect x="19" y="9" width="4" height="1.6" transform="rotate(38 21 11)"/>' +
          '<rect x="19" y="9" width="4" height="1.6" transform="rotate(-38 21 11)"/>' +
        '</g>' +
        '<g class="d-brow" hidden>' +
          '<rect x="10" y="7" width="6" height="1.8" transform="rotate(14 13 8)"/>' +
          '<rect x="18" y="7" width="6" height="1.8" transform="rotate(-14 21 8)"/>' +
        '</g>' +
        '<rect class="d-mouth" x="14" y="16" width="6" height="1.6"/>' +
      '</g>' +
    '</svg>';
  }

  function makeFighter(id, name) {
    var el = document.createElement("div");
    el.className = "duel-fighter duel-" + id;
    el.innerHTML =
      '<div class="d-bubble" hidden></div>' +
      '<div class="d-stars" hidden><i>✦</i><i>✦</i><i>✦</i></div>' +
      sprite();
    root.appendChild(el);

    var f = {
      id: id, name: name, el: el,
      bubble: el.querySelector(".d-bubble"),
      body: el.querySelector(".d-body"),
      eyes: el.querySelector(".d-eyes"),
      eyesX: el.querySelector(".d-eyes-x"),
      brow: el.querySelector(".d-brow"),
      mouth: el.querySelector(".d-mouth"),
      stars: el.querySelector(".d-stars"),
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
      face: 1, bob: rand(0, 6.28), retarget: 0, hurt: 0, sayT: 0, nextShot: 0,
      pinned: false
    };
    /* menuyu kapatan "disariya tiklama" dinleyicisi yaratigi disari saymasin */
    el.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    el.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menuOpen) {
        var same = menuFor === f;
        closeMenu(true);
        if (!same) openMenu(f);          /* obur yaratiga gecis */
        return;
      }
      if (mode === "truce") { openMenu(f); return; }   /* zaten ayrılmışlar */
      separate();
      setTimeout(function () { if (!menuOpen) openMenu(f); }, 780);
    });
    return f;
  }

  var A = makeFighter("green", "Bit");
  var B = makeFighter("pink", "Bug");
  var PAIR = [A, B];

  /* ---------- Alan ---------- */

  /* Menü şeridinin üstüne de çıkabilirler; oradayken tıklamayı engellememek
     için (bkz. render) fare olaylarını kapatıyoruz. */
  var HEADER_BAND = 78;

  function bounds() {
    return {
      x0: W * 0.6,
      x1: window.innerWidth - W * 0.6,
      y0: 34,
      y1: window.innerHeight - H * 0.7 - 10
    };
  }

  (function place() {
    var b = bounds();
    A.x = b.x0 + (b.x1 - b.x0) * 0.24; A.y = b.y0 + (b.y1 - b.y0) * 0.62;
    B.x = b.x0 + (b.x1 - b.x0) * 0.76; B.y = b.y0 + (b.y1 - b.y0) * 0.3;
    A.tx = A.x; A.ty = A.y; B.tx = B.x; B.ty = B.y;
  })();

  function dist(p, q) { return Math.hypot(q.x - p.x, q.y - p.y); }

  function wanderTarget(f) {
    var b = bounds();
    if (Math.random() < 0.45) {
      /* bazen ekranın bambaşka bir köşesine kafayı takarlar */
      f.tx = rand(b.x0, b.x1);
      f.ty = rand(b.y0, b.y1);
    } else {
      f.tx = clamp(f.x + rand(-440, 440), b.x0, b.x1);
      f.ty = clamp(f.y + rand(-320, 320), b.y0, b.y1);
    }
  }

  /* ---------- Konuşma ---------- */

  function say(f, text, ms) {
    f.bubble.textContent = text;
    show(f.bubble, true);
    clearTimeout(f.sayT);
    f.sayT = setTimeout(function () { show(f.bubble, false); }, ms || 2100);
  }

  function setAngry(on) {
    PAIR.forEach(function (f) {
      show(f.brow, !!on);
      f.el.classList.toggle("d-mad", !!on);
    });
  }

  function flinch(f) {
    f.hurt = 520;
    show(f.eyes, false);
    show(f.eyesX, true);
    f.el.classList.add("d-hit");
    setTimeout(function () {
      show(f.eyes, true);
      show(f.eyesX, false);
      f.el.classList.remove("d-hit");
    }, 520);
  }

  /* ---------- Efektler ---------- */

  function burst(x, y, text, cls) {
    var d = document.createElement("div");
    d.className = "d-burst " + (cls || "");
    d.textContent = text;
    d.style.left = x + "px";
    d.style.top = y + "px";
    d.style.setProperty("--rot", rand(-18, 18) + "deg");
    fx.appendChild(d);
    setTimeout(function () { d.remove(); }, 900);
  }

  function sparks(x, y, color, n) {
    for (var i = 0; i < (n || 7); i++) {
      var s = document.createElement("i");
      s.className = "d-spark";
      var a = rand(0, 6.283), r = rand(18, 62);
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.background = color;
      s.style.setProperty("--dx", Math.cos(a) * r + "px");
      s.style.setProperty("--dy", Math.sin(a) * r + "px");
      fx.appendChild(s);
      /* jshint -W083 */
      (function (node) { setTimeout(function () { node.remove(); }, 620); })(s);
    }
  }

  function flash(x, y, color) {
    var d = document.createElement("div");
    d.className = "d-flash";
    d.style.left = x + "px";
    d.style.top = y + "px";
    d.style.background = "radial-gradient(circle, " + color + ", transparent 70%)";
    fx.appendChild(d);
    setTimeout(function () { d.remove(); }, 420);
  }

  var shakeT = 0;
  function shake(power) {
    document.documentElement.style.setProperty("--duel-shake", (power || 4) + "px");
    document.documentElement.classList.remove("duel-shaking");
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add("duel-shaking");
    clearTimeout(shakeT);
    shakeT = setTimeout(function () {
      document.documentElement.classList.remove("duel-shaking");
    }, power > 6 ? 460 : 300);
  }

  /* ---------- Ekran çatlağı ---------- */

  var cracks = [];

  function crack(x, y, size, color) {
    var b = bounds();
    x = clamp(x, 18, window.innerWidth - 18);
    y = clamp(y, 18, window.innerHeight - 18);
    size = size || rand(60, 120);

    var NS = "http://www.w3.org/2000/svg";
    var g = document.createElementNS(NS, "g");
    g.setAttribute("class", "d-crack");
    g.style.setProperty("--cc", color || "#dffff2");

    var arms = 5 + ((Math.random() * 4) | 0);
    var base = rand(0, 6.283);
    var total = 0;

    for (var i = 0; i < arms; i++) {
      var ang = base + (i / arms) * 6.283 + rand(-0.28, 0.28);
      var len = size * rand(0.45, 1.15);
      var px = x, py = y, pts = [x + "," + y];
      var segs = 2 + ((Math.random() * 3) | 0);
      for (var s = 0; s < segs; s++) {
        ang += rand(-0.42, 0.42);
        var step = len / segs;
        px += Math.cos(ang) * step;
        py += Math.sin(ang) * step;
        pts.push(Math.round(px) + "," + Math.round(py));
      }
      var line = document.createElementNS(NS, "polyline");
      line.setAttribute("points", pts.join(" "));
      line.setAttribute("class", "d-crack-line");
      var L = len * 1.25;
      line.style.strokeDasharray = L;
      line.style.strokeDashoffset = L;
      line.style.animationDelay = (i * 14) + "ms";
      g.appendChild(line);
      total += 1;

      /* dallanma */
      if (Math.random() < 0.55) {
        var bx = x + Math.cos(ang) * len * 0.5;
        var by = y + Math.sin(ang) * len * 0.5;
        var ba = ang + (Math.random() < 0.5 ? 0.9 : -0.9);
        var bl = len * rand(0.2, 0.45);
        var br = document.createElementNS(NS, "polyline");
        br.setAttribute("points", Math.round(bx) + "," + Math.round(by) + " " +
          Math.round(bx + Math.cos(ba) * bl) + "," + Math.round(by + Math.sin(ba) * bl));
        br.setAttribute("class", "d-crack-line d-crack-thin");
        br.style.strokeDasharray = bl;
        br.style.strokeDashoffset = bl;
        br.style.animationDelay = (60 + i * 14) + "ms";
        g.appendChild(br);
      }
    }

    /* çarpma göbeği */
    var hub = document.createElementNS(NS, "circle");
    hub.setAttribute("cx", x); hub.setAttribute("cy", y);
    hub.setAttribute("r", 3.5);
    hub.setAttribute("class", "d-crack-hub");
    g.appendChild(hub);

    cracksSvg.appendChild(g);
    flash(x, y, color || "rgba(223,255,242,.85)");

    var rec = { g: g, t: setTimeout(function () { fade(rec); }, rand(9000, 14000)) };
    cracks.push(rec);
    while (cracks.length > 7) fade(cracks[0]);
    return rec;
  }

  function fade(rec) {
    var i = cracks.indexOf(rec);
    if (i < 0) return;
    cracks.splice(i, 1);
    clearTimeout(rec.t);
    rec.g.classList.add("d-crack-out");
    setTimeout(function () { rec.g.remove(); }, 900);
  }

  function healAll() { cracks.slice().forEach(fade); }

  /* ---------- Mermiler ---------- */

  var shots = [];

  function fire(from, to, willHit) {
    var sx = from.x + from.face * (W * 0.42);
    var sy = from.y - 2;
    var ang = Math.atan2(to.y - sy, to.x - sx);
    var reach = Math.hypot(to.x - sx, to.y - sy);
    if (!willHit) {
      ang += rand(0.13, 0.30) * (Math.random() < 0.5 ? -1 : 1);
      reach += rand(120, 340);
    }

    var el = document.createElement("i");
    el.className = "d-shot d-shot-" + from.id;
    fx.appendChild(el);

    shots.push({
      el: el, x: sx, y: sy, ang: ang, sp: SMALL ? 9 : 12,
      left: reach, hit: willHit, from: from, to: to
    });

    /* namlu alevi */
    flash(sx, sy, from.id === "green" ? "rgba(0,255,156,.7)" : "rgba(255,62,242,.7)");
    from.el.classList.add("d-recoil");
    setTimeout(function () { from.el.classList.remove("d-recoil"); }, 180);
  }

  function stepShots(dt) {
    for (var i = shots.length - 1; i >= 0; i--) {
      var s = shots[i];
      var d = s.sp * dt;
      s.x += Math.cos(s.ang) * d;
      s.y += Math.sin(s.ang) * d;
      s.left -= d;
      s.el.style.transform = "translate3d(" + (s.x - 4) + "px," + (s.y - 2) + "px,0) rotate(" + (s.ang * 57.3) + "deg)";

      var out = s.x < -30 || s.x > window.innerWidth + 30 || s.y < -30 || s.y > window.innerHeight + 30;

      if (s.hit && s.left <= 0) {
        var col = s.from.id === "green" ? "#00ff9c" : "#ff3ef2";
        sparks(s.to.x, s.to.y, col, 9);
        flinch(s.to);
        s.to.vx += Math.cos(s.ang) * 260;
        s.to.vy += Math.sin(s.ang) * 160 - 60;
        if (Math.random() < 0.6) say(s.to, pick(SAY.hit), 1200);
        shake(4);
        s.el.remove(); shots.splice(i, 1);
      } else if (!s.hit && (s.left <= 0 || out)) {
        crack(s.x, s.y, rand(55, 110), s.from.id === "green" ? "#b6ffe2" : "#ffc8fb");
        shake(5);
        if (Math.random() < 0.5) say(s.to, pick(SAY.miss), 1500);
        s.el.remove(); shots.splice(i, 1);
      }
    }
  }

  function clearShots() {
    shots.forEach(function (s) { s.el.remove(); });
    shots.length = 0;
  }

  /* ---------- Durum makinesi ---------- */

  var mode = "wander";
  var modeT = 0;
  var modeLen = rand(11000, 17000);
  var farT = 0;
  var meleeT = 0;
  var paused = false;

  function setMode(m, len) {
    mode = m;
    modeT = 0;
    modeLen = len;
    if (m !== "shoot" && m !== "melee") setAngry(false);
  }

  /* ---------- Oneri menusu ---------- */

  /* Menu, #duel'in DISINDA dogrudan body'ye eklenir: #duel aria-hidden oldugu
     icin icine konan baglantilar ekran okuyuculara hic gorunmezdi ve
     aria-hidden bir atadan miras alinip iceriden geri acilamaz. */

  var menuEl = null;
  var menuOpen = false;
  var menuFor = null;
  var menuT = 0;

  function navItems() {
    var out = [];
    var links = document.querySelectorAll(".nav-links a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.classList.contains("lang-switch")) continue;
      var href = a.getAttribute("href");
      if (!href) continue;
      var numEl = a.querySelector(".n");
      var num = numEl ? numEl.textContent.trim() : "";
      var label = a.textContent.replace(num, "").trim();
      if (label) out.push({ href: href, label: label, num: num });
    }
    return out;
  }

  function buildMenu() {
    var items = navItems();
    if (!items.length) return null;

    var el = document.createElement("div");
    el.id = "duel-menu";
    el.hidden = true;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", TR ? "Hızlı gezinme" : "Quick navigation");

    var card = document.createElement("div");
    card.className = "dm-card";

    var q = document.createElement("p");
    q.className = "dm-q";
    card.appendChild(q);

    var list = document.createElement("div");
    list.className = "dm-list";
    items.forEach(function (it) {
      var a = document.createElement("a");
      a.className = "dm-item";
      a.href = it.href;
      if (it.num) {
        var n = document.createElement("span");
        n.className = "dm-n";
        n.textContent = it.num;
        a.appendChild(n);
      }
      a.appendChild(document.createTextNode(it.label));
      a.addEventListener("click", function () { closeMenu(false); });
      list.appendChild(a);
    });
    card.appendChild(list);

    var close = document.createElement("button");
    close.type = "button";
    close.className = "dm-close";
    close.textContent = TR ? "boş ver, kavgaya dön" : "never mind, back to the fight";
    close.addEventListener("click", function () { closeMenu(true); });
    card.appendChild(close);

    el.appendChild(card);
    document.body.appendChild(el);
    return el;
  }

  function placeMenu(f) {
    var m = menuEl;
    var mw = m.offsetWidth;
    var mh = m.offsetHeight;
    var above = f.y - H * 0.6 - mh - 12 > 8;
    var left = clamp(f.x - mw * 0.3, 8, Math.max(8, window.innerWidth - mw - 8));
    var top = above ? f.y - H * 0.6 - mh - 12 : f.y + H * 0.6 + 12;
    top = clamp(top, 8, Math.max(8, window.innerHeight - mh - 8));
    m.style.left = Math.round(left) + "px";
    m.style.top = Math.round(top) + "px";
    m.classList.toggle("dm-above", above);
    m.classList.toggle("dm-below", !above);
    m.style.setProperty("--dm-tail", Math.round(clamp(f.x - left - 5, 12, mw - 24)) + "px");
  }

  function openMenu(f) {
    if (!menuEl) menuEl = buildMenu();
    if (!menuEl || menuOpen) return;
    menuOpen = true;
    menuFor = f;
    menuT = 0;
    f.pinned = true;
    clearTimeout(f.sayT);
    show(f.bubble, false);
    menuEl.classList.toggle("dm-pink", f.id === "pink");
    menuEl.querySelector(".dm-q").textContent = pick(SAY.ask);
    menuEl.hidden = false;
    placeMenu(f);
    var first = menuEl.querySelector(".dm-item");
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(quiet) {
    if (!menuOpen) return;
    menuOpen = false;
    menuEl.hidden = true;
    var f = menuFor;
    menuFor = null;
    if (f) {
      f.pinned = false;
      if (!quiet) say(f, pick(SAY.bye), 1700);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) closeMenu(true);
  });
  document.addEventListener("pointerdown", function (e) {
    if (menuOpen && menuEl && !menuEl.contains(e.target)) closeMenu(true);
  });

  /* ---------- Sayfayi kovalama ---------- */

  /* Yaratiklar sayfaya yapisiktir: sayfa kayinca onlar da kayar. Ekrandan
     cikarlarsa her seyi birakip geri kosar, sonra kaldiklari yerden devam
     ederler. LOST, en fazla ne kadar geride kalabileceklerini sinirlar. */
  function lostLimit() { return clamp(window.innerHeight * 0.22, 120, 260); }
  var LOST = lostLimit();
  var lastScrollY = window.scrollY || window.pageYOffset || 0;
  var scrollSettle = 0;
  var chaseSave = null;
  var lastChaseSay = -9999;
  var time0 = 0;

  function offscreen() {
    var b = bounds();
    return PAIR.some(function (f) { return f.y < b.y0 - 12 || f.y > b.y1 + 12; });
  }

  function startChase() {
    if (mode === "chase") return;
    chaseSave = { mode: mode, modeT: modeT, modeLen: modeLen };
    clearShots();
    setAngry(false);
    mode = "chase";
    modeT = 0;
    modeLen = 7000;
    if (time0 - lastChaseSay > 4000) {
      lastChaseSay = time0;
      say(A, pick(SAY.chase), 1700);
      say(B, pick(SAY.chase.filter(function (t) { return t !== A.bubble.textContent; })), 1700);
    }
  }

  function endChase() {
    var s = chaseSave;
    chaseSave = null;
    if (!s || s.mode === "chase") { setMode("wander", rand(11000, 17000)); return; }
    mode = s.mode;
    modeT = s.modeT;
    modeLen = s.modeLen;
    if (mode === "shoot" || mode === "melee") {
      setAngry(true);
      PAIR.forEach(function (f) { f.nextShot = rand(300, 900); });
    }
    if (time0 - lastChaseSay > 1200) {
      say(A, pick(SAY.resume), 1600);
      say(B, pick(SAY.resume.filter(function (t) { return t !== A.bubble.textContent; })), 1600);
    }
  }

  window.addEventListener("scroll", function () {
    var y = window.scrollY || window.pageYOffset || 0;
    var dy = y - lastScrollY;
    lastScrollY = y;
    if (!dy) return;
    var b = bounds();
    LOST = lostLimit();
    PAIR.forEach(function (f) {
      f.y = clamp(f.y - dy, b.y0 - LOST, b.y1 + LOST);
      f.ty -= dy;
    });
    shots.forEach(function (s2) { s2.y -= dy; });
    scrollSettle = 220;
    if (menuOpen) closeMenu(true);
    if (mode !== "chase" && offscreen()) startChase();
  }, { passive: true });

  function separate() {
    if (mode === "truce") { PAIR.forEach(function (f) { say(f, pick(SAY.truce), 1800); }); return; }
    var b = bounds();
    clearShots();
    setAngry(false);
    healAll();
    shake(7);

    var mid = (A.x + B.x) / 2;
    var left = A.x <= B.x ? A : B;
    var right = left === A ? B : A;

    left.vx = -900; left.vy = -260;
    right.vx = 900; right.vy = -260;
    left.tx = clamp(mid - rand(320, 520), b.x0, b.x1);
    right.tx = clamp(mid + rand(320, 520), b.x0, b.x1);
    left.ty = clamp(left.y + rand(-90, 90), b.y0, b.y1);
    right.ty = clamp(right.y + rand(-90, 90), b.y0, b.y1);

    PAIR.forEach(function (f) {
      show(f.stars, true);
      f.el.classList.add("d-dizzy");
      say(f, pick(SAY.truce), 2400);
      setTimeout(function () {
        show(f.stars, false);
        f.el.classList.remove("d-dizzy");
      }, 2200);
    });

    setMode("truce", rand(15000, 22000));
  }

  function steer(f, speed, agility) {
    if (f.pinned) { f.vx *= 0.6; f.vy *= 0.6; return; }
    var dx = f.tx - f.x, dy = f.ty - f.y;
    var d = Math.hypot(dx, dy) || 1;
    var k = agility || 0.055;
    f.vx += (dx / d * speed - f.vx) * k;
    f.vy += (dy / d * speed - f.vy) * k;
  }

  function integrate(f, dt) {
    var b = bounds();
    f.x += f.vx * dt / 60;
    f.y += f.vy * dt / 60;
    f.vx *= 0.92;
    f.vy *= 0.92;
    if (f.x < b.x0) { f.x = b.x0; f.vx = Math.abs(f.vx) * 0.5; }
    if (f.x > b.x1) { f.x = b.x1; f.vx = -Math.abs(f.vx) * 0.5; }
    if (mode === "chase") {
      /* sayfaya yetismeye calisirken ekranin disinda kalabilirler */
      f.y = clamp(f.y, b.y0 - LOST, b.y1 + LOST);
      return;
    }
    /* kavga menünün arkasında geçmesin: dövüşürken tavan biraz aşağıda */
    var top = (mode === "shoot" || mode === "melee") ? Math.max(b.y0, 118) : b.y0;
    if (f.y < top) { f.y = top; f.vy = Math.abs(f.vy) * 0.5; }
    if (f.y > b.y1) { f.y = b.y1; f.vy = -Math.abs(f.vy) * 0.5; }
  }

  function render(f, time) {
    var bobY = Math.sin(time * 0.006 + f.bob) * 3.2;
    f.el.style.transform = "translate3d(" + (f.x - W / 2) + "px," + (f.y - H / 2 + bobY) + "px,0)";
    if (f.lastFace !== f.face) {
      f.lastFace = f.face;
      f.el.style.setProperty("--dflip", f.face);
    }
    f.el.classList.toggle("d-move", Math.hypot(f.vx, f.vy) > 40);
    /* tepedeyken balonu altına al, ekranın dışında kalmasın */
    f.el.classList.toggle("d-say-below", f.y < 116);
    /* menünün üstündeyken tıklamaları alta geçir */
    var overNav = f.y < HEADER_BAND;
    if (f.overNav !== overNav) {
      f.overNav = overNav;
      f.el.style.pointerEvents = overNav ? "none" : "auto";
    }
  }

  var last = 0;

  function tick(time) {
    requestAnimationFrame(tick);
    if (paused) { last = time; return; }
    var dt = last ? Math.min((time - last) / 16.67, 3) : 1;
    last = time;
    var ms = dt * 16.67;
    time0 = time;
    modeT += ms;
    if (scrollSettle > 0) scrollSettle -= ms;
    if (menuOpen) { menuT += ms; if (menuT > 11000) closeMenu(false); }

    var d = dist(A, B);
    var diag = Math.hypot(window.innerWidth, window.innerHeight);

    if (mode === "chase") {
      /* her seyi birak, sayfaya yetis */
      var bc = bounds();
      PAIR.forEach(function (f) {
        f.tx = clamp(f.x, bc.x0, bc.x1);
        f.ty = clamp(f.y, bc.y0 + 50, bc.y1 - 50);
        steer(f, 2600, 0.30);
        if (Math.abs(f.vx) > 12) f.face = f.vx > 0 ? 1 : -1;
      });
      if ((!offscreen() && scrollSettle <= 0) || modeT > modeLen) endChase();

    } else if (mode === "wander") {
      PAIR.forEach(function (f) {
        f.retarget -= ms;
        if (f.retarget <= 0 || Math.hypot(f.tx - f.x, f.ty - f.y) < 26) {
          wanderTarget(f);
          f.retarget = rand(2400, 4600);
          if (Math.random() < 0.28) say(f, pick(SAY.idle), 1800);
        }
        steer(f, rand(230, 330), 0.05);
        if (Math.abs(f.vx) > 12) f.face = f.vx > 0 ? 1 : -1;
      });
      /* uzaklaştılarsa merak etmeye başla */
      if (d > diag * 0.46) farT += ms; else farT = Math.max(0, farT - ms * 0.6);
      if (farT > 3200 || modeT > modeLen) {
        farT = 0;
        say(A, pick(SAY.lost), 1900);
        setTimeout(function () { if (mode === "seek") say(B, pick(SAY.lost), 1900); }, 900);
        setMode("seek", 11000);
      }

    } else if (mode === "seek") {
      PAIR.forEach(function (f) {
        var o = f === A ? B : A;
        f.tx = o.x; f.ty = o.y;
        steer(f, 430, 0.09);
        f.face = o.x > f.x ? 1 : -1;
      });
      if (d < (SMALL ? 210 : 330)) {
        say(A, pick(SAY.found), 1600);
        setTimeout(function () { if (mode === "shoot") say(B, pick(SAY.found), 1600); }, 700);
        setAngry(true);
        PAIR.forEach(function (f) { f.nextShot = rand(500, 1100); f.vx *= -0.4; f.vy *= -0.4; });
        setMode("shoot", rand(5200, 7200));
      } else if (modeT > modeLen) {
        setMode("wander", rand(10000, 15000));
      }

    } else if (mode === "shoot") {
      PAIR.forEach(function (f) {
        var o = f === A ? B : A;
        f.face = o.x > f.x ? 1 : -1;
        /* mesafeyi koru, hafif sağa sola kaçın */
        f.retarget -= ms;
        if (f.retarget <= 0) {
          var b = bounds();
          var want = SMALL ? 190 : 300;
          var ux = (f.x - o.x) / (d || 1), uy = (f.y - o.y) / (d || 1);
          f.tx = clamp(o.x + ux * want + rand(-40, 40), b.x0, b.x1);
          f.ty = clamp(o.y + uy * want + rand(-70, 70), b.y0, b.y1);
          f.retarget = rand(500, 1100);
        }
        steer(f, 210, 0.06);

        f.nextShot -= ms;
        if (f.nextShot <= 0 && f.hurt <= 0) {
          f.nextShot = rand(650, 1250);
          fire(f, o, Math.random() < 0.55);
          if (Math.random() < 0.4) say(f, pick(SAY.shoot), 1200);
        }
        if (f.hurt > 0) f.hurt -= ms;
      });
      if (modeT > modeLen) {
        clearShots();
        meleeT = 0;
        setMode("melee", rand(3200, 4600));
      }

    } else if (mode === "melee") {
      var cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2;
      PAIR.forEach(function (f) {
        var o = f === A ? B : A;
        f.face = o.x > f.x ? 1 : -1;
        f.tx = o.x; f.ty = o.y;
        steer(f, 620, 0.16);
      });
      meleeT -= ms;
      if (d < 110 && meleeT <= 0) {
        meleeT = rand(180, 340);
        burst(cx + rand(-46, 46), cy + rand(-52, 22), pick(SAY.melee));
        sparks(cx, cy, Math.random() < 0.5 ? "#00ff9c" : "#ff3ef2", 6);
        var kick = rand(120, 300);
        A.vx += (A.x - B.x) / (d || 1) * kick; A.vy += rand(-160, -40);
        B.vx += (B.x - A.x) / (d || 1) * kick; B.vy += rand(-160, -40);
        shake(4);
      }
      if (modeT > modeLen) {
        /* final darbe: ekran çatlar */
        crack(cx + rand(-40, 40), cy + rand(-40, 40), rand(120, 190), "#ffffff");
        burst(cx, cy - 40, TR ? "GÜÜÜM!" : "KABOOM!", "d-burst-big");
        shake(9);
        A.vx = -700; B.vx = 700; A.vy = -220; B.vy = -220;
        PAIR.forEach(function (f) { say(f, pick(SAY.tired), 2200); });
        setMode("rest", rand(4500, 7000));
      }

    } else if (mode === "rest" || mode === "truce") {
      PAIR.forEach(function (f) {
        f.retarget -= ms;
        if (f.retarget <= 0) {
          wanderTarget(f);
          f.retarget = rand(2000, 4000);
          if (Math.random() < 0.22) say(f, pick(mode === "truce" ? SAY.truce : SAY.idle), 1800);
        }
        /* ateşkeste birbirlerinden uzak dursunlar */
        if (mode === "truce" && d < 260) {
          var o = f === A ? B : A;
          f.vx += (f.x - o.x) / (d || 1) * 22;
          f.vy += (f.y - o.y) / (d || 1) * 22;
        }
        steer(f, 150, 0.04);
        if (Math.abs(f.vx) > 12) f.face = f.vx > 0 ? 1 : -1;
      });
      if (modeT > modeLen) setMode("wander", rand(11000, 17000));
    }

    PAIR.forEach(function (f) { integrate(f, dt); render(f, time); });
    stepShots(dt);
  }

  /* ---------- Bağlantılar ---------- */

  document.addEventListener("visibilitychange", function () {
    paused = document.hidden;
    if (!paused) last = 0;
  });

  window.addEventListener("resize", function () {
    LOST = lostLimit();
    lastScrollY = window.scrollY || window.pageYOffset || 0;
    var b = bounds();
    PAIR.forEach(function (f) {
      f.x = clamp(f.x, b.x0, b.x1);
      f.y = clamp(f.y, b.y0, b.y1);
      f.tx = clamp(f.tx, b.x0, b.x1);
      f.ty = clamp(f.ty, b.y0, b.y1);
    });
    healAll();
  });

  /* test/debug kancası */
  window.__duel = {
    mode: function () { return mode; },
    go: function (m, len) { setMode(m, len || 6000); return m; },
    fight: function () { setMode("seek", 11000); },
    crack: function (x, y) { return crack(x || innerWidth / 2, y || innerHeight / 2, 140, "#fff"); },
    warp: function (who, x, y) { var f = who === "b" ? B : A; f.x = x; f.y = y; f.tx = x; f.ty = y; f.vx = f.vy = 0; },
    hits: function () { return { a: A.el.style.pointerEvents, b: B.el.style.pointerEvents }; },
    heal: healAll,
    separate: separate,
    pos: function () { return { a: [A.x | 0, A.y | 0], b: [B.x | 0, B.y | 0], d: dist(A, B) | 0 }; },
    saved: function () { return chaseSave && chaseSave.mode; },
    onscreen: function () { return !offscreen(); }
  };

  requestAnimationFrame(tick);
})();
