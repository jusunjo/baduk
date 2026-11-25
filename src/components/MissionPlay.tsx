import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { BoardBuddy } from "@/components/BoardBuddy";
import { PrimaryButton } from "@/components/Screen";
import type { Point } from "@/data/curriculum";
import type { Exercise } from "@/data/path/types";
import { aiBoard, gridToStones } from "@/lib/aiBoard";
import { applySetup, keyOf, playMove, pointsMatch, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { sfx, XP_PER_CORRECT } from "@/lib/sfx";
import { actions } from "@/lib/store";

export function MissionPlay({
  title,
  exercises,
  hearts,
  onHeartLost,
  onStep,
  onComplete,
}: {
  title: string;
  subtitle?: string;
  exercises: Exercise[];
  hearts: number;
  onHeartLost: () => void;
  onStep?: (index: number, total: number) => void;
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

  useEffect(() => {
    onStep?.(0, exercises.length);
    // 최초 진행만 알림 — onStep 참조 변경으로 루프 나지 않게
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises.length]);

  const load = (i: number) => {
    const next = exercises[i];
    setIdx(i);
    onStep?.(i, exercises.length);
    setBoard(applySetup(next.size, next.setup));
    setFeedback(null);
    setOk(false);
    setWrong(null);
    setPicked(null);
  };

  const advance = () => {
    sfx.play("tap");
    if (idx + 1 >= exercises.length) {
      sfx.play("complete");
      onComplete();
      return;
    }
    load(idx + 1);
  };

  const succeed = (msg?: string) => {
    sfx.play("correct");
    sfx.play("xp");
    haptic.correct();
    actions.addXp(XP_PER_CORRECT);
    setOk(true);
    setFeedback(msg ?? ex.correctText ?? `좋아요! +${XP_PER_CORRECT} XP`);
  };

  const fail = (at?: Point) => {
    sfx.play("wrong");
    haptic.wrong();
    onHeartLost();
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
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-[#CE82FF]/15 px-2 py-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-duo-berry text-[10px] font-black text-white">
            ◆
          </span>
          <span className="text-[12px] font-extrabold text-duo-berry">{title}</span>
        </div>
        <p className="break-keep text-[22px] font-extrabold leading-snug text-white">{ex.prompt}</p>
        {ex.hint && !feedback ? <p className="mt-2 text-[13px] font-bold text-duo-night-mute">힌트: {ex.hint}</p> : null}
      </div>

      <div className="relative mt-3 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
        <div className="w-full max-w-[min(100%,340px)] rounded-[24px] bg-duo-night-2 p-2.5 ring-2 ring-duo-night-line">
          <Board
            size={ex.size}
            board={board}
            marks={ex.marks}
            onPlay={ex.type === "read" ? undefined : onTap}
            interactive={ex.type !== "read" && !ok}
            wrongFlash={wrong}
            libertiesFor={ex.showLibs ? "both" : undefined}
            showSize={false}
            className="max-h-full max-w-none"
          />
        </div>

        {ex.type === "choice" ? (
          <div className="mt-4 flex w-full shrink-0 flex-col gap-2.5 px-1">
            {(ex.choices ?? []).map((c) => {
              const tone = choiceTone(c.at);
              const cls =
                tone === "correct"
                  ? "bg-[#58CC02]/15 text-duo-green ring-duo-green"
                  : tone === "wrong"
                    ? "bg-[#FF4B4B]/15 text-duo-cardinal ring-duo-cardinal"
                    : tone === "dim"
                      ? "bg-duo-night-2 text-duo-night-mute ring-duo-night-line opacity-50"
                      : "bg-duo-night-2 text-white ring-duo-night-line active:bg-duo-night-3";
              return (
                <button
                  key={keyOf(c.at)}
                  type="button"
                  disabled={ok}
                  onClick={() => onTap(c.at)}
                  className={`flex min-h-[56px] w-full items-center justify-center rounded-2xl px-4 py-3 text-[17px] font-extrabold ring-2 transition active:translate-y-[2px] disabled:active:translate-y-0 ${cls}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {feedback ? (
        <div
          className={`mt-3 shrink-0 rounded-2xl px-4 py-3 ${
            ok ? "bg-[#58CC02]/15 text-duo-green" : "bg-[#FF4B4B]/12 text-duo-cardinal"
          }`}
        >
          <p className="text-[15px] font-extrabold">{ok ? "정답!" : "아쉬워요"}</p>
          <p className="mt-0.5 break-keep text-[14px] font-semibold opacity-90">{feedback}</p>
        </div>
      ) : null}

      <div className="shrink-0 border-t-2 border-duo-night-line pt-3 pb-[max(16px,calc(env(safe-area-inset-bottom)+4px))]">
        {ex.type === "read" && !ok ? (
          <PrimaryButton night onClick={() => succeed(ex.correctText ?? `알겠어요 · +${XP_PER_CORRECT} XP`)}>
            확인
          </PrimaryButton>
        ) : ok ? (
          <PrimaryButton night onClick={advance}>
            {idx + 1 >= exercises.length ? "완료" : "계속하기"}
          </PrimaryButton>
        ) : wrong ? (
          <PrimaryButton
            night
            onClick={() => {
              sfx.play("tap");
              load(idx);
            }}
          >
            다시 두기
          </PrimaryButton>
        ) : (
          <PrimaryButton night disabled>
            {ex.type === "choice" ? "골라 보세요" : "판을 눌러 보세요"}
          </PrimaryButton>
        )}
      </div>
      {hearts <= 0 ? null : <BoardBuddy />}
    </div>
  );
}
