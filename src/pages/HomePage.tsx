import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanionCard, companionMood } from "@/components/Companion";
import { DailyPulse } from "@/components/DailyPulse";
import { GoalSheet } from "@/components/GoalSheet";
import { RankBadge } from "@/components/RankPicker";
import { Headline, PrimaryButton, Reveal, Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { itemKey, itemTitle } from "@/data/path";
import { dDayLabel, formatDay } from "@/lib/date";
import { listConcepts } from "@/lib/practice";
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
    : p.canTakeExam
      ? "승급 시험\n준비됐어요"
      : p.next
        ? `${itemTitle(p.next)}\n이어서 둘까요?`
        : "이 구간은\n다 익혔어요";

  const goMission = () => {
    if (p.canTakeExam && p.module) navigate(`/exam/${p.module.rankId}`);
    else if (p.nextId) navigate(`/mission/${p.nextId}`);
    else navigate("/learn");
  };

  return (
    <Screen nav right={<RankBadge label={p.rank.short} onClick={() => navigate("/path")} />}>
      <Reveal className="px-1 pt-1">
        <p className="text-[13px] font-semibold text-toss-mute">나의 급수 · {p.rank.label}</p>
        <Headline>{headline}</Headline>
        {introPhase && (
          <p className="mt-2 break-keep text-[15px] leading-relaxed text-toss-body">
            Course로 규칙을 익히고, 급수 파트로 감각을 쌓은 뒤 시험으로 올라가요.
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
          <Stat label="남은 미션" value={`${remaining}`} unit="개" />
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

      <Reveal order={5} className="mt-5 space-y-3">
        {firstConcept && (
          <button
            type="button"
            onClick={() => navigate("/practice")}
            className="w-full rounded-[28px] bg-white p-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] ring-1 ring-toss-line transition active:scale-[0.99]"
          >
            <p className="text-[12px] font-semibold text-toss-blue">문제 풀이</p>
            <p className="mt-1 text-[17px] font-bold tracking-tight text-toss-ink">개념 고르고 풀기</p>
            <p className="mt-0.5 break-keep text-[13px] text-toss-mute">
              개념 {listConcepts(p.rank.track).length}개 · 원하는 주제부터
            </p>
          </button>
        )}

        {p.next && (
          <button
            type="button"
            onClick={goMission}
            className="w-full rounded-[24px] bg-toss-soft2 px-4 py-3.5 text-left transition active:scale-[0.99]"
          >
            <p className="text-[12px] font-semibold text-toss-mute">
              {introPhase ? "Course 시작" : p.canTakeExam ? "승급 시험" : "이어서 배우기"}
            </p>
            <p className="mt-0.5 text-[16px] font-bold tracking-tight text-toss-ink">{itemTitle(p.next)}</p>
            <p className="mt-0.5 break-keep text-[13px] text-toss-mute">짧은 미션 · 판 위에서</p>
          </button>
        )}

        {upcoming.length > 0 && (
          <div className="rounded-[24px] bg-toss-soft2 p-3.5">
            <p className="px-1 text-[12px] font-semibold text-toss-mute">앞으로의 길</p>
            <ul className="mt-2 space-y-1">
              {upcoming.map((item, i) => {
                const key = itemKey(item);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => i === 0 && (item.kind === "rank-exam" ? navigate(`/exam/${item.module.rankId}`) : navigate(`/mission/${key}`))}
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
                      <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-toss-ink">{itemTitle(item)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <PrimaryButton onClick={goMission}>
          {introPhase
            ? "쉽게 시작해 보기"
            : p.canTakeExam
              ? "승급 시험 보기"
              : !p.missionDoneToday
                ? "오늘 한 판 두기"
                : p.next
                  ? "이어서 배우기"
                  : "개념 목록 보기"}
        </PrimaryButton>
      </Reveal>

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
