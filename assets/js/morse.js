/* TroyApps — morse.js : Canlı Sinyal demosu (Morse Flash sayfası) */
(function () {
  "use strict";

  var MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
    H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
    O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
    V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
    "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--", "'": ".----.",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", ":": "---...", "=": "-...-",
    "+": ".-.-.", "-": "-....-", "@": ".--.-.", '"': ".-..-."
  };

  /* Türkçe karakterleri en yakın Latin karşılığına indir */
  var TR_MAP = { "Ç": "C", "Ğ": "G", "İ": "I", "I": "I", "Ö": "O", "Ş": "S", "Ü": "U" };

  var UNIT = 160; /* ms — foto-hassasiyet için yavaş tutuldu (< 3 flaş/sn) */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function normalize(text) {
    return text
      .toLocaleUpperCase("tr-TR")
      .split("")
      .map(function (ch) { return TR_MAP[ch] || ch; })
      .join("");
  }

  /* Metni [ {char, code} | {space:true} ] listesine çevir */
  function encode(text) {
    var out = [];
    var norm = normalize(text);
    for (var i = 0; i < norm.length; i++) {
      var ch = norm[i];
      if (ch === " ") {
        if (out.length && !out[out.length - 1].space) out.push({ space: true });
      } else if (MORSE[ch]) {
        out.push({ ch: ch, code: MORSE[ch] });
      }
    }
    while (out.length && out[out.length - 1].space) out.pop();
    return out;
  }

  function Player(lampEl) {
    this.lamp = lampEl;
    this.timer = null;
    this.playing = false;
    this.onFinish = null;
  }

  Player.prototype.stop = function () {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.playing = false;
    if (this.lamp) this.lamp.classList.remove("on");
    document.body.classList.remove("lamp-lit");
  };

  /* steps: {on:bool, ms:number, symEl:Element|null, done:bool} adımları sırayla oynat */
  Player.prototype.run = function (steps) {
    var self = this;
    this.stop();
    this.playing = true;
    var i = 0;

    function next() {
      if (!self.playing || i >= steps.length) {
        self.stop();
        if (self.onFinish) self.onFinish();
        return;
      }
      var st = steps[i++];
      if (self.lamp) {
        if (st.on && !reduceMotion) {
          self.lamp.classList.add("on");
          document.body.classList.add("lamp-lit");
        } else {
          self.lamp.classList.remove("on");
          document.body.classList.remove("lamp-lit");
        }
      }
      if (st.symEl) {
        if (st.done) { st.symEl.classList.remove("hit"); st.symEl.classList.add("done"); }
        else st.symEl.classList.add("hit");
      }
      self.timer = setTimeout(next, st.ms);
    }
    next();
  };

  /* Kodlanmış diziden zaman adımları üret; outEl verildiyse sembol span'ları oluşturur */
  function buildSteps(encoded, outEl) {
    var steps = [];
    if (outEl) outEl.textContent = "";

    encoded.forEach(function (item, idx) {
      if (item.space) {
        if (outEl) {
          var sep = document.createElement("span");
          sep.className = "sep";
          sep.textContent = "/";
          outEl.appendChild(sep);
        }
        steps.push({ on: false, ms: UNIT * 7 });
        return;
      }
      var letterWrap = null;
      if (outEl) {
        letterWrap = document.createElement("span");
        letterWrap.className = "letter";
        letterWrap.setAttribute("aria-hidden", "true");
        outEl.appendChild(letterWrap);
        if (idx < encoded.length - 1 && !encoded[idx + 1].space) {
          outEl.appendChild(document.createTextNode(" "));
        }
      }
      item.code.split("").forEach(function (sym, sIdx) {
        var symEl = null;
        if (letterWrap) {
          symEl = document.createElement("span");
          symEl.className = "sym";
          symEl.textContent = sym === "." ? "•" : "—";
          letterWrap.appendChild(symEl);
        }
        steps.push({ on: true, ms: UNIT * (sym === "." ? 1 : 3), symEl: symEl });
        steps.push({ on: false, ms: UNIT, symEl: symEl, done: true });
        void sIdx;
      });
      steps.push({ on: false, ms: UNIT * 2 }); /* harf arası: 1u zaten var + 2u */
    });
    return steps;
  }

  /* ---------- Hero giriş şovu: SOS ---------- */

  var heroLamp = document.getElementById("hero-lamp");
  var heroCaption = document.getElementById("hero-caption");

  if (heroLamp) {
    var heroPlayer = new Player(heroLamp);
    var sosText = heroLamp.getAttribute("data-signal") || "SOS";
    var captionAfter = heroCaption ? heroCaption.getAttribute("data-after") : "";

    if (!reduceMotion) {
      var steps = buildSteps(encode(sosText), null);
      heroPlayer.onFinish = function () {
        if (heroCaption && captionAfter) heroCaption.textContent = captionAfter;
      };
      window.setTimeout(function () { heroPlayer.run(steps); }, 900);
    } else if (heroCaption && captionAfter) {
      heroCaption.textContent = captionAfter;
    }
  }

  /* ---------- Canlı Sinyal interaktif demo ---------- */

  var input = document.getElementById("morse-input");
  var playBtn = document.getElementById("morse-play");
  var output = document.getElementById("morse-output");
  var demoLamp = document.getElementById("demo-lamp");

  if (input && playBtn && output && demoLamp) {
    var demoPlayer = new Player(demoLamp);
    var labelPlay = playBtn.getAttribute("data-play");
    var labelStop = playBtn.getAttribute("data-stop");

    function setPlaying(is) {
      playBtn.textContent = is ? labelStop : labelPlay;
      playBtn.setAttribute("aria-pressed", is ? "true" : "false");
    }

    function renderOnly() {
      buildSteps(encode(input.value), output);
      output.querySelectorAll(".sym").forEach(function (el) { el.classList.add("done"); });
    }

    demoPlayer.onFinish = function () { setPlaying(false); };

    playBtn.addEventListener("click", function () {
      if (demoPlayer.playing) {
        demoPlayer.stop();
        setPlaying(false);
        return;
      }
      var encoded = encode(input.value);
      if (!encoded.length) { input.focus(); return; }
      var steps = buildSteps(encoded, output);
      setPlaying(true);
      demoPlayer.run(steps);
    });

    input.addEventListener("input", function () {
      demoPlayer.stop();
      setPlaying(false);
      renderOnly();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); playBtn.click(); }
    });

    /* İlk açılışta örnek metni işle */
    renderOnly();
  }
})();
