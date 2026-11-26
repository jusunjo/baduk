import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Board3D } from "@/components/Board3D";
import type { Point, StoneColor } from "@/data/curriculum";
import { emptyBoard, playMove, type Grid } from "@/lib/board";
import { haptic } from "@/lib/native";
import { sfx } from "@/lib/sfx";

type Size = 7 | 9 | 13;

function useChromeMargins() {
  const [margins, setMargins] = useState({ top: 0.12, bottom: 0.1 });

  useEffect(() => {
    const sync = () => {
      const h = window.innerHeight || 1;
      // 상단 뒤로/사이즈 칩, 하단 턴 표시 + safe-area
      const topPx = 56 + (parseFloat(getComputedStyle(document.documentElement).paddingTop) || 0);
      const bottomPx = 52;
      setMargins({
        top: Math.min(0.28, Math.max(0.08, (topPx + 8) / h)),
        bottom: Math.min(0.22, Math.max(0.08, (bottomPx + 12) / h)),
      });
    };
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);

  return margins;
}

export function Board3DPage() {
  const navigate = useNavigate();
  const margins = useChromeMargins();
  const [size, setSize] = useState<Size>(9);
  const [board, setBoard] = useState<Grid>(() => emptyBoard(9));
  const [turn, setTurn] = useState<StoneColor>("B");
  const [lastMove, setLastMove] = useState<Point | null>(null);

  const reset = (n: Size = size) => {
    setSize(n);
    setBoard(emptyBoard(n));
    setTurn("B");
    setLastMove(null);
  };

  const onPlay = (p: Point) => {
    const next = playMove(board, p, turn);
    if (!next) {
      haptic.tap();
      sfx.play("wrong");
      return;
    }
    haptic.tap();
    sfx.play("tap");
    setBoard(next);
    setLastMove(p);
    setTurn(turn === "B" ? "W" : "B");
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#1a1a1a]">
      <Board3D
        className="absolute inset-0 h-full w-full"
        size={size}
        board={board}
        lastMove={lastMove}
        onPlay={onPlay}
        marginTop={margins.top}
        marginBottom={margins.bottom}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label="뒤로"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="pointer-events-auto flex gap-1.5 rounded-full bg-black/45 p-1 backdrop-blur-sm">
          {([9, 13] as Size[]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => reset(n)}
              className={`h-8 rounded-full px-3 text-[13px] font-bold ${
                size === n ? "bg-white text-black" : "text-white/80"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => reset()}
            className="h-8 rounded-full px-3 text-[13px] font-bold text-white/80"
          >
            다시
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-[13px] font-bold text-white backdrop-blur-sm">
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full ${
              turn === "B" ? "bg-neutral-950 ring-1 ring-white/40" : "bg-white"
            }`}
          />
          {turn === "B" ? "흑" : "백"}
        </div>
      </div>
    </div>
  );
}
