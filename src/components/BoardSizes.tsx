import { useState } from "react";
import { PrimaryButton } from "./Screen";
import { Sheet } from "./Sheet";

/** 5→19 판이 넓어지는 길을 한눈에 */
export function BoardGrowth({ active = 5 }: { active?: 5 | 7 | 9 | 13 | 19 }) {
  const sizes = [5, 7, 9, 13, 19] as const;
  return (
    <div className="rounded-[24px] bg-toss-soft2 p-4">
      <div className="flex items-end justify-between gap-1.5">
        {sizes.map((n) => {
          const on = n === active;
          const box = 18 + (n / 19) * 28;
          return (
            <div key={n} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex items-center justify-center rounded-lg transition ${
                  on ? "ring-2 ring-toss-blue ring-offset-2 ring-offset-toss-soft2" : "opacity-55"
                }`}
                style={{
                  width: box,
                  height: box,
                  background: "linear-gradient(160deg, #f0d4a0, #d4a66a)",
                }}
                aria-hidden
              >
                <MiniGrid n={Math.min(n, 7)} />
              </div>
              <span className={`text-[11px] font-bold tabular-nums ${on ? "text-toss-blue" : "text-toss-mute"}`}>
                {n}줄
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 작은 판이 궁금한 사람만 열어 보는 설명 */
export function WhySmallBoard({ size }: { size: 5 | 7 | 9 | 13 | 19 }) {
  const [open, setOpen] = useState(false);
  if (size === 19) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto flex items-center gap-1 rounded-pill px-3 py-1.5 text-[13px] font-medium text-toss-mute transition hover:bg-toss-soft active:scale-95"
      >
        왜 {size}줄 판이에요?
      </button>
      {open && (
        <Sheet
          title={`왜 ${size}줄 판으로 배우나요?`}
          onClose={() => setOpen(false)}
          footer={<PrimaryButton onClick={() => setOpen(false)}>알겠어요</PrimaryButton>}
        >
          <BoardGrowth active={size} />
          <ul className="mt-5 space-y-3">
            {[
              "실제 대국은 19줄 판에서 둬요. 돌을 놓을 자리가 361개라 처음엔 막막해요.",
              "작은 판은 한 판이 몇 분 만에 끝나서, 규칙과 감각을 빨리 익힐 수 있어요.",
              "실력이 늘면 7 → 9 → 13 → 19줄로 판이 함께 넓어져요. 작은 판에서 배운 원칙은 그대로 쓰여요.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 break-keep text-[14px] leading-relaxed text-toss-body">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-toss-blue" />
                {t}
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  );
}

function MiniGrid({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 20 20" className="h-[70%] w-[70%]">
      {Array.from({ length: n }, (_, i) => {
        const v = 2 + (i * 16) / Math.max(1, n - 1);
        return (
          <g key={i}>
            <line x1="2" y1={v} x2="18" y2={v} stroke="#5c3d1e" strokeWidth="0.55" opacity="0.75" />
            <line x1={v} y1="2" x2={v} y2="18" stroke="#5c3d1e" strokeWidth="0.55" opacity="0.75" />
          </g>
        );
      })}
    </svg>
  );
}
