import type { Point } from "@/data/curriculum";

/** GTP 열: A–H, J–T (I 없음) */
const COLS = "ABCDEFGHJKLMNOPQRST";

export function pointToGtp(p: Point, size: number): string {
  const col = COLS[p.x];
  if (!col || p.x < 0 || p.x >= size || p.y < 0 || p.y >= size) {
    throw new Error(`invalid point ${p.x},${p.y} for size ${size}`);
  }
  // GTP: 행 1 = 보드 아래. 우리 보드 y=0 은 위쪽.
  const row = size - p.y;
  return `${col}${row}`;
}

export function gtpToPoint(gtp: string, size: number): Point | null {
  const s = gtp.trim();
  if (!s || s.toLowerCase() === "pass") return null;
  const m = /^([A-HJ-Ta-hj-t])([1-9][0-9]?)$/.exec(s);
  if (!m) throw new Error(`bad gtp: ${gtp}`);
  const col = m[1]!.toUpperCase();
  const row = Number(m[2]);
  const x = COLS.indexOf(col);
  if (x < 0 || x >= size || row < 1 || row > size) {
    throw new Error(`gtp out of board: ${gtp}`);
  }
  const y = size - row;
  return { x, y };
}
