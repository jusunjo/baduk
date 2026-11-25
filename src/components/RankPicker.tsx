import { RANKS, type Rank, type RankId } from "@/lib/ranks";
import { haptic } from "@/lib/native";

export function RankOptions({
  ranks = RANKS,
  value,
  onChange,
  dark,
}: {
  ranks?: Rank[];
  value: RankId | null;
  onChange: (id: RankId) => void;
  dark?: boolean;
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
              style={
                dark
                  ? {
                      backgroundColor: on ? "rgba(28, 176, 246, 0.16)" : "#1A2C33",
                      boxShadow: on ? "inset 0 0 0 2px #1CB0F6" : "inset 0 0 0 2px #37464F",
                    }
                  : undefined
              }
              className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 text-left transition active:scale-[0.985] ${
                dark
                  ? ""
                  : on
                    ? "bg-toss-blue/10 ring-2 ring-toss-blue"
                    : "bg-toss-soft2 hover:bg-toss-soft"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`text-[16px] font-extrabold ${!dark && !on ? "text-toss-ink" : ""}`}
                    style={{
                      color: on ? "#1CB0F6" : dark ? "#FFFFFF" : undefined,
                    }}
                  >
                    {r.label}
                  </span>
                  <span
                    className={`text-[12px] font-bold ${!dark && !on ? "text-toss-mute" : ""}`}
                    style={{
                      color: on ? "rgba(28, 176, 246, 0.85)" : dark ? "#C4CDD1" : undefined,
                    }}
                  >
                    {r.boardSize}줄 판
                  </span>
                </span>
                <span
                  className={`mt-1 block break-keep text-[13px] leading-snug ${dark ? "" : "text-toss-mute"}`}
                  style={{ color: dark ? "#C4CDD1" : undefined }}
                >
                  {r.meaning}
                </span>
              </span>
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition"
                style={
                  on
                    ? { backgroundColor: "#1CB0F6", color: "#FFFFFF" }
                    : dark
                      ? { backgroundColor: "#131F24", boxShadow: "inset 0 0 0 2px #37464F" }
                      : undefined
                }
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
  const style = {
    backgroundColor: "#163A4A",
    color: "#4CC3FF",
    boxShadow: "0 2px 0 #0F2A36",
  } as const;
  const className =
    "flex h-9 items-center rounded-2xl px-3.5 text-[14px] font-extrabold transition active:translate-y-[2px] active:[box-shadow:0_0_0_#1899D6]";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} style={style}>
        {label}
      </button>
    );
  }
  return (
    <span className={className} style={style}>
      {label}
    </span>
  );
}
