import { useEffect, useState } from "react";
import { HansuMascot } from "@/components/HansuMascot";
import { PrimaryButton } from "@/components/Screen";
import type { ConceptIntro } from "@/data/path/types";
import { sfx } from "@/lib/sfx";
import { CaptureDoorsAnim } from "./CaptureDoorsAnim";

const BRIDGE_AT_MS = 5200;

export function ConceptIntroOverlay({
  intro,
  onContinue,
  onSkip,
}: {
  intro: ConceptIntro;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<"metaphor" | "bridge">("metaphor");

  useEffect(() => {
    sfx.play("start");
    const t = window.setTimeout(() => {
      setPhase("bridge");
      sfx.play("correct");
    }, BRIDGE_AT_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-1 pb-4">
        <div className="w-full">
          {intro.animation === "capture-doors" ? <CaptureDoorsAnim playing /> : null}
        </div>

        <div className="flex w-full max-w-[340px] items-start gap-3">
          <HansuMascot size={44} bounce={phase === "metaphor"} className="mt-1 shrink-0" />
          <div className="relative flex-1 rounded-2xl bg-[#202F36] px-4 py-3 ring-2 ring-[#37464F]">
            <span
              className="absolute left-[-7px] top-5 h-3.5 w-3.5 rotate-45 bg-[#202F36] ring-2 ring-[#37464F]"
              aria-hidden
            />
            {phase === "metaphor" ? (
              <>
                <p className="relative text-[17px] font-extrabold leading-snug text-white">{intro.metaphorTitle}</p>
                <p className="relative mt-1.5 break-keep text-[14px] font-semibold leading-relaxed text-[#D6DEE2]">
                  {intro.metaphorBody}
                </p>
              </>
            ) : (
              <p className="relative break-keep text-[16px] font-extrabold leading-snug text-[#89E219]">{intro.bridgeText}</p>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-2 border-t-2 border-duo-night-line pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        {phase === "bridge" ? (
          <PrimaryButton
            night
            onClick={() => {
              sfx.play("tap");
              onContinue();
            }}
          >
            연습하기
          </PrimaryButton>
        ) : (
          <PrimaryButton
            night
            onClick={() => {
              sfx.play("tap");
              setPhase("bridge");
            }}
          >
            다음
          </PrimaryButton>
        )}
        <button
          type="button"
          className="mx-auto block py-2 text-[14px] font-bold text-[#9AA6AC]"
          onClick={() => {
            sfx.play("tap");
            onSkip();
          }}
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
