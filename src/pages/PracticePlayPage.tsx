import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Board } from "@/components/Board";
import { BoardBuddy } from "@/components/BoardBuddy";
import { Confetti, PraiseBadge, pickPraise } from "@/components/Celebrate";
import { PrimaryButton, Reveal, Screen } from "@/components/Screen";
import { aiBoard, gridToStones, useAiBoard } from "@/lib/aiBoard";
import { aiChat } from "@/lib/aiChat";
import { applySetup, isAnswer, playMove, resolveAnswer, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { findPractice, listPractice, type PracticeItem } from "@/lib/practice";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";

export function PracticePlayPage() {
  const { lessonId = "", problemId = "" } = useParams();
  return <PracticePlay key={`${lessonId}/${problemId}`} lessonId={lessonId} problemId={problemId} />;
}

function PracticePlay({ lessonId, problemId }: { lessonId: string; problemId: string }) {
  const navigate = useNavigate();
  const p = useProgress();
  const item = p.rank ? findPractice(p.rank.track, lessonId, problemId) : null;
  const queue = p.rank ? listPractice(p.rank.track).filter((x) => x.lessonId === lessonId) : [];
  const idx = queue.findIndex((x) => x.problemId === problemId);
  const next = idx >= 0 ? queue[idx + 1] ?? null : null;

  if (!p.rank || !item) {
    return (
      <Screen onBack={() => navigate("/practice")} title="문제">
        <p className="mt-8 text-center text-[#777777]">문제를 찾을 수 없어요.</p>
      </Screen>
    );
  }

  return <Play item={item} next={next} index={Math.max(0, idx)} total={queue.length} />;
}

function Play({
  item,
  next,
  index,
  total,
}: {
  item: PracticeItem;
  next: PracticeItem | null;
  index: number;
  total: number;
}) {
  const navigate = useNavigate();
  const { feedback: aiFeedback } = useAiBoard();
  const stageRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState(0);
  const [board, setBoard] = useState<Grid>(() => applySetup(item.size, item.setup));
  const [lastMove, setLastMove] = useState<{ x: number; y: number } | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<{ x: number; y: number } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ id: number; big: boolean } | null>(null);
  const [praise, setPraise] = useState<{ id: number; text: string; tone: "blue" | "orange" } | null>(null);
  const hintTimer = useRef(0);
  const timers = useRef<number[]>([]);

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
      lessonId: item.lessonId,
      size: board.length,
      stones: gridToStones(board),
      prompt: item.prompt,
      playAs: item.playAs ?? "B",
    });
  }, [item.lessonId, item.prompt, item.playAs, board]);

  useEffect(() => {
    aiChat.clear();
    aiBoard.clearFeedback();
    return () => aiBoard.clearSession();
  }, [item.id]);

  useEffect(
    () => () => {
      window.clearTimeout(hintTimer.current);
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

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

  const resolved = resolveAnswer(item.answer, board);
  const playAs = item.playAs ?? "B";
  const needsPlay = !solved;

  const onPlay = (point: { x: number; y: number }) => {
    if (!needsPlay) return;
    const after = isAnswer(point, resolved, board) ? playMove(board, point, playAs) : null;
    if (after) {
      haptic.correct();
      sfx.play("correct");
      aiBoard.clearFeedback();
      const opponent = playAs === "W" ? "B" : "W";
      const captured =
        board.flat().filter((c) => c === opponent).length - after.flat().filter((c) => c === opponent).length;
      if (captured > 0) celebrate({ praise: `따냈어요! +${captured}`, tone: "orange", confetti: "small" });
      else celebrate({ praise: pickPraise(), confetti: "small" });
      setBoard(after);
      setLastMove(point);
      setSolved(true);
      setWrong(null);
      setHint(null);
      return;
    }
    haptic.wrong();
    sfx.play("wrong");
    setWrong(point);
    setHint(item.wrongHint ?? "다른 자리를 눌러 볼까요?");
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setWrong(null), 400);
  };

  const baseHighlights = needsPlay ? (item.highlight ?? []).filter((h) => !board[h.y]?.[h.x]) : [];
  const highlights = [...baseHighlights, ...(aiFeedback?.highlights ?? [])].filter(
    (p, i, arr) => arr.findIndex((q) => q.x === p.x && q.y === p.y) === i,
  );

  return (
    <Screen
      lesson
      fit
      progress={(index + 1) / Math.max(1, total)}
      onClose={() => navigate("/practice")}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-[100px] shrink-0 px-1">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-[#CE82FF]/20 px-2.5 py-1">
            <span className="duo-t-berry text-[12px] font-extrabold">
              {item.chapterTitle}
              {total > 1 ? ` · ${index + 1}/${total}` : ""}
            </span>
          </div>
          <p className="duo-t1 break-keep text-[22px] font-extrabold leading-snug">
            {solved && item.feedback ? item.feedback : item.prompt}
          </p>
          {!solved && item.tip ? (
            <p className="duo-t2 mt-2 break-keep text-[14px] font-semibold leading-relaxed">{item.tip}</p>
          ) : null}
          {solved && item.explanation ? (
            <p className="duo-t2 mt-2 break-keep text-[14px] font-semibold leading-relaxed">
              해설 · {item.explanation}
            </p>
          ) : null}
        </div>

        {burst && <Confetti key={burst.id} big={burst.big} />}
        <div ref={stageRef} className="relative mt-3 flex min-h-0 flex-1 items-center justify-center">
          {praise && <PraiseBadge key={praise.id} text={praise.text} tone={praise.tone} />}
          <div
            className="rounded-[24px] p-2.5"
            style={{ width: side || undefined, backgroundColor: "#1A2C33", boxShadow: "inset 0 0 0 2px #37464F" }}
          >
            <Board
              size={board.length}
              board={board}
              highlights={highlights}
              ghosts={aiFeedback?.ghosts}
              libertiesFor={item.libertiesFor}
              onPlay={onPlay}
              interactive={needsPlay}
              lastMove={lastMove}
              wrongFlash={wrong}
              showSize={false}
              className="max-w-none"
            />
          </div>
        </div>

        <div className="mt-2 flex min-h-[28px] shrink-0 items-center justify-center">
          {hint && needsPlay ? (
            <Reveal key={hint}>
              <p className="duo-t-red break-keep px-1 text-center text-[14px] font-extrabold">{hint}</p>
            </Reveal>
          ) : null}
        </div>

        <div
          className="shrink-0 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"
          style={{ borderTop: "2px solid #37464F" }}
        >
          {solved ? (
            next ? (
              <PrimaryButton
                night
                onClick={() => navigate(`/practice/${next.lessonId}/${next.problemId}`, { replace: true })}
              >
                계속하기
              </PrimaryButton>
            ) : (
              <PrimaryButton night onClick={() => navigate("/practice")}>
                목록으로
              </PrimaryButton>
            )
          ) : (
            <PrimaryButton night disabled>
              {playAs === "W" ? "백" : "흑"} 차례 · 판을 눌러 보세요
            </PrimaryButton>
          )}
        </div>
        <BoardBuddy />
      </div>
    </Screen>
  );
}
