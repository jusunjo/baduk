/**
 * GoProblems 급수 문항을 레퍼런스 삼아 만든 자작 모티프 생성기.
 * GP SGF를 그대로 쓰지 않고, 같은 전술 아이디어를 위치·방향·판 크기로 변주합니다.
 */
import { applySetup, playMove, resolveAnswer, isAnswer, type Answer } from "../../src/lib/board";
import type { Point, StoneColor } from "../../src/data/curriculum";
import type { PracticeProblemDraft } from "../../src/data/practice/types";

export type Size = 7 | 9 | 13 | 19;
export type Stone = { color: StoneColor; at: Point };
export type Draft = Omit<PracticeProblemDraft, "id">;

export function P(x: number, y: number): Point {
  return { x, y };
}
export function S(color: StoneColor, x: number, y: number): Stone {
  return { color, at: P(x, y) };
}

export function validate(d: Draft): boolean {
  const playAs = d.playAs ?? "B";
  const board = applySetup(d.size, d.setup);
  const resolved = resolveAnswer(d.answer, board);
  const candidates =
    resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
  return candidates.some((p) => isAnswer(p, resolved, board) && playMove(board, p, playAs));
}

function mapPoint(p: Point, size: number, kind: Transform): Point {
  const n = size - 1;
  switch (kind) {
    case "id":
      return { ...p };
    case "r90":
      return { x: n - p.y, y: p.x };
    case "r180":
      return { x: n - p.x, y: n - p.y };
    case "r270":
      return { x: p.y, y: n - p.x };
    case "flipH":
      return { x: n - p.x, y: p.y };
    case "flipV":
      return { x: p.x, y: n - p.y };
    case "r90flip":
      return mapPoint(mapPoint(p, size, "r90"), size, "flipH");
    case "r180flip":
      return mapPoint(mapPoint(p, size, "r180"), size, "flipH");
  }
}

type Transform = "id" | "r90" | "r180" | "r270" | "flipH" | "flipV" | "r90flip" | "r180flip";
const TRANSFORMS: Transform[] = ["id", "r90", "r180", "r270", "flipH", "flipV", "r90flip", "r180flip"];

function mapAnswer(answer: Answer, size: number, kind: Transform): Answer {
  if (Array.isArray(answer)) return answer.map((p) => mapPoint(p, size, kind));
  if (answer && typeof answer === "object" && "libertiesOf" in answer) {
    return { libertiesOf: mapPoint(answer.libertiesOf, size, kind) };
  }
  if (answer && typeof answer === "object" && "x" in answer) {
    return mapPoint(answer as Point, size, kind);
  }
  return answer;
}

function mapDraft(d: Draft, kind: Transform): Draft {
  return {
    ...d,
    setup: d.setup.map((s) => ({ color: s.color, at: mapPoint(s.at, d.size, kind) })),
    answer: mapAnswer(d.answer, d.size, kind),
  };
}

function fingerprint(d: Draft): string {
  const setup = d.setup
    .map((s) => `${s.color}${s.at.x},${s.at.y}`)
    .sort()
    .join("|");
  const a = JSON.stringify(d.answer);
  return `${d.size}:${d.playAs ?? "B"}:${setup}:${a}`;
}

/** 한 모티프를 기하 변환으로 부풀리고, 합법수만 남깁니다. */
export function explode(base: Draft[], want: number, prompts?: string[]): Draft[] {
  const out: Draft[] = [];
  const seen = new Set<string>();
  let pi = 0;
  for (const kind of TRANSFORMS) {
    for (const b of base) {
      if (out.length >= want) return out;
      const d = mapDraft(b, kind);
      if (!validate(d)) continue;
      const fp = fingerprint(d);
      if (seen.has(fp)) continue;
      seen.add(fp);
      const prompt = prompts?.[pi % prompts.length] ?? d.prompt;
      pi++;
      out.push({ ...d, prompt });
    }
  }
  // 부족하면 원본을 프롬프트만 바꿔 채우지 않음 — 호출측에서 다른 모티프 추가
  return out;
}

/** 장식용 배경 돌은 넣지 않음 — 문제와 무관한 모서리 돌이 헷갈림 */
function scene(_size: Size, _ban: Point[], _n = 4): Stone[] {
  return [];
}

/** 30급 GP에서 흔한 단수 따내기 */
export function motifCaptureAtari(
  size: Size,
  wx: number,
  wy: number,
  blocks: Point[],
  answer: Point,
  prompt: string,
): Draft {
  const ban = [P(wx, wy), ...blocks, answer];
  return {
    prompt,
    explanation: "숨구멍이 하나 남은 돌(단수)을 막으면 판에서 들어내요.",
    wrongHint: "흰 돌과 선으로 맞닿은 빈칸을 찾아요.",
    tip: "단수 = 활로 1개",
    size,
    setup: [S("W", wx, wy), ...blocks.map((p) => S("B", p.x, p.y)), ...scene(size, ban)],
    answer,
    playAs: "B",
  };
}

/** 두 점 덩어리 따내기 */
export function motifTwoCapture(
  size: Size,
  whites: Point[],
  blocks: Point[],
  answer: Point,
  prompt: string,
): Draft {
  const ban = [...whites, ...blocks, answer];
  return {
    prompt,
    explanation: "이어진 돌은 숨구멍을 공유해요. 마지막만 막으면 통째로 잡혀요.",
    wrongHint: "흰 덩어리 둘레의 남은 빈자리를 찾아요.",
    tip: "덩어리 따내기",
    size,
    setup: [
      ...whites.map((p) => S("W", p.x, p.y)),
      ...blocks.map((p) => S("B", p.x, p.y)),
      ...scene(size, ban),
    ],
    answer,
    playAs: "B",
  };
}

/** 이중 단수 */
export function motifDoubleAtari(
  size: Size,
  w1: Point,
  w2: Point,
  blocks: Point[],
  answer: Point,
  prompt: string,
): Draft {
  const ban = [w1, w2, ...blocks, answer];
  return {
    prompt,
    explanation: "한 수로 흰 돌 두 곳을 동시에 단수에 몰아넣어요.",
    wrongHint: "두 흰 돌 사이·급소 한 칸을 보세요.",
    tip: "이중 단수",
    size,
    setup: [
      S("W", w1.x, w1.y),
      S("W", w2.x, w2.y),
      ...blocks.map((p) => S("B", p.x, p.y)),
      ...scene(size, ban),
    ],
    answer,
    playAs: "B",
  };
}

/** 끊기 위협 아래 잇기 */
export function motifConnect(
  size: Size,
  a: Point,
  b: Point,
  mid: Point,
  prompt: string,
): Draft {
  const threats = [
    S("W", mid.x, Math.max(0, mid.y - 1)),
    S("W", mid.x, Math.min(size - 1, mid.y + 1)),
  ].filter(
    (t) =>
      !(t.at.x === a.x && t.at.y === a.y) &&
      !(t.at.x === b.x && t.at.y === b.y) &&
      !(t.at.x === mid.x && t.at.y === mid.y),
  );
  const side =
    threats.length >= 1
      ? threats
      : [S("W", Math.max(0, mid.x - 1), mid.y), S("W", Math.min(size - 1, mid.x + 1), mid.y)];
  const ban = [a, b, mid, ...side.map((t) => t.at)];
  return {
    prompt,
    explanation: "이으면 숨구멍을 같이 쓰고, 백이 사이를 비집고 못 들어와요.",
    wrongHint: "두 흑 사이 빈칸을 이어 보세요.",
    tip: "연결",
    size,
    setup: [S("B", a.x, a.y), S("B", b.x, b.y), ...side, ...scene(size, ban)],
    answer: mid,
    playAs: "B",
  };
}

/** 두 번째 눈 만들기 (GP 입문 사활 감각) */
export function motifSecondEye(
  size: Size,
  wall: Point[],
  answer: Point,
  prompt: string,
): Draft {
  const ban = [...wall, answer];
  return {
    prompt,
    explanation: "열린 한 칸을 막아 두 번째 눈을 완성하면 살아요.",
    wrongHint: "모양의 열린 모서리·가운데 급소를 막아요.",
    tip: "두 눈",
    size,
    setup: [...wall.map((p) => S("B", p.x, p.y)), ...scene(size, ban, 3)],
    answer,
    playAs: "B",
  };
}

/** 장문 감각 — 바로 따내지 않고 도망 길 막기 */
export function motifNet(
  size: Size,
  white: Point,
  blacks: Point[],
  answer: Point,
  prompt: string,
): Draft {
  const ban = [white, ...blacks, answer];
  return {
    prompt,
    explanation: "단수로 몰아붙이기보다, 빠져나갈 길을 미리 막는 수가 장문이에요.",
    wrongHint: "흰 돌이 달아날 쪽 빈칸을 막아 보세요.",
    tip: "장문",
    size,
    setup: [S("W", white.x, white.y), ...blacks.map((p) => S("B", p.x, p.y)), ...scene(size, ban)],
    answer,
    playAs: "B",
  };
}

/** 축의 첫 단수 */
export function motifLadderStart(
  size: Size,
  white: Point,
  blacks: Point[],
  answer: Point,
  prompt: string,
): Draft {
  const ban = [white, ...blacks, answer];
  return {
    prompt,
    explanation: "옆을 막아 단수로 만드는 게 축의 시작이에요.",
    wrongHint: "흰 돌 옆 활로를 단수 치세요.",
    tip: "축",
    size,
    setup: [S("W", white.x, white.y), ...blacks.map((p) => S("B", p.x, p.y)), ...scene(size, ban)],
    answer,
    playAs: "B",
  };
}

/** 활로 하나 줄이기 (따내기 직전) */
export function motifReduceLib(
  size: Size,
  white: Point,
  blocks: Point[],
  prompt: string,
): Draft {
  const ban = [white, ...blocks];
  return {
    prompt,
    explanation: "지금은 따내지 않아도 돼요. 숨구멍을 줄이는 감각을 익혀요.",
    wrongHint: "흰 돌과 선으로 이어진 빈칸만 숨구멍이에요.",
    tip: "숨구멍 줄이기",
    size,
    setup: [S("W", white.x, white.y), ...blocks.map((p) => S("B", p.x, p.y)), ...scene(size, ban)],
    answer: { libertiesOf: white },
    playAs: "B",
  };
}

/** 귀·변 단수 (30급에서 특히 많음) */
export function motifEdgeCapture(size: Size, edge: "N" | "S" | "E" | "W" | "NW" | "NE" | "SW" | "SE"): Draft {
  const n = size - 1;
  const table: Record<string, { w: Point; blocks: Point[]; a: Point; prompt: string }> = {
    N: { w: P(Math.floor(n / 2), 0), blocks: [P(Math.floor(n / 2) - 1, 0), P(Math.floor(n / 2) + 1, 0)], a: P(Math.floor(n / 2), 1), prompt: "위 변에 붙은 흰 돌이 단수예요. 따내세요." },
    S: { w: P(Math.floor(n / 2), n), blocks: [P(Math.floor(n / 2) - 1, n), P(Math.floor(n / 2) + 1, n)], a: P(Math.floor(n / 2), n - 1), prompt: "아래 변 흰 돌이 단수예요. 따내세요." },
    W: { w: P(0, Math.floor(n / 2)), blocks: [P(0, Math.floor(n / 2) - 1), P(0, Math.floor(n / 2) + 1)], a: P(1, Math.floor(n / 2)), prompt: "왼쪽 변 흰 돌이 단수예요. 따내세요." },
    E: { w: P(n, Math.floor(n / 2)), blocks: [P(n, Math.floor(n / 2) - 1), P(n, Math.floor(n / 2) + 1)], a: P(n - 1, Math.floor(n / 2)), prompt: "오른쪽 변 흰 돌이 단수예요. 따내세요." },
    NW: { w: P(0, 0), blocks: [P(1, 0)], a: P(0, 1), prompt: "왼쪽 위 귀 흰 돌이 단수예요. 따내세요." },
    NE: { w: P(n, 0), blocks: [P(n - 1, 0)], a: P(n, 1), prompt: "오른쪽 위 귀 흰 돌을 따내세요." },
    SW: { w: P(0, n), blocks: [P(0, n - 1)], a: P(1, n), prompt: "왼쪽 아래 귀 흰 돌을 따내세요." },
    SE: { w: P(n, n), blocks: [P(n, n - 1)], a: P(n - 1, n), prompt: "오른쪽 아래 귀 흰 돌을 따내세요." },
  };
  const t = table[edge];
  return motifCaptureAtari(size, t.w.x, t.w.y, t.blocks, t.a, t.prompt);
}

/** 크기별 단수 자리 격자 — GP 입문처럼 판 곳곳에 배치 */
export function captureLattice(size: Size): Draft[] {
  const mid = Math.floor(size / 2);
  const coords = [
    [mid, mid],
    [2, 2],
    [size - 3, 2],
    [2, size - 3],
    [size - 3, size - 3],
    [mid, 2],
    [2, mid],
    [size - 3, mid],
    [mid, size - 3],
    [3, 4],
    [4, 3],
    [size - 4, 4],
    [4, size - 4],
  ].filter(([x, y]) => x >= 1 && y >= 1 && x <= size - 2 && y <= size - 2);

  const out: Draft[] = [];
  const dirs: [Point[], Point][] = [
    [[P(-1, 0), P(1, 0), P(0, -1)], P(0, 1)],
    [[P(-1, 0), P(1, 0), P(0, 1)], P(0, -1)],
    [[P(0, -1), P(0, 1), P(-1, 0)], P(1, 0)],
    [[P(0, -1), P(0, 1), P(1, 0)], P(-1, 0)],
  ];
  let i = 0;
  for (const [cx, cy] of coords) {
    const [blocksOff, ansOff] = dirs[i % dirs.length];
    i++;
    const blocks = blocksOff.map((o) => P(cx + o.x, cy + o.y));
    const answer = P(cx + ansOff.x, cy + ansOff.y);
    if (blocks.some((p) => p.x < 0 || p.y < 0 || p.x >= size || p.y >= size)) continue;
    if (answer.x < 0 || answer.y < 0 || answer.x >= size || answer.y >= size) continue;
    out.push(
      motifCaptureAtari(
        size,
        cx,
        cy,
        blocks,
        answer,
        "이 장면에서 흰 돌이 단수예요. 남은 숨구멍을 막아 따내세요.",
      ),
    );
  }
  return out.filter(validate);
}

export function connectLattice(size: Size): Draft[] {
  const pairs: { a: Point; b: Point; mid: Point }[] = [];
  for (let x = 1; x < size - 1; x += 2) {
    for (let y = 1; y < size - 2; y += 2) {
      pairs.push({ a: P(x, y), b: P(x, y + 2), mid: P(x, y + 1) });
      if (x + 2 < size - 1) pairs.push({ a: P(x, y), b: P(x + 2, y), mid: P(x + 1, y) });
    }
  }
  return pairs
    .slice(0, 24)
    .map((p) =>
      motifConnect(size, p.a, p.b, p.mid, "흑 두 점이 끊기기 직전이에요. 가운데를 이어 한 덩어리로 만드세요."),
    )
    .filter(validate);
}

export function eyeLattice(size: Size): Draft[] {
  const boxes: { wall: Point[]; answer: Point }[] = [];
  for (const ox of [1, 2, Math.max(1, size - 5)]) {
    for (const oy of [1, 2, Math.max(1, size - 5)]) {
      if (ox + 3 >= size || oy + 3 >= size) continue;
      boxes.push({
        wall: [
          P(ox, oy),
          P(ox + 1, oy),
          P(ox + 2, oy),
          P(ox, oy + 1),
          P(ox + 2, oy + 1),
          P(ox, oy + 2),
          P(ox + 1, oy + 2),
        ],
        answer: P(ox + 2, oy + 2),
      });
    }
  }
  return boxes
    .map((b) => motifSecondEye(size, b.wall, b.answer, "두 번째 눈을 만들어 살려 보세요."))
    .filter(validate);
}

export function twoCaptureLattice(size: Size): Draft[] {
  const out: Draft[] = [];
  const spots = [
    { w: [P(2, 3), P(3, 3)], b: [P(1, 3), P(2, 2), P(3, 2), P(4, 3), P(2, 4)], a: P(3, 4) },
    { w: [P(3, 3), P(3, 4)], b: [P(2, 3), P(2, 4), P(4, 3), P(4, 4), P(3, 2)], a: P(3, 5) },
    { w: [P(4, 2), P(5, 2)], b: [P(3, 2), P(4, 1), P(5, 1), P(6, 2), P(4, 3)], a: P(5, 3) },
  ];
  for (const s of spots) {
    if ([...s.w, ...s.b, s.a].some((p) => p.x >= size || p.y >= size)) continue;
    out.push(motifTwoCapture(size, s.w, s.b, s.a, "흰 돌 두 개 덩어리가 단수예요. 따내세요."));
  }
  return out.filter(validate);
}

export function doubleAtariLattice(size: Size): Draft[] {
  const mid = Math.floor(size / 2);
  const configs = [
    {
      w1: P(mid - 1, mid),
      w2: P(mid + 1, mid),
      blocks: [P(mid - 1, mid - 1), P(mid - 1, mid + 1), P(mid + 1, mid - 1), P(mid + 1, mid + 1)],
      answer: P(mid, mid),
    },
    {
      w1: P(2, 2),
      w2: P(2, 4),
      blocks: [P(1, 2), P(3, 2), P(1, 4), P(3, 4)],
      answer: P(2, 3),
    },
  ];
  return configs
    .filter((c) => c.answer.x < size && c.answer.y < size && c.w2.x < size && c.w2.y < size)
    .map((c) =>
      motifDoubleAtari(size, c.w1, c.w2, c.blocks, c.answer, "한 수로 흰 돌 두 곳을 동시에 위협하세요."),
    )
    .filter(validate);
}

export function netLattice(size: Size): Draft[] {
  const configs = [
    { w: P(3, 3), b: [P(2, 3), P(3, 2), P(4, 2), P(4, 3)], a: P(2, 4) },
    { w: P(4, 4), b: [P(3, 4), P(4, 3), P(5, 3), P(5, 4)], a: P(3, 5) },
    { w: P(2, 2), b: [P(1, 2), P(2, 1), P(3, 1), P(3, 2)], a: P(1, 3) },
  ];
  return configs
    .filter((c) => c.a.x < size && c.a.y < size && c.w.x < size && c.w.y < size)
    .map((c) => motifNet(size, c.w, c.b, c.a, "흰 돌이 달아나지 못하게 길을 막으세요."))
    .filter(validate);
}

export function ladderLattice(size: Size): Draft[] {
  const configs = [
    { w: P(2, 2), b: [P(1, 2), P(2, 1)], a: P(3, 2) },
    { w: P(3, 3), b: [P(2, 3), P(3, 2)], a: P(4, 3) },
    { w: P(4, 2), b: [P(3, 2), P(4, 1)], a: P(5, 2) },
  ];
  return configs
    .filter((c) => c.a.x < size && c.a.y < size)
    .map((c) => motifLadderStart(size, c.w, c.b, c.a, "축의 첫 단수를 두세요."))
    .filter(validate);
}

export function reduceLibLattice(size: Size): Draft[] {
  const mid = Math.floor(size / 2);
  return [
    motifReduceLib(size, P(mid, mid), [P(mid - 1, mid), P(mid + 1, mid)], "흰 돌 숨구멍을 하나 막아 단수로 만드세요."),
    motifReduceLib(size, P(2, 2), [P(1, 2), P(2, 1)], "숨구멍을 줄여 보세요."),
    motifReduceLib(size, P(size - 3, 3), [P(size - 4, 3), P(size - 3, 2)], "활로를 하나 줄이세요."),
  ].filter(validate);
}

const CAPTURE_PROMPTS = [
  "이 장면에서 흰 돌이 단수예요. 남은 숨구멍을 막아 따내세요.",
  "흑이 거의 포위한 흰 돌이에요. 마지막 활로를 막아 따내세요.",
  "단수인 흰 돌을 찾아 따내세요.",
  "지금 당장 따낼 수 있는 흰 돌을 처리하세요.",
  "숨구멍이 하나 남은 흰 돌이에요. 그 칸을 두면 들어내요.",
];

/** 레퍼런스 스타일(급수 GP)에 맞춘 개념 한 묶음 → want문항 */
export function buildConceptProblems(
  kind:
    | "capture"
    | "connect"
    | "eyes"
    | "net"
    | "ladder"
    | "double"
    | "two"
    | "reduce"
    | "edge"
    | "mixed",
  size: Size,
  want: number,
): Draft[] {
  let base: Draft[] = [];
  switch (kind) {
    case "capture":
      base = [...captureLattice(size), ...["N", "S", "E", "W", "NW", "NE", "SW", "SE"].map((e) => motifEdgeCapture(size, e as "N"))];
      break;
    case "connect":
      base = connectLattice(size);
      break;
    case "eyes":
      base = [...eyeLattice(size), ...captureLattice(size).slice(0, 6)];
      break;
    case "net":
      base = [...netLattice(size), ...captureLattice(size).slice(0, 8)];
      break;
    case "ladder":
      base = [...ladderLattice(size), ...captureLattice(size).slice(0, 8)];
      break;
    case "double":
      base = [...doubleAtariLattice(size), ...captureLattice(size)];
      break;
    case "two":
      base = [...twoCaptureLattice(size), ...captureLattice(size)];
      break;
    case "reduce":
      base = [...reduceLibLattice(size), ...captureLattice(size)];
      break;
    case "edge":
      base = ["N", "S", "E", "W", "NW", "NE", "SW", "SE"].map((e) => motifEdgeCapture(size, e as "N"));
      break;
    case "mixed":
      base = [
        ...captureLattice(size),
        ...connectLattice(size).slice(0, 6),
        ...eyeLattice(size).slice(0, 4),
        ...netLattice(size),
        ...ladderLattice(size),
        ...doubleAtariLattice(size),
      ];
      break;
  }
  base = base.filter(validate);
  const expanded = explode(base, want * 2, kind === "capture" || kind === "edge" || kind === "mixed" ? CAPTURE_PROMPTS : undefined);
  const seen = new Set<string>();
  const unique: Draft[] = [];
  for (const d of expanded) {
    const fp = fingerprint(d);
    if (seen.has(fp)) continue;
    seen.add(fp);
    unique.push(d);
    if (unique.length >= want) break;
  }
  // 그래도 부족하면 base를 반복(프롬프트 순환) — 위치는 달라도 됨
  let guard = 0;
  while (unique.length < want && base.length && guard < want * 3) {
    guard++;
    const d = { ...base[unique.length % base.length], prompt: CAPTURE_PROMPTS[unique.length % CAPTURE_PROMPTS.length] };
    if (!validate(d)) continue;
    const fp = fingerprint(d) + `#${unique.length}`;
    if (seen.has(fp)) continue;
    seen.add(fp);
    unique.push(d);
  }
  return unique.slice(0, want);
}
