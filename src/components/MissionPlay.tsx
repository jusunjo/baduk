import { useEffect, useMemo, useState } from "react";
import { Board } from "@/components/Board";
import { BoardBuddy } from "@/components/BoardBuddy";
import { PrimaryButton } from "@/components/Screen";
import type { Point } from "@/data/curriculum";
import type { Exercise } from "@/data/path/types";
import { aiBoard, gridToStones } from "@/lib/aiBoard";
import { applySetup, keyOf, playMove, pointsMatch, type Grid } from "@/lib/board";

function marksToHighlights(ex: Exercise): Point[] {
  return (ex.marks ?? [])
    .filter((m) => m.type === "target" || m.type === "glow" || m.type === "triangle" || m.type === "liberty")
    .map((m) => m.at);
}

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

  const ex = exercises[idx];
  const highlights = useMemo(() => marksToHighlights(ex), [ex]);

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
      const good = (ex.correct ?? []).some((c) => pointsMatch(c, p));
      if (good) succeed();
      else fail(p);
      return;
    }

    // move
    const playAs = ex.playAs ?? "B";
    const next = playMove(board, p, playAs);
    if (!next) {
      fail(p);
      return;
    }
    const good = (ex.correct ?? []).some((c) => pointsMatch(c, p));
    setBoard(next);
    if (good) succeed();
    else fail(p);
  };

  if (!ex) return null;

  return (
    <div className="pb-8">
      <div className="px-1">
        <p className="text-[13px] font-semibold text-toss-mute">
          {title} · {idx + 1}/{exercises.length}
        </p>
        {subtitle && <p className="mt-0.5 text-[13px] text-toss-mute">{subtitle}</p>}
        <p className="mt-3 break-keep text-[18px] font-bold leading-snug text-toss-ink">{ex.prompt}</p>
        {ex.hint && !feedback && <p className="mt-2 text-[13px] text-toss-mute">힌트: {ex.hint}</p>}
      </div>

      <div className="relative mt-4">
        <Board
          size={ex.size}
          board={board}
          highlights={highlights}
          onPlay={ex.type === "read" ? undefined : onTap}
          interactive={ex.type !== "read" && !ok}
          wrongFlash={wrong}
          libertiesFor={ex.showLibs ? "both" : undefined}
        />
        {ex.type === "choice" && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 px-2">
            {(ex.choices ?? []).map((c) => (
              <button
                key={keyOf(c.at)}
                type="button"
                disabled={ok}
                onClick={() => onTap(c.at)}
                className="rounded-pill bg-white px-4 py-2 text-[15px] font-bold text-toss-ink shadow-sm ring-1 ring-toss-line active:scale-95"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
        <BoardBuddy />
      </div>

      {feedback && (
        <p className={`mt-4 break-keep px-1 text-[15px] font-semibold ${ok ? "text-toss-blue" : "text-toss-mute"}`}>
          {feedback}
        </p>
      )}

      <div className="mt-5 px-1">
        {ex.type === "read" && !ok && (
          <PrimaryButton
            onClick={() => succeed(ex.correctText ?? "다음으로")}
          >
            알겠어요
          </PrimaryButton>
        )}
        {ok && (
          <PrimaryButton onClick={advance}>
            {idx + 1 >= exercises.length ? "완료" : "다음"}
          </PrimaryButton>
        )}
        {!ok && ex.type !== "read" && wrong && (
          <button
            type="button"
            className="mt-3 w-full text-center text-[14px] font-semibold text-toss-mute"
            onClick={() => load(idx)}
          >
            다시 두기
          </button>
        )}
      </div>
    </div>
  );
}
