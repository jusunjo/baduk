import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { RankOptions } from "@/components/RankPicker";
import { Headline, PrimaryButton, Reveal, SecondaryButton } from "@/components/Screen";
import { allLessons } from "@/data/curriculum";
import { getRank, RANKS, type RankId } from "@/lib/ranks";
import { actions } from "@/lib/store";

export function WelcomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "rank">("intro");
  const [current, setCurrent] = useState<RankId>("beginner");
  const rank = getRank(current);

  const start = () => {
    actions.completeOnboarding(current, null);
    const first = allLessons(rank.track)[0];
    navigate(first ? `/learn/${first.id}` : "/", { replace: true });
  };

  if (step === "intro") {
    return (
      <Shell>
        <Reveal>
          <Logo size={48} />
        </Reveal>
        <Reveal order={1} className="mt-6">
          <Headline>{"바둑,\n한 수부터 쉽게"}</Headline>
        </Reveal>
        <Reveal order={2}>
          <p className="mt-3 break-keep text-[15px] leading-relaxed text-toss-body">
            바둑을 하나도 몰라도 괜찮아요. 판 위에 직접 돌을 놓으면서 규칙을 하나씩 알아가요.
          </p>
        </Reveal>
        <Footer>
          <PrimaryButton onClick={() => setStep("rank")}>시작하기</PrimaryButton>
        </Footer>
      </Shell>
    );
  }

  return (
    <Shell>
      <Reveal>
        <Headline>{"바둑을 얼마나\n알고 있나요?"}</Headline>
      </Reveal>
      <Reveal order={1}>
        <p className="mt-3 break-keep text-[15px] text-toss-mute">잘 모르겠으면 ‘처음이에요’를 고르세요. 나중에 바꿀 수 있어요.</p>
      </Reveal>
      <Reveal order={2} className="mt-6">
        <RankOptions ranks={RANKS} value={current} onChange={setCurrent} />
      </Reveal>
      <Footer>
        <div className="flex gap-2">
          <div className="w-[38%]">
            <SecondaryButton onClick={() => setStep("intro")}>이전</SecondaryButton>
          </div>
          <PrimaryButton onClick={start}>{current === "beginner" ? "첫 판 둬 보기" : `${rank.boardSize}줄에서 시작하기`}</PrimaryButton>
        </div>
      </Footer>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col px-5 pt-[env(safe-area-inset-top)]">
      <main className="flex flex-1 flex-col pb-36 pt-10">{children}</main>
    </div>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-white via-white to-white/0 pt-6">
      <div className="mx-auto w-full max-w-[520px] px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}
