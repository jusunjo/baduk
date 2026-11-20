import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Board } from "@/components/Board";
import { WhySmallBoard } from "@/components/BoardSizes";
import { LearningRoadmap } from "@/components/LearningRoadmap";
import { PrimaryButton, Reveal, Screen, SecondaryButton } from "@/components/Screen";
import { findLesson, nextLesson, type Lesson, type Point } from "@/data/curriculum";
import { applySetup, computeTerritory, emptyBoard, isAnswer, playMove, resolveAnswer, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { CompleteCard, Confetti, PraiseBadge, pickPraise } from "@/components/Celebrate";
import { useProgress } from "@/lib/progress";
import { actions } from "@/lib/store";

type Phase = "play" | "bridge" | "done";

function entryBoard(lesson: Lesson, idx: number, prev: Grid | null): Grid {
  const step = lesson.steps[idx];
  const size = step.size ?? lesson.boardSize;
  if (step.setup) return applySetup(size, step.setup);
  if (prev && prev.length === size) return prev;
  return emptyBoard(size);
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

  const [stepIdx, setStepIdx] = useState(0);
  const [board, setBoard] = useState<Grid>(() => (lesson ? entryBoard(lesson, 0, null) : emptyBoard(5)));
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<Point | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("play");
  const [replying, setReplying] = useState(false);
  const hintTimer = useRef<number>(0);
  const timers = useRef<number[]>([]);
  const goNextRef = useRef<() => void>(() => {});
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
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    if (!lesson) return;
    clearTimers();
    setReplying(false);
    setStepIdx(0);
    setBoard(entryBoard(lesson, 0, null));
    setLastMove(null);
    setSolved(false);
    setWrong(null);
    setHint(null);
    setPhase("play");
  }, [lesson]);

  useEffect(
    () => () => {
      window.clearTimeout(hintTimer.current);
      clearTimers();
    },
    [],
  );

  const autoplay = phase === "play" ? lesson?.steps[stepIdx]?.autoplay : undefined;
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

  const autoAdvance = !!lesson && phase === "play" && solved && !replying && !!lesson.steps[stepIdx]?.autoNext;
  const autoDelay = lesson?.steps[stepIdx]?.feedback ? 1100 : 450;
  useEffect(() => {
    if (!autoAdvance) return;
    const id = window.setTimeout(() => goNextRef.current(), autoDelay);
    return () => window.clearTimeout(id);
  }, [autoAdvance, autoDelay]);

  const [burst, setBurst] = useState<{ id: number; big: boolean } | null>(null);
  const [praise, setPraise] = useState<{ id: number; text: string; tone: "blue" | "orange" } | null>(null);
  const celebrate = (opts: { praise?: string; tone?: "blue" | "orange"; confetti?: "small" | "big" }) => {
    const id = Date.now();
    if (opts.praise) {
      setPraise({ id, text: opts.praise, tone: opts.tone ?? "blue" });
      later(() => setPraise((cur) => (cur?.id === id ? null : cur)), 1100);
    }
    if (opts.confetti) {
      setBurst({ id, big: opts.confetti === "big" });
      later(() => setBurst((cur) => (cur?.id === id ? null : cur)), 2400);
    }
  };

  if (!p.rank || !found || !lesson) {
    return (
      <Screen onBack={() => navigate("/learn")} title="한 수">
        <p className="mt-8 text-center text-toss-mute">레슨을 찾을 수 없어요.</p>
      </Screen>
    );
  }

  const step = lesson.steps[stepIdx];
  const total = lesson.steps.length;
  const resolved = resolveAnswer(step.answer, board);
  const needsPlay = phase === "play" && !!step.answer && !solved;
  const nxt = nextLesson(p.rank.track, lesson.id);
  const nextChapter = nxt ? findLesson(p.rank.track, nxt.id)?.chapter : null;
  const chapterEnds = !!nextChapter && nextChapter.id !== found.chapter.id;

  const goNext = (target = step.goto ?? stepIdx + 1) => {
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
    if (!needsPlay) return;
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

  const label =
    phase === "play"
      ? lesson.title
      : phase === "done"
        ? "축하해요"
        : `다음 · ${chapterEnds ? nextChapter!.title : nxt!.title}`;
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
      right={
        <span className="text-[13px] font-semibold text-toss-mute">
          {found.chapter.title}
        </span>
      }
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
        ) : (
          step.ask && !solved ? (
            <div className="flex flex-col gap-2">
              <PrimaryButton onClick={() => goNext(step.ask!.yesGoto)}>{step.ask.yes}</PrimaryButton>
              <SecondaryButton onClick={() => goNext(step.ask!.noGoto)}>{step.ask.no}</SecondaryButton>
            </div>
          ) : (
            <PrimaryButton onClick={() => goNext()} disabled={playing}>
              {solved ? "다음" : (step.cta ?? "다음")}
            </PrimaryButton>
          )
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
          <p key={`tip-${phase}-${stepIdx}`} className="mt-2 animate-rise-in break-keep text-[14px] leading-relaxed text-toss-mute" style={{ animationDelay: "120ms" }}>
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
            title={!nxt ? `${p.curriculum?.title ?? ""} 과정을 마쳤어요` : chapterEnds ? found.chapter.title : lesson.title}
            done={p.done}
            total={p.total}
            chapterDone={found.chapter.lessons.filter((l) => p.completed[l.id]).length}
            chapterTotal={found.chapter.lessons.length}
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
              highlights={playing ? [] : (needsPlay
                ? (step.highlight ?? (resolved === "any" ? [] : resolved)).filter((h) => !board[h.y][h.x])
                : solved || phase !== "play"
                  ? []
                  : step.highlight)}
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
