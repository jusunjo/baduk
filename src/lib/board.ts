import type { Point, StoneColor } from "@/data/curriculum";

export type Cell = StoneColor | null;
export type Grid = Cell[][];

export function emptyBoard(size: number): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

export function cloneBoard(board: Grid): Grid {
  return board.map((row) => row.slice());
}

export function keyOf(p: Point): string {
  return `${p.x},${p.y}`;
}

function neighbors(size: number, p: Point): Point[] {
  const out: Point[] = [];
  if (p.x > 0) out.push({ x: p.x - 1, y: p.y });
  if (p.x < size - 1) out.push({ x: p.x + 1, y: p.y });
  if (p.y > 0) out.push({ x: p.x, y: p.y - 1 });
  if (p.y < size - 1) out.push({ x: p.x, y: p.y + 1 });
  return out;
}

function groupAndLiberties(board: Grid, start: Point): { stones: Point[]; liberties: Point[] } {
  const color = board[start.y][start.x];
  if (!color) return { stones: [], liberties: [] };
  const size = board.length;
  const seen = new Set<string>();
  const lib = new Set<string>();
  const stones: Point[] = [];
  const stack = [start];
  seen.add(keyOf(start));
  while (stack.length) {
    const cur = stack.pop()!;
    stones.push(cur);
    for (const n of neighbors(size, cur)) {
      const c = board[n.y][n.x];
      if (!c) {
        lib.add(keyOf(n));
      } else if (c === color) {
        const k = keyOf(n);
        if (!seen.has(k)) {
          seen.add(k);
          stack.push(n);
        }
      }
    }
  }
  return {
    stones,
    liberties: [...lib].map((s) => {
      const [x, y] = s.split(",").map(Number);
      return { x, y };
    }),
  };
}

/** Place a stone; remove captured opponent groups. Returns null if illegal (occupied / suicide). */
export function playMove(board: Grid, point: Point, color: StoneColor): Grid | null {
  if (board[point.y][point.x]) return null;
  const next = cloneBoard(board);
  next[point.y][point.x] = color;
  const size = board.length;
  const opp: StoneColor = color === "B" ? "W" : "B";
  for (const n of neighbors(size, point)) {
    if (next[n.y][n.x] !== opp) continue;
    const g = groupAndLiberties(next, n);
    if (g.liberties.length === 0) {
      for (const s of g.stones) next[s.y][s.x] = null;
    }
  }
  const self = groupAndLiberties(next, point);
  if (self.liberties.length === 0) return null;
  return next;
}

export function applySetup(size: number, setup: { color: StoneColor; at: Point }[] = []): Grid {
  const board = emptyBoard(size);
  for (const s of setup) {
    if (s.at.x >= 0 && s.at.y >= 0 && s.at.x < size && s.at.y < size) {
      board[s.at.y][s.at.x] = s.color;
    }
  }
  return board;
}

export function pointsMatch(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function libertiesOf(board: Grid, p: Point): Point[] {
  return groupAndLiberties(board, p).liberties;
}

export interface Group {
  color: StoneColor;
  stones: Point[];
  liberties: Point[];
}

export function groups(board: Grid): Group[] {
  const seen = new Set<string>();
  const out: Group[] = [];
  board.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (!cell || seen.has(keyOf({ x, y }))) return;
      const g = groupAndLiberties(board, { x, y });
      g.stones.forEach((s) => seen.add(keyOf(s)));
      out.push({ color: cell, ...g });
    }),
  );
  return out;
}

/**
 * Empty regions bordered by one color only. Regions larger than half the board are skipped,
 * so a lone stone on an empty board doesn't claim everything.
 */
export function computeTerritory(board: Grid): { color: StoneColor; points: Point[] }[] {
  const size = board.length;
  const seen = new Set<string>();
  const owned: Record<StoneColor, Point[]> = { B: [], W: [] };
  board.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell || seen.has(keyOf({ x, y }))) return;
      const region: Point[] = [];
      const borders = new Set<StoneColor>();
      const stack = [{ x, y }];
      seen.add(keyOf({ x, y }));
      while (stack.length) {
        const cur = stack.pop()!;
        region.push(cur);
        for (const n of neighbors(size, cur)) {
          const c = board[n.y][n.x];
          if (c) borders.add(c);
          else if (!seen.has(keyOf(n))) {
            seen.add(keyOf(n));
            stack.push(n);
          }
        }
      }
      if (borders.size === 1 && region.length <= (size * size) / 2) owned[[...borders][0]].push(...region);
    }),
  );
  return (["B", "W"] as const).filter((c) => owned[c].length).map((color) => ({ color, points: owned[color] }));
}
export type Answer = Point | Point[] | "any" | { libertiesOf: Point };

/** The points that count as correct on the current board; "any" means every empty point. */
export function resolveAnswer(answer: Answer | undefined, board: Grid): Point[] | "any" {
  if (!answer) return [];
  if (answer === "any") return "any";
  if (Array.isArray(answer)) return answer;
  if ("libertiesOf" in answer) return libertiesOf(board, answer.libertiesOf);
  return [answer];
}

export function isAnswer(point: Point, resolved: Point[] | "any", board: Grid): boolean {
  if (board[point.y][point.x]) return false;
  return resolved === "any" || resolved.some((p) => pointsMatch(p, point));
}
