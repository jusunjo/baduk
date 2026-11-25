import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LearnPath } from "@/components/LearnPath";
import { RankBadge } from "@/components/RankPicker";
import { Screen } from "@/components/Screen";
import { useProgress } from "@/lib/progress";

export function HomePage() {
  const navigate = useNavigate();
  const p = useProgress();

  if (!p.rank) return null;

  const goalPct = Math.round(p.xpGoalPct * 100);

  return (
    <Screen nav gray right={<RankBadge label={p.rank.short} onClick={() => navigate("/path")} />}>
      <div
        className="sticky top-14 z-40 -mx-5 mb-4 px-5 py-3"
        style={{ backgroundColor: "#131F24", borderBottom: "2px solid #37464F" }}
      >
        <div className="flex items-center gap-2.5">
          <HudChip icon={<FlameIcon />} value={p.streakDays} color="#FF9600" bg="#3A2A14" />
          <HudChip icon={<XpIcon />} value={p.xp} color="#1CB0F6" bg="#163A4A" />
          <div className="ml-auto min-w-[128px] max-w-[160px] flex-1">
            <div className="mb-1.5 flex items-center justify-between text-[12px] font-extrabold">
              <span className="duo-t2">오늘 목표</span>
              <span className="duo-t1 tabular-nums">
                {p.xpToday}/{p.xpGoal}
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full" style={{ backgroundColor: "#37464F" }}>
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max(goalPct === 0 ? 0 : 10, goalPct)}%`,
                  background: "linear-gradient(90deg, #1CB0F6, #58CC02)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <LearnPath />
    </Screen>
  );
}

function HudChip({
  icon,
  value,
  color,
  bg,
}: {
  icon: ReactNode;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-2xl px-2.5 py-2 text-[15px] font-extrabold tabular-nums"
      style={{ color, backgroundColor: bg }}
    >
      {icon}
      {value}
    </span>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 3c1.2 2.4-.2 4.2-1.4 5.5C9.2 10 8 11.4 8 14a4 4 0 0 0 8 0c0-2.2-1-3.8-2-5.2-.8-1.2-1.4-2.2-1.2-3.8.6 1 .8 1.8 1.6 2.8C16.2 9.8 18 11.6 18 14.2A6 6 0 0 1 6 14c0-3.2 2.2-5.2 3.8-6.8C11 5.8 11.4 4.6 12 3Z" />
    </svg>
  );
}

function XpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2.5 14.2 8l5.8.5-4.4 3.7 1.4 5.6L12 14.8 6.9 17.8l1.4-5.6L4 8.5 9.8 8 12 2.5Z" />
    </svg>
  );
}
