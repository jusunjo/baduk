import { useState } from "react";
import { RANKS, type Rank, type RankId } from "@/lib/ranks";
import { haptic } from "@/lib/native";
import { actions } from "@/lib/store";
import { MiniBoard } from "./Board";
import { PrimaryButton } from "./Screen";
import { Sheet } from "./Sheet";

export function RankOptions({
  ranks = RANKS,
  value,
  onChange,
}: {
  ranks?: Rank[];
  value: RankId | null;
  onChange: (id: RankId) => void;
}) {
  return (
    <ul className="space-y-2.5">
      {ranks.map((r, i) => {
        const on = r.id === value;
        return (
          <li key={r.id} className="animate-rise-in" style={{ animationDelay: `${i * 35}ms` }}>
            <button
              type="button"
              onClick={() => {
                haptic.tap();
                onChange(r.id);
              }}
              aria-pressed={on}
              className={`flex w-full items-start gap-3 rounded-2xl px-3.5 py-3.5 text-left transition active:scale-[0.985] ${
                on ? "bg-toss-blue/10 ring-2 ring-toss-blue" : "bg-toss-soft2 hover:bg-toss-soft"
              }`}
            >
              <MiniBoard size={r.boardSize} />
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[16px] font-bold ${on ? "text-toss-blue" : "text-toss-ink"}`}>{r.label}</span>
                  <span className={`text-[12px] font-semibold ${on ? "text-toss-blue/70" : "text-toss-mute"}`}>
                    {r.boardSize}줄 판
                  </span>
                </span>
                <span className="mt-1 block break-keep text-[13px] leading-snug text-toss-mute">{r.meaning}</span>
              </span>
              <span
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
                  on ? "bg-toss-blue text-white" : "bg-white ring-1 ring-toss-line"
                }`}
                aria-hidden
              >
                {on && (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 animate-pop" fill="none">
                    <path d="m6.5 12.5 3.5 3.5 7.5-8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function RankSheet({ current, onClose }: { current: RankId; onClose: () => void }) {
  const [value, setValue] = useState<RankId>(current);
  return (
    <Sheet
      title="지금 실력은 어느 정도인가요?"
      description="급수에 맞는 판 크기와 개념부터 보여 드려요"
      onClose={onClose}
      footer={
        <PrimaryButton
          onClick={() => {
            actions.setCurrentRank(value);
            onClose();
          }}
        >
          {value === current ? "닫기" : "이 급수로 바꾸기"}
        </PrimaryButton>
      }
    >
      <RankOptions value={value} onChange={setValue} />
    </Sheet>
  );
}

export function RankButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 items-center gap-1 rounded-pill bg-white px-3.5 text-[14px] font-semibold text-toss-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-toss-line transition active:scale-95"
    >
      {label}
      <svg viewBox="0 0 20 20" className="h-4 w-4 text-toss-mute" fill="none" aria-hidden>
        <path d="m5 8 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
