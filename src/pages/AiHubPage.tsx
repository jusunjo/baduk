import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, Reveal, Screen } from "@/components/Screen";
import {
  AI_LEVELS,
  AI_SIZES,
  formatAiWhen,
  levelMeta,
  resultLabel,
  useAiGames,
  type AiBoardSize,
  type AiLevelId,
} from "@/lib/aiGames";
import { sfx } from "@/lib/sfx";

type Step = "hub" | "setup";

export function AiHubPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const games = useAiGames();
  const [step, setStep] = useState<Step>(() =>
    (location.state as { openSetup?: boolean } | null)?.openSetup ? "setup" : "hub",
  );
  const [size, setSize] = useState<AiBoardSize>(9);
  const [level, setLevel] = useState<AiLevelId>("normal");

  useEffect(() => {
    if ((location.state as { openSetup?: boolean } | null)?.openSetup) {
      setStep("setup");
      navigate("/play", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  if (step === "setup") {
    return (
      <Screen nav gray title="새 대국">
        <Reveal className="px-1 pt-2">
          <p className="duo-t1 text-[22px] font-extrabold tracking-tight">어떻게 둘까요?</p>
          <p className="duo-t2 mt-1 break-keep text-[14px] font-semibold">판 크기와 AI 세기를 고르세요.</p>
        </Reveal>

        <Reveal order={1} className="mt-6 px-1">
          <p className="duo-t3 mb-2 text-[12px] font-extrabold uppercase tracking-wide">판 크기</p>
          <div className="grid grid-cols-2 gap-2">
            {AI_SIZES.map((s) => {
              const on = size === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => {
                    sfx.play("tap");
                    setSize(s.size);
                  }}
                  className="rounded-2xl px-3 py-3 text-left transition active:scale-[0.98]"
                  style={{
                    backgroundColor: on ? "rgba(88,204,2,0.16)" : "#1A2C33",
                    boxShadow: on ? "inset 0 0 0 2px #58CC02" : "inset 0 0 0 2px #37464F",
                  }}
                >
                  <span className="block text-[17px] font-extrabold text-white">{s.label}</span>
                  <span className="mt-0.5 block text-[12px] font-bold text-[#AEB8BE]">{s.blurb}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal order={2} className="mt-6 px-1">
          <p className="duo-t3 mb-2 text-[12px] font-extrabold uppercase tracking-wide">AI 레벨</p>
          <div className="space-y-2">
            {AI_LEVELS.map((l) => {
              const on = level === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    sfx.play("tap");
                    setLevel(l.id);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition active:scale-[0.98]"
                  style={{
                    backgroundColor: on ? "rgba(88,204,2,0.16)" : "#1A2C33",
                    boxShadow: on ? "inset 0 0 0 2px #58CC02" : "inset 0 0 0 2px #37464F",
                  }}
                >
                  <span>
                    <span className="block text-[17px] font-extrabold text-white">{l.label}</span>
                    <span className="mt-0.5 block text-[12px] font-bold text-[#AEB8BE]">{l.blurb}</span>
                  </span>
                  <span className="text-[12px] font-extrabold tabular-nums text-[#7A8A92]">{l.visits}v</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-8 space-y-2 px-1 pb-4">
          <PrimaryButton
            night
            onClick={() => {
              sfx.play("start");
              navigate("/play/ai", { state: { size, level } });
            }}
          >
            대국 시작
          </PrimaryButton>
          <button
            type="button"
            className="mx-auto block py-2 text-[14px] font-bold text-[#9AA6AC]"
            onClick={() => {
              sfx.play("tap");
              setStep("hub");
            }}
          >
            뒤로
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen nav gray title="AI 대국">
      <Reveal className="px-1 pt-2">
        <div
          className="rounded-2xl px-4 py-4 text-white"
          style={{ backgroundColor: "#58CC02", boxShadow: "0 4px 0 #46A302" }}
        >
          <p className="text-[13px] font-extrabold text-white/90">KataGo</p>
          <p className="mt-0.5 text-[20px] font-extrabold tracking-tight">AI와 한 판</p>
          <p className="mt-1 break-keep text-[13px] font-bold text-white/90">판 크기와 세기를 골라 두어요.</p>
        </div>
      </Reveal>

      <Reveal order={1} className="mt-4 px-1">
        <PrimaryButton
          night
          onClick={() => {
            sfx.play("tap");
            setStep("setup");
          }}
        >
          새 대국
        </PrimaryButton>
      </Reveal>

      <Reveal order={2} className="mt-8 px-1">
        <p className="duo-t3 mb-2.5 text-[12px] font-extrabold uppercase tracking-wide">최근 기록</p>
        {games.length === 0 ? (
          <div
            className="rounded-2xl px-4 py-6 text-center"
            style={{ backgroundColor: "#1A2C33", boxShadow: "inset 0 0 0 2px #37464F" }}
          >
            <p className="duo-t1 text-[15px] font-extrabold">아직 기록이 없어요</p>
            <p className="duo-t2 mt-1 break-keep text-[13px] font-semibold">첫 판을 두면 여기에 쌓여요.</p>
          </div>
        ) : (
          <ul className="space-y-2 pb-4">
            {games.map((g) => {
              const lv = levelMeta(g.level);
              return (
                <li
                  key={g.id}
                  className="flex items-center justify-between rounded-2xl px-4 py-3"
                  style={{ backgroundColor: "#1A2C33", boxShadow: "inset 0 0 0 2px #37464F" }}
                >
                  <div>
                    <p className="text-[15px] font-extrabold text-white">
                      {g.size}×{g.size} · {lv.label}
                    </p>
                    <p className="mt-0.5 text-[12px] font-bold text-[#AEB8BE]">
                      {formatAiWhen(g.at)} · {g.moveCount}수 · {resultLabel(g.result)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Reveal>
    </Screen>
  );
}
