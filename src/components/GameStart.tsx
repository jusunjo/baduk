import { useEffect, useState } from "react";
import { haptic } from "@/lib/native";
import type { TrackId } from "@/lib/ranks";
import { TRACKS } from "@/lib/ranks";
import { CompanionArt } from "./Companion";

type Phase = "board" | "stone" | "title" | "out";

export function GameStart({
  boardSize,
  track,
  onDone,
}: {
  boardSize: 5 | 7 | 9 | 13 | 19;
  track: TrackId;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("board");
  const label = TRACKS[track].label;

  useEffect(() => {
    const timers = [
      window.setTimeout(() => {
        setPhase("stone");
        haptic.tap();
      }, 420),
      window.setTimeout(() => {
        setPhase("title");
        haptic.correct();
      }, 980),
      window.setTimeout(() => setPhase("out"), 1750),
      window.setTimeout(() => onDone(), 2100),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [onDone]);

  const cells = Math.min(boardSize, 9);
  const step = 100 / (cells + 1);

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#1a1f27] px-6 transition-opacity duration-300 ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="한 판 시작"
    >
      <div
        className={`relative aspect-square w-full max-w-[280px] overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-700 animate-panel-in`}
        style={{ background: "linear-gradient(160deg, #f0d4a0, #d4a66a)" }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          {Array.from({ length: cells }, (_, i) => {
            const v = step * (i + 1);
            return (
              <g key={i}>
                <line x1={step} y1={v} x2={100 - step} y2={v} stroke="#5c3d1e" strokeWidth="0.7" opacity="0.7" />
                <line x1={v} y1={step} x2={v} y2={100 - step} stroke="#5c3d1e" strokeWidth="0.7" opacity="0.7" />
              </g>
            );
          })}
        </svg>

        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
            phase === "board" ? "scale-50 opacity-0 translate-y-[-20%]" : "scale-100 opacity-100"
          }`}
        >
          <span
            className={`block h-11 w-11 rounded-full bg-[#1a1f27] shadow-[2px_3px_0_rgba(0,0,0,0.25)] ${
              phase !== "board" ? "animate-stone-drop" : ""
            }`}
          />
        </div>
      </div>

      <div
        className={`mt-8 flex flex-col items-center transition-all duration-500 ${
          phase === "title" || phase === "out" ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <CompanionArt track={track} stage={0} mood="intro" size={56} />
        <p className="mt-3 font-display text-[13px] font-semibold tracking-wide text-white/55">한수</p>
        <p className="mt-1 text-[22px] font-bold tracking-tight text-white">
          {label} 구간 시작
        </p>
        <p className="mt-1 text-[14px] font-medium text-white/60">{boardSize}줄 · 어렵지 않아요</p>
      </div>
    </div>
  );
}
