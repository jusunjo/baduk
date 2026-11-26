import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Board } from "@/components/Board";
import { PrimaryButton, Screen, Spinner } from "@/components/Screen";
import type { Point, StoneColor } from "@/data/curriculum";
import {
  aiGameActions,
  levelMeta,
  type AiBoardSize,
  type AiLevelId,
} from "@/lib/aiGames";
import { emptyBoard, playMove, type Grid } from "@/lib/board";
import { gtpToPoint, pointToGtp } from "@/lib/gtp";
import { fetchKataHealth, fetchKataMove, type KataMove } from "@/lib/katago";
import { haptic } from "@/lib/native";
import { sfx } from "@/lib/sfx";

type Phase = "play" | "over";
type PlayState = { size?: AiBoardSize; level?: AiLevelId };

function parseConfig(state: unknown): { size: AiBoardSize; level: AiLevelId } {
  const s = (state ?? {}) as PlayState;
  const size: AiBoardSize = s.size === 7 || s.size === 9 || s.size === 13 || s.size === 19 ? s.size : 9;
  const level: AiLevelId =
    s.level === "easy" || s.level === "normal" || s.level === "hard" ? s.level : "normal";
  return { size, level };
}

export function AiPlayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { size, level } = useMemo(() => parseConfig(location.state), [location.state]);
  const visits = levelMeta(level).visits;
  const levelLabel = levelMeta(level).label;

  const [board, setBoard] = useState<Grid>(() => emptyBoard(size));
  const [moves, setMoves] = useState<KataMove[]>([]);
  const [toPlay, setToPlay] = useState<StoneColor>("B");
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [thinking, setThinking] = useState(false);
  const [passStreak, setPassStreak] = useState(0);
  const [phase, setPhase] = useState<Phase>("play");
  const [status, setStatus] = useState("흑으로 두세요. AI가 백을 둡니다.");
  const [error, setError] = useState<string | null>(null);
  const [proxyOk, setProxyOk] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBoard(emptyBoard(size));
    setMoves([]);
    setToPlay("B");
    setLastMove(null);
    setPassStreak(0);
    setPhase("play");
    setThinking(false);
    setStatus("흑으로 두세요. AI가 백을 둡니다.");
    setError(null);
    setSaved(false);
  }, [size, level]);

  useEffect(() => {
    let cancelled = false;
    fetchKataHealth()
      .then((h) => {
        if (cancelled) return;
        setProxyOk(h.ok && h.hasKey);
        if (!h.hasKey) setError("프록시에 READ19_API_KEY가 없어요. .env를 확인하세요.");
      })
      .catch(() => {
        if (cancelled) return;
        setProxyOk(false);
        setError("KataGo 프록시에 연결할 수 없어요. 터미널에서 npm run katago 를 실행하세요.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveRecord = useCallback(
    (result: "resign" | "finished", moveCount: number) => {
      if (saved) return;
      setSaved(true);
      aiGameActions.add({
        size,
        level,
        result,
        moveCount,
      });
    },
    [saved, size, level],
  );

  const endGame = useCallback(
    (reason: string, result: "resign" | "finished", moveCount: number) => {
      setPhase("over");
      setStatus(reason);
      setThinking(false);
      sfx.play("complete");
      saveRecord(result, moveCount);
    },
    [saveRecord],
  );

  const applyAiMove = useCallback(
    async (history: KataMove[], streakBeforeAi: number, boardNow: Grid) => {
      setThinking(true);
      setError(null);
      try {
        const res = await fetchKataMove({ size, moves: history, maxVisits: visits });
        const raw = res.move?.trim() || "pass";
        if (raw.toLowerCase() === "pass") {
          setMoves([...history, { color: "W", pass: true }]);
          setLastMove(null);
          const streak = streakBeforeAi + 1;
          setPassStreak(streak);
          setToPlay("B");
          sfx.play("tap");
          if (streak >= 2) {
            endGame("서로 패스했어요. 대국 끝!", "finished", history.length + 1);
            return;
          }
          setStatus("AI가 패스했어요. 당신 차례예요.");
          return;
        }
        const point = gtpToPoint(raw, size);
        if (!point) throw new Error(`AI 수 해석 실패: ${raw}`);
        const nextBoard = playMove(boardNow, point, "W");
        if (!nextBoard) throw new Error(`AI 불법수: ${raw}`);
        setBoard(nextBoard);
        setMoves([...history, { color: "W", gtp: raw }]);
        setLastMove(point);
        setPassStreak(0);
        setToPlay("B");
        sfx.play("correct");
        haptic.tap();
        const wr = res.winrate != null ? ` · 흑 승률 ${(res.winrate * 100).toFixed(0)}%` : "";
        setStatus(`AI가 ${raw}에 뒀어요${wr}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "AI 착점 실패");
        setStatus("AI 수를 가져오지 못했어요.");
      } finally {
        setThinking(false);
      }
    },
    [endGame, size, visits],
  );

  const onPlay = async (p: Point) => {
    if (phase !== "play" || thinking || toPlay !== "B" || proxyOk === false) return;
    const next = playMove(board, p, "B");
    if (!next) {
      sfx.play("wrong");
      haptic.wrong();
      setStatus("둘 수 없는 자리예요.");
      return;
    }
    const gtp = pointToGtp(p, size);
    const history: KataMove[] = [...moves, { color: "B", gtp }];
    setBoard(next);
    setMoves(history);
    setLastMove(p);
    setToPlay("W");
    setPassStreak(0);
    setStatus("AI가 생각 중…");
    sfx.play("tap");
    haptic.tap();
    await applyAiMove(history, 0, next);
  };

  const onPass = async () => {
    if (phase !== "play" || thinking || toPlay !== "B" || proxyOk === false) return;
    const streak = passStreak + 1;
    const history: KataMove[] = [...moves, { color: "B", pass: true }];
    setMoves(history);
    setLastMove(null);
    setPassStreak(streak);
    setToPlay("W");
    sfx.play("tap");
    if (streak >= 2) {
      endGame("서로 패스했어요. 대국 끝!", "finished", history.length);
      return;
    }
    setStatus("패스했어요. AI 차례…");
    await applyAiMove(history, streak, board);
  };

  const onResign = () => {
    if (thinking) return;
    endGame("기권했어요. AI 승!", "resign", moves.length);
  };

  const goHub = () => {
    sfx.play("tap");
    navigate("/play", { replace: true });
  };

  return (
    <Screen lesson fit onClose={goHub} progress={phase === "over" ? 1 : undefined}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-1" style={{ minHeight: 72 }}>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-[#1CB0F6]/20 px-2.5 py-1">
            <span className="text-[12px] font-extrabold text-[#4CC3FF]">
              AI 대국 · {size}×{size} · {levelLabel}
            </span>
          </div>
          <p className="duo-t1 break-keep text-[18px] font-extrabold leading-snug sm:text-[20px]">{status}</p>
          {error ? <p className="duo-t-red mt-1 break-keep text-[13px] font-bold">{error}</p> : null}
        </div>

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
              size={size}
              board={board}
              onPlay={phase === "play" && !thinking && toPlay === "B" ? onPlay : undefined}
              interactive={phase === "play" && !thinking && toPlay === "B"}
              lastMove={lastMove}
              showSize={false}
              className="h-full max-h-full w-full max-w-none"
            />
          </div>
          {thinking ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                style={{ backgroundColor: "rgba(19,31,36,0.88)", boxShadow: "inset 0 0 0 2px #37464F" }}
              >
                <Spinner className="h-5 w-5 text-[#89E219]" />
                <span className="text-[14px] font-extrabold text-white">AI 생각 중</span>
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="shrink-0 space-y-2 pt-2 pb-[max(12px,calc(env(safe-area-inset-bottom)+4px))] sm:pt-3"
          style={{ borderTop: "2px solid #37464F" }}
        >
          {phase === "over" ? (
            <>
              <PrimaryButton
                night
                onClick={() => {
                  sfx.play("start");
                  navigate("/play", { replace: true, state: { openSetup: true } });
                }}
              >
                새 설정으로 한 판 더
              </PrimaryButton>
              <button type="button" className="mx-auto block py-2 text-[14px] font-bold text-[#9AA6AC]" onClick={goHub}>
                기록으로
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={thinking || toPlay !== "B" || proxyOk === false}
                onClick={() => void onPass()}
                className="flex h-14 items-center justify-center rounded-2xl text-[16px] font-extrabold text-white transition enabled:active:translate-y-[2px] disabled:opacity-40"
                style={{ backgroundColor: "#202F36", boxShadow: "0 4px 0 #0B1519" }}
              >
                패스
              </button>
              <button
                type="button"
                disabled={thinking}
                onClick={onResign}
                className="flex h-14 items-center justify-center rounded-2xl text-[16px] font-extrabold transition enabled:active:translate-y-[2px] disabled:opacity-40"
                style={{ backgroundColor: "#3A1F24", boxShadow: "0 4px 0 #1A0C0E", color: "#FF6B6B" }}
              >
                기권
              </button>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
