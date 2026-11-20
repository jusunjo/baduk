import { useMemo } from "react";
import type { Point, StoneColor } from "@/data/curriculum";
import { groups, keyOf, type Grid } from "@/lib/board";

export function Board({
  size,
  board,
  highlights = [],
  territory = [],
  onPlay,
  interactive = true,
  lastMove,
  wrongFlash,
  libertiesFor,
  showSize = true,
  className = "",
}: {
  size: number;
  board: Grid;
  highlights?: Point[];
  territory?: { color: StoneColor; points: Point[] }[];
  onPlay?: (p: Point) => void;
  interactive?: boolean;
  lastMove?: Point | null;
  wrongFlash?: Point | null;
  /** Show each group's breathing-space count, and make groups in atari gasp. */
  libertiesFor?: StoneColor | "both";
  showSize?: boolean;
  className?: string;
}) {
  const hi = useMemo(() => new Set(highlights.map(keyOf)), [highlights]);
  const labelled = useMemo(
    () => (libertiesFor ? groups(board).filter((g) => libertiesFor === "both" || g.color === libertiesFor) : []),
    [board, libertiesFor],
  );
  /** Edge margin in grid cells; must clear an edge stone plus its atari ring. */
  const gap = 100 / (size - 1 + 2 * 0.7);
  const pad = gap * 0.7;
  const stoneR = gap * 0.46;

  return (
    <div className={`relative mx-auto w-full max-w-[360px] select-none ${className}`}>
      <div
        className="aspect-square w-full overflow-hidden rounded-[20px] shadow-[0_8px_24px_rgba(92,61,30,0.12)] ring-1 ring-black/5"
        style={{
          background: "linear-gradient(160deg, #f0d4a0 0%, #e2b87a 55%, #d4a66a 100%)",
        }}
      >
        <svg viewBox={`0 0 100 100`} className="h-full w-full" role="img" aria-label={`${size}줄 바둑판`}>
          <defs>
            <filter id="stone-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0.4" dy="0.8" stdDeviation="0.7" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* grid */}
          {Array.from({ length: size }, (_, i) => {
            const v = pad + (i * (100 - pad * 2)) / (size - 1);
            return (
              <g key={`line-${i}`}>
                <line x1={pad} y1={v} x2={100 - pad} y2={v} stroke="#5c3d1e" strokeWidth="0.45" strokeOpacity="0.75" />
                <line x1={v} y1={pad} x2={v} y2={100 - pad} stroke="#5c3d1e" strokeWidth="0.45" strokeOpacity="0.75" />
              </g>
            );
          })}

          {/* star points for larger boards */}
          {starPoints(size).map((p) => {
            const { cx, cy } = toSvg(p, size, pad);
            return <circle key={keyOf(p)} cx={cx} cy={cy} r={0.9} fill="#5c3d1e" opacity="0.7" />;
          })}

          {/* territory wash */}
          {territory.flatMap((t) =>
            t.points.map((p) => {
              const { cx, cy } = toSvg(p, size, pad);
              const r = gap * 0.42;
              return (
                <rect
                  key={`ter-${t.color}-${keyOf(p)}`}
                  x={cx - r}
                  y={cy - r}
                  width={r * 2}
                  height={r * 2}
                  rx={r * 0.35}
                  fill={t.color === "B" ? "rgba(25,31,40,0.28)" : "rgba(255,255,255,0.6)"}
                  className="animate-pop"
                  style={POP}
                />
              );
            }),
          )}

          {/* highlights */}
          {highlights.map((p) => {
            const { cx, cy } = toSvg(p, size, pad);
            return (
              <circle
                key={`hi-${keyOf(p)}`}
                cx={cx}
                cy={cy}
                r={stoneR * 0.95}
                fill="none"
                stroke="#3182F6"
                strokeWidth="0.7"
                strokeDasharray="1.6 1.2"
                className="animate-breathe"
                style={POP}
                opacity="0.85"
              />
            );
          })}

          {/* stones */}
          {board.map((row, y) =>
            row.map((cell, x) => {
              if (!cell) return null;
              const { cx, cy } = toSvg({ x, y }, size, pad);
              return <Stone key={`${x}-${y}-${cell}`} cx={cx} cy={cy} r={stoneR} color={cell} />;
            }),
          )}

          {labelled.map((g) => {
            const danger = g.liberties.length === 1;
            const rep = [...g.stones].sort((a, b) => a.y - b.y || a.x - b.x)[0];
            const { cx, cy } = toSvg(rep, size, pad);
            return (
              <g key={`lib-${keyOf(rep)}`} className="pointer-events-none">
                {danger &&
                  g.stones.map((s) => {
                    const c = toSvg(s, size, pad);
                    return (
                      <circle
                        key={`gasp-${keyOf(s)}`}
                        cx={c.cx}
                        cy={c.cy}
                        r={stoneR * 1.12}
                        fill="none"
                        stroke="#F04452"
                        strokeWidth="0.9"
                        className="animate-gasp"
                        style={POP}
                      />
                    );
                  })}
                <text
                  key={g.liberties.length}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={stoneR * 0.95}
                  fontWeight={700}
                  fill={danger ? "#F04452" : g.color === "B" ? "#fff" : "#191F28"}
                  className="animate-pop"
                  style={POP}
                >
                  {g.liberties.length}
                </text>
              </g>
            );
          })}

          {lastMove && !libertiesFor && (
            (() => {
              const { cx, cy } = toSvg(lastMove, size, pad);
              const color = board[lastMove.y][lastMove.x];
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={1.15}
                  fill={color === "B" ? "#fff" : "#191F28"}
                  className="animate-pop"
                  style={POP}
                />
              );
            })()
          )}

          {wrongFlash && (
            (() => {
              const { cx, cy } = toSvg(wrongFlash, size, pad);
              return <circle cx={cx} cy={cy} r={stoneR * 0.9} fill="#F04452" opacity="0.35" className="animate-shake" />;
            })()
          )}

          {/* tap targets */}
          {interactive &&
            Array.from({ length: size }, (_, y) =>
              Array.from({ length: size }, (_, x) => {
                const { cx, cy } = toSvg({ x, y }, size, pad);
                const occupied = !!board[y][x];
                const marked = hi.has(keyOf({ x, y }));
                return (
                  <circle
                    key={`tap-${x}-${y}`}
                    cx={cx}
                    cy={cy}
                    r={stoneR * 1.05}
                    fill={marked && !occupied ? "rgba(49,130,246,0.12)" : "transparent"}
                    className={occupied ? "pointer-events-none" : "cursor-pointer"}
                    onClick={() => !occupied && onPlay?.({ x, y })}
                  />
                );
              }),
            )}
        </svg>
      </div>
      {showSize && <p className="mt-2 text-center text-[12px] font-medium tabular-nums text-toss-mute">{size}×{size}</p>}
    </div>
  );
}

const POP = { transformBox: "fill-box", transformOrigin: "center" } as const;

function Stone({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: StoneColor }) {
  if (color === "B") {
    return (
      <g filter="url(#stone-shadow)" className="animate-pop" style={POP}>
        <circle cx={cx} cy={cy} r={r} fill="#1a1f27" />
        <circle cx={cx - r * 0.28} cy={cy - r * 0.3} r={r * 0.28} fill="#fff" opacity="0.18" />
      </g>
    );
  }
  return (
    <g filter="url(#stone-shadow)" className="animate-pop" style={POP}>
      <circle cx={cx} cy={cy} r={r} fill="#f7f8fa" stroke="#d1d5db" strokeWidth="0.35" />
      <circle cx={cx - r * 0.25} cy={cy - r * 0.28} r={r * 0.22} fill="#fff" opacity="0.7" />
    </g>
  );
}

function toSvg(p: Point, size: number, pad: number) {
  const span = 100 - pad * 2;
  return {
    cx: pad + (p.x * span) / (size - 1),
    cy: pad + (p.y * span) / (size - 1),
  };
}

function starPoints(size: number): Point[] {
  if (size === 5) return [{ x: 2, y: 2 }];
  if (size === 7) return [{ x: 3, y: 3 }];
  if (size === 9) return [
    { x: 2, y: 2 },
    { x: 6, y: 2 },
    { x: 4, y: 4 },
    { x: 2, y: 6 },
    { x: 6, y: 6 },
  ];
  if (size === 13) {
    const pts = [3, 6, 9];
    return pts.flatMap((y) => pts.map((x) => ({ x, y })));
  }
  if (size === 19) {
    const pts = [3, 9, 15];
    return pts.flatMap((y) => pts.map((x) => ({ x, y })));
  }
  return [];
}

/** Mini preview board used in onboarding rank cards */
export function MiniBoard({ size }: { size: 5 | 7 | 9 | 13 | 19 }) {
  const n = Math.min(size, 9);
  const lines = n;
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ background: "linear-gradient(160deg, #f0d4a0, #d4a66a)" }}
      aria-hidden
    >
      <svg viewBox="0 0 20 20" className="h-8 w-8">
        {Array.from({ length: lines }, (_, i) => {
          const v = 2 + (i * 16) / (lines - 1);
          return (
            <g key={i}>
              <line x1="2" y1={v} x2="18" y2={v} stroke="#5c3d1e" strokeWidth="0.5" opacity="0.7" />
              <line x1={v} y1="2" x2={v} y2="18" stroke="#5c3d1e" strokeWidth="0.5" opacity="0.7" />
            </g>
          );
        })}
        <circle cx="7" cy="8" r="1.6" fill="#191F28" />
        <circle cx="12.5" cy="12" r="1.6" fill="#fff" stroke="#d1d5db" strokeWidth="0.3" />
      </svg>
    </div>
  );
}
