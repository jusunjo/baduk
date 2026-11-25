import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { companionMood } from "@/components/Companion";
import { GoalSheet } from "@/components/GoalSheet";
import { Logo } from "@/components/Logo";
import { RankBadge } from "@/components/RankPicker";
import { Reveal, Screen } from "@/components/Screen";
import { itemKey, itemTitle } from "@/data/path";
import { useProgress } from "@/lib/progress";

export function HomePage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [sheet, setSheet] = useState<"goal" | null>(null);

  const upcoming = useMemo(() => {
    if (!p.next) return [];
    const i = p.queue.findIndex((item) => itemKey(item) === p.nextId);
    return p.queue.slice(Math.max(0, i), Math.max(0, i) + 3);
  }, [p.queue, p.next, p.nextId]);

  if (!p.rank) return null;

  const introPhase = p.done === 0;
  const trackClear = !p.next && p.done > 0;
  const mood = companionMood({
    intro: introPhase,
    missionDone: p.missionDoneToday,
    streak: p.streakDays,
    trackClear,
  });

  const bubble =
    mood === "intro"
      ? "어렵지 않아요. 같이 한 판 두어 볼까요?"
      : mood === "clear"
        ? "이 구간은 다 익혔어요. 복습해도 좋아요!"
        : p.canTakeExam
          ? "승급 시험 열렸어요. 도전해 볼까요?"
          : p.missionDoneToday
            ? "오늘도 해냈어요. 한 판 더?"
            : "오늘도 가볍게, 한 수만요!";

  const goMission = () => {
    if (p.canTakeExam && p.module) navigate(`/exam/${p.module.rankId}`);
    else if (p.nextId) navigate(`/mission/${p.nextId}`);
    else navigate("/learn");
  };

  const ctaLabel = introPhase
    ? "시작하기"
    : p.canTakeExam
      ? "시험 보기"
      : !p.missionDoneToday
        ? "오늘 미션"
        : p.next
          ? "이어서"
          : "복습하기";

  const pct = Math.round(Math.min(1, Math.max(0, p.pct)) * 100);

  return (
    <Screen
      nav
      gray
      right={<RankBadge label={p.rank.short} onClick={() => navigate("/path")} />}
    >
      <div className="relative flex flex-1 flex-col pb-2">
        {/* soft playfield */}
        <div
          className="pointer-events-none absolute inset-x-[-20px] top-0 h-[42%] rounded-b-[40px] opacity-90"
          style={{
            background: "radial-gradient(120% 80% at 50% 0%, #dff3ff 0%, #eef8f1 45%, transparent 75%)",
          }}
          aria-hidden
        />

        <Reveal className="relative px-1 pt-1">
          <div className="flex items-center gap-2">
            <StreakChip days={p.streakDays} />
            {p.missionDoneToday ? (
              <span className="rounded-pill bg-toss-green/15 px-2.5 py-1 text-[12px] font-bold text-toss-green">
                오늘 완료
              </span>
            ) : (
              <span className="rounded-pill bg-toss-blue/12 px-2.5 py-1 text-[12px] font-bold text-toss-blue">
                미션 대기
              </span>
            )}
          </div>
        </Reveal>

        <Reveal order={1} className="relative mt-5 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-white/50 blur-md" aria-hidden />
            <Logo
              size={108}
              className={mood === "intro" || mood === "mission" ? "relative animate-companion-bob" : "relative animate-pop"}
            />
          </div>
          <div className="relative mt-4 max-w-[300px] animate-pop rounded-[22px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(49,130,246,0.1)] ring-1 ring-toss-line">
            <p className="break-keep text-[16px] font-bold leading-snug text-toss-ink">{bubble}</p>
            <span className="absolute -top-2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-white ring-1 ring-toss-line" aria-hidden />
            <span className="absolute -top-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-white" aria-hidden />
          </div>
          <p className="mt-4 text-[13px] font-semibold text-toss-mute">
            {p.rank.label} · {p.done}/{p.total} 미션
          </p>
          <div className="mt-2 h-3 w-[220px] overflow-hidden rounded-full bg-white ring-1 ring-black/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-toss-blue to-[#58CC02] transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(8, pct)}%` }}
            />
          </div>
        </Reveal>

        <Reveal order={2} className="relative mt-7 px-1">
          <button
            type="button"
            onClick={goMission}
            className="flex h-[58px] w-full items-center justify-center rounded-[18px] bg-[#58CC02] text-[18px] font-extrabold tracking-tight text-white shadow-[0_6px_0_#46A302] transition active:translate-y-[4px] active:shadow-[0_2px_0_#46A302]"
          >
            {ctaLabel}
          </button>
          <p className="mt-2 text-center text-[13px] font-medium text-toss-mute">
            {p.next ? itemTitle(p.next) : "개념 맵에서 골라 복습해요"}
          </p>
        </Reveal>

        {upcoming.length > 0 && (
          <Reveal order={3} className="relative mt-6 px-1">
            <p className="mb-3 text-center text-[12px] font-bold uppercase tracking-wide text-toss-mute">다음 길</p>
            <div className="flex items-center justify-center gap-2">
              {upcoming.map((item, i) => {
                const key = itemKey(item);
                const active = i === 0;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!active}
                    onClick={() =>
                      active &&
                      (item.kind === "rank-exam"
                        ? navigate(`/exam/${item.module.rankId}`)
                        : navigate(`/mission/${key}`))
                    }
                    className={`flex h-[72px] w-[72px] flex-col items-center justify-center rounded-[22px] transition ${
                      active
                        ? "bg-toss-blue text-white shadow-[0_5px_0_#1B64DA] active:translate-y-[3px] active:shadow-[0_2px_0_#1B64DA]"
                        : "bg-white text-toss-mute ring-1 ring-toss-line opacity-70"
                    }`}
                  >
                    <span className="text-[15px] font-extrabold">{i + 1}</span>
                    <span className="mt-0.5 max-w-[58px] truncate text-[10px] font-semibold leading-tight">
                      {itemTitle(item).replace(/^Part\s*\d+\s*·\s*/, "").slice(0, 6)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        <Reveal order={4} className="relative mt-auto flex justify-center gap-5 pt-8 text-[13px] font-semibold">
          <button type="button" onClick={() => navigate("/learn")} className="text-toss-blue">
            개념 맵
          </button>
          <span className="text-toss-line">·</span>
          <button type="button" onClick={() => navigate("/practice")} className="text-toss-blue">
            문제 풀기
          </button>
          {p.goal ? (
            <>
              <span className="text-toss-line">·</span>
              <button type="button" onClick={() => setSheet("goal")} className="text-toss-mute">
                목표
              </button>
            </>
          ) : (
            <>
              <span className="text-toss-line">·</span>
              <button type="button" onClick={() => setSheet("goal")} className="text-toss-mute">
                목표 정하기
              </button>
            </>
          )}
        </Reveal>
      </div>

      {sheet === "goal" && <GoalSheet currentRank={p.rank.id} current={p.goal} onClose={() => setSheet(null)} />}
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
      {on ? `${days}일째` : "연속 시작"}
    </span>
  );
}
