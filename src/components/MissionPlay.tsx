import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { BoardBuddy } from "@/components/BoardBuddy";
import { PrimaryButton } from "@/components/Screen";
import type { Point } from "@/data/curriculum";
import type { Exercise } from "@/data/path/types";
import { aiBoard, gridToStones } from "@/lib/aiBoard";
import { applySetup, keyOf, playMove, pointsMatch, type Grid } from "@/lib/board";

export function MissionPlay({
  title,
  subtitle,
  exercises,
  onComplete,
}: {
  title: string;
  subtitle?: string;
  exercises: Exercise[];
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [board, setBoard] = useState<Grid>(() => applySetup(exercises[0]?.size ?? 9, exercises[0]?.setup));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [wrong, setWrong] = useState<Point | null>(null);
  const [picked, setPicked] = useState<Point | null>(null);

  const ex = exercises[idx];

  useEffect(() => {
    if (!ex) return;
    aiBoard.setSession({
      lessonId: ex.id,
      size: board.length,
      stones: gridToStones(board),
      prompt: ex.prompt,
      playAs: ex.playAs ?? "B",
    });
  }, [ex, board]);

  useEffect(() => {
    aiBoard.clearFeedback();
    return () => aiBoard.clearSession();
  }, [ex?.id]);

  const load = (i: number) => {
    const next = exercises[i];
    setIdx(i);
    setBoard(applySetup(next.size, next.setup));
    setFeedback(null);
    setOk(false);
    setWrong(null);
    setPicked(null);
  };

  const advance = () => {
    if (idx + 1 >= exercises.length) {
      onComplete();
      return;
    }
    load(idx + 1);
  };

  const succeed = (msg?: string) => {
    setOk(true);
    setFeedback(msg ?? ex.correctText ?? "좋아요!");
  };

  const fail = (at?: Point) => {
    setOk(false);
    setWrong(at ?? null);
    setFeedback(ex.wrongText ?? ex.hint ?? "다시 생각해 보세요.");
  };

  const onTap = (p: Point) => {
    if (ok || !ex) return;
    if (ex.type === "read") return;

    if (ex.type === "choice") {
      const hit = (ex.choices ?? []).some((c) => pointsMatch(c.at, p));
      if (!hit) return;
      setPicked(p);
      const good = (ex.correct ?? []).some((c) => pointsMatch(c, p));
      if (good) succeed();
      else fail(p);
      return;
    }

    const playAs = ex.playAs ?? "B";
    const next = playMove(board, p, playAs);
    if (!next) {
      setPicked(p);
      fail(p);
      return;
    }
    const good = (ex.correct ?? []).some((c) => pointsMatch(c, p));
    setBoard(next);
    setPicked(p);
    if (good) succeed();
    else fail(p);
  };

  const choiceTone = (at: Point) => {
    if (!picked && !ok) return "idle" as const;
    const isPick = !!picked && pointsMatch(picked, at);
    const isCorrect = (ex.correct ?? []).some((c) => pointsMatch(c, at));
    if (isCorrect && (ok || isPick)) return "correct" as const;
    if (isPick && !ok) return "wrong" as const;
    if (ok) return "dim" as const;
    return "idle" as const;
  };

  if (!ex) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-1">
        <p className="text-[13px] font-semibold text-toss-mute">
          {title} · {idx + 1}/{exercises.length}
        </p>
        {subtitle ? <p className="mt-0.5 text-[13px] text-toss-mute">{subtitle}</p> : null}
        <p className="mt-2 break-keep text-[18px] font-bold leading-snug text-toss-ink">{ex.prompt}</p>
        {ex.hint && !feedback ? <p className="mt-1.5 text-[13px] text-toss-mute">힌트: {ex.hint}</p> : null}
        {feedback ? (
          <p className={`mt-1.5 break-keep text-[14px] font-semibold ${ok ? "text-toss-green" : "text-toss-orange"}`}>
            {feedback}
          </p>
        ) : null}
      </div>

      <div className="relative mt-2 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
        <Board
          size={ex.size}
          board={board}
          marks={ex.marks}
          onPlay={ex.type === "read" ? undefined : onTap}
          interactive={ex.type !== "read" && !ok}
          wrongFlash={wrong}
          libertiesFor={ex.showLibs ? "both" : undefined}
          showSize={false}
          className="max-h-full max-w-[min(100%,340px)]"
        />
        {ex.type === "choice" ? (
          <div className="mt-3 flex w-full shrink-0 flex-wrap justify-center gap-2 px-1">
            {(ex.choices ?? []).map((c) => {
              const tone = choiceTone(c.at);
              const cls =
                tone === "correct"
                  ? "bg-toss-green text-white ring-toss-green"
                  : tone === "wrong"
                    ? "bg-toss-orange text-white ring-toss-orange"
                    : tone === "dim"
                      ? "bg-white/70 text-toss-mute ring-toss-line opacity-60"
                      : "bg-white text-toss-ink ring-toss-line";
              return (
                <button
                  key={keyOf(c.at)}
                  type="button"
                  disabled={ok}
                  onClick={() => onTap(c.at)}
                  className={`rounded-pill px-4 py-2.5 text-[15px] font-bold shadow-sm ring-1 transition active:scale-95 disabled:active:scale-100 ${cls}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {ex.type === "read" && !ok ? (
          <PrimaryButton onClick={() => succeed(ex.correctText ?? "다음으로")}>알겠어요</PrimaryButton>
        ) : ok ? (
          <PrimaryButton onClick={advance}>{idx + 1 >= exercises.length ? "완료" : "다음"}</PrimaryButton>
        ) : wrong ? (
          <button
            type="button"
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-toss-soft2 text-[15px] font-semibold text-toss-mute active:scale-[0.98]"
            onClick={() => load(idx)}
          >
            다시 두기
          </button>
        ) : (
          <div className="flex h-14 items-center justify-center rounded-2xl bg-toss-soft2 text-[14px] font-semibold text-toss-mute">
            {ex.type === "choice" ? "아래에서 골라 보세요" : "판을 눌러 두어 보세요"}
          </div>
        )}
      </div>
      <BoardBuddy />
    </div>
  );
}
