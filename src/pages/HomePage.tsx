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
      <div className="sticky top-14 z-40 -mx-5 mb-3 border-b-2 border-duo-swan bg-[#F7F7F7]/95 px-5 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <HudChip icon={<FlameIcon />} value={p.streakDays} tone="text-[#FF9600]" bg="bg-[#FFF4E0]" />
          <HudChip icon={<XpIcon />} value={p.xp} tone="text-[#1CB0F6]" bg="bg-[#DDF4FF]" />
          <div className="ml-auto min-w-[112px]">
            <div className="mb-1 flex items-center justify-between text-[11px] font-extrabold">
              <span className="text-[#5C656B]">오늘 목표</span>
              <span className="tabular-nums text-[#3C3C3C]">
                {p.xpToday}/{p.xpGoal}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white ring-1 ring-duo-swan">
              <div
                className="h-full rounded-full bg-gradient-to-r from-duo-blue to-duo-green transition-[width] duration-500"
                style={{ width: `${Math.max(goalPct === 0 ? 0 : 8, goalPct)}%` }}
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
  tone,
  bg,
}: {
  icon: ReactNode;
  value: number;
  tone: string;
  bg: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill ${bg} px-2.5 py-1.5 text-[14px] font-extrabold tabular-nums ${tone}`}>
      {icon}
      {value}
    </span>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 3c1.2 2.4-.2 4.2-1.4 5.5C9.2 10 8 11.4 8 14a4 4 0 0 0 8 0c0-2.2-1-3.8-2-5.2-.8-1.2-1.4-2.2-1.2-3.8.6 1 .8 1.8 1.6 2.8C16.2 9.8 18 11.6 18 14.2A6 6 0 0 1 6 14c0-3.2 2.2-5.2 3.8-6.8C11 5.8 11.4 4.6 12 3Z" />
    </svg>
  );
}

function XpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 2.5 14.2 8l5.8.5-4.4 3.7 1.4 5.6L12 14.8 6.9 17.8l1.4-5.6L4 8.5 9.8 8 12 2.5Z" />
    </svg>
  );
}
