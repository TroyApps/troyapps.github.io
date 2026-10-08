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

  /* Hangi bolumdeyiz: ust kenari ekranin ortasini gecmis son bolum.
     (Telefonda bolumler kisa; eski "yuzde 40 gorunur" kurali
     uygulamalardayken Iletisim'i yakiyordu.) */
  var sections = [].slice.call(document.querySelectorAll("[data-index]"));
  function onScroll() {
    document.body.classList.toggle("scrolled", scrollY > innerHeight * 0.6);
    if (scrollY < innerHeight * 0.5) { setNav("top"); return; }
    var cur = "top", line = innerHeight * 0.45;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s.dataset.index; });
    /* sayfanin dibine gelindiyse son bolum */
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4 && sections.length) cur = sections[sections.length - 1].dataset.index;
    setNav(cur);
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

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

/* --- Hero logo: giriste titreme + imlecin degdigi yerin dagilmasi --------
   1) Giris: murekkep filtresinin (feTurbulence) tohumu ~2 sn boyunca
      hizla degisir, cizgi el cizimi gibi "kaynar" ve hafif sarsilir, sonra
      orijinal haline oturur. Telefonda da calisir.
   2) Fare: logo SVG'si birebir ayni gorunumle tuvale cizilir. Imlecin
      degdigi bolgedeki cizgi parcaciklari disari savrulur, imlec gidince
      yayla yerine doner; logonun geri kalani hic oynamaz.
   Hareketi azalt acik olanlarda ikisi de kapali. Tuval kurulamazsa
   (eski tarayici vb.) SVG oldugu gibi kalir. */
(function () {
  "use strict";
  var svg = document.querySelector(".hero .wordmark");
  if (!svg || !window.matchMedia) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var turb = [].slice.call(document.querySelectorAll("#ink feTurbulence, #ink2 feTurbulence"));
  var seeds = turb.map(function (t) { return t.getAttribute("seed"); });

  /* ---- 1) giris titremesi ---- */
  var boiling = false;
  function boil(ms, done, amp) {
    var t0 = performance.now(), last = 0;
    amp = amp || 1.8;
    boiling = true;
    function step(now) {
      var k = (now - t0) / ms;
      if (k >= 1) {
        turb.forEach(function (t, i) { t.setAttribute("seed", seeds[i]); });
        svg.style.transform = "";
        boiling = false;
        if (done) done();
        return;
      }
      if (now - last > 85) {           /* ~12 kare/sn: el cizimi animasyon hissi */
        last = now;
        turb.forEach(function (t) { t.setAttribute("seed", String(1 + (Math.random() * 97 | 0))); });
        var a = amp * (1 - k);          /* sarsinti giderek sonumlenir */
        svg.style.transform = "translate(" + ((Math.random() - .5) * 2 * a).toFixed(2) + "px," + ((Math.random() - .5) * 2 * a).toFixed(2) + "px) rotate(" + ((Math.random() - .5) * .6 * (1 - k)).toFixed(2) + "deg)";
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var fx = null; /* imlec efekti kurulunca: { busy, hide, show } */
  ready.then(function () { boil(2000, fine ? setupScatter : null); });

  /* Her 10 saniyede bir kisa kipirdama. Sekme arka plandaysa ya da
     imlec logonun uzerindeyse atlanir. Tuval acikken titreme SVG'de
     oynatilir, bitince tuval geri gelir (tohumlar eski haline doner,
     tuvaldeki resim yine birebir ayni). */
  setInterval(function () {
    if (document.hidden || boiling) return;
    if (fx && fx.busy()) return;
    if (fx) fx.hide();
    boil(2000, function () { if (fx) fx.show(); }, 1.2);
  }, 10000);

  /* ---- 2) imlecle dagilma ---- */
  function setupScatter() {
    var texts = [].slice.call(svg.children).filter(function (n) { return n.tagName.toLowerCase() === "text"; });
    if (!texts.length) return;

    var canvas = document.createElement("canvas");
    canvas.className = "wordmark-fx";
    canvas.setAttribute("aria-hidden", "true");
    var ctx = canvas.getContext("2d");
    var base = document.createElement("canvas");
    var bctx = base.getContext("2d");
    if (!ctx || !bctx) return;

    var parts = [], W = 0, H = 0, dpr = 1, C = 2, R = 64, pointer = null, raf = null, building = false;
    /* SVG overflow:visible; harfler viewBox'tan tasiyor (S'nin sag kenari, golge,
       murekkep kaymasi). Tuvali her yandan pay birakarak buyut, yoksa kesilir. */
    var PADX = 70, PADY = 45, padX = 0, padY = 0;
    var fontData = null;

    function fetchFont() {
      if (fontData) return Promise.resolve(fontData);
      return fetch("/assets/fonts/archivo-black-latin-400-normal.woff2").then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
        var s = "", u = new Uint8Array(buf);
        for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
        fontData = "data:font/woff2;base64," + btoa(s);
        return fontData;
      });
    }

    /* Ana SVG'deki iki cizgiyi (golge + ana), filtreleri ve fontuyla birlikte
       tek basina bir SVG resmine cevir: tuvalde birebir ayni gorunsun */
    function svgImage(font) {
      var r = svg.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var v = svg.viewBox.baseVal, k = r.width / v.width;
      padX = PADX * k; padY = PADY * k;
      W = Math.round((v.width + 2 * PADX) * k); H = Math.round((v.height + 2 * PADY) * k);
      var vb = (v.x - PADX) + " " + (v.y - PADY) + " " + (v.width + 2 * PADX) + " " + (v.height + 2 * PADY);
      var defs = ["ink", "ink2"].map(function (id) { var f = document.getElementById(id); return f ? f.outerHTML : ""; }).join("");
      var body = texts.map(function (t) {
        var cs = getComputedStyle(t);
        var st = "font-family:AB;font-size:" + cs.fontSize + ";fill:none;stroke:" + cs.stroke + ";stroke-width:" + cs.strokeWidth + ";stroke-linejoin:round;letter-spacing:" + cs.letterSpacing;
        var c = t.cloneNode(true); c.removeAttribute("class"); c.setAttribute("style", st);
        return c.outerHTML;
      }).join("");
      var str = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" width="' + W * dpr + '" height="' + H * dpr + '" overflow="visible">' +
        "<style>@font-face{font-family:AB;src:url(" + font + ') format("woff2")}</style><defs>' + defs + "</defs>" + body + "</svg>";
      return new Promise(function (ok, bad) {
        var img = new Image();
        img.onload = function () { ok(img); };
        img.onerror = bad;
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(str);
      });
    }

    function build() {
      if (building) return; building = true;
      fetchFont().then(svgImage).then(function (img) {
        building = false;
        var w = W * dpr, h = H * dpr;
        base.width = w; base.height = h;
        bctx.clearRect(0, 0, w, h);
        bctx.drawImage(img, 0, 0, w, h);
        var data;
        try { data = bctx.getImageData(0, 0, w, h).data; } catch (e) { return; } /* tuval kirlendiyse vazgec, SVG kalir */
        C = Math.max(2, Math.round(2 * dpr)); R = 64 * dpr;
        parts = [];
        for (var y = 0; y < h; y += C) {
          for (var x = 0; x < w; x += C) {
            var hit = false;
            for (var yy = y; yy < Math.min(y + C, h) && !hit; yy++) {
              for (var xx = x; xx < Math.min(x + C, w); xx++) { if (data[(yy * w + xx) * 4 + 3] > 24) { hit = true; break; } }
            }
            if (hit) parts.push({ hx: x, hy: y, x: x, y: y, vx: 0, vy: 0, m: 0.75 + Math.random() * 0.5 });
          }
        }
        canvas.width = w; canvas.height = h;
        canvas.style.width = W + "px"; canvas.style.height = H + "px";
        if (!canvas.parentNode) svg.parentNode.insertBefore(canvas, svg.nextSibling);
        place();
        svg.classList.add("fx-on");
        draw();
      }, function () { building = false; });
    }

    function place() {
      /* <svg> HTMLElement degil, offsetLeft/Top yok: konumu kutulardan hesapla */
      var host = canvas.offsetParent || svg.parentNode;
      var sr = svg.getBoundingClientRect(), hr = host.getBoundingClientRect();
      canvas.style.left = (sr.left - hr.left - (host.clientLeft || 0) - padX) + "px";
      canvas.style.top = (sr.top - hr.top - (host.clientTop || 0) - padY) + "px";
    }

    function draw() {
      var w = canvas.width, h = canvas.height, moved = [];
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (Math.abs(p.x - p.hx) > 0.4 || Math.abs(p.y - p.hy) > 0.4) { moved.push(p); ctx.clearRect(p.hx, p.hy, C, C); }
      }
      for (var j = 0; j < moved.length; j++) {
        var q = moved[j];
        ctx.drawImage(base, q.hx, q.hy, C, C, q.x, q.y, C, C);
      }
    }

    function tick() {
      var active = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (pointer) {
          var dx = p.x - pointer.x, dy = p.y - pointer.y;
          if (dx < R && dx > -R && dy < R && dy > -R) {
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < R) {
              var f = 1 - d / R; f = f * f * 5.2 * p.m * dpr;
              d = d || 1;
              p.vx += dx / d * f + (Math.random() - .5) * f * .9;
              p.vy += dy / d * f + (Math.random() - .5) * f * .9;
            }
          }
        }
        if (p.vx || p.vy || p.x !== p.hx || p.y !== p.hy) {
          p.vx += (p.hx - p.x) * 0.06; p.vy += (p.hy - p.y) * 0.06;
          p.vx *= 0.8; p.vy *= 0.8;
          p.x += p.vx; p.y += p.vy;
          if (Math.abs(p.vx) < 0.01 && Math.abs(p.vy) < 0.01 && Math.abs(p.x - p.hx) < 0.15 && Math.abs(p.y - p.hy) < 0.15) { p.x = p.hx; p.y = p.hy; p.vx = p.vy = 0; }
          else active = true;
        }
      }
      draw();
      raf = (active || pointer) ? requestAnimationFrame(tick) : null;
    }
    function kick() { if (!raf && parts.length) raf = requestAnimationFrame(tick); }

    fx = {
      busy: function () { return !!pointer || !!raf; },
      hide: function () { svg.classList.remove("fx-on"); canvas.style.visibility = "hidden"; },
      show: function () { if (parts.length) { svg.classList.add("fx-on"); canvas.style.visibility = ""; } }
    };

    var hero = svg.closest(".hero") || svg;
    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      var r = canvas.getBoundingClientRect();
      pointer = { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
      kick();
    });
    hero.addEventListener("pointerleave", function () { pointer = null; kick(); });
    var rt = null;
    addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { parts = []; build(); }, 200); });
    build();
  }
})();
