import { useMemo } from "react";
import type { Point, StoneColor } from "@/data/curriculum";
import type { BoardMark } from "@/data/path/types";
import { groups, keyOf, type Grid } from "@/lib/board";

export function Board({
  size,
  board,
  highlights = [],
  marks = [],
  ghosts = [],
  territory = [],
  onPlay,
  interactive = true,
  lastMove,
  wrongFlash,
  libertiesFor,
  showSize = false,
  className = "",
}: {
  size: number;
  board: Grid;
  highlights?: Point[];
  /** 세모·X·숨구멍 등 미션 안내 마크 */
  marks?: BoardMark[];
  /** AI·힌트용 반투명 제안 돌 */
  ghosts?: { color: StoneColor; at: Point }[];
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
  const n = board.length || size;
  const markDots = useMemo(
    () =>
      marks
        .filter((m) => m.type === "target" || m.type === "glow" || m.type === "liberty")
        .map((m) => m.at),
    [marks],
  );
  const allHighlights = useMemo(() => {
    const seen = new Set<string>();
    const out: Point[] = [];
    for (const p of [...highlights, ...markDots]) {
      const k = keyOf(p);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(p);
    }
    return out;
  }, [highlights, markDots]);
  const hi = useMemo(() => new Set(allHighlights.map(keyOf)), [allHighlights]);
  const labelled = useMemo(
    () => (libertiesFor ? groups(board).filter((g) => libertiesFor === "both" || g.color === libertiesFor) : []),
    [board, libertiesFor],
  );
  const glyphMarks = useMemo(
    () => marks.filter((m) => m.type === "triangle" || m.type === "x" || m.type === "label" || m.type === "not"),
    [marks],
  );

  /**
   * Intersection-centered layout.
   * padCells: empty margin outside the outer lines so edge stones / rings stay inside the rounded clip.
   */
  const padCells = 0.85;
  const gap = 100 / (n - 1 + 2 * padCells);
  const pad = gap * padCells;
  const stoneR = gap * 0.44;
  const span = 100 - pad * 2;

  const xy = (p: Point) => ({
    cx: pad + (p.x * span) / (n - 1),
    cy: pad + (p.y * span) / (n - 1),
  });

  return (
    <div className={`relative mx-auto w-full max-w-[360px] select-none ${className}`}>
      <div
        className="aspect-square w-full overflow-hidden rounded-[20px] shadow-[0_8px_24px_rgba(92,61,30,0.12)] ring-1 ring-black/5"
        style={{
          background: "linear-gradient(160deg, #f0d4a0 0%, #e2b87a 55%, #d4a66a 100%)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          role="img"
          aria-label={`${n}줄 바둑판`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="stone-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0.4" dy="0.8" stdDeviation="0.7" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* grid lines — n × n intersections */}
          {Array.from({ length: n }, (_, i) => {
            const v = pad + (i * span) / (n - 1);
            return (
              <g key={`line-${i}`}>
                <line x1={pad} y1={v} x2={100 - pad} y2={v} stroke="#5c3d1e" strokeWidth="0.45" strokeOpacity="0.75" />
                <line x1={v} y1={pad} x2={v} y2={100 - pad} stroke="#5c3d1e" strokeWidth="0.45" strokeOpacity="0.75" />
              </g>
            );
          })}

          {starPoints(n).map((p) => {
            const { cx, cy } = xy(p);
            return <circle key={keyOf(p)} cx={cx} cy={cy} r={Math.min(1.1, gap * 0.08)} fill="#5c3d1e" opacity="0.7" />;
          })}

          {territory.flatMap((t) =>
            t.points.map((p) => {
              const { cx, cy } = xy(p);
              const r = gap * 0.38;
              return (
                <rect
                  key={`ter-${t.color}-${keyOf(p)}`}
                  x={cx - r}
                  y={cy - r}
                  width={r * 2}
                  height={r * 2}
                  rx={r * 0.35}
                  fill={t.color === "B" ? "rgba(25,31,40,0.28)" : "rgba(255,255,255,0.6)"}
                />
              );
            }),
          )}

          {/* highlights — 초록 점/링 (미션 안내와 맞춤) */}
          {allHighlights.map((p) => {
            const { cx, cy } = xy(p);
            const r = stoneR * 0.92;
            return (
              <g key={`hi-${keyOf(p)}`} transform={`translate(${cx} ${cy})`} pointerEvents="none">
                <circle r={r * 0.42} fill="#22C55E" opacity="0.95">
                  <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <circle
                  r={r}
                  fill="rgba(34,197,94,0.16)"
                  stroke="#16A34A"
                  strokeWidth="0.75"
                  strokeDasharray="1.6 1.2"
                  opacity="0.95"
                >
                  <animate attributeName="r" values={`${r};${r * 1.08};${r}`} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95;0.55;0.95" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </g>
            );
          })}

          {/* 세모·X·라벨 */}
          {glyphMarks.map((m) => {
            const { cx, cy } = xy(m.at);
            if (m.type === "triangle") {
              const s = stoneR * 0.95;
              return (
                <g key={`mk-${keyOf(m.at)}`} transform={`translate(${cx} ${cy})`} pointerEvents="none">
                  <path
                    d={`M 0 ${-s * 0.85} L ${s * 0.82} ${s * 0.55} L ${-s * 0.82} ${s * 0.55} Z`}
                    fill="rgba(34,197,94,0.2)"
                    stroke="#16A34A"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                  />
                </g>
              );
            }
            if (m.type === "x") {
              const s = stoneR * 0.55;
              return (
                <g key={`mk-${keyOf(m.at)}`} transform={`translate(${cx} ${cy})`} pointerEvents="none">
                  <line x1={-s} y1={-s} x2={s} y2={s} stroke="#F04452" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={s} y1={-s} x2={-s} y2={s} stroke="#F04452" strokeWidth="1.2" strokeLinecap="round" />
                </g>
              );
            }
            const label = "label" in m ? m.label : "";
            if (!label) return null;
            return (
              <text
                key={`mk-${keyOf(m.at)}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={stoneR * 0.9}
                fontWeight={700}
                fill="#16A34A"
                pointerEvents="none"
              >
                {label}
              </text>
            );
          })}

          {ghosts.map((g) => {
            if (board[g.at.y]?.[g.at.x]) return null;
            const { cx, cy } = xy(g.at);
            return <GhostStone key={`ghost-${keyOf(g.at)}-${g.color}`} cx={cx} cy={cy} r={stoneR} color={g.color} />;
          })}

          {board.map((row, y) =>
            row.map((cell, x) => {
              if (!cell) return null;
              const { cx, cy } = xy({ x, y });
              return <Stone key={`${x}-${y}-${cell}`} cx={cx} cy={cy} r={stoneR} color={cell} />;
            }),
          )}

          {labelled.map((g) => {
            const danger = g.liberties.length === 1;
            const rep = [...g.stones].sort((a, b) => a.y - b.y || a.x - b.x)[0];
            const { cx, cy } = xy(rep);
            return (
              <g key={`lib-${keyOf(rep)}`} className="pointer-events-none">
                {danger &&
                  g.stones.map((s) => {
                    const c = xy(s);
                    return (
                      <g key={`gasp-${keyOf(s)}`} transform={`translate(${c.cx} ${c.cy})`}>
                        <circle r={stoneR * 1.12} fill="none" stroke="#F04452" strokeWidth="0.9">
                          <animate attributeName="opacity" values="0.95;0.4;0.95" dur="0.9s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    );
                  })}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={stoneR * 0.95}
                  fontWeight={700}
                  fill={danger ? "#F04452" : g.color === "B" ? "#fff" : "#191F28"}
                >
                  {g.liberties.length}
                </text>
              </g>
            );
          })}

          {lastMove && !libertiesFor && (() => {
            const { cx, cy } = xy(lastMove);
            const color = board[lastMove.y]?.[lastMove.x];
            return <circle cx={cx} cy={cy} r={1.15} fill={color === "B" ? "#fff" : "#191F28"} />;
          })()}

          {wrongFlash && (() => {
            const { cx, cy } = xy(wrongFlash);
            return (
              <g transform={`translate(${cx} ${cy})`}>
                <circle r={stoneR * 0.9} fill="#F04452" opacity="0.35">
                  <animate attributeName="opacity" values="0.45;0.1;0.45;0" dur="0.36s" fill="freeze" />
                </circle>
              </g>
            );
          })()}

          {interactive &&
            Array.from({ length: n }, (_, y) =>
              Array.from({ length: n }, (_, x) => {
                const { cx, cy } = xy({ x, y });
                const occupied = !!board[y]?.[x];
                const marked = hi.has(keyOf({ x, y }));
                return (
                  <circle
                    key={`tap-${x}-${y}`}
                    cx={cx}
                    cy={cy}
                    r={stoneR * 1.05}
                    fill={marked && !occupied ? "rgba(49,130,246,0.1)" : "transparent"}
                    className={occupied ? "pointer-events-none" : "cursor-pointer"}
                    onClick={() => !occupied && onPlay?.({ x, y })}
                  />
                );
              }),
            )}
        </svg>
      </div>
      {showSize && <p className="mt-2 text-center text-[12px] font-medium tabular-nums text-toss-mute">{n}×{n}</p>}
    </div>
  );
}

function Stone({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: StoneColor }) {
  if (color === "B") {
    return (
      <g filter="url(#stone-shadow)" transform={`translate(${cx} ${cy})`}>
        <circle r={r} fill="#1a1f27">
          <animate attributeName="r" values={`${r * 0.7};${r * 1.04};${r}`} dur="0.42s" fill="freeze" />
        </circle>
        <circle cx={-r * 0.28} cy={-r * 0.3} r={r * 0.28} fill="#fff" opacity="0.18" />
      </g>
    );
  }
  return (
    <g filter="url(#stone-shadow)" transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#f7f8fa" stroke="#d1d5db" strokeWidth="0.35">
        <animate attributeName="r" values={`${r * 0.7};${r * 1.04};${r}`} dur="0.42s" fill="freeze" />
      </circle>
      <circle cx={-r * 0.25} cy={-r * 0.28} r={r * 0.22} fill="#fff" opacity="0.7" />
    </g>
  );
}

function GhostStone({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: StoneColor }) {
  return (
    <g transform={`translate(${cx} ${cy})`} opacity="0.42" pointerEvents="none">
      <circle
        r={r}
        fill={color === "B" ? "#1a1f27" : "#f7f8fa"}
        stroke={color === "B" ? "none" : "#d1d5db"}
        strokeWidth={color === "B" ? 0 : 0.35}
        strokeDasharray="1.2 0.9"
      />
      <circle r={r * 1.05} fill="none" stroke="#3182F6" strokeWidth="0.55" strokeDasharray="1.4 1" opacity="0.85" />
    </g>
  );
}

function starPoints(size: number): Point[] {
  if (size === 7) return [{ x: 3, y: 3 }];
  if (size === 9)
    return [
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
export function MiniBoard({ size }: { size: 7 | 9 | 13 | 19 }) {
  const n = Math.min(size, 9);
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ background: "linear-gradient(160deg, #f0d4a0, #d4a66a)" }}
      aria-hidden
    >
      <svg viewBox="0 0 20 20" className="h-8 w-8">
        {Array.from({ length: n }, (_, i) => {
          const v = 2 + (i * 16) / (n - 1);
          return (
            <g key={i}>
              <line x1="2" y1={v} x2="18" y2={v} stroke="#5c3d1e" strokeWidth="0.5" opacity="0.7" />
              <line x1={v} y1="2" x2={v} y2="18" stroke="#5c3d1e" strokeWidth="0.5" opacity="0.7" />
            </g>
          );
        })}
        <circle cx="10" cy="10" r="1.5" fill="#191F28" />
      </svg>
    </div>
  );
}
