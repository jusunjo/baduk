import { RANKS, type Rank, type RankId } from "@/lib/ranks";
import { haptic } from "@/lib/native";
import { MiniBoard } from "./Board";

export function RankOptions({
  ranks = RANKS,
  value,
  onChange,
}: {
  ranks?: Rank[];
  value: RankId | null;
  onChange: (id: RankId) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {ranks.map((r, i) => {
        const on = r.id === value;
        return (
          <li key={r.id} className="animate-rise-in" style={{ animationDelay: `${i * 35}ms` }}>
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                onChange(r.id);
              }}
              aria-pressed={on}
              className={`flex w-full items-start gap-3 rounded-2xl px-3.5 py-3.5 text-left transition active:scale-[0.985] ${
                on ? "bg-toss-blue/10 ring-2 ring-toss-blue" : "bg-toss-soft2 hover:bg-toss-soft"
              }`}
            >
              <MiniBoard size={r.boardSize} />
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[16px] font-bold ${on ? "text-toss-blue" : "text-toss-ink"}`}>{r.label}</span>
                  <span className={`text-[12px] font-semibold ${on ? "text-toss-blue/70" : "text-toss-mute"}`}>
                    {r.boardSize}줄 판
                  </span>
                </span>
                <span className="mt-1 block break-keep text-[13px] leading-snug text-toss-mute">{r.meaning}</span>
              </span>
              <span
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                  on ? "bg-toss-blue text-white" : "bg-white ring-1 ring-toss-line"
                }`}
                aria-hidden
              >
                {on && (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 animate-pop" fill="none">
                    <path d="m6.5 12.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** 표시만 — 현재 급수는 온보딩·승급 시험 외에는 바꾸지 않음 */
export function RankBadge({ label, onClick }: { label: string; onClick?: () => void }) {
  const className =
    "flex h-9 items-center rounded-pill bg-white px-3.5 text-[14px] font-semibold text-toss-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-toss-line";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} transition active:scale-95`}>
        {label}
      </button>
    );
  }
  return <span className={className}>{label}</span>;
}
