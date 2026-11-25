import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { companionMood } from "@/components/Companion";
import { GoalSheet } from "@/components/GoalSheet";
import { Logo } from "@/components/Logo";
import { Headline, Reveal, Screen, SecondaryButton } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { dDayLabel, formatDay } from "@/lib/date";
import { RANKS } from "@/lib/ranks";
import { useProgress } from "@/lib/progress";
import { actions } from "@/lib/store";

export function PathPage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [goalOpen, setGoalOpen] = useState(false);
  if (!p.rank) return null;

  const mood = companionMood({
    intro: p.done === 0,
    missionDone: p.missionDoneToday,
    streak: p.streakDays,
    trackClear: !p.next && p.done > 0,
  });
  const myLevel = p.rank.level;

  return (
    <Screen nav>
      <Reveal className="px-1 pt-1">
        <Headline>{"나의 급수"}</Headline>
        <p className="mt-2 break-keep text-[15px] leading-relaxed text-toss-body">
          급수는 실력 표시예요. 숫자가 작을수록 강해요. 천천히 따라가면 됩니다.
        </p>
      </Reveal>

      <Reveal order={1} className="mt-6 flex items-center gap-4 rounded-[28px] bg-gradient-to-br from-[#eef3f8] to-[#e8f1ff] p-5">
        <Logo size={72} className={mood === "intro" || mood === "mission" ? "animate-companion-bob" : "animate-pop"} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-toss-mute">지금 급수</p>
          <p className="mt-1 text-[22px] font-bold tracking-tight text-toss-ink">{p.rank.label}</p>
          <p className="mt-2 break-keep text-[14px] leading-relaxed text-toss-body">{p.rank.meaning}</p>
          <p className="mt-3 text-[13px] font-semibold text-[#8a6a3d]">
            {p.rank.boardSize}줄 판 · 연속 {p.streakDays > 0 ? `${p.streakDays}일` : "대기 중"}
          </p>
        </div>
      </Reveal>

      <Reveal order={2} className="mt-4 rounded-[28px] bg-white p-5 ring-1 ring-toss-line">
        {p.goal && p.target ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-toss-mute">목표 급수</p>
              <Pill tone="bg-toss-blue text-white">{p.daysLeft == null ? "—" : dDayLabel(p.daysLeft)}</Pill>
            </div>
            <p className="mt-1 text-[22px] font-bold tracking-tight text-toss-ink">{p.target.label}</p>
            <p className="mt-2 break-keep text-[14px] leading-relaxed text-toss-body">{p.target.meaning}</p>
            <p className="mt-2 text-[13px] font-medium text-toss-mute">{formatDay(p.goal.date)}까지</p>
            <button
              type="button"
              onClick={() => setGoalOpen(true)}
              className="mt-4 text-[14px] font-semibold text-toss-blue"
            >
              목표 바꾸기
            </button>
          </>
        ) : (
          <>
            <p className="text-[17px] font-bold text-toss-ink">목표 급수는 나중에 해도 돼요</p>
            <p className="mt-1 break-keep text-[14px] text-toss-mute">
              지금은 규칙만 익혀도 충분해요. 목표 급수·날짜는 편해지면 정하세요.
            </p>
            <button type="button" onClick={() => setGoalOpen(true)} className="mt-4 text-[14px] font-semibold text-toss-blue">
              목표 급수 정하기
            </button>
          </>
        )}
      </Reveal>

      <Reveal order={3} className="mt-8 px-1">
        <h2 className="text-[15px] font-bold text-toss-ink">급수가 올라가는 길</h2>
        <p className="mt-1 break-keep text-[13px] text-toss-mute">
          지금 급수는 여기서 바꿀 수 없어요. 승급 시험으로만 올라가요.
        </p>
        <ul className="mt-4 space-y-2">
          {RANKS.map((r) => {
            const state = r.level < myLevel ? "done" : r.level === myLevel ? "now" : "soon";
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 ${
                  state === "now" ? "bg-toss-blue/10 ring-1 ring-toss-blue/25" : "bg-toss-soft2"
                }`}
              >
                <Logo size={40} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] font-bold ${state === "now" ? "text-toss-blue" : "text-toss-ink"}`}>
                    {r.label}
                    <span className="ml-1.5 text-[12px] font-semibold text-toss-mute">{r.boardSize}줄</span>
                  </span>
                  <span className="block text-[12px] text-toss-mute">{r.meaning}</span>
                </span>
                <span className="shrink-0 text-[12px] font-semibold text-toss-mute">
                  {state === "done" ? "지남" : state === "now" ? "지금" : "다음"}
                </span>
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal order={4} className="mt-8 space-y-2 px-1">
        <SecondaryButton onClick={() => navigate("/learn")}>개념 목록 보기</SecondaryButton>
        <button
          type="button"
          onClick={() => {
            if (confirm("학습 기록을 모두 지우고 처음부터 할까요?")) actions.reset();
          }}
          className="w-full py-3 text-center text-[13px] font-medium text-toss-mute"
        >
          처음부터 다시 설정
        </button>
      </Reveal>

      {goalOpen && <GoalSheet currentRank={p.rank.id} current={p.goal} onClose={() => setGoalOpen(false)} />}
    </Screen>
  );
}
