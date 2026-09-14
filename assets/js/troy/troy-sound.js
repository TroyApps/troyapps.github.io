const STORAGE_KEY = "troy-sound-enabled";

export function createTroySound({
  storage = globalThis.localStorage,
  AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext,
} = {}) {
  let enabled = false;
  let context = null;

  try {
    enabled = storage?.getItem(STORAGE_KEY) === "true";
  } catch {
    enabled = false;
  }

  function audioContext() {
    if (!enabled || !AudioContextClass) return null;
    if (!context) context = new AudioContextClass();
    if (context.state === "suspended") {
      context.resume?.().catch?.(() => {});
    }
    return context;
  }

  function tone(ctx, { at = ctx.currentTime, duration, startHz, endHz, gain, type }) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startHz, at);
    oscillator.frequency.exponentialRampToValueAtTime(endHz, at + duration);
    envelope.gain.setValueAtTime(Math.max(gain, 0.0001), at);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(envelope);
    envelope.connect(ctx.destination);
    oscillator.start(at);
    oscillator.stop(at + duration);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }

  function noise(ctx, { at = ctx.currentTime, duration, gain, cutoffHz }) {
    const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(cutoffHz, at);
    envelope.gain.setValueAtTime(Math.max(gain, 0.0001), at);
    envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(ctx.destination);
    source.start(at);
    source.stop(at + duration);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }

  function play(effect) {
    if (!enabled || !["poke", "slap", "whip"].includes(effect)) return false;

    try {
      const ctx = audioContext();
      if (!ctx) return false;
      const now = ctx.currentTime;

      if (effect === "poke") {
        tone(ctx, { at: now, duration: 0.09, startHz: 190, endHz: 120, gain: 0.035, type: "triangle" });
      } else if (effect === "slap") {
        noise(ctx, { at: now, duration: 0.12, gain: 0.11, cutoffHz: 850 });
        tone(ctx, { at: now, duration: 0.08, startHz: 130, endHz: 80, gain: 0.035, type: "triangle" });
      } else {
        tone(ctx, { at: now, duration: 0.22, startHz: 1_100, endHz: 150, gain: 0.045, type: "sawtooth" });
        noise(ctx, { at: now + 0.16, duration: 0.07, gain: 0.09, cutoffHz: 1_300 });
      }
      return true;
    } catch {
      return false;
    }
  }

  return {
    isEnabled() { return enabled; },
    toggle() {
      enabled = !enabled;
      try {
        storage?.setItem(STORAGE_KEY, String(enabled));
      } catch {
        // Storage is optional; the in-memory preference still works.
      }
      return enabled;
    },
    play,
    dispose() {
      if (!context) return;
      try {
        context.close?.();
      } catch {
        // Closing audio is best-effort during page teardown.
      }
      context = null;
    },
  };
}
