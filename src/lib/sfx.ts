/** Web Audio 짧은 효과음 — 에셋 없이 생성 */

type Kind = "tap" | "correct" | "wrong" | "complete" | "xp" | "start";

let ctx: AudioContext | null = null;
let muted = false;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.08,
  when = 0,
  slideTo?: number,
) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo != null) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export const sfx = {
  setMuted(v: boolean) {
    muted = v;
  },
  play(kind: Kind) {
    if (muted) return;
    try {
      switch (kind) {
        case "tap":
          tone(520, 0.06, "triangle", 0.05);
          break;
        case "start":
          tone(440, 0.08, "square", 0.05);
          tone(660, 0.1, "square", 0.04, 0.06);
          break;
        case "correct":
          tone(523, 0.09, "sine", 0.07);
          tone(659, 0.1, "sine", 0.06, 0.07);
          tone(784, 0.14, "sine", 0.05, 0.14);
          break;
        case "wrong":
          tone(220, 0.18, "sawtooth", 0.05, 0, 140);
          break;
        case "xp":
          tone(880, 0.08, "triangle", 0.05);
          tone(1175, 0.12, "triangle", 0.045, 0.05);
          break;
        case "complete":
          tone(392, 0.1, "sine", 0.06);
          tone(523, 0.1, "sine", 0.06, 0.08);
          tone(659, 0.1, "sine", 0.06, 0.16);
          tone(784, 0.22, "sine", 0.07, 0.24);
          break;
      }
    } catch {
      /* ignore autoplay / audio errors */
    }
  },
};

export const XP_PER_CORRECT = 5;
export const XP_MISSION_BONUS = 15;
export const XP_DAILY_GOAL = 50;
