import { useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Confetti, useCelebrate } from "@/components/Celebrate";
import { LearnPath } from "@/components/LearnPath";
import { RankBadge } from "@/components/RankPicker";
import { Screen } from "@/components/Screen";
import { dayKey, startOfToday } from "@/lib/date";
import { useProgress } from "@/lib/progress";
import { DAILY_REVIEW_ID, DAILY_REVIEW_SIZE, daysToNextReview, dueCount, wrongCount } from "@/lib/review";
import { useStore } from "@/lib/store";
import { sfx } from "@/lib/sfx";

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const p = useProgress();
  const { burst, celebrate } = useCelebrate();
  const celebrated = useRef(false);

  useEffect(() => {
    const st = location.state as { celebrateHome?: boolean } | null;
    if (!st?.celebrateHome || celebrated.current) return;
    celebrated.current = true;
    celebrate({ confetti: "big" });
    sfx.play("xp");
    navigate("/", { replace: true, state: null });
  }, [location.state, celebrate, navigate]);

  if (!p.rank) return null;

  const goalPct = Math.round(p.xpGoalPct * 100);

  return (
    <Screen nav gray right={<RankBadge label={p.rank.short} onClick={() => navigate("/path")} />}>
      {burst && <Confetti key={burst.id} big={burst.big} originY={22} />}
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
      <DailyReviewCard showEmpty={p.rank.id === "g30"} />
      <LearnPath />
    </Screen>
  );
}

/** 오늘의 복습 — 1·3·7일 간격으로 돌아오는 30급 문제 */
function DailyReviewCard({ showEmpty }: { showEmpty: boolean }) {
  const navigate = useNavigate();
  const st = useStore();
  const total = Object.keys(st.reviews).length;
  if (!total && !showEmpty) return null;

  const due = dueCount(st.reviews);
  const today = Math.min(due, DAILY_REVIEW_SIZE);
  const wrong = wrongCount(st.reviews);
  const doneToday = st.reviewDoneDay === dayKey(startOfToday());
  const nextIn = daysToNextReview(st.reviews);

  let line: string;
  if (today > 0) line = wrong > 0 ? `틀렸던 문제 ${wrong}개가 기다려요` : "잊기 전에 한 번 더 풀어요";
  else if (doneToday) line = "오늘 복습 끝! 내일 또 만나요";
  else if (nextIn !== null) line = `다음 복습은 ${nextIn}일 뒤예요`;
  else line = "30급 문제를 풀면 복습이 쌓여요";

  return (
    <button
      type="button"
      disabled={today === 0}
      onClick={() => {
        sfx.play("tap");
        navigate(`/mission/${DAILY_REVIEW_ID}`);
      }}
      className="mb-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition active:translate-y-[2px] disabled:active:translate-y-0"
      style={{
        backgroundColor: today > 0 ? "#2A1F3D" : "#1A2C33",
        boxShadow: `inset 0 0 0 2px ${today > 0 ? "#CE82FF" : "#37464F"}`,
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[18px] font-black text-white"
        style={{ backgroundColor: today > 0 ? "#CE82FF" : "#37464F" }}
        aria-hidden
      >
        ↻
      </span>
      <span className="min-w-0 flex-1">
        <span className="duo-t1 block text-[16px] font-extrabold">
          {today > 0 ? `오늘의 복습 ${today}문제` : "오늘의 복습"}
        </span>
        <span className="duo-t2 block break-keep text-[13px] font-semibold">{line}</span>
      </span>
      {today > 0 ? <span className="text-[14px] font-extrabold text-[#CE82FF]">시작</span> : null}
    </button>
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
