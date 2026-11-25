import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoalSheet } from "@/components/GoalSheet";
import { Screen, SecondaryButton } from "@/components/Screen";
import { RANKS } from "@/lib/ranks";
import { useProgress } from "@/lib/progress";
import { actions } from "@/lib/store";
import { sfx } from "@/lib/sfx";

export function PathPage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [goalOpen, setGoalOpen] = useState(false);
  if (!p.rank) return null;

  const myLevel = p.rank.level;

  return (
    <Screen nav gray>
      <div className="px-1 pt-1">
        <p className="text-[13px] font-extrabold text-duo-wolf">나의 급수</p>
        <p className="mt-1 text-[24px] font-extrabold tracking-tight text-duo-eel">{p.rank.label}</p>
        <p className="mt-1 break-keep text-[14px] text-duo-wolf">{p.rank.boardSize}줄 · 연속 {p.streakDays}일</p>
      </div>

      {p.canTakeExam && p.module && (
        <button
          type="button"
          onClick={() => {
            sfx.play("start");
            navigate(`/exam/${p.module!.rankId}`);
          }}
          className="mt-5 w-full rounded-2xl bg-[#58CC02] px-4 py-4 text-left text-white shadow-[0_4px_0_#46A302] active:translate-y-[3px] active:shadow-[0_1px_0_#46A302]"
        >
          <p className="text-[12px] font-bold text-white/85">승급 시험</p>
          <p className="mt-0.5 text-[17px] font-extrabold">{p.module.title} · 10문제 중 8개</p>
        </button>
      )}

      <div className="mt-6">
        <p className="mb-3 px-1 text-[13px] font-extrabold text-duo-wolf">급수 목록</p>
        <ul className="space-y-2">
          {RANKS.map((r) => {
            const state = r.level < myLevel ? "done" : r.level === myLevel ? "now" : "soon";
            return (
              <li
                key={r.id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 ring-2 ${
                  state === "now"
                    ? "bg-[#E7F9D3] ring-[#58CC02]"
                    : state === "done"
                      ? "bg-white ring-duo-swan"
                      : "bg-[#F0F0F0] ring-transparent"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold ${
                    state === "now"
                      ? "bg-[#58CC02] text-white"
                      : state === "done"
                        ? "bg-[#1CB0F6] text-white"
                        : "bg-[#E5E5E5] text-duo-hare"
                  }`}
                >
                  {state === "done" ? "✓" : r.short.replace("급", "")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold text-duo-eel">
                    {r.label}
                    <span className="ml-1.5 text-[12px] font-bold text-duo-hare">{r.boardSize}줄</span>
                  </span>
                </span>
                <span className="shrink-0 text-[12px] font-extrabold text-duo-hare">
                  {state === "done" ? "지남" : state === "now" ? "지금" : "잠김"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 space-y-2 px-1 pb-4">
        <button
          type="button"
          onClick={() => setGoalOpen(true)}
          className="w-full rounded-2xl bg-white py-3.5 text-[15px] font-extrabold text-duo-eel ring-2 ring-duo-swan"
        >
          {p.goal ? "목표 바꾸기" : "목표 급수 정하기"}
        </button>
        <SecondaryButton onClick={() => navigate("/")}>학습 패스 보기</SecondaryButton>
        <button
          type="button"
          onClick={() => {
            if (confirm("학습 기록을 모두 지우고 처음부터 할까요?")) actions.reset();
          }}
          className="w-full py-3 text-center text-[13px] font-medium text-duo-hare"
        >
          처음부터 다시 설정
        </button>
      </div>

      {goalOpen && <GoalSheet currentRank={p.rank.id} current={p.goal} onClose={() => setGoalOpen(false)} />}
    </Screen>
  );
}
