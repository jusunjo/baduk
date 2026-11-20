import { useState } from "react";
import { addDays, dayKey, formatDay, parseDay, startOfToday } from "@/lib/date";
import { goalRanks, getRank, type RankId } from "@/lib/ranks";
import { haptic } from "@/lib/native";
import { actions, type Goal } from "@/lib/store";
import { RankOptions } from "./RankPicker";
import { PrimaryButton, SecondaryButton } from "./Screen";
import { Sheet } from "./Sheet";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_DAYS = 365;

const QUICK = [
  { label: "2주 뒤", days: 14 },
  { label: "1달 뒤", days: 30 },
  { label: "2달 뒤", days: 60 },
  { label: "3달 뒤", days: 90 },
];

export function GoalSheet({
  currentRank,
  current,
  onClose,
}: {
  currentRank: RankId;
  current?: Goal | null;
  onClose: () => void;
}) {
  const today = startOfToday();
  const last = addDays(today, MAX_DAYS);
  const targets = goalRanks(currentRank);
  const [step, setStep] = useState<"rank" | "date">(current?.targetRank ? "date" : "rank");
  const [target, setTarget] = useState<RankId | null>(current?.targetRank ?? targets[0]?.id ?? null);
  const [picked, setPicked] = useState<string | null>(current?.date ?? null);
  const [month, setMonth] = useState(() => {
    const d = picked ? parseDay(picked) : today;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const pick = (d: Date) => {
    haptic.tap();
    setPicked(dayKey(d));
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(last.getFullYear(), last.getMonth(), 1);
  const lead = month.getDay();
  const length = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];

  const save = () => {
    if (target && picked) actions.setGoal({ targetRank: target, date: picked });
    onClose();
  };

  if (!targets.length) {
    return (
      <Sheet title="목표가 충분해요" description="이미 1급이에요. 다음 버전에서 단 목표를 열어 둘게요." onClose={onClose}>
        <PrimaryButton onClick={onClose}>닫기</PrimaryButton>
      </Sheet>
    );
  }

  return (
    <Sheet
      title={step === "rank" ? "어디까지 가고 싶나요?" : "언제까지 달성할까요?"}
      description={
        step === "rank"
          ? "목표 급수를 고르면, 그 실력에 맞는 설명도 함께 보여 드려요"
          : target
            ? `${getRank(target).label}까지 · ${getRank(target).meaning}`
            : undefined
      }
      onClose={onClose}
      footer={
        step === "rank" ? (
          <PrimaryButton disabled={!target} onClick={() => setStep("date")}>
            다음 · 날짜 정하기
          </PrimaryButton>
        ) : current ? (
          <div className="flex gap-2">
            <div className="w-[38%]">
              <SecondaryButton
                onClick={() => {
                  actions.setGoal(null);
                  onClose();
                }}
              >
                목표 지우기
              </SecondaryButton>
            </div>
            <PrimaryButton disabled={!picked || !target} onClick={save}>
              {picked === current.date && target === current.targetRank ? "닫기" : "이 목표로 바꾸기"}
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="w-[38%]">
              <SecondaryButton onClick={() => setStep("rank")}>급수 다시</SecondaryButton>
            </div>
            <PrimaryButton disabled={!picked || !target} onClick={save}>
              이 목표로 정하기
            </PrimaryButton>
          </div>
        )
      }
    >
      {step === "rank" ? (
        <RankOptions ranks={targets} value={target} onChange={setTarget} />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK.map((q) => {
              const d = addDays(today, q.days);
              const on = picked === dayKey(d);
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => pick(d)}
                  className={`shrink-0 rounded-pill px-3.5 py-2 text-[14px] font-semibold transition active:scale-95 ${
                    on ? "bg-toss-blue text-white" : "bg-toss-soft text-toss-body"
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <MonthButton
              label="이전 달"
              dir={-1}
              disabled={month <= firstMonth}
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            />
            <p className="text-[17px] font-bold tabular-nums tracking-tight text-toss-ink">
              {month.getFullYear()}년 {month.getMonth() + 1}월
            </p>
            <MonthButton
              label="다음 달"
              dir={1}
              disabled={month >= lastMonth}
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            />
          </div>

          <div key={month.getTime()} className="mt-3 grid animate-fade-in grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((w, i) => (
              <span key={w} className={`pb-1 text-[12px] font-medium ${i === 0 ? "text-toss-red/70" : "text-toss-mute"}`}>
                {w}
              </span>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={`blank-${i}`} />;
              const key = dayKey(d);
              const out = d < today || d > last;
              const on = picked === key;
              const isToday = d.getTime() === today.getTime();
              const sunday = d.getDay() === 0;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={out}
                  onClick={() => pick(d)}
                  aria-pressed={on}
                  aria-label={formatDay(key)}
                  className="flex h-11 items-center justify-center disabled:cursor-default"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-[15px] tabular-nums transition ${
                      on
                        ? "animate-pop bg-toss-blue font-bold text-white"
                        : out
                          ? "text-toss-line"
                          : isToday
                            ? "font-bold text-toss-blue ring-1 ring-inset ring-toss-blue/40"
                            : sunday
                              ? "text-toss-red/70 hover:bg-toss-soft2"
                              : "font-medium text-toss-ink hover:bg-toss-soft2"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {picked && target && (
            <div key={picked} className="mt-4 animate-rise-in rounded-2xl bg-toss-soft2 px-4 py-3.5">
              <p className="text-[15px] font-bold text-toss-ink">
                {formatDay(picked)}
                <span className="ml-1.5 text-toss-blue">{getRank(target).label} 목표</span>
              </p>
              <p className="mt-1 break-keep text-[14px] text-toss-body">{getRank(target).meaning}</p>
            </div>
          )}
        </>
      )}
    </Sheet>
  );
}

function MonthButton({ label, dir, disabled, onClick }: { label: string; dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-toss-body transition hover:bg-toss-soft active:scale-90 disabled:text-toss-line disabled:hover:bg-transparent"
    >
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
        <path d={dir < 0 ? "m12 5-5 5 5 5" : "m8 5 5 5-5 5"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
