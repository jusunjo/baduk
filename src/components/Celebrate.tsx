import { useMemo, type CSSProperties } from "react";

const COLORS = ["#3182F6", "#FFB331", "#F04452", "#00C471", "#A234C7", "#191F28", "#ffffff"];

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

/** Card that replaces the board when a lesson or chapter is finished. */
export function CompleteCard({
  kind,
  title,
  done,
  total,
  chapterDone,
  chapterTotal,
}: {
  kind: "lesson" | "chapter" | "track";
  title: string;
  done: number;
  total: number;
  chapterDone: number;
  chapterTotal: number;
}) {
  const badge = kind === "lesson" ? "레슨 완료" : kind === "chapter" ? "챕터 완료" : "과정 졸업";
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

      <div className="mt-6 grid w-full animate-rise-in grid-cols-2 gap-2" style={{ animationDelay: "320ms" }}>
        <Meter label="이번 챕터" value={chapterDone} total={chapterTotal} />
        <Meter label="전체 과정" value={done} total={total} />
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
