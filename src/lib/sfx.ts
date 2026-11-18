"use client";

let ctx: AudioContext | null = null;

function tone(freqs: number[], dur = 0.12) {
  try {
    ctx ??= new AudioContext();
    const c = ctx;
    freqs.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t = c.currentTime + i * dur;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  good: () => tone([660, 880]),
  bad: () => tone([300, 220], 0.15),
  done: () => tone([523, 659, 784, 1047], 0.1),
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}
