import { Logo } from "@/components/Logo";
import type { TrackId } from "@/lib/ranks";

export type CompanionMood = "intro" | "mission" | "done" | "streak" | "clear";

const LINES: Record<CompanionMood, (ctx: { streak: number; track: string }) => string> = {
  intro: () => "어렵지 않아요. 같이 두어 볼까요?",
  mission: () => "오늘도 가볍게 한 판만요",
  done: () => "봤죠? 생각보다 할 만해요",
  streak: ({ streak }) => `${streak}일째, 점점 익숙해지고 있어요`,
  clear: ({ track }) => `${track}, 이 구간은 다 익혔어요`,
};

export function companionMood(opts: {
  intro: boolean;
  missionDone: boolean;
  streak: number;
  trackClear: boolean;
}): CompanionMood {
  if (opts.intro) return "intro";
  if (opts.trackClear) return "clear";
  if (opts.missionDone && opts.streak >= 3) return "streak";
  if (opts.missionDone) return "done";
  return "mission";
}

export function CompanionCard({
  rankLabel,
  boardSize,
  progress,
  mood,
  streak,
}: {
  track: TrackId;
  rankLabel: string;
  boardSize: number;
  /** 0~1 within current track */
  progress: number;
  mood: CompanionMood;
  streak: number;
}) {
  const line = LINES[mood]({ streak, track: rankLabel });

  return (
    <div className="flex items-center gap-3.5 rounded-[28px] bg-gradient-to-br from-[#eef3f8] via-[#f4f7f2] to-[#e8f1ff] px-4 py-3.5 ring-1 ring-black/[0.04]">
      <div className="relative shrink-0">
        <Logo
          size={64}
          className={mood === "intro" || mood === "mission" ? "animate-companion-bob" : "animate-pop"}
        />
        {mood === "done" || mood === "streak" ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-toss-green text-[10px] font-bold text-white shadow-sm">
            ✓
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#6b7c93]">
          나의 급수 · {rankLabel} · {boardSize}줄
        </p>
        <p key={line} className="mt-0.5 animate-rise-in break-keep text-[15px] font-bold leading-snug tracking-tight text-toss-ink">
          {line}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-black/[0.04]">
          <div
            className="h-full rounded-full bg-toss-blue transition-[width] duration-700 ease-out"
            style={{ width: `${Math.round(Math.min(1, Math.max(0.08, progress)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
