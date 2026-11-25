import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "@/components/Board";
import { CompanionCard, companionMood } from "@/components/Companion";
import { DailyPulse } from "@/components/DailyPulse";
import { GoalSheet } from "@/components/GoalSheet";
import { RankBadge } from "@/components/RankPicker";
import { Headline, PrimaryButton, Reveal, Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { homePractice } from "@/data/curriculum";
import { applySetup } from "@/lib/board";
import { dDayLabel, formatDay } from "@/lib/date";
import { listConcepts } from "@/lib/practice";
import { useProgress } from "@/lib/progress";

export function HomePage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [sheet, setSheet] = useState<"goal" | null>(null);

  const focus = p.next ?? p.lessons[p.lessons.length - 1] ?? null;
  const upcoming = useMemo(() => {
    if (!p.next) return [];
    const i = p.lessons.findIndex((l) => l.id === p.next!.id);
    return p.lessons.slice(i, i + 3);
  }, [p.lessons, p.next]);

  const chapterTitle = useMemo(() => {
    if (!p.curriculum || !focus) return null;
    return p.curriculum.chapters.find((c) => c.lessons.some((l) => l.id === focus.id))?.title ?? null;
  }, [p.curriculum, focus]);

  const practice = useMemo(() => (focus ? homePractice(focus) : null), [focus]);
  const practiceBoard = useMemo(() => {
    if (!practice?.setup?.length) return null;
    return {
      size: practice.size,
      board: applySetup(practice.size, practice.setup),
      highlights: practice.highlight,
    };
  }, [practice]);

  const firstConcept = useMemo(() => {
    if (!p.rank) return null;
    return listConcepts(p.rank.track)[0] ?? null;
  }, [p.rank]);

  if (!p.rank) return null;

  const introPhase = p.done === 0;
  const trackClear = !p.next && p.done > 0;
  const remaining = Math.max(0, p.total - p.done);
  const mood = companionMood({
    intro: introPhase,
    missionDone: p.missionDoneToday,
    streak: p.streakDays,
    trackClear,
  });

  const headline = introPhase
    ? "바둑,\n생각보다 어렵지 않아요"
    : p.next
      ? `${p.next.vibe}\n이어서 둘까요?`
      : "이 판의 개념은\n다 익혔어요";

  const goMission = () => {
    if (p.next) navigate(`/learn/${p.next.id}`);
    else if (focus) navigate(`/learn/${focus.id}`);
  };

  return (
    <Screen nav right={<RankBadge label={p.rank.short} onClick={() => navigate("/path")} />}>
      <Reveal className="px-1 pt-1">
        <p className="text-[13px] font-semibold text-toss-mute">나의 급수 · {p.rank.label}</p>
        <Headline>{headline}</Headline>
        {introPhase && (
          <p className="mt-2 break-keep text-[15px] leading-relaxed text-toss-body">
            급수는 실력 표시예요. 숫자가 작을수록 강해요. 바꾸는 게 아니라, 시험으로 올라가요.
          </p>
        )}
      </Reveal>

      <Reveal order={1} className="mt-4">
        <DailyPulse streak={p.streakDays} missionDone={p.missionDoneToday} onMissionClick={goMission} />
      </Reveal>

      <Reveal order={2} className="mt-3">
        <CompanionCard
          track={p.rank.track}
          rankLabel={p.rank.label}
          boardSize={p.rank.boardSize}
          progress={p.pct}
          mood={mood}
          streak={p.streakDays}
        />
      </Reveal>

      <Reveal order={3} className="mt-3">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="완료" value={`${p.done}`} unit={`/ ${p.total}`} />
          <Stat label="남은 레슨" value={`${remaining}`} unit="개" />
          <Stat label="지금 판" value={`${p.rank.boardSize}`} unit="줄" />
        </div>
      </Reveal>

      {p.goal && p.target && (
        <Reveal order={4} className="mt-3 px-1">
          <button
            type="button"
            onClick={() => setSheet("goal")}
            className="flex w-full items-center gap-2 rounded-2xl bg-toss-soft2 px-3.5 py-2.5 text-left transition active:scale-[0.99]"
          >
            <Pill tone="bg-toss-blue text-white">{p.daysLeft == null ? "목표" : dDayLabel(p.daysLeft)}</Pill>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-toss-body">
              {p.target.label} · {formatDay(p.goal.date)}
            </span>
            <span className="text-[12px] font-semibold text-toss-mute">변경</span>
          </button>
        </Reveal>
      )}

      {focus && (
        <Reveal order={5} className="mt-5 space-y-3">
          {/* 문제 풀이 (개념과 분리) */}
          {firstConcept && (
            <button
              type="button"
              onClick={() => navigate("/practice")}
              className="w-full rounded-[28px] bg-white p-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] ring-1 ring-toss-line transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-toss-blue">문제 풀이</p>
                  <p className="mt-1 text-[17px] font-bold tracking-tight text-toss-ink">개념 고르고 풀기</p>
                  <p className="mt-0.5 break-keep text-[13px] text-toss-mute">
                    개념 {listConcepts(p.rank.track).length}개 · 원하는 주제부터
                  </p>
                </div>
                <span className="shrink-0 rounded-pill bg-toss-blue/10 px-2.5 py-1 text-[12px] font-semibold text-toss-blue">
                  전체 개방
                </span>
              </div>

              {(practiceBoard || firstConcept.problems[0]) && (
                <div className={`mt-4 flex gap-3 ${practiceBoard ? "items-stretch" : "items-start"}`}>
                  {practiceBoard && (
                    <div className="w-[118px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#f7efe2] to-[#f2f4f6] p-2 ring-1 ring-black/[0.04]">
                      <Board
                        size={practiceBoard.size}
                        board={practiceBoard.board}
                        highlights={practiceBoard.highlights}
                        interactive={false}
                        showSize={false}
                        className="max-w-none"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 self-center">
                    <p className="text-[12px] font-semibold text-[#8a6a3d]">예시 개념</p>
                    <p className="mt-1 break-keep text-[15px] font-bold leading-snug text-toss-ink line-clamp-2">
                      {firstConcept.title}
                    </p>
                    <span className="mt-2 inline-block text-[13px] font-semibold text-toss-blue">목록에서 고르기 →</span>
                  </div>
                </div>
              )}
            </button>
          )}

          {/* 개념 이어서 */}
          <button
            type="button"
            onClick={() => navigate(`/learn/${focus.id}`)}
            className="w-full rounded-[24px] bg-toss-soft2 px-4 py-3.5 text-left transition active:scale-[0.99]"
          >
            <p className="text-[12px] font-semibold text-toss-mute">
              {introPhase ? "개념 배우기" : chapterTitle ?? "이어서 배우기"}
            </p>
            <p className="mt-0.5 text-[16px] font-bold tracking-tight text-toss-ink">{focus.title}</p>
            <p className="mt-0.5 break-keep text-[13px] text-toss-mute">
              {focus.subtitle} · {focus.minutes}분
            </p>
          </button>

          {/* 앞으로의 길 */}
          {upcoming.length > 0 && (
            <div className="rounded-[24px] bg-toss-soft2 p-3.5">
              <p className="px-1 text-[12px] font-semibold text-toss-mute">앞으로의 길</p>
              <ul className="mt-2 space-y-1">
                {upcoming.map((l, i) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => i === 0 && navigate(`/learn/${l.id}`)}
                      disabled={i > 0}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        i === 0 ? "bg-white ring-1 ring-toss-line active:scale-[0.99]" : "opacity-55"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                          i === 0 ? "bg-toss-blue text-white" : "bg-white text-toss-mute"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-bold text-toss-ink">{l.title}</span>
                        <span className="block truncate text-[12px] text-toss-mute">{l.vibe}</span>
                      </span>
                      <span className="shrink-0 text-[12px] font-semibold tabular-nums text-toss-mute">{l.minutes}분</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PrimaryButton onClick={() => navigate(`/learn/${p.next?.id ?? focus.id}`)}>
            {introPhase ? "쉽게 시작해 보기" : !p.missionDoneToday ? "오늘 한 판 두기" : p.next ? "이어서 배우기" : "다시 복습하기"}
          </PrimaryButton>
        </Reveal>
      )}

      {sheet === "goal" && <GoalSheet currentRank={p.rank.id} current={p.goal} onClose={() => setSheet(null)} />}
    </Screen>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl bg-toss-soft2 px-3 py-2.5 text-center">
      <p className="text-[11px] font-semibold text-toss-mute">{label}</p>
      <p className="mt-0.5 text-[18px] font-bold tabular-nums tracking-tight text-toss-ink">
        {value}
        <span className="ml-0.5 text-[12px] font-semibold text-toss-mute">{unit}</span>
      </p>
    </div>
  );
}
