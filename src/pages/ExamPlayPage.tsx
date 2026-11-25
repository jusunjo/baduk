import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Board } from "@/components/Board";
import { BoardBuddy } from "@/components/BoardBuddy";
import { Confetti, PraiseBadge, pickPraise } from "@/components/Celebrate";
import { PrimaryButton, Reveal, Screen, SecondaryButton } from "@/components/Screen";
import {
  EXAM_PASS_SCORE,
  EXAM_TOTAL,
  examPassed,
  examProblems,
  type ExamRankId,
} from "@/data/exams/banks";
import type { ExamProblem } from "@/data/exams/types";
import { aiBoard, gridToStones } from "@/lib/aiBoard";
import { applySetup, isAnswer, playMove, resolveAnswer, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { useProgress } from "@/lib/progress";
import { nextRank, type RankId } from "@/lib/ranks";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";

function isExamRank(id: string): id is ExamRankId {
  return ["g30", "g25", "g20", "g15", "g10", "g7", "g5", "g3", "g1"].includes(id);
}

export function ExamPlayPage() {
  const { rankId = "" } = useParams();
  return <Exam key={rankId} rankId={rankId} />;
}

function Exam({ rankId }: { rankId: string }) {
  const navigate = useNavigate();
  const p = useProgress();
  const valid = isExamRank(rankId) && p.rank?.id === rankId;
  const bank = useMemo(() => (isExamRank(rankId) ? examProblems(rankId).slice(0, EXAM_TOTAL) : []), [rankId]);

  if (!valid) {
    return (
      <Screen onBack={() => navigate("/path")} title="승급 시험">
        <p className="mt-8 text-center text-toss-mute">시험을 열 수 없어요.</p>
      </Screen>
    );
  }

  if (bank.length < EXAM_TOTAL) {
    return (
      <Screen onBack={() => navigate("/path")} title="승급 시험">
        <p className="mt-8 text-center text-toss-mute">시험 문제가 준비 중이에요.</p>
      </Screen>
    );
  }

  return <ExamRun rankId={rankId} problems={bank} />;
}

function ExamRun({ rankId, problems }: { rankId: ExamRankId; problems: ExamProblem[] }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const problem = problems[idx]!;

  const onResult = (ok: boolean) => {
    const nextCorrect = correctCount + (ok ? 1 : 0);
    setCorrectCount(nextCorrect);
    if (idx + 1 >= problems.length) {
      setFinished(true);
      if (examPassed(nextCorrect, problems.length)) {
        actions.completeLesson(`exam:${rankId}`);
        const nxt = nextRank(rankId as RankId);
        if (nxt) actions.promoteRank(nxt.id);
      }
      return;
    }
    setIdx(idx + 1);
  };

  if (finished) {
    const passed = examPassed(correctCount, problems.length);
    const nxt = nextRank(rankId as RankId);
    return (
      <Screen onClose={() => navigate(passed ? "/" : "/path", { replace: true })} title="결과">
        <Reveal className="px-1 pt-6 text-center">
          <p className="text-[13px] font-semibold text-toss-mute">승급 시험</p>
          <p className="mt-3 text-[28px] font-bold tracking-tight text-toss-ink">
            {correctCount} / {problems.length}
          </p>
          <p className="mt-2 break-keep text-[17px] font-bold text-toss-ink">
            {passed ? (nxt ? `${nxt.label}로 승급!` : "최고 급수예요") : `${EXAM_PASS_SCORE}개 이상이면 통과`}
          </p>
          <p className="mt-2 break-keep text-[14px] text-toss-mute">
            {passed ? "급수 사다리가 한 칸 올라갔어요." : "파트 복습 후 다시 도전해 보세요."}
          </p>
        </Reveal>
        <div className="mt-8 space-y-2 px-1">
          <PrimaryButton onClick={() => navigate(passed ? "/" : "/learn", { replace: true })}>
            {passed ? "홈으로" : "개념으로"}
          </PrimaryButton>
          {!passed && (
            <SecondaryButton
              onClick={() => {
                setIdx(0);
                setCorrectCount(0);
                setFinished(false);
              }}
            >
              다시 보기
            </SecondaryButton>
          )}
        </div>
        {passed && <Confetti big />}
      </Screen>
    );
  }

  return (
    <ExamProblemView
      key={problem.id}
      problem={problem}
      index={idx}
      total={problems.length}
      onResult={onResult}
      onClose={() => navigate("/path")}
    />
  );
}

function ExamProblemView({
  problem,
  index,
  total,
  onResult,
  onClose,
}: {
  problem: ExamProblem;
  index: number;
  total: number;
  onResult: (ok: boolean) => void;
  onClose: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);
  const [board, setBoard] = useState<Grid>(() => applySetup(problem.size, problem.setup));
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);
  const [solved, setSolved] = useState<"ok" | "ng" | null>(null);
  const [wrong, setWrong] = useState<{ x: number; y: number } | null>(null);
  const [praise, setPraise] = useState<{ id: number; text: string; tone: "blue" | "orange" } | null>(null);
  const hintTimer = useRef(0);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSide(Math.floor(Math.min(width, height, 480)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    aiBoard.setSession({
      lessonId: problem.id,
      size: board.length,
      stones: gridToStones(board),
      prompt: problem.prompt,
      playAs: problem.playAs ?? "B",
    });
  }, [problem, board]);

  useEffect(() => {
    aiBoard.clearFeedback();
    return () => aiBoard.clearSession();
  }, [problem.id]);

  useEffect(
    () => () => {
      window.clearTimeout(hintTimer.current);
    },
    [],
  );

  const resolved = resolveAnswer(problem.answer, board);
  const playAs = problem.playAs ?? "B";

  const onPlay = useCallback(
    (point: { x: number; y: number }) => {
      if (solved) return;
      const after = isAnswer(point, resolved, board) ? playMove(board, point, playAs) : null;
      if (after) {
        haptic.correct();
        sfx.play("correct");
        sfx.play("xp");
        setBoard(after);
        setLastMove(point);
        setSolved("ok");
        setWrong(null);
        setPraise({ id: Date.now(), text: pickPraise(), tone: "blue" });
        return;
      }
      haptic.wrong();
      sfx.play("wrong");
      setWrong(point);
      setSolved("ng");
      window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setWrong(null), 400);
    },
    [board, playAs, resolved, solved],
  );

  return (
    <Screen lesson fit progress={(index + 1) / Math.max(1, total)} onClose={onClose}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-[100px] shrink-0 px-1">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-[#CE82FF]/20 px-2.5 py-1">
            <span className="duo-t-berry text-[12px] font-extrabold">
              {problem.rankDisplay} · {index + 1}/{total}
            </span>
          </div>
          <p className="duo-t1 break-keep text-[22px] font-extrabold leading-snug">
            {solved === "ok" && problem.explanation ? problem.explanation : problem.prompt}
          </p>
          {!solved && problem.tip ? <p className="duo-t2 mt-2 break-keep text-[14px] font-semibold leading-relaxed">{problem.tip}</p> : null}
          {solved === "ng" ? <p className="duo-t-red mt-2 break-keep text-[14px] font-extrabold">아쉬워요. 다음 문제로 가요.</p> : null}
        </div>

        <div ref={stageRef} className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
          {praise && solved === "ok" && <PraiseBadge key={praise.id} text={praise.text} tone={praise.tone} />}
          <div
            className="rounded-[24px] p-2.5"
            style={{ width: side || undefined, backgroundColor: "#1A2C33", boxShadow: "inset 0 0 0 2px #37464F" }}
          >
            <Board
              size={board.length}
              board={board}
              onPlay={onPlay}
              interactive={!solved}
              lastMove={lastMove}
              wrongFlash={wrong}
              showSize={false}
              className="max-w-none"
            />
          </div>
        </div>

        <div className="shrink-0 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]" style={{ borderTop: "2px solid #37464F" }}>
          {solved ? (
            <PrimaryButton night onClick={() => onResult(solved === "ok")}>
              {index + 1 >= total ? "결과 보기" : "계속하기"}
            </PrimaryButton>
          ) : (
            <PrimaryButton night disabled>
              {playAs === "W" ? "백" : "흑"} 차례 · 한 수만요
            </PrimaryButton>
          )}
        </div>
        <BoardBuddy />
      </div>
    </Screen>
  );
}
