import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Board } from "@/components/Board";
import { WhySmallBoard } from "@/components/BoardSizes";
import { CompleteCard, Confetti, PraiseBadge, pickPraise } from "@/components/Celebrate";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { PrimaryButton, Reveal, Screen, SecondaryButton } from "@/components/Screen";
import {
  findLesson,
  nextLesson,
  type Lesson,
  type LessonStep,
  type Point,
  type Problem,
} from "@/data/curriculum";
import { applySetup, computeTerritory, emptyBoard, isAnswer, playMove, resolveAnswer, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { useProgress } from "@/lib/progress";
import { actions } from "@/lib/store";

type LegacyPhase = "play" | "bridge" | "done";
type SessionPhase = "concept" | "example" | "problems" | "review" | "bridge" | "done";

function entryBoard(lesson: Lesson, idx: number, prev: Grid | null): Grid {
  const step = lesson.steps[idx];
  const size = step.size ?? lesson.boardSize;
  if (step.setup) return applySetup(size, step.setup);
  if (prev && prev.length === size) return prev;
  return emptyBoard(size);
}

function stepBoard(lesson: Lesson, step: LessonStep, prev: Grid | null): Grid {
  const size = step.size ?? lesson.boardSize;
  if (step.setup) return applySetup(size, step.setup);
  if (prev && prev.length === size) return prev;
  return emptyBoard(size);
}

function problemBoard(lesson: Lesson, problem: Problem): Grid {
  return applySetup(problem.size ?? lesson.boardSize, problem.setup);
}

export function LessonPlayPage() {
  const { lessonId = "" } = useParams();
  return <LessonPlay key={lessonId} lessonId={lessonId} />;
}

function LessonPlay({ lessonId }: { lessonId: string }) {
  const navigate = useNavigate();
  const p = useProgress();
  const found = p.rank ? findLesson(p.rank.track, lessonId) : null;
  const lesson = found?.lesson;

  if (!p.rank || !found || !lesson) {
    return (
      <Screen onBack={() => navigate("/learn")} title="한 수">
        <p className="mt-8 text-center text-toss-mute">레슨을 찾을 수 없어요.</p>
      </Screen>
    );
  }

  if (lesson.session) {
    return <SessionPlay lesson={lesson} chapterId={found.chapter.id} chapterTitle={found.chapter.title} chapterLessons={found.chapter.lessons} />;
  }

  return <LegacyPlay lesson={lesson} chapterId={found.chapter.id} chapterTitle={found.chapter.title} chapterLessons={found.chapter.lessons} />;
}

function useStageSize() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);
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
  return { stageRef, side };
}

function useCelebrate() {
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);
  const [burst, setBurst] = useState<{ id: number; big: boolean } | null>(null);
  const [praise, setPraise] = useState<{ id: number; text: string; tone: "blue" | "orange" } | null>(null);
  const celebrate = useCallback(
    (opts: { praise?: string; tone?: "blue" | "orange"; confetti?: "small" | "big" }) => {
      const id = Date.now();
      if (opts.praise) {
        setPraise({ id, text: opts.praise, tone: opts.tone ?? "blue" });
        later(() => setPraise((cur) => (cur?.id === id ? null : cur)), 1100);
      }
      if (opts.confetti) {
        setBurst({ id, big: opts.confetti === "big" });
        later(() => setBurst((cur) => (cur?.id === id ? null : cur)), 2400);
      }
    },
    [later],
  );
  useEffect(() => () => clearTimers(), [clearTimers]);
  return { burst, praise, celebrate, later, clearTimers };
}

/* ─── Session: concept → example → problems → review ─── */

function SessionPlay({
  lesson,
  chapterId,
  chapterTitle,
  chapterLessons,
}: {
  lesson: Lesson;
  chapterId: string;
  chapterTitle: string;
  chapterLessons: Lesson[];
}) {
  const navigate = useNavigate();
  const p = useProgress();
  const session = lesson.session!;
  const { stageRef, side } = useStageSize();
  const { burst, praise, celebrate, later, clearTimers } = useCelebrate();

  const [phase, setPhase] = useState<SessionPhase>("concept");
  const [stepIdx, setStepIdx] = useState(0);
  const [problemIdx, setProblemIdx] = useState(0);
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [missed, setMissed] = useState<string[]>([]);
  const missedRef = useRef<string[]>([]);
  const [board, setBoard] = useState<Grid>(() => stepBoard(lesson, session.concept[0] ?? { text: "" }, null));
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<Point | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);
  const hintTimer = useRef<number>(0);
  const goNextRef = useRef<() => void>(() => {});
  missedRef.current = missed;

  const teachSteps = phase === "concept" ? session.concept : phase === "example" ? session.example : [];
  const currentProblem =
    phase === "problems"
      ? session.problems[problemIdx]
      : phase === "review"
        ? session.problems.find((x) => x.id === reviewQueue[0]) ?? null
        : null;
  const teachStep = teachSteps[stepIdx] as LessonStep | undefined;

  const activeAnswer = currentProblem?.answer ?? teachStep?.answer;
  const activePlayAs = currentProblem?.playAs ?? teachStep?.playAs ?? "B";
  const activeHighlight = currentProblem?.highlight ?? teachStep?.highlight;
  const activeWrongHint = currentProblem?.wrongHint ?? teachStep?.wrongHint;
  const activeAutoNext = currentProblem?.autoNext ?? teachStep?.autoNext;
  const activeReply = currentProblem?.reply ?? teachStep?.reply;
  const activeFeedback = currentProblem?.feedback ?? teachStep?.feedback;
  const activeLiberties = currentProblem?.libertiesFor ?? lesson.libertiesFor;
  const activeSize = (currentProblem?.size ?? teachStep?.size ?? lesson.boardSize) as number;

  const resetPlay = () => {
    setLastMove(null);
    setSolved(false);
    setWrong(null);
    setHint(null);
    setReplying(false);
  };

  const loadTeach = (nextPhase: "concept" | "example", idx: number, prev: Grid | null) => {
    const steps = nextPhase === "concept" ? session.concept : session.example;
    const step = steps[idx];
    setPhase(nextPhase);
    setStepIdx(idx);
    setBoard(step ? stepBoard(lesson, step, prev) : emptyBoard(lesson.boardSize));
    resetPlay();
  };

  const loadProblem = (idx: number) => {
    const problem = session.problems[idx];
    setPhase("problems");
    setProblemIdx(idx);
    setBoard(problem ? problemBoard(lesson, problem) : emptyBoard(lesson.boardSize));
    resetPlay();
  };

  const loadReview = (queue: string[]) => {
    const problem = session.problems.find((x) => x.id === queue[0]);
    setPhase("review");
    setReviewQueue(queue);
    setBoard(problem ? problemBoard(lesson, problem) : emptyBoard(lesson.boardSize));
    resetPlay();
  };

  useEffect(() => {
    clearTimers();
    missedRef.current = [];
    setMissed([]);
    setReviewQueue([]);
    if (session.concept.length) loadTeach("concept", 0, null);
    else if (session.example.length) loadTeach("example", 0, null);
    else if (session.problems.length) loadProblem(0);
    else setPhase("done");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(
    () => () => {
      window.clearTimeout(hintTimer.current);
      clearTimers();
    },
    [clearTimers],
  );

  const autoplay = phase === "concept" || phase === "example" ? teachStep?.autoplay : undefined;
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!autoplay?.length) return;
    setPlaying(true);
    const ids = autoplay.map((m, i) =>
      window.setTimeout(() => {
        setBoard((b) => playMove(b, m.at, m.color) ?? b);
        setLastMove(m.at);
      }, 450 + i * 650),
    );
    ids.push(window.setTimeout(() => setPlaying(false), 450 + autoplay.length * 650));
    return () => {
      ids.forEach(window.clearTimeout);
      setPlaying(false);
    };
  }, [autoplay, stepIdx, phase]);

  const playingPhase = phase === "concept" || phase === "example" || phase === "problems" || phase === "review";
  const resolved = resolveAnswer(activeAnswer, board);
  const needsPlay = playingPhase && !!activeAnswer && !solved;
  const autoAdvance = playingPhase && solved && !replying && !!activeAutoNext;
  const autoDelay = activeFeedback ? 1100 : 450;
  useEffect(() => {
    if (!autoAdvance) return;
    const id = window.setTimeout(() => goNextRef.current(), autoDelay);
    return () => window.clearTimeout(id);
  }, [autoAdvance, autoDelay]);

  const nxt = nextLesson(p.rank!.track, lesson.id);
  const nextChapter = nxt ? findLesson(p.rank!.track, nxt.id)?.chapter : null;
  const chapterEnds = !!nextChapter && nextChapter.id !== chapterId;

  const finishSession = () => {
    actions.completeLesson(lesson.id);
    haptic.correct();
    celebrate({ confetti: chapterEnds || !nxt ? "big" : "small" });
    if (nxt && lesson.flowNext) {
      navigate(`/learn/${nxt.id}`, { replace: true });
      return;
    }
    setPhase(nxt ? "bridge" : "done");
  };

  const advanceAfterTeach = (prevBoard: Grid) => {
    if (phase === "concept") {
      if (stepIdx + 1 < session.concept.length) {
        loadTeach("concept", stepIdx + 1, prevBoard);
        return;
      }
      if (session.example.length) {
        loadTeach("example", 0, null);
        return;
      }
      if (session.problems.length) {
        loadProblem(0);
        return;
      }
      finishSession();
      return;
    }
    if (phase === "example") {
      if (stepIdx + 1 < session.example.length) {
        loadTeach("example", stepIdx + 1, prevBoard);
        return;
      }
      if (session.problems.length) {
        loadProblem(0);
        return;
      }
      finishSession();
    }
  };

  const advanceAfterProblem = () => {
    if (problemIdx + 1 < session.problems.length) {
      loadProblem(problemIdx + 1);
      return;
    }
    const queue = missedRef.current;
    if (queue.length) {
      loadReview([...queue]);
      return;
    }
    finishSession();
  };

  const advanceAfterReview = () => {
    const rest = reviewQueue.slice(1);
    if (rest.length) {
      loadReview(rest);
      return;
    }
    finishSession();
  };

  const goNext = (target?: number) => {
    if (phase === "concept" || phase === "example") {
      if (target != null && teachStep) {
        const steps = phase === "concept" ? session.concept : session.example;
        if (target < steps.length) {
          loadTeach(phase, target, board);
          return;
        }
      }
      advanceAfterTeach(board);
      return;
    }
    if (phase === "problems") {
      advanceAfterProblem();
      return;
    }
    if (phase === "review") {
      advanceAfterReview();
    }
  };

  goNextRef.current = goNext;

  const markMissed = (id: string) => {
    setMissed((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      missedRef.current = next;
      return next;
    });
  };

  const onPlay = (point: Point) => {
    if (!needsPlay || !activeAnswer) return;
    const after = isAnswer(point, resolved, board) ? playMove(board, point, activePlayAs) : null;
    if (after) {
      haptic.correct();
      const opponent = activePlayAs === "W" ? "B" : "W";
      const captured =
        board.flat().filter((c) => c === opponent).length - after.flat().filter((c) => c === opponent).length;
      if (captured > 0) celebrate({ praise: `따냈어요! +${captured}`, tone: "orange", confetti: "small" });
      else if (!activeAutoNext) celebrate({ praise: pickPraise() });
      setBoard(after);
      setLastMove(point);
      setSolved(true);
      setWrong(null);
      setHint(null);
      if (activeReply) {
        setReplying(true);
        later(() => {
          const at = activeReply(point);
          const answered = playMove(after, at, activePlayAs === "W" ? "B" : "W");
          if (answered) {
            haptic.tap();
            setBoard(answered);
            setLastMove(at);
          }
          setReplying(false);
        }, 550);
      }
      return;
    }
    haptic.wrong();
    if (currentProblem) markMissed(currentProblem.id);
    setWrong(point);
    setHint(activeWrongHint ?? "다른 자리를 눌러 볼까요?");
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setWrong(null), 400);
  };

  const segmentLabel =
    phase === "concept"
      ? "개념"
      : phase === "example"
        ? "예시"
        : phase === "problems"
          ? `문제 ${problemIdx + 1}/${session.problems.length}`
          : phase === "review"
            ? `오답 ${session.problems.length - reviewQueue.length + 1}/${missed.length || reviewQueue.length}`
            : phase === "done"
              ? "축하해요"
              : `다음 · ${chapterEnds ? nextChapter!.title : nxt!.title}`;

  const text =
    phase === "done"
      ? "모든 레슨을 마쳤어요!"
      : phase === "bridge"
        ? (nxt?.bridge ?? `다음은 ‘${nxt?.title}’이에요`)
        : phase === "review" && currentProblem
          ? currentProblem.prompt
          : phase === "problems" && currentProblem
            ? solved && currentProblem.feedback
              ? currentProblem.feedback
              : currentProblem.prompt
            : teachStep
              ? solved && teachStep.feedback
                ? teachStep.feedback
                : teachStep.text
              : "";

  const tip =
    phase === "done"
      ? "홈에서 다음 판으로 가는 길을 확인해 보세요."
      : phase === "review" && currentProblem
        ? currentProblem.explanation ?? currentProblem.tip
        : phase === "problems" && currentProblem && !solved
          ? currentProblem.tip
          : phase === "concept" || phase === "example"
            ? solved
              ? undefined
              : teachStep?.tip
            : undefined;

  const territory = activeLiberties ? undefined : computeTerritory(board);

  const progressSegments = [
    { key: "concept", weight: Math.max(session.concept.length, 1), done: phase === "concept" ? stepIdx + 0.5 : ["example", "problems", "review", "bridge", "done"].includes(phase) ? session.concept.length : 0, total: Math.max(session.concept.length, 1) },
    { key: "example", weight: Math.max(session.example.length, 1), done: phase === "example" ? stepIdx + 0.5 : ["problems", "review", "bridge", "done"].includes(phase) ? session.example.length : 0, total: Math.max(session.example.length, 1) },
    {
      key: "problems",
      weight: session.problems.length,
      done:
        phase === "problems"
          ? problemIdx + (solved ? 1 : 0.5)
          : phase === "review"
            ? session.problems.length + (missed.length - reviewQueue.length) + (solved ? 0.5 : 0)
            : ["bridge", "done"].includes(phase)
              ? session.problems.length + missed.length
              : 0,
      total: session.problems.length + (phase === "review" || missed.length ? Math.max(missed.length, 1) : 0),
    },
  ].filter((s) => (s.key === "concept" ? session.concept.length : s.key === "example" ? session.example.length : session.problems.length) > 0);

  return (
    <Screen
      fit
      onClose={() => navigate("/")}
      right={<span className="text-[13px] font-semibold text-toss-mute">{chapterTitle}</span>}
      cta={
        phase === "done" ? (
          <PrimaryButton onClick={() => navigate("/", { replace: true })}>홈으로</PrimaryButton>
        ) : phase === "bridge" ? (
          chapterEnds ? (
            <div className="flex gap-2">
              <div className="w-[38%]">
                <SecondaryButton onClick={() => navigate("/", { replace: true })}>오늘은 여기까지</SecondaryButton>
              </div>
              <PrimaryButton onClick={() => navigate(`/learn/${nxt!.id}`, { replace: true })}>이어서 하기</PrimaryButton>
            </div>
          ) : (
            <PrimaryButton onClick={() => navigate(`/learn/${nxt!.id}`, { replace: true })}>이어서 하기</PrimaryButton>
          )
        ) : needsPlay || replying || autoAdvance ? (
          (() => {
            const theirs = replying || (autoAdvance && !!activeReply);
            const mine = activePlayAs === "W" ? "백" : "흑";
            return (
              <div className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-toss-soft2 text-[15px] font-semibold text-toss-body">
                <span
                  className={`h-4 w-4 rounded-full ${(activePlayAs === "W") !== theirs ? "bg-white ring-1 ring-toss-line" : "bg-toss-ink"}`}
                  aria-hidden
                />
                {theirs ? `${mine === "흑" ? "백" : "흑"} 차례` : `${mine} 차례 · 판을 눌러 두어 보세요`}
              </div>
            );
          })()
        ) : teachStep?.ask && !solved ? (
          <div className="flex flex-col gap-2">
            <PrimaryButton onClick={() => goNext(teachStep.ask!.yesGoto)}>{teachStep.ask.yes}</PrimaryButton>
            <SecondaryButton onClick={() => goNext(teachStep.ask!.noGoto)}>{teachStep.ask.no}</SecondaryButton>
          </div>
        ) : (
          <PrimaryButton onClick={() => goNext(teachStep?.goto)} disabled={playing}>
            {solved ? "다음" : (teachStep?.cta ?? (phase === "review" ? "다시 풀기" : "다음"))}
          </PrimaryButton>
        )
      }
    >
      <div className="flex items-center gap-2 px-1">
        <span
          className={`rounded-pill px-2.5 py-1 text-[12px] font-semibold ${
            phase === "review" ? "bg-toss-orange/15 text-toss-orange" : "bg-toss-blue/10 text-toss-blue"
          }`}
        >
          {segmentLabel}
        </span>
        <div className="flex min-w-0 flex-1 gap-1" aria-hidden>
          {progressSegments.map((seg) => (
            <span key={seg.key} className="h-1 flex-1 overflow-hidden rounded-full bg-toss-soft">
              <span
                className={`block h-full rounded-full transition-[width] duration-500 ease-out ${
                  seg.key === "problems" && phase === "review" ? "bg-toss-orange" : "bg-toss-blue"
                }`}
                style={{ width: `${Math.max(0, Math.min(1, seg.done / seg.total)) * 100}%` }}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 min-h-[132px] shrink-0 px-1">
        <p className="text-[13px] font-semibold text-toss-mute">{lesson.title}</p>
        <p
          key={`${phase}-${text}`}
          className="mt-2 animate-rise-in break-keep text-[22px] font-bold leading-[1.4] tracking-tight text-toss-ink"
        >
          {text}
        </p>
        {tip && (
          <p
            key={`tip-${phase}-${stepIdx}-${problemIdx}-${reviewQueue[0]}`}
            className="mt-2 animate-rise-in break-keep text-[14px] leading-relaxed text-toss-mute"
            style={{ animationDelay: "120ms" }}
          >
            {phase === "review" ? `해설 · ${tip}` : tip}
          </p>
        )}
      </div>

      {burst && <Confetti key={burst.id} big={burst.big} />}
      <div ref={stageRef} className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
        {praise && playingPhase && <PraiseBadge key={praise.id} text={praise.text} tone={praise.tone} />}
        {phase === "bridge" || phase === "done" ? (
          <div className="max-h-full w-full overflow-y-auto">
            <CompleteCard
              kind={!nxt ? "track" : chapterEnds ? "chapter" : "lesson"}
              title={!nxt ? `${p.curriculum?.title ?? ""} 과정을 마쳤어요` : chapterEnds ? chapterTitle : lesson.title}
              done={p.done}
              total={p.total}
              chapterDone={chapterLessons.filter((l) => p.completed[l.id]).length}
              chapterTotal={chapterLessons.length}
            />
          </div>
        ) : teachStep?.visual === "roadmap" ? (
          <div className="max-h-full w-full overflow-y-auto">
            <LearningRoadmap />
          </div>
        ) : (
          <div
            className="rounded-[28px] bg-gradient-to-b from-[#f7efe2] to-white p-3 ring-1 ring-black/[0.04]"
            style={{ width: side || undefined }}
          >
            <div key={`${phase}-${stepIdx}-${problemIdx}-${reviewQueue[0]}-${activeSize}`} className="animate-panel-in">
              <Board
                size={board.length}
                board={board}
                highlights={
                  playing
                    ? []
                    : needsPlay
                      ? (activeHighlight ?? (resolved === "any" ? [] : resolved)).filter((h) => !board[h.y][h.x])
                      : solved
                        ? []
                        : activeHighlight
                }
                territory={territory}
                libertiesFor={activeLiberties}
                onPlay={onPlay}
                interactive={needsPlay}
                lastMove={lastMove}
                wrongFlash={wrong}
                showSize={false}
                className="max-w-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-[44px] shrink-0 items-center justify-center px-1 text-center">
        {hint && needsPlay ? (
          <Reveal key={hint}>
            <p className="break-keep text-[14px] font-medium text-toss-orange">{hint}</p>
          </Reveal>
        ) : teachStep?.score && (phase === "concept" || phase === "example") ? (
          <Score territory={territory} />
        ) : playingPhase && !teachStep?.visual ? (
          <WhySmallBoard size={lesson.boardSize} />
        ) : null}
      </div>
    </Screen>
  );
}

/* ─── Legacy linear steps ─── */

function LegacyPlay({
  lesson,
  chapterId,
  chapterTitle,
  chapterLessons,
}: {
  lesson: Lesson;
  chapterId: string;
  chapterTitle: string;
  chapterLessons: Lesson[];
}) {
  const navigate = useNavigate();
  const p = useProgress();
  const { stageRef, side } = useStageSize();
  const { burst, praise, celebrate, later, clearTimers } = useCelebrate();

  const [stepIdx, setStepIdx] = useState(0);
  const [board, setBoard] = useState<Grid>(() => entryBoard(lesson, 0, null));
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<Point | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [phase, setPhase] = useState<LegacyPhase>("play");
  const [replying, setReplying] = useState(false);
  const hintTimer = useRef<number>(0);
  const goNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    clearTimers();
    setReplying(false);
    setStepIdx(0);
    setBoard(entryBoard(lesson, 0, null));
    setLastMove(null);
    setSolved(false);
    setWrong(null);
    setHint(null);
    setPhase("play");
  }, [lesson, clearTimers]);

  useEffect(
    () => () => {
      window.clearTimeout(hintTimer.current);
      clearTimers();
    },
    [clearTimers],
  );

  const autoplay = phase === "play" ? lesson.steps[stepIdx]?.autoplay : undefined;
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!autoplay?.length) return;
    setPlaying(true);
    const ids = autoplay.map((m, i) =>
      window.setTimeout(() => {
        setBoard((b) => playMove(b, m.at, m.color) ?? b);
        setLastMove(m.at);
      }, 450 + i * 650),
    );
    ids.push(window.setTimeout(() => setPlaying(false), 450 + autoplay.length * 650));
    return () => {
      ids.forEach(window.clearTimeout);
      setPlaying(false);
    };
  }, [autoplay, stepIdx]);

  const autoAdvance = phase === "play" && solved && !replying && !!lesson.steps[stepIdx]?.autoNext;
  const autoDelay = lesson.steps[stepIdx]?.feedback ? 1100 : 450;
  useEffect(() => {
    if (!autoAdvance) return;
    const id = window.setTimeout(() => goNextRef.current(), autoDelay);
    return () => window.clearTimeout(id);
  }, [autoAdvance, autoDelay]);

  const step = lesson.steps[stepIdx];
  const total = lesson.steps.length;
  const resolved = resolveAnswer(step?.answer, board);
  const needsPlay = phase === "play" && !!step?.answer && !solved;
  const nxt = nextLesson(p.rank!.track, lesson.id);
  const nextChapter = nxt ? findLesson(p.rank!.track, nxt.id)?.chapter : null;
  const chapterEnds = !!nextChapter && nextChapter.id !== chapterId;

  const goNext = (target = step?.goto ?? stepIdx + 1) => {
    if (target < total) {
      setBoard(entryBoard(lesson, target, board));
      setStepIdx(target);
      setLastMove(null);
      setSolved(false);
      setHint(null);
      return;
    }
    actions.completeLesson(lesson.id);
    haptic.correct();
    celebrate({ confetti: chapterEnds || !nxt ? "big" : "small" });
    if (nxt && lesson.flowNext) {
      navigate(`/learn/${nxt.id}`, { replace: true });
      return;
    }
    setPhase(nxt ? "bridge" : "done");
  };

  goNextRef.current = goNext;

  const onPlay = (point: Point) => {
    if (!needsPlay || !step) return;
    const after = isAnswer(point, resolved, board) ? playMove(board, point, step.playAs ?? "B") : null;
    if (after) {
      haptic.correct();
      const opponent = step.playAs === "W" ? "B" : "W";
      const captured =
        board.flat().filter((c) => c === opponent).length - after.flat().filter((c) => c === opponent).length;
      if (captured > 0) celebrate({ praise: `따냈어요! +${captured}`, tone: "orange", confetti: "small" });
      else if (!step.autoNext) celebrate({ praise: pickPraise() });
      setBoard(after);
      setLastMove(point);
      setSolved(true);
      setWrong(null);
      setHint(null);
      const reply = step.reply;
      if (reply) {
        setReplying(true);
        later(() => {
          const at = reply(point);
          const answered = playMove(after, at, step.playAs === "W" ? "B" : "W");
          if (answered) {
            haptic.tap();
            setBoard(answered);
            setLastMove(at);
          }
          setReplying(false);
        }, 550);
      }
      return;
    }
    haptic.wrong();
    setWrong(point);
    setHint(step.wrongHint ?? "다른 자리를 눌러 볼까요?");
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setWrong(null), 400);
  };

  if (!step && phase === "play") {
    return (
      <Screen onBack={() => navigate("/learn")} title="한 수">
        <p className="mt-8 text-center text-toss-mute">레슨 단계가 없어요.</p>
      </Screen>
    );
  }

  const label =
    phase === "play" ? lesson.title : phase === "done" ? "축하해요" : `다음 · ${chapterEnds ? nextChapter!.title : nxt!.title}`;
  const text =
    phase === "done"
      ? "모든 레슨을 마쳤어요!"
      : phase === "bridge"
        ? (nxt?.bridge ?? `다음은 ‘${nxt?.title}’이에요`)
        : solved && step.feedback
          ? step.feedback
          : step.text;
  const tip = phase === "done" ? "홈에서 다음 판으로 가는 길을 확인해 보세요." : phase === "bridge" || solved ? undefined : step.tip;
  const size = board.length;
  const territory = lesson.libertiesFor ? undefined : computeTerritory(board);
  const filled = phase === "play" ? stepIdx + (solved || !step.answer ? 0.5 : 0) : total;

  return (
    <Screen
      fit
      onClose={() => navigate("/")}
      right={<span className="text-[13px] font-semibold text-toss-mute">{chapterTitle}</span>}
      cta={
        phase === "done" ? (
          <PrimaryButton onClick={() => navigate("/", { replace: true })}>홈으로</PrimaryButton>
        ) : phase === "bridge" ? (
          chapterEnds ? (
            <div className="flex gap-2">
              <div className="w-[38%]">
                <SecondaryButton onClick={() => navigate("/", { replace: true })}>오늘은 여기까지</SecondaryButton>
              </div>
              <PrimaryButton onClick={() => navigate(`/learn/${nxt!.id}`, { replace: true })}>이어서 하기</PrimaryButton>
            </div>
          ) : (
            <PrimaryButton onClick={() => navigate(`/learn/${nxt!.id}`, { replace: true })}>이어서 하기</PrimaryButton>
          )
        ) : needsPlay || replying || autoAdvance ? (
          (() => {
            const theirs = replying || (autoAdvance && !!step.reply);
            const mine = step.playAs === "W" ? "백" : "흑";
            return (
              <div className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-toss-soft2 text-[15px] font-semibold text-toss-body">
                <span
                  className={`h-4 w-4 rounded-full ${(step.playAs === "W") !== theirs ? "bg-white ring-1 ring-toss-line" : "bg-toss-ink"}`}
                  aria-hidden
                />
                {theirs ? `${mine === "흑" ? "백" : "흑"} 차례` : `${mine} 차례 · 판을 눌러 두어 보세요`}
              </div>
            );
          })()
        ) : step.ask && !solved ? (
          <div className="flex flex-col gap-2">
            <PrimaryButton onClick={() => goNext(step.ask!.yesGoto)}>{step.ask.yes}</PrimaryButton>
            <SecondaryButton onClick={() => goNext(step.ask!.noGoto)}>{step.ask.no}</SecondaryButton>
          </div>
        ) : (
          <PrimaryButton onClick={() => goNext()} disabled={playing}>
            {solved ? "다음" : (step.cta ?? "다음")}
          </PrimaryButton>
        )
      }
    >
      <div className="flex gap-1 px-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-toss-soft">
            <span
              className="block h-full rounded-full bg-toss-blue transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(1, filled - i)) * 100}%` }}
            />
          </span>
        ))}
      </div>

      <div className="mt-4 min-h-[132px] shrink-0 px-1">
        <p className="text-[13px] font-semibold text-toss-mute">{label}</p>
        <p
          key={`${phase}-${text}`}
          className="mt-2 animate-rise-in break-keep text-[22px] font-bold leading-[1.4] tracking-tight text-toss-ink"
        >
          {text}
        </p>
        {tip && (
          <p
            key={`tip-${phase}-${stepIdx}`}
            className="mt-2 animate-rise-in break-keep text-[14px] leading-relaxed text-toss-mute"
            style={{ animationDelay: "120ms" }}
          >
            {tip}
          </p>
        )}
      </div>

      {burst && <Confetti key={burst.id} big={burst.big} />}
      <div ref={stageRef} className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
        {praise && phase === "play" && <PraiseBadge key={praise.id} text={praise.text} tone={praise.tone} />}
        {phase !== "play" ? (
          <div className="max-h-full w-full overflow-y-auto">
            <CompleteCard
              kind={!nxt ? "track" : chapterEnds ? "chapter" : "lesson"}
              title={!nxt ? `${p.curriculum?.title ?? ""} 과정을 마쳤어요` : chapterEnds ? chapterTitle : lesson.title}
              done={p.done}
              total={p.total}
              chapterDone={chapterLessons.filter((l) => p.completed[l.id]).length}
              chapterTotal={chapterLessons.length}
            />
          </div>
        ) : step.visual === "roadmap" ? (
          <div className="max-h-full w-full overflow-y-auto">
            <LearningRoadmap />
          </div>
        ) : (
          <div
            className="rounded-[28px] bg-gradient-to-b from-[#f7efe2] to-white p-3 ring-1 ring-black/[0.04]"
            style={{ width: side || undefined }}
          >
            <div key={size} className="animate-panel-in">
              <Board
                size={size}
                board={board}
                highlights={
                  playing
                    ? []
                    : needsPlay
                      ? (step.highlight ?? (resolved === "any" ? [] : resolved)).filter((h) => !board[h.y][h.x])
                      : solved || phase !== "play"
                        ? []
                        : step.highlight
                }
                territory={territory}
                libertiesFor={lesson.libertiesFor}
                onPlay={onPlay}
                interactive={needsPlay}
                lastMove={lastMove}
                wrongFlash={wrong}
                showSize={false}
                className="max-w-none"
              />
            </div>
            {step.size === 19 && phase === "play" && (
              <p className="mt-2 text-center text-[12px] font-semibold tabular-nums text-[#8a6a3d]">
                {size}×{size} · {size * size}자리
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex min-h-[44px] shrink-0 items-center justify-center px-1 text-center">
        {hint && needsPlay ? (
          <Reveal key={hint}>
            <p className="break-keep text-[14px] font-medium text-toss-orange">{hint}</p>
          </Reveal>
        ) : step.score && phase === "play" ? (
          <Score territory={territory} />
        ) : step.visual || phase !== "play" ? null : (
          <WhySmallBoard size={lesson.boardSize} />
        )}
      </div>
    </Screen>
  );
}

function Score({ territory = [] }: { territory?: { color: "B" | "W"; points: Point[] }[] }) {
  const count = (c: "B" | "W") => territory.find((t) => t.color === c)?.points.length ?? 0;
  const b = count("B");
  const w = count("W");
  return (
    <Reveal className="flex w-full gap-2">
      {(["B", "W"] as const).map((c) => {
        const n = c === "B" ? b : w;
        const lead = n > (c === "B" ? w : b);
        return (
          <div key={c} className={`flex flex-1 items-center gap-2.5 rounded-2xl px-4 py-2.5 ${lead ? "bg-toss-blue/10" : "bg-toss-soft2"}`}>
            <span className={`h-4 w-4 rounded-full ${c === "B" ? "bg-toss-ink" : "bg-white ring-1 ring-toss-line"}`} aria-hidden />
            <span className="flex-1 text-left text-[14px] font-semibold text-toss-body">{c === "B" ? "흑" : "백"} 집</span>
            <span className={`text-[18px] font-bold tabular-nums ${lead ? "text-toss-blue" : "text-toss-ink"}`}>{n}</span>
          </div>
        );
      })}
    </Reveal>
  );
}
