import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoalSheet } from "@/components/GoalSheet";
import { PrimaryButton, Screen } from "@/components/Screen";
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
    <Screen nav gray title="급수">
      <div
        className="mt-2 rounded-2xl px-4 py-5 text-white"
        style={{ backgroundColor: "#58CC02", boxShadow: "0 4px 0 #46A302" }}
      >
        <p className="text-[13px] font-extrabold text-white/90">나의 급수</p>
        <p className="mt-1 text-[28px] font-extrabold tracking-tight">{p.rank.label}</p>
        <p className="mt-1 text-[14px] font-bold text-white/95">
          {p.rank.boardSize}줄 · 연속 {p.streakDays}일
        </p>
      </div>

      {p.canTakeExam && p.module && (
        <button
          type="button"
          onClick={() => {
            sfx.play("start");
            navigate(`/exam/${p.module!.rankId}`);
          }}
          className="mt-4 w-full rounded-2xl px-4 py-4 text-left text-white transition active:translate-y-[3px]"
          style={{ backgroundColor: "#FF9600", boxShadow: "0 4px 0 #E07E00" }}
        >
          <p className="text-[12px] font-extrabold text-white/90">승급 시험 가능</p>
          <p className="mt-0.5 text-[17px] font-extrabold">{p.module.title} · 10문제 중 8개</p>
        </button>
      )}

      <div className="mt-6">
        <p className="duo-t3 mb-3 px-1 text-[13px] font-extrabold uppercase tracking-wide">급수 사다리</p>
        <ul className="space-y-2.5">
          {RANKS.filter((r) => r.id !== "beginner").map((r) => {
            const state =
              r.level < myLevel ? "done" : r.level === myLevel || (p.rank.id === "beginner" && r.id === "g30") ? "now" : "soon";
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-3.5"
                style={{
                  backgroundColor: state === "now" ? "#243830" : "#1A2C33",
                  border: state === "now" ? "2px solid #58CC02" : "2px solid #37464F",
                  boxShadow: state === "now" ? "0 4px 0 #46A302" : "0 3px 0 #0B1519",
                  opacity: state === "soon" ? 0.65 : 1,
                }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold"
                  style={{
                    backgroundColor: state === "now" ? "#58CC02" : state === "done" ? "#1CB0F6" : "#37464F",
                    color: state === "soon" ? "#7A8A92" : "#FFFFFF",
                    boxShadow: state === "soon" ? "none" : `0 3px 0 ${state === "now" ? "#46A302" : "#1899D6"}`,
                  }}
                >
                  {state === "done" ? "✓" : state === "soon" ? <LockIcon /> : r.short.replace("급", "")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="duo-t1 block text-[16px] font-extrabold">
                    {r.label}
                    <span className="duo-t3 ml-1.5 text-[12px] font-bold">{r.boardSize}줄</span>
                  </span>
                  <span className="duo-t2 mt-0.5 block break-keep text-[12px] font-semibold">{r.meaning}</span>
                </span>
                <span
                  className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-extrabold"
                  style={{
                    backgroundColor: state === "now" ? "#58CC02" : state === "done" ? "#163A4A" : "#37464F",
                    color: state === "now" ? "#FFFFFF" : state === "done" ? "#4CC3FF" : "#7A8A92",
                  }}
                >
                  {state === "done" ? "완료" : state === "now" ? "지금" : "잠김"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 space-y-3 px-0.5 pb-[max(2rem,calc(var(--nav-h,72px)+1rem))]">
        <PrimaryButton
          night
          onClick={() => {
            sfx.play("tap");
            setGoalOpen(true);
          }}
        >
          {p.goal ? "목표 바꾸기" : "목표 급수 정하기"}
        </PrimaryButton>
        <button
          type="button"
          onClick={() => {
            sfx.play("tap");
            navigate("/");
          }}
          className="flex h-14 w-full items-center justify-center rounded-2xl text-[16px] font-extrabold transition active:translate-y-[2px]"
          style={{
            backgroundColor: "#1A2C33",
            color: "#FFFFFF",
            border: "2px solid #37464F",
            boxShadow: "0 4px 0 #0B1519",
          }}
        >
          학습 패스 보기
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("학습 기록을 모두 지우고 처음부터 할까요?")) actions.reset();
          }}
          className="w-full py-3 text-center text-[13px] font-bold text-[#7A8A92]"
        >
          처음부터 다시 설정
        </button>
      </div>

      {goalOpen && <GoalSheet currentRank={p.rank.id} current={p.goal} onClose={() => setGoalOpen(false)} />}
    </Screen>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="6" y="10" width="12" height="9" rx="2" fill="#7A8A92" />
      <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" stroke="#7A8A92" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
