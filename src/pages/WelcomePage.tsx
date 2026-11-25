import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "@/components/Board";
import { GameStart } from "@/components/GameStart";
import { Logo } from "@/components/Logo";
import { RankOptions } from "@/components/RankPicker";
import { Headline, PrimaryButton, Reveal, SecondaryButton } from "@/components/Screen";
import { courseLessonsFlat } from "@/data/path";
import { emptyBoard, playMove, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { getRank, RANKS, type RankId } from "@/lib/ranks";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";

export function WelcomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "rank" | "boot">("intro");
  const [current, setCurrent] = useState<RankId>("beginner");
  const rank = getRank(current);

  const finishBoot = useCallback(() => {
    actions.completeOnboarding(current, null);
    const first = courseLessonsFlat()[0]?.lesson;
    navigate(first ? `/mission/${first.id}` : "/learn", { replace: true });
  }, [current, navigate]);

  if (step === "boot") {
    return (
      <GameStart boardSize={rank.boardSize} track={rank.track} rankLabel={rank.label} onDone={finishBoot} />
    );
  }

  if (step === "intro") {
    return <TitleScreen onStart={() => setStep("rank")} />;
  }

  return (
    <Shell>
      <Reveal>
        <Headline night>{"바둑을 얼마나\n알고 있나요?"}</Headline>
      </Reveal>
      <Reveal order={1}>
        <p className="mt-3 break-keep text-[15px] leading-relaxed text-duo-hare">
          잘 모르겠으면 ‘처음이에요’를 고르세요. 나중에 바꿀 수 있어요.
        </p>
      </Reveal>
      <Reveal order={2} className="mt-6">
        <RankOptions ranks={RANKS} value={current} onChange={setCurrent} dark />
      </Reveal>
      <Footer>
        <div className="flex gap-2">
          <div className="w-[38%]">
            <SecondaryButton night onClick={() => setStep("intro")}>
              이전
            </SecondaryButton>
          </div>
          <PrimaryButton
            night
            onClick={() => {
              haptic.tap();
              sfx.play("start");
              setStep("boot");
            }}
          >
            {current === "beginner" ? "시작하기" : `${rank.boardSize}줄에서 시작`}
          </PrimaryButton>
        </div>
      </Footer>
    </Shell>
  );
}

function TitleScreen({ onStart }: { onStart: () => void }) {
  const [board, setBoard] = useState<Grid>(() => emptyBoard(7));
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setReady(true), 40);
    const black = window.setTimeout(() => {
      const next = playMove(emptyBoard(7), { x: 3, y: 3 }, "B");
      if (next) {
        setBoard(next);
        setLastMove({ x: 3, y: 3 });
        haptic.tap();
      }
    }, 520);
    const white = window.setTimeout(() => {
      setBoard((prev) => {
        const next = playMove(prev, { x: 4, y: 3 }, "W");
        if (next) {
          setLastMove({ x: 4, y: 3 });
          haptic.tap();
          return next;
        }
        return prev;
      });
    }, 1100);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(black);
      window.clearTimeout(white);
    };
  }, []);

  return (
    <Shell>
      <div
        className={`flex min-h-0 flex-1 flex-col transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-2 pt-2">
          <Logo size={28} />
          <span className="font-display text-[18px] font-extrabold tracking-tight text-white">한수</span>
        </div>

        <div className="mt-8 flex items-start gap-3">
          <Mascot />
          <div className="relative mt-2 min-w-0 flex-1 rounded-2xl border-2 border-duo-night-line bg-duo-night-2 px-4 py-3">
            <span
              className="absolute -left-2 top-5 h-3 w-3 rotate-45 border-b-2 border-l-2 border-duo-night-line bg-duo-night-2"
              aria-hidden
            />
            <h1 className="break-keep text-[22px] font-extrabold leading-snug tracking-tight text-white">
              바둑, 생각보다 어렵지 않아요
            </h1>
            <p className="mt-2 break-keep text-[14px] leading-relaxed text-duo-hare">
              판 위에 돌을 놓으며 규칙을 익혀요. 몰라도 바로 시작해요.
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex flex-1 items-center justify-center">
          <div className="w-full max-w-[320px] rounded-[28px] bg-duo-night-2 p-3 shadow-[0_8px_0_#0B1519] ring-2 ring-duo-night-line">
            <Board size={7} board={board} lastMove={lastMove} interactive={false} showSize={false} className="max-w-none" />
          </div>
        </div>
      </div>

      <Footer>
        <PrimaryButton
          night
          onClick={() => {
            haptic.tap();
            sfx.play("start");
            onStart();
          }}
        >
          한 판 시작하기
        </PrimaryButton>
      </Footer>
    </Shell>
  );
}

function Mascot() {
  return (
    <div className="relative shrink-0 animate-companion-bob" aria-hidden>
      <svg viewBox="0 0 72 88" className="h-[88px] w-[72px]">
        <ellipse cx="36" cy="82" rx="18" ry="5" fill="#0B1519" opacity="0.45" />
        <circle cx="36" cy="48" r="28" fill="#58CC02" />
        <circle cx="36" cy="48" r="28" fill="url(#g)" opacity="0.35" />
        <circle cx="26" cy="44" r="7" fill="#fff" />
        <circle cx="46" cy="44" r="7" fill="#fff" />
        <circle cx="27.5" cy="45" r="3.2" fill="#131F24" />
        <circle cx="47.5" cy="45" r="3.2" fill="#131F24" />
        <path d="M28 58c4 5 12 5 16 0" stroke="#131F24" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="18" cy="58" r="5" fill="#46A302" />
        <circle cx="54" cy="58" r="5" fill="#46A302" />
        <defs>
          <radialGradient id="g" cx="0.35" cy="0.3" r="0.7">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#58CC02" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden px-5 pt-[env(safe-area-inset-top)]">
      <div className="duo-night pointer-events-none absolute inset-0" aria-hidden />
      <main className="relative z-10 flex flex-1 flex-col pb-36 pt-6">{children}</main>
    </div>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-duo-night-line bg-duo-night pt-4">
      <div className="mx-auto w-full max-w-[520px] px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}
