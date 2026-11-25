import { useNavigate } from "react-router-dom";
import { LearnPath } from "@/components/LearnPath";
import { RankBadge } from "@/components/RankPicker";
import { Screen } from "@/components/Screen";
import { useProgress } from "@/lib/progress";

export function HomePage() {
  const navigate = useNavigate();
  const p = useProgress();

  if (!p.rank) return null;

  return (
    <Screen nav gray right={<RankBadge label={p.rank.short} onClick={() => navigate("/path")} />}>
      <div className="sticky top-14 z-10 -mx-5 mb-3 border-b border-toss-line/80 bg-toss-soft/95 px-5 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <StreakChip days={p.streakDays} />
          <span className="rounded-pill bg-white px-2.5 py-1 text-[12px] font-bold text-toss-ink ring-1 ring-toss-line">
            {p.rank.label}
          </span>
          <span className="ml-auto text-[12px] font-bold tabular-nums text-toss-mute">
            {p.done}/{p.total}
          </span>
        </div>
      </div>
      <LearnPath />
    </Screen>
  );
}

function StreakChip({ days }: { days: number }) {
  const on = days > 0;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[12px] font-bold ${
        on ? "bg-[#FFEDD5] text-[#EA580C]" : "bg-white text-toss-mute ring-1 ring-toss-line"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M12 3c1.2 2.4-.2 4.2-1.4 5.5C9.2 10 8 11.4 8 14a4 4 0 0 0 8 0c0-2.2-1-3.8-2-5.2-.8-1.2-1.4-2.2-1.2-3.8.6 1 .8 1.8 1.6 2.8C16.2 9.8 18 11.6 18 14.2A6 6 0 0 1 6 14c0-3.2 2.2-5.2 3.8-6.8C11 5.8 11.4 4.6 12 3Z" />
      </svg>
      {on ? days : 0}
    </span>
  );
}
