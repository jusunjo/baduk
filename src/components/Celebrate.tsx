import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { PrimaryButton } from "@/components/Screen";
import { sfx } from "@/lib/sfx";

const COLORS = ["#3182F6", "#FFB331", "#F04452", "#00C471", "#A234C7", "#58CC02", "#ffffff"];

/** Shared confetti + floating praise helper (레슨·미션·연습 공용) */
export function useCelebrate() {
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);
  const [burst, setBurst] = useState<{ id: number; big: boolean } | null>(null);
  const [praise, setPraise] = useState<{ id: number; text: string; tone: "blue" | "orange" } | null>(null);
  const celebrate = useCallback(
    (opts: { praise?: string; tone?: "blue" | "orange"; confetti?: "small" | "big" }) => {
      const id = Date.now();
      if (opts.praise) {
        setPraise({ id, text: opts.praise, tone: opts.tone ?? "blue" });
        later(() => setPraise((cur) => (cur?.id === id ? null : cur)), 1100);
      }
      if (opts.confetti) {
        setBurst({ id, big: opts.confetti === "big" });
        later(() => setBurst((cur) => (cur?.id === id ? null : cur)), opts.confetti === "big" ? 3200 : 2400);
      }
    },
    [later],
  );
  useEffect(() => () => clearTimers(), [clearTimers]);
  return { burst, praise, celebrate, later, clearTimers };
}

/** One-shot confetti burst. Remount (change `key`) to fire again. */
export function Confetti({ big = false, originY = 45 }: { big?: boolean; originY?: number }) {
  const pieces = useMemo(() => {
    const count = big ? 90 : 36;
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const power = (big ? 180 : 110) + Math.random() * (big ? 220 : 120);
      const dx = Math.cos(angle) * power;
      const dy = Math.sin(angle) * power * 0.7 + (big ? 260 : 160);
      const round = i % 3 === 0;
      return {
        id: i,
        color: COLORS[i % COLORS.length],
        w: round ? 9 : 6 + Math.random() * 5,
        h: round ? 9 : 10 + Math.random() * 8,
        round,
        style: {
          "--dx": `${dx}px`,
          "--dy": `${dy}px`,
          "--rot": `${(Math.random() - 0.5) * 900}deg`,
          "--dur": `${900 + Math.random() * (big ? 900 : 500)}ms`,
          "--delay": `${Math.random() * (big ? 220 : 80)}ms`,
        } as CSSProperties,
      };
    });
  }, [big]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2" style={{ top: `${originY}%` }}>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece absolute block"
            style={{
              ...p.style,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? 999 : 2,
              boxShadow: p.color === "#ffffff" ? "0 0 0 1px rgba(0,0,0,0.06)" : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const PRAISE = ["좋아요!", "정확해요!", "완벽해요!", "잘했어요!", "멋져요!"];
export const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

/** Floating badge over the board after a correct move. */
export function PraiseBadge({ text, tone = "blue" }: { text: string; tone?: "blue" | "orange" }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
      <span
        className={`animate-pop rounded-full px-4 py-2 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] ${
          tone === "orange" ? "bg-toss-orange" : "bg-toss-blue"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

/** 듀오식 미션/레슨 클리어 화면 */
export function MissionClearScreen({
  title,
  xp,
  streakDays,
  onContinue,
}: {
  title: string;
  xp: number;
  streakDays?: number;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
        <div
          className="flex h-[104px] w-[104px] animate-pop items-center justify-center rounded-[32px]"
          style={{ backgroundColor: "#58CC02", boxShadow: "0 8px 0 #46A302" }}
        >
          <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" aria-hidden>
            <path d="m5.5 12.5 4.2 4.2L18.5 8" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="duo-t-green-hi mt-7 animate-rise-in text-[15px] font-extrabold" style={{ animationDelay: "80ms" }}>
          레슨 완료!
        </p>
        <p
          className="duo-t1 mt-2 animate-rise-in break-keep text-[26px] font-extrabold leading-snug"
          style={{ animationDelay: "140ms" }}
        >
          {title}
        </p>
        <div className="mt-8 flex w-full max-w-[320px] animate-rise-in gap-3" style={{ animationDelay: "220ms" }}>
          <StatChip
            label="획득 XP"
            value={`+${xp}`}
            color="#1CB0F6"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 2.5 14.2 8l5.8.5-4.4 3.7 1.4 5.6L12 14.8 6.9 17.8l1.4-5.6L4 8.5 9.8 8 12 2.5Z" />
              </svg>
            }
          />
          {streakDays != null && streakDays > 0 ? (
            <StatChip
              label="연속 학습"
              value={`${streakDays}일`}
              color="#FF9600"
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                  <path d="M12 3c1.2 2.4-.2 4.2-1.4 5.5C9.2 10 8 11.4 8 14a4 4 0 0 0 8 0c0-2.2-1-3.8-2-5.2-.8-1.2-1.4-2.2-1.2-3.8.6 1 .8 1.8 1.6 2.8C16.2 9.8 18 11.6 18 14.2A6 6 0 0 1 6 14c0-3.2 2.2-5.2 3.8-6.8C11 5.8 11.4 4.6 12 3Z" />
                </svg>
              }
            />
          ) : null}
        </div>
      </div>
      <div className="shrink-0 border-t-2 border-duo-night-line pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        <PrimaryButton
          night
          onClick={() => {
            sfx.play("tap");
            onContinue();
          }}
        >
          계속하기
        </PrimaryButton>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl px-3 py-3.5" style={{ backgroundColor: "#202F36", boxShadow: "inset 0 0 0 2px #37464F" }}>
      <span className="flex items-center gap-1 text-[12px] font-extrabold" style={{ color }}>
        {icon}
        {label}
      </span>
      <span className="duo-t1 mt-1 text-[22px] font-extrabold tabular-nums">{value}</span>
    </div>
  );
}

/** Card that replaces the board when a lesson or chapter is finished. */
export function CompleteCard({
  kind,
  title,
  done,
  total,
  chapterDone,
  chapterTotal,
  rankLabel,
}: {
  kind: "lesson" | "chapter" | "track";
  title: string;
  done: number;
  total: number;
  chapterDone: number;
  chapterTotal: number;
  /** 급수 중심 축하 문구용 */
  rankLabel?: string;
}) {
  const badge =
    kind === "lesson" ? "레슨 완료" : kind === "chapter" ? "챕터 완료" : rankLabel ? `${rankLabel} 구간 완료` : "과정 졸업";
  const color = kind === "lesson" ? "bg-toss-blue shadow-[0_8px_0_#1B64DA]" : "bg-toss-orange shadow-[0_8px_0_#d9771a]";
  return (
    <div className="flex w-full flex-col items-center rounded-[28px] bg-toss-soft2 px-5 py-7 text-center">
      <div className={`flex h-24 w-24 animate-pop items-center justify-center rounded-[30px] ${color}`}>
        {kind === "lesson" ? (
          <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden>
            <path d="m5.5 12.5 4.2 4.2L18.5 8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden>
            <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5Z" fill="#fff" />
            <path d="M7 5.5H4.5v1.5A3 3 0 0 0 7.5 10M17 5.5h2.5v1.5a3 3 0 0 1-3 3" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <rect x="10.5" y="13" width="3" height="4" fill="#fff" />
            <rect x="7" y="17" width="10" height="3.5" rx="1.5" fill="#fff" />
          </svg>
        )}
      </div>
      <p className="mt-6 animate-rise-in text-[13px] font-bold text-toss-blue" style={{ animationDelay: "150ms" }}>
        {badge}
      </p>
      <p className="mt-1 animate-rise-in break-keep text-[20px] font-bold tracking-tight text-toss-ink" style={{ animationDelay: "220ms" }}>
        {title}
      </p>
      {kind === "track" && rankLabel && (
        <p className="mt-2 animate-rise-in break-keep text-[14px] font-medium text-toss-body" style={{ animationDelay: "260ms" }}>
          이 급수에서 배울 개념을 모두 익혔어요
        </p>
      )}

      <div className="mt-6 grid w-full animate-rise-in grid-cols-2 gap-2" style={{ animationDelay: "320ms" }}>
        <Meter label="이번 챕터" value={chapterDone} total={chapterTotal} />
        <Meter label="이 급수" value={done} total={total} />
      </div>
    </div>
  );
}

function Meter({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-2xl bg-white px-4 py-3 text-left">
      <p className="text-[12px] font-semibold text-toss-mute">{label}</p>
      <p className="mt-0.5 text-[18px] font-bold tabular-nums text-toss-ink">
        {value}
        <span className="text-[13px] font-semibold text-toss-mute">/{total}</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-toss-soft">
        <div className="h-full origin-left animate-grow-x rounded-full bg-toss-blue" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
