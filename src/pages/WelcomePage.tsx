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
    <Shell warm>
      <Reveal>
        <Headline>{"바둑을 얼마나\n알고 있나요?"}</Headline>
      </Reveal>
      <Reveal order={1}>
        <p className="mt-3 break-keep text-[15px] leading-relaxed text-toss-body">
          잘 모르겠으면 ‘처음이에요’를 고르세요. 나중에 바꿀 수 있어요.
        </p>
      </Reveal>
      <Reveal order={2} className="mt-6">
        <RankOptions ranks={RANKS} value={current} onChange={setCurrent} />
      </Reveal>
      <Footer warm>
        <div className="flex gap-2">
          <div className="w-[38%]">
            <SecondaryButton onClick={() => setStep("intro")}>이전</SecondaryButton>
          </div>
          <PrimaryButton
            onClick={() => {
              haptic.tap();
              setStep("boot");
            }}
          >
            {current === "beginner" ? "시작하기" : `${rank.boardSize}줄에서 시작하기`}
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
    <Shell warm>
      <div
        className={`flex min-h-0 flex-1 flex-col transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-2 pt-2">
          <Logo size={26} />
          <span className="font-display text-[17px] font-semibold tracking-tight text-toss-ink">한수</span>
        </div>

        <div className="mt-7">
          <h1 className="break-keep text-[26px] font-bold leading-[1.4] tracking-tight text-toss-ink">
            바둑, 생각보다 어렵지 않아요
          </h1>
          <p className="mt-2 max-w-[20em] break-keep text-[15px] leading-relaxed text-toss-body">
            판 위에 돌을 놓아 보며 규칙을 익혀요. 몰라도 바로 시작할 수 있어요.
          </p>
        </div>

        <div className="relative mt-8 flex flex-1 items-center justify-center">
          <div className="w-full max-w-[340px] rounded-[32px] bg-gradient-to-b from-[#f7efe2] to-white p-3.5 shadow-[0_16px_40px_rgba(92,61,30,0.12)] ring-1 ring-black/[0.04]">
            <Board size={7} board={board} lastMove={lastMove} interactive={false} showSize={false} className="max-w-none" />
          </div>
        </div>
      </div>

      <Footer warm>
        <PrimaryButton
          onClick={() => {
            haptic.tap();
            onStart();
          }}
        >
          한 판 시작하기
        </PrimaryButton>
      </Footer>
    </Shell>
  );
}

function Shell({ children, warm }: { children: ReactNode; warm?: boolean }) {
  return (
    <div
      className={`relative mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col overflow-hidden px-5 pt-[env(safe-area-inset-top)] ${
        warm ? "bg-[#faf7f2]" : "bg-white"
      }`}
    >
      {warm && (
        <>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 55% at 50% -8%, #fffdf8 0%, transparent 58%), radial-gradient(70% 40% at 100% 100%, rgba(215, 232, 200, 0.35) 0%, transparent 55%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#5c3d1e 1px, transparent 1px), linear-gradient(90deg, #5c3d1e 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "linear-gradient(to bottom, black, transparent)",
            }}
            aria-hidden
          />
        </>
      )}
      <main className="relative z-10 flex flex-1 flex-col pb-36 pt-6">{children}</main>
    </div>
  );
}

function Footer({ children, warm }: { children: ReactNode; warm?: boolean }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 pt-6 ${
        warm
          ? "bg-gradient-to-t from-[#faf7f2] via-[#faf7f2]/95 to-transparent"
          : "bg-gradient-to-t from-white via-white to-white/0"
      }`}
    >
      <div className="mx-auto w-full max-w-[520px] px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}
