import { useEffect, useState } from "react";
import { Board } from "@/components/Board";
import { BoardBuddy } from "@/components/BoardBuddy";
import { PrimaryButton } from "@/components/Screen";
import type { Point } from "@/data/curriculum";
import type { Exercise } from "@/data/path/types";
import { aiBoard, gridToStones } from "@/lib/aiBoard";
import { aiChat } from "@/lib/aiChat";
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
    aiChat.clear();
    aiBoard.clearFeedback();
    return () => aiBoard.clearSession();
  }, [ex?.id]);

  useEffect(() => {
    onStep?.(0, exercises.length);
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

  /** 읽기(개념) 카드 — 정답 판정 없이 바로 다음으로 */
  const acknowledgeRead = () => {
    sfx.play("tap");
    sfx.play("xp");
    haptic.tap();
    actions.addXp(XP_PER_CORRECT);
    if (idx + 1 >= exercises.length) {
      sfx.play("complete");
      onComplete();
      return;
    }
    load(idx + 1);
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
    // 이미 틀린 피드백 중이면 같은 칸 연타는 무시 (하트 연속 소모 방지)
    if (wrong && picked && pointsMatch(picked, p)) return;

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

  const choices = ex.choices ?? [];
  const compactChoices = choices.length > 0 && choices.every((c) => c.label.length <= 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-1">
        <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#CE82FF]/20 px-2.5 py-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-[#CE82FF] text-[10px] font-black text-white">
            ◆
          </span>
          <span className="duo-t-berry text-[12px] font-extrabold">{title}</span>
        </div>
        <p className="duo-t1 break-keep text-[18px] font-extrabold leading-snug sm:text-[22px]">{ex.prompt}</p>
        {ex.hint && !feedback ? <p className="duo-t2 mt-1 text-[12px] font-bold sm:text-[13px]">힌트: {ex.hint}</p> : null}
      </div>

      {/* 판만 남는 높이에 맞춤 — overflow로 잘리지 않게 */}
      <div className="relative my-2 flex min-h-0 flex-1 items-center justify-center px-1">
        <div
          className="aspect-square max-h-full w-full max-w-[min(100%,320px)] rounded-[20px] p-1.5 sm:rounded-[24px] sm:p-2.5"
          style={{
            backgroundColor: "#1A2C33",
            boxShadow: "inset 0 0 0 2px #37464F",
            width: "min(100%, 320px)",
            maxHeight: "100%",
          }}
        >
          <Board
            size={ex.size}
            board={board}
            marks={ex.marks}
            onPlay={ex.type === "read" ? undefined : onTap}
            interactive={ex.type !== "read" && !ok}
            wrongFlash={wrong}
            showSize={false}
            className="h-full max-h-full w-full max-w-none"
          />
        </div>
      </div>

      {ex.type === "choice" ? (
        <div
          className={`shrink-0 px-1 ${
            compactChoices
              ? `grid gap-2 ${choices.length <= 3 ? "grid-cols-3" : "grid-cols-2"}`
              : "flex flex-col gap-2"
          }`}
        >
          {choices.map((c) => {
            const tone = choiceTone(c.at);
            const style =
              tone === "correct"
                ? { backgroundColor: "rgba(88,204,2,0.18)", boxShadow: "inset 0 0 0 2px #58CC02", color: "#89E219" }
                : tone === "wrong"
                  ? { backgroundColor: "rgba(255,75,75,0.16)", boxShadow: "inset 0 0 0 2px #FF4B4B", color: "#FF6B6B" }
                  : tone === "dim"
                    ? { backgroundColor: "#1A2C33", boxShadow: "inset 0 0 0 2px #37464F", color: "#AEB8BE", opacity: 0.55 }
                    : { backgroundColor: "#1A2C33", boxShadow: "inset 0 0 0 2px #37464F", color: "#FFFFFF" };
            return (
              <button
                key={keyOf(c.at)}
                type="button"
                disabled={ok}
                onClick={() => onTap(c.at)}
                style={style}
                className={`flex w-full items-center justify-center rounded-2xl px-3 font-extrabold transition active:translate-y-[2px] disabled:active:translate-y-0 ${
                  compactChoices ? "min-h-[48px] text-[18px]" : "min-h-[48px] px-4 py-2.5 text-[16px] sm:min-h-[56px] sm:text-[17px]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 피드백 자리 — 모웹에선 더 얇게 (읽기 카드는 정답 UI 없음) */}
      <div className="mt-2 shrink-0 sm:mt-3" style={{ minHeight: feedback ? undefined : 8 }}>
        {feedback && ex.type !== "read" ? (
          <div
            className="rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3"
            style={
              ok
                ? { backgroundColor: "rgba(88,204,2,0.16)", color: "#89E219" }
                : { backgroundColor: "rgba(255,75,75,0.14)", color: "#FF6B6B" }
            }
          >
            <p className="text-[14px] font-extrabold sm:text-[15px]">{ok ? "정답!" : "아쉬워요"}</p>
            <p className="mt-0.5 line-clamp-2 break-keep text-[13px] font-semibold sm:text-[14px]" style={{ color: ok ? "#D6F5A8" : "#FFC2C2" }}>
              {feedback}
            </p>
          </div>
        ) : null}
      </div>

      <div
        className="shrink-0 pt-2 pb-[max(12px,calc(env(safe-area-inset-bottom)+4px))] sm:pt-3"
        style={{ borderTop: "2px solid #37464F" }}
      >
        {ex.type === "read" ? (
          <PrimaryButton night onClick={acknowledgeRead}>
            {idx + 1 >= exercises.length ? "완료" : "다음"}
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
