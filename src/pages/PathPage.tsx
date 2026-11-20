import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoalSheet } from "@/components/GoalSheet";
import { Headline, Reveal, Screen, SecondaryButton } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { dDayLabel, formatDay } from "@/lib/date";
import { TRACKS } from "@/lib/ranks";
import { useProgress } from "@/lib/progress";
import { actions } from "@/lib/store";

export function PathPage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [goalOpen, setGoalOpen] = useState(false);
  if (!p.rank) return null;

  const track = TRACKS[p.rank.track];
  const trackOrder = ["seed", "sprout", "leaf", "tree", "forest"] as const;
  const myIdx = trackOrder.indexOf(p.rank.track);

  return (
    <Screen nav>
      <Reveal className="px-1 pt-1">
        <Headline>{"나의 목표"}</Headline>
        <p className="mt-2 break-keep text-[15px] leading-relaxed text-toss-body">
          급수는 실력의 이정표예요. 판은 작을수록 개념이 잘 보여요.
        </p>
      </Reveal>

      <Reveal order={1} className="mt-6 rounded-[28px] bg-toss-soft2 p-5">
        <p className="text-[13px] font-semibold text-toss-mute">지금</p>
        <p className="mt-1 text-[22px] font-bold tracking-tight text-toss-ink">{p.rank.label}</p>
        <p className="mt-2 break-keep text-[14px] leading-relaxed text-toss-body">{p.rank.meaning}</p>
        <p className="mt-3 text-[13px] font-semibold text-[#8a6a3d]">
          {track.label} 트랙 · {track.boardSize}줄
        </p>
      </Reveal>

      <Reveal order={2} className="mt-4 rounded-[28px] bg-white p-5 ring-1 ring-toss-line">
        {p.goal && p.target ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-toss-mute">목표</p>
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
            <p className="text-[17px] font-bold text-toss-ink">목표는 나중에 해도 돼요</p>
            <p className="mt-1 break-keep text-[14px] text-toss-mute">
              지금은 5줄에서 개념만 익혀도 충분해요. 급수·날짜는 준비가 되면 정하세요.
            </p>
            <button type="button" onClick={() => setGoalOpen(true)} className="mt-4 text-[14px] font-semibold text-toss-blue">
              목표 정하기
            </button>
          </>
        )}
      </Reveal>

      <Reveal order={3} className="mt-8 px-1">
        <h2 className="text-[15px] font-bold text-toss-ink">판이 커지는 길</h2>
        <p className="mt-1 break-keep text-[13px] text-toss-mute">개념이 쌓이면 판도 함께 넓어져요.</p>
        <ul className="mt-4 space-y-2">
          {trackOrder.map((id, i) => {
            const t = TRACKS[id];
            const state = i < myIdx ? "done" : i === myIdx ? "now" : "soon";
            return (
              <li
                key={id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3.5 ${
                  state === "now" ? "bg-toss-blue/10 ring-1 ring-toss-blue/25" : "bg-toss-soft2"
                }`}
              >
                <span>
                  <span className={`block text-[14px] font-bold ${state === "now" ? "text-toss-blue" : "text-toss-ink"}`}>
                    {t.boardSize}줄 · {t.label}
                  </span>
                  <span className="block text-[12px] text-toss-mute">{t.blurb}</span>
                </span>
                <span className="text-[12px] font-semibold text-toss-mute">
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
