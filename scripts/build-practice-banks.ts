/**
 * 연습 문제 뱅크 — 개념마다 10문제
 *   npm run build:practice
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applySetup, playMove, resolveAnswer, isAnswer, type Answer } from "../src/lib/board";
import type { Point, StoneColor } from "../src/data/curriculum";
import type {
  PracticeBank,
  PracticeConceptDraft,
  PracticeIndex,
  PracticeProblemDraft,
} from "../src/data/practice/types";
import type { TrackId } from "../src/lib/ranks";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/practice");

function P(x: number, y: number): Point {
  return { x, y };
}
function S(color: StoneColor, x: number, y: number) {
  return { color, at: P(x, y) };
}

type Draft = Omit<PracticeProblemDraft, "id"> & { id?: string };

function validate(d: Draft, label: string): string | null {
  const size = d.size;
  const playAs = d.playAs ?? "B";
  const board = applySetup(size, d.setup);
  const resolved = resolveAnswer(d.answer, board);
  const candidates =
    resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
  const legal = candidates.filter((p) => isAnswer(p, resolved, board) && playMove(board, p, playAs));
  if (!legal.length) return `${label}: no legal answer — ${d.prompt}`;
  return null;
}

/** 장면용 돌 — 정답·활로와 겹치지 않게 필터 */
function sceneExtras(
  size: number,
  forbidden: Point[],
  extras: { color: StoneColor; at: Point }[],
): { color: StoneColor; at: Point }[] {
  const ban = new Set(forbidden.map((p) => `${p.x},${p.y}`));
  return extras.filter((e) => {
    if (ban.has(`${e.at.x},${e.at.y}`)) return false;
    if (e.at.x < 0 || e.at.y < 0 || e.at.x >= size || e.at.y >= size) return false;
    return true;
  });
}

/** 흰 한 점 단수 → 따내기 (+ 주변 장면 돌) */
function captureOne(
  size: 7 | 9 | 13 | 19,
  wx: number,
  wy: number,
  blocks: Point[],
  answer: Point,
  prompt: string,
  explanation = "숨구멍이 하나 남은 돌을 막으면 판에서 들어내요.",
  wrongHint = "흰 돌 바로 옆, 아직 비어 있는 한 칸을 찾아요.",
  extras: { color: StoneColor; at: Point }[] = [],
): Draft {
  const core = [S("W", wx, wy), ...blocks.map((p) => S("B", p.x, p.y))];
  const forbidden = [P(wx, wy), ...blocks, answer];
  return {
    prompt,
    explanation,
    wrongHint,
    size,
    setup: [...core, ...sceneExtras(size, forbidden, extras)],
    answer,
    playAs: "B",
  };
}

/** 숨구멍 중 아무 곳이나 막기 */
function blockAnyLib(
  size: 7 | 9 | 13 | 19,
  wx: number,
  wy: number,
  blocks: Point[],
  prompt: string,
  explanation = "돌의 상하좌우 빈칸이 숨구멍이에요. 하나를 막으면 숨이 줄어들어요.",
  extras: { color: StoneColor; at: Point }[] = [],
): Draft {
  const core = [S("W", wx, wy), ...blocks.map((p) => S("B", p.x, p.y))];
  const forbidden = [P(wx, wy), ...blocks];
  return {
    prompt,
    explanation,
    wrongHint: "흰 돌과 선으로 이어진 빈칸만 숨구멍이에요.",
    size,
    setup: [...core, ...sceneExtras(size, forbidden, extras)],
    answer: { libertiesOf: P(wx, wy) },
    playAs: "B",
  };
}

/** 7줄 기본 배경 — 반대편에 백·흑 울타리 */
function backdrop7(side: "NE" | "NW" | "SE" | "SW" | "E" | "W" = "E"): { color: StoneColor; at: Point }[] {
  if (side === "E" || side === "NE" || side === "SE") {
    return [S("W", 6, 5), S("W", 5, 6), S("W", 6, 6), S("B", 5, 4), S("B", 4, 5)];
  }
  if (side === "W" || side === "NW" || side === "SW") {
    return [S("W", 0, 5), S("W", 1, 6), S("W", 0, 6), S("B", 2, 5), S("B", 1, 4)];
  }
  return [S("W", 5, 5), S("W", 6, 4), S("B", 4, 6)];
}

function pad10(base: Draft[], fillers: () => Draft[]): Draft[] {
  const out = [...base];
  const extra = fillers();
  let i = 0;
  while (out.length < 10 && i < extra.length) {
    out.push(extra[i++]);
  }
  if (out.length < 10) {
    throw new Error(`need 10 problems, got ${out.length}`);
  }
  return out.slice(0, 10);
}

function concept(
  lessonId: string,
  title: string,
  subtitle: string,
  chapterTitle: string,
  boardSize: 7 | 9 | 13 | 19,
  vibe: string,
  drafts: Draft[],
): PracticeConceptDraft {
  if (drafts.length !== 10) throw new Error(`${lessonId}: expected 10, got ${drafts.length}`);
  return {
    lessonId,
    title,
    subtitle,
    vibe,
    chapterTitle,
    boardSize,
    minutes: 5,
    problems: drafts.map((d, i) => ({
      id: `${lessonId}-p${String(i + 1).padStart(2, "0")}`,
      prompt: d.prompt,
      tip: d.tip,
      explanation: d.explanation,
      setup: d.setup,
      size: d.size,
      answer: d.answer,
      playAs: d.playAs ?? "B",
      wrongHint: d.wrongHint,
      feedback: d.feedback,
    })),
  };
}

/* ─── seed (7줄) ─── */

function seedBreath(): PracticeConceptDraft {
  const ch = "숨구멍과 따내기";
  const bg = backdrop7();
  const base: Draft[] = [
    captureOne(
      7, 3, 3, [P(2, 3), P(4, 3), P(3, 4)], P(3, 2),
      "판 가운데 흰 돌이 숨구멍 하나(단수)예요. 그 빈칸을 막아 따내세요.",
      "돌은 상하좌우로만 숨 쉬어요. 마지막 숨구멍을 막으면 들어내요.",
      "흰 돌 바로 옆 빈칸 중 아직 안 막힌 곳을 찾아요.",
      [...bg, S("B", 1, 1), S("W", 5, 1)],
    ),
    captureOne(
      7, 2, 2, [P(1, 2), P(2, 1), P(3, 2)], P(2, 3),
      "왼쪽 위쪽 싸움에서 흰 돌이 단수예요. 남은 활로를 막아 따내세요.",
      "단수 = 숨구멍 1개. 그 자리를 두면 바로 따내요.",
      "흰 돌 둘레의 빈칸은 하나뿐이에요.",
      [...bg, S("B", 5, 3), S("W", 0, 5)],
    ),
    captureOne(
      7, 4, 4, [P(3, 4), P(4, 3), P(5, 4)], P(4, 5),
      "오른쪽 아래 근처 흰 돌이 단수예요. 따내세요.",
      "주변에 흑·백이 섞여 있어도, 따내기는 ‘숨구멍 전부 막기’만 보면 돼요.",
      "흰 돌 아래쪽 빈칸을 보세요.",
      [S("B", 1, 1), S("B", 2, 0), S("W", 0, 3), S("W", 1, 5)],
    ),
    captureOne(
      7, 1, 3, [P(0, 3), P(1, 2), P(1, 4)], P(2, 3),
      "왼쪽 변에 붙은 흰 돌이 단수예요. 변을 등져 숨이 적으니 쉽게 따낼 수 있어요.",
      "변의 돌은 숨구멍이 최대 3개라 가운데보다 빨리 잡혀요.",
      "흰 돌 오른쪽 빈칸이에요.",
      [...bg, S("B", 3, 5), S("W", 4, 1)],
    ),
    captureOne(
      7, 5, 2, [P(4, 2), P(5, 1), P(6, 2)], P(5, 3),
      "오른쪽 변 근처 흰 돌이 단수예요. 남은 숨구멍을 막으세요.",
      "단수인 돌을 찾아 막는 연습이에요.",
      "흰 돌 바로 아래를 보세요.",
      [S("B", 1, 1), S("B", 2, 5), S("W", 0, 4), S("W", 3, 6)],
    ),
  ];
  return concept(
    "seed-breath",
    "돌도 숨을 쉬어요",
    "숨구멍을 막으면 따낼 수 있어요",
    ch,
    7,
    "숨구멍과 따내기",
    pad10(base, () => [
      blockAnyLib(
        7, 3, 3, [P(2, 3), P(4, 3)],
        "가운데 흰 돌 숨구멍이 두 개예요. 아무 쪽이나 하나 막아 단수로 만드세요.",
        "숨구멍 2개 → 하나 막으면 단수 → 다음 수에 따내기.",
        [...bg, S("B", 0, 1)],
      ),
      blockAnyLib(
        7, 2, 4, [P(1, 4)],
        "흰 돌에 아직 숨이 남았어요. 옆 빈칸 하나를 막아 숨을 줄이세요.",
        "지금은 따내지 않아도 돼요. 숨구멍을 줄이는 감각만 익혀요.",
        [...bg, S("W", 5, 1), S("B", 6, 3)],
      ),
      captureOne(
        7, 3, 1, [P(2, 1), P(3, 0), P(4, 1)], P(3, 2),
        "위 변 근처 흰 돌이 단수예요. 따내세요.",
        "변·귀는 숨구멍이 적어 단수가 자주 나와요.",
        "흰 돌 아래 빈칸이에요.",
        [...bg, S("B", 0, 4)],
      ),
      captureOne(
        7, 4, 3, [P(3, 3), P(4, 2), P(5, 3)], P(4, 4),
        "흑이 거의 포위한 흰 돌이에요. 마지막 숨구멍을 막아 따내세요.",
        "포위가 거의 끝났으면 남은 한 칸만 찾으면 돼요.",
        "흰 돌 아래쪽이에요.",
        [S("B", 1, 0), S("W", 0, 5), S("B", 6, 5)],
      ),
      captureOne(
        7, 2, 5, [P(1, 5), P(2, 4), P(3, 5)], P(2, 6),
        "아래 변 흰 돌이 단수예요. 변을 등진 돌을 따내세요.",
        "아래 변에 붙어 있어 도망갈 칸이 적어요.",
        "흰 돌 아래(변 쪽) 빈칸이에요.",
        [...backdrop7("W"), S("B", 5, 1)],
      ),
    ]),
  );
}

function seedEdge(): PracticeConceptDraft {
  const ch = "숨구멍과 따내기";
  return concept(
    "seed-edge-breath",
    "가장자리는 숨이 적어요",
    "가운데 4 · 변 3 · 귀 2",
    ch,
    7,
    "자리마다 다른 숨구멍",
    pad10(
      [
        captureOne(7, 3, 0, [P(2, 0), P(4, 0)], P(3, 1), "변의 흰 돌이 단수예요. 따내세요."),
        captureOne(7, 0, 0, [P(1, 0)], P(0, 1), "귀의 흰 돌이 단수예요. 따내세요."),
        captureOne(7, 6, 0, [P(5, 0)], P(6, 1), "오른쪽 귀 흰 돌을 따내세요."),
        captureOne(7, 0, 6, [P(0, 5)], P(1, 6), "왼쪽 아래 귀 흰 돌을 따내세요."),
        captureOne(7, 6, 6, [P(6, 5)], P(5, 6), "오른쪽 아래 귀 흰 돌을 따내세요."),
      ],
      () => [
        captureOne(7, 0, 3, [P(0, 2), P(0, 4)], P(1, 3), "왼쪽 변 흰 돌을 따내세요."),
        captureOne(7, 6, 3, [P(6, 2), P(6, 4)], P(5, 3), "오른쪽 변 흰 돌을 따내세요."),
        captureOne(7, 3, 6, [P(2, 6), P(4, 6)], P(3, 5), "아래 변 흰 돌을 따내세요."),
        blockAnyLib(7, 0, 0, [], "귀의 돌 숨구멍을 하나 막아 보세요."),
        blockAnyLib(7, 3, 0, [], "변의 돌 숨구멍을 하나 막아 보세요."),
      ],
    ),
  );
}

function seedGroup(): PracticeConceptDraft {
  const ch = "숨구멍과 따내기";
  const twoAtari = (
    w: Point[],
    blocks: Point[],
    answer: Point,
    prompt: string,
  ): Draft => ({
    prompt,
    explanation: "이어진 돌은 숨구멍을 공유해요. 마지막만 막으면 통째로 잡혀요.",
    wrongHint: "흰 덩어리 둘레의 남은 빈자리를 찾아요.",
    size: 7,
    setup: [...w.map((p) => S("W", p.x, p.y)), ...blocks.map((p) => S("B", p.x, p.y))],
    answer,
    playAs: "B",
  });
  return concept(
    "seed-group-capture",
    "붙은 돌은 한 덩어리",
    "덩어리째 따내기",
    ch,
    7,
    "덩어리 따내기",
    pad10(
      [
        twoAtari(
          [P(2, 3), P(3, 3)],
          [P(1, 3), P(2, 2), P(3, 2), P(4, 3), P(2, 4)],
          P(3, 4),
          "흰 돌 두 개 덩어리가 단수예요. 따내세요.",
        ),
        twoAtari(
          [P(0, 0), P(1, 0)],
          [P(2, 0), P(0, 1)],
          P(1, 1),
          "귀의 흰 돌 두 개를 한 번에 잡아 보세요.",
        ),
        twoAtari(
          [P(4, 1), P(5, 1)],
          [P(3, 1), P(4, 0), P(5, 0), P(6, 1), P(4, 2)],
          P(5, 2),
          "위쪽 덩어리를 따내세요.",
        ),
        twoAtari(
          [P(1, 4), P(1, 5)],
          [P(0, 4), P(0, 5), P(1, 3), P(2, 4), P(2, 5)],
          P(1, 6),
          "세로로 붙은 흰 돌을 따내세요.",
        ),
        twoAtari(
          [P(3, 4), P(4, 4)],
          [P(2, 4), P(3, 3), P(4, 3), P(5, 4), P(3, 5)],
          P(4, 5),
          "가운데 덩어리를 따내세요.",
        ),
      ],
      () => [
        twoAtari(
          [P(5, 4), P(5, 5)],
          [P(4, 4), P(4, 5), P(5, 3), P(6, 4), P(6, 5)],
          P(5, 6),
          "오른쪽 덩어리를 따내세요.",
        ),
        twoAtari(
          [P(2, 1), P(3, 1)],
          [P(1, 1), P(2, 0), P(3, 0), P(4, 1), P(2, 2)],
          P(3, 2),
          "위쪽 두 점을 따내세요.",
        ),
        twoAtari(
          [P(0, 2), P(0, 3)],
          [P(1, 2), P(1, 3), P(0, 1)],
          P(0, 4),
          "왼쪽 변 덩어리를 따내세요.",
        ),
        twoAtari(
          [P(6, 2), P(6, 3)],
          [P(5, 2), P(5, 3), P(6, 1)],
          P(6, 4),
          "오른쪽 변 덩어리를 따내세요.",
        ),
        twoAtari(
          [P(3, 5), P(4, 5)],
          [P(2, 5), P(3, 4), P(4, 4), P(5, 5), P(3, 6)],
          P(4, 6),
          "아래쪽 덩어리를 따내세요.",
        ),
      ],
    ),
  );
}

function seedCaptureQuiz(): PracticeConceptDraft {
  const ch = "숨구멍과 따내기";
  return concept(
    "seed-capture",
    "따내기 퀴즈",
    "어디를 막으면 잡힐까요?",
    ch,
    7,
    "따내기 실력 확인",
    pad10(
      [
        captureOne(7, 3, 3, [P(2, 3), P(4, 3), P(3, 4)], P(3, 2), "흰 돌을 따내 보세요."),
        captureOne(7, 4, 2, [P(4, 1), P(3, 2)], P(5, 2), "변에 있는 흰 돌이에요."),
        captureOne(7, 0, 0, [P(1, 0)], P(0, 1), "귀의 흰 돌을 따내세요."),
        {
          prompt: "흰 돌 두 개 덩어리예요. 따내 보세요.",
          explanation: "덩어리 둘레의 마지막 빈자리를 막으면 통째로 잡혀요.",
          size: 7,
          setup: [
            S("W", 1, 1),
            S("W", 2, 1),
            S("B", 0, 1),
            S("B", 3, 1),
            S("B", 1, 0),
            S("B", 2, 0),
            S("B", 1, 2),
          ],
          answer: P(2, 2),
          playAs: "B",
          wrongHint: "두 돌 둘레에 아직 비어 있는 곳은 한 군데예요.",
        },
        captureOne(7, 5, 5, [P(4, 5), P(5, 4), P(6, 5)], P(5, 6), "아래쪽 흰 돌을 따내세요."),
      ],
      () => [
        captureOne(7, 2, 4, [P(1, 4), P(2, 3), P(3, 4)], P(2, 5), "단수인 흰 돌을 찾아 따내세요."),
        captureOne(7, 6, 1, [P(5, 1), P(6, 0)], P(6, 2), "오른쪽 위 흰 돌을 따내세요."),
        captureOne(7, 1, 5, [P(0, 5), P(1, 4), P(2, 5)], P(1, 6), "왼쪽 아래 흰 돌을 따내세요."),
        captureOne(7, 4, 0, [P(3, 0), P(5, 0)], P(4, 1), "위 변 흰 돌을 따내세요."),
        captureOne(7, 3, 5, [P(2, 5), P(4, 5), P(3, 6)], P(3, 4), "가운데 아래 흰 돌을 따내세요."),
      ],
    ),
  );
}

function seedAtari(): PracticeConceptDraft {
  const ch = "단수";
  return concept(
    "seed-atari",
    "단수를 찾아요",
    "숨구멍이 하나 남았을 때",
    ch,
    7,
    "단수",
    pad10(
      [
        captureOne(7, 3, 3, [P(2, 3), P(3, 2), P(4, 3)], P(3, 4), "단수인 흰 돌을 따내세요."),
        captureOne(7, 1, 1, [P(0, 1), P(1, 0)], P(2, 1), "귀 근처 단수를 따내세요."),
        captureOne(7, 5, 3, [P(4, 3), P(5, 2), P(6, 3)], P(5, 4), "오른쪽 단수를 따내세요."),
        captureOne(7, 2, 5, [P(1, 5), P(2, 4), P(3, 5)], P(2, 6), "아래 단수를 따내세요."),
        captureOne(7, 4, 1, [P(3, 1), P(4, 0), P(5, 1)], P(4, 2), "위쪽 단수를 따내세요."),
      ],
      () => [
        captureOne(7, 0, 4, [P(0, 3), P(1, 4)], P(0, 5), "왼쪽 변 단수를 따내세요."),
        captureOne(7, 6, 4, [P(6, 3), P(5, 4)], P(6, 5), "오른쪽 변 단수를 따내세요."),
        captureOne(7, 3, 0, [P(2, 0), P(4, 0)], P(3, 1), "위 변 단수를 따내세요."),
        captureOne(7, 2, 2, [P(1, 2), P(2, 1), P(3, 2)], P(2, 3), "가운데 단수를 따내세요."),
        captureOne(7, 4, 5, [P(3, 5), P(4, 4), P(5, 5)], P(4, 6), "아래쪽 단수를 따내세요."),
      ],
    ),
  );
}

function seedEscape(): PracticeConceptDraft {
  const ch = "단수";
  // 흑이 단수 → 활로로 달아남
  const escape = (bx: number, by: number, blocks: Point[], answer: Point, prompt: string): Draft => ({
    prompt,
    explanation: "단수일 때는 숨구멍을 늘리는 쪽으로 달아나요.",
    wrongHint: "흑 돌이 숨구멍을 더 얻는 빈자리를 찾아요.",
    size: 7,
    setup: [S("B", bx, by), ...blocks.map((p) => S("W", p.x, p.y))],
    answer,
    playAs: "B",
  });
  return concept(
    "seed-escape",
    "단수에서 달아나요",
    "숨구멍을 늘리는 수",
    ch,
    7,
    "달아나기",
    pad10(
      [
        escape(3, 3, [P(2, 3), P(3, 2), P(4, 3)], P(3, 4), "흑이 단수예요. 달아날 곳을 두세요."),
        escape(2, 2, [P(1, 2), P(2, 1), P(3, 2)], P(2, 3), "흑을 살릴 빈자리를 찾아요."),
        escape(4, 4, [P(3, 4), P(4, 3), P(5, 4)], P(4, 5), "아래쪽으로 달아나요."),
        escape(1, 3, [P(0, 3), P(1, 2), P(1, 4)], P(2, 3), "오른쪽으로 이어 달아나요."),
        escape(5, 2, [P(4, 2), P(5, 1), P(6, 2)], P(5, 3), "아래로 달아나요."),
      ],
      () => [
        escape(3, 1, [P(2, 1), P(3, 0), P(4, 1)], P(3, 2), "가운데로 달아나요."),
        escape(2, 5, [P(1, 5), P(2, 4), P(3, 5)], P(2, 6), "아래로 한 칸 달아나요."),
        escape(4, 5, [P(3, 5), P(4, 4), P(5, 5)], P(4, 6), "흑 단수를 풀어 주세요."),
        escape(5, 4, [P(4, 4), P(5, 3), P(6, 4)], P(5, 5), "아래로 달아나요."),
        escape(1, 1, [P(0, 1), P(1, 0)], P(2, 1), "귀 근처에서 달아나요."),
      ],
    ),
  );
}

function seedConnect(): PracticeConceptDraft {
  const ch = "잇기와 끊기";
  const connect = (
    a: Point,
    b: Point,
    mid: Point,
    threat: { color: StoneColor; at: Point }[],
    prompt: string,
    explanation: string,
  ): Draft => ({
    prompt,
    explanation,
    wrongHint: "두 흑 돌 사이 빈칸을 이어 한 덩어리로 만드세요.",
    size: 7,
    setup: [S("B", a.x, a.y), S("B", b.x, b.y), ...threat],
    answer: mid,
    playAs: "B",
  });
  return concept(
    "seed-connect",
    "돌을 이어요",
    "붙이면 한 덩어리",
    ch,
    7,
    "잇기",
    [
      connect(
        P(2, 3), P(4, 3), P(3, 3),
        [S("W", 3, 2), S("W", 3, 4), S("W", 5, 5), S("B", 0, 1), S("B", 1, 0)],
        "흑 두 점이 한 칸 떨어져 있고, 백이 위아래에서 끊으려 해요. 가운데를 이어 한 덩어리로 만드세요.",
        "이으면 숨구멍을 같이 쓰고, 백이 사이를 비집고 들어오지 못해요.",
      ),
      connect(
        P(1, 2), P(1, 4), P(1, 3),
        [S("W", 0, 3), S("W", 2, 3), S("W", 4, 5), S("B", 5, 1), S("B", 6, 2)],
        "세로로 떨어진 흑을 백이 좌우에서 노려요. 사이를 이어 지키세요.",
        "끊기면 각각 약해져요. 먼저 잇는 게 안전해요.",
      ),
      connect(
        P(3, 1), P(3, 3), P(3, 2),
        [S("W", 2, 2), S("W", 4, 2), S("W", 5, 5), S("B", 0, 5), S("B", 1, 6)],
        "위아래 흑이 끊기기 직전이에요. 가운데를 이어 살리세요.",
        "잇기는 ‘한 칸 사이’를 메우는 수예요.",
      ),
      connect(
        P(4, 2), P(4, 4), P(4, 3),
        [S("W", 3, 3), S("W", 5, 3), S("W", 1, 5), S("B", 0, 0), S("B", 1, 1)],
        "오른쪽 흑 두 점이 백에게 끼어 있어요. 이어 한 덩어리로 만드세요.",
        "덩어리가 되면 숨구멍이 늘어나 잡기 어려워져요.",
      ),
      connect(
        P(2, 4), P(4, 4), P(3, 4),
        [S("W", 3, 3), S("W", 3, 5), S("W", 5, 1), S("B", 0, 2), S("B", 1, 0)],
        "아래쪽 흑이 끊길 자리예요. 백이 위아래에서 노리니 가운데를 이으세요.",
        "상대가 끊기 전에 잇는 게 기본이에요.",
      ),
      connect(
        P(0, 3), P(2, 3), P(1, 3),
        [S("W", 1, 2), S("W", 1, 4), S("W", 4, 5), S("B", 5, 0), S("B", 6, 1)],
        "왼쪽 변 흑을 백이 끊으려 해요. 사이를 이으세요.",
        "변에서도 잇기의 원리는 같아요.",
      ),
      connect(
        P(5, 1), P(5, 3), P(5, 2),
        [S("W", 4, 2), S("W", 6, 2), S("W", 2, 5), S("B", 0, 4), S("B", 1, 6)],
        "오른쪽 세로 흑이 위험해요. 이어 지키세요.",
        "백이 끼어 있는 사이를 메우면 연결돼요.",
      ),
      connect(
        P(2, 1), P(4, 1), P(3, 1),
        [S("W", 3, 0), S("W", 3, 2), S("W", 5, 5), S("B", 0, 5), S("B", 1, 6)],
        "위 변 흑 두 점 사이가 비어 있어요. 백이 끊기 전에 이으세요.",
        "변 위에서도 ‘한 칸 이음’이 가장 단단해요.",
      ),
      connect(
        P(1, 5), P(3, 5), P(2, 5),
        [S("W", 2, 4), S("W", 2, 6), S("W", 5, 2), S("B", 6, 0), S("B", 5, 1)],
        "아래쪽 흑이 끊기기 직전이에요. 가운데를 이으세요.",
        "끊긴 돌은 따로 잡혀요. 먼저 잇기!",
      ),
      connect(
        P(3, 2), P(5, 2), P(4, 2),
        [S("W", 4, 1), S("W", 4, 3), S("W", 1, 5), S("B", 0, 0), S("B", 1, 1)],
        "가로로 떨어진 흑을 백이 위아래에서 노려요. 이어 한 덩어리로 만드세요.",
        "이으면 두 돌의 숨구멍이 합쳐져요.",
      ),
    ],
  );
}

function seedCut(): PracticeConceptDraft {
  const ch = "잇기와 끊기";
  const cut = (
    w1: Point,
    w2: Point,
    mid: Point,
    support: { color: StoneColor; at: Point }[],
    prompt: string,
  ): Draft => ({
    prompt,
    explanation: "상대 돌을 갈라놓으면 각각 약해져 잡기 쉬워져요.",
    wrongHint: "두 흰 돌 사이 빈칸 — 그곳을 두면 끊겨요.",
    size: 7,
    setup: [S("W", w1.x, w1.y), S("W", w2.x, w2.y), ...support],
    answer: mid,
    playAs: "B",
  });
  return concept(
    "seed-cut",
    "상대를 끊어요",
    "갈라놓으면 약해져요",
    ch,
    7,
    "끊기",
    [
      cut(
        P(2, 3), P(4, 3), P(3, 3),
        [S("B", 3, 2), S("B", 3, 4), S("B", 0, 1), S("W", 5, 5), S("W", 6, 4)],
        "흰 두 점이 한 칸 떨어져 이어지려 해요. 가운데를 두어 끊고, 약하게 만드세요.",
      ),
      cut(
        P(1, 2), P(1, 4), P(1, 3),
        [S("B", 0, 3), S("B", 2, 3), S("B", 5, 1), S("W", 4, 5), S("W", 6, 5)],
        "세로로 이어지려는 백을 좌우 흑이 받쳐 줍니다. 사이를 끊어 가세요.",
      ),
      cut(
        P(3, 1), P(3, 3), P(3, 2),
        [S("B", 2, 2), S("B", 4, 2), S("B", 0, 5), S("W", 5, 5), S("W", 6, 6)],
        "위아래 백이 붙으려 해요. 흑이 양옆을 잡고 있으니 가운데를 끊어 버리세요.",
      ),
      cut(
        P(4, 2), P(4, 4), P(4, 3),
        [S("B", 3, 3), S("B", 5, 3), S("B", 1, 1), S("W", 0, 5), S("W", 1, 6)],
        "오른쪽 백 연결을 끊으세요. 끊기면 위·아래가 따로 놀아요.",
      ),
      cut(
        P(2, 4), P(4, 4), P(3, 4),
        [S("B", 3, 3), S("B", 3, 5), S("B", 0, 1), S("W", 5, 1), S("W", 6, 0)],
        "아래쪽 백이 이어지려 합니다. 흑이 위아래를 누르고 있으니 끊으세요.",
      ),
      cut(
        P(0, 3), P(2, 3), P(1, 3),
        [S("B", 1, 2), S("B", 1, 4), S("B", 5, 0), S("W", 4, 5), S("W", 5, 6)],
        "왼쪽 변 백을 끊으세요. 변에서는 끊긴 돌이 더 빨리 약해져요.",
      ),
      cut(
        P(5, 1), P(5, 3), P(5, 2),
        [S("B", 4, 2), S("B", 6, 2), S("B", 1, 5), S("W", 0, 0), S("W", 1, 1)],
        "오른쪽 세로 백 연결을 끊으세요.",
      ),
      cut(
        P(2, 1), P(4, 1), P(3, 1),
        [S("B", 3, 0), S("B", 3, 2), S("B", 0, 5), S("W", 5, 5), S("W", 6, 4)],
        "위 변 백이 가로로 이어지려 해요. 가운데를 끊어 약하게 만드세요.",
      ),
      cut(
        P(1, 5), P(3, 5), P(2, 5),
        [S("B", 2, 4), S("B", 2, 6), S("B", 6, 1), S("W", 5, 0), S("W", 6, 2)],
        "아래쪽 백을 끊으세요. 끊긴 쪽부터 단수가 나오기 쉬워요.",
      ),
      cut(
        P(3, 2), P(5, 2), P(4, 2),
        [S("B", 4, 1), S("B", 4, 3), S("B", 0, 5), S("W", 1, 0), S("W", 0, 1)],
        "가로로 이어지려는 백을 위아래 흑이 노려요. 사이를 끊으세요.",
      ),
    ],
  );
}

function seedDoubleAtari(): PracticeConceptDraft {
  const ch = "단수";
  // 한 수로 두 쪽을 동시에 위협 — 단순화: 두 단수 중 하나를 따내는 문제 + 양단수 자리
  return concept(
    "seed-double-atari",
    "양단수",
    "한 수로 두 곳을 위협해요",
    ch,
    7,
    "양단수",
    pad10(
      [
        {
          prompt: "한 수로 흰 돌 두 쪽을 동시에 단수로 만드세요.",
          explanation: "양단수는 상대가 한곳만 막아도 다른 쪽이 잡혀요.",
          wrongHint: "두 흰 돌 사이에 끼는 빈칸을 찾아요.",
          size: 7,
          setup: [
            S("W", 2, 3),
            S("W", 4, 3),
            S("B", 2, 2),
            S("B", 2, 4),
            S("B", 4, 2),
            S("B", 4, 4),
          ],
          answer: P(3, 3),
          playAs: "B",
        },
        {
          prompt: "양단수 자리를 두세요.",
          explanation: "한 수가 두 단수를 만들면 상대가 둘 다 못 막아요.",
          wrongHint: "두 흰 덩어리가 맞닿는 빈칸이에요.",
          size: 7,
          setup: [
            S("W", 1, 2),
            S("W", 1, 4),
            S("B", 0, 2),
            S("B", 0, 4),
            S("B", 2, 2),
            S("B", 2, 4),
          ],
          answer: P(1, 3),
          playAs: "B",
        },
        captureOne(7, 2, 2, [P(1, 2), P(2, 1), P(3, 2)], P(2, 3), "먼저 보이는 단수부터 따내세요."),
        captureOne(7, 4, 4, [P(3, 4), P(4, 3), P(5, 4)], P(4, 5), "단수인 흰 돌을 따내세요."),
        {
          prompt: "가운데를 두어 양단수를 만드세요.",
          explanation: "양단수 자리는 보통 두 약점의 교차점이에요.",
          wrongHint: "두 흰 돌 한가운데예요.",
          size: 7,
          setup: [
            S("W", 2, 2),
            S("W", 4, 4),
            S("B", 2, 1),
            S("B", 1, 2),
            S("B", 4, 5),
            S("B", 5, 4),
          ],
          answer: P(3, 3),
          playAs: "B",
        },
      ],
      () => [
        captureOne(7, 1, 4, [P(0, 4), P(1, 3), P(2, 4)], P(1, 5), "왼쪽 단수를 따내세요."),
        captureOne(7, 5, 2, [P(4, 2), P(5, 1), P(6, 2)], P(5, 3), "오른쪽 단수를 따내세요."),
        {
          prompt: "세로로 양단수를 두세요.",
          size: 7,
          setup: [
            S("W", 3, 1),
            S("W", 3, 3),
            S("B", 2, 1),
            S("B", 4, 1),
            S("B", 2, 3),
            S("B", 4, 3),
          ],
          answer: P(3, 2),
          playAs: "B",
          explanation: "위아래 약점을 한 수로 노려요.",
          wrongHint: "두 흰 돌 사이예요.",
        },
        captureOne(7, 3, 5, [P(2, 5), P(3, 4), P(4, 5)], P(3, 6), "아래 단수를 따내세요."),
        captureOne(7, 0, 0, [P(1, 0)], P(0, 1), "귀 단수를 따내세요."),
      ],
    ),
  );
}

function seedMakeAtari(): PracticeConceptDraft {
  const ch = "단수";
  return concept(
    "seed-make-atari",
    "단수로 만들어요",
    "숨구멍 2 → 1",
    ch,
    7,
    "단수 만들기",
    pad10(
      [
        blockAnyLib(7, 3, 3, [P(2, 3), P(4, 3)], "숨구멍 두 개 중 하나를 막아 단수로 만드세요."),
        blockAnyLib(7, 2, 2, [P(1, 2), P(2, 1)], "단수로 만들 한 수를 두세요."),
        blockAnyLib(7, 4, 4, [P(4, 3), P(5, 4)], "흰 돌을 단수로 만드세요."),
        blockAnyLib(7, 1, 3, [P(0, 3), P(1, 2)], "변의 흰 돌을 단수로 만드세요."),
        blockAnyLib(7, 5, 1, [P(4, 1), P(5, 0)], "위쪽 흰 돌을 단수로 만드세요."),
      ],
      () => [
        blockAnyLib(7, 3, 5, [P(2, 5), P(4, 5)], "아래 흰 돌을 단수로 만드세요."),
        blockAnyLib(7, 0, 2, [P(0, 1)], "왼쪽 변 돌을 단수로 만드세요."),
        blockAnyLib(7, 6, 3, [P(6, 2)], "오른쪽 변 돌을 단수로 만드세요."),
        blockAnyLib(7, 2, 4, [P(1, 4), P(2, 5)], "단수로 만드는 수를 찾아요."),
        blockAnyLib(7, 4, 2, [P(3, 2), P(5, 2)], "가로로 막혀 있는 돌을 단수로 만드세요."),
      ],
    ),
  );
}

function seedSave(): PracticeConceptDraft {
  const ch = "잇기와 끊기";
  const save = (setup: { color: StoneColor; at: Point }[], answer: Point, prompt: string): Draft => ({
    prompt,
    explanation: "잡히기 직전 돌을 이어서 숨구멍을 늘려요.",
    wrongHint: "흑끼리 이어지는 빈칸을 찾아요.",
    size: 7,
    setup,
    answer,
    playAs: "B",
  });
  return concept(
    "seed-save",
    "내 돌을 살려요",
    "잡히기 전에 이어요",
    ch,
    7,
    "살리기",
    pad10(
      [
        save(
          [S("B", 2, 3), S("B", 4, 3), S("W", 2, 2), S("W", 2, 4), S("W", 4, 2), S("W", 4, 4)],
          P(3, 3),
          "끊어진 흑을 이어 살려 보세요.",
        ),
        save([S("B", 1, 2), S("B", 1, 4), S("W", 0, 2), S("W", 0, 4), S("W", 2, 2), S("W", 2, 4)], P(1, 3), "세로로 이어 살려요."),
        save([S("B", 3, 1), S("B", 3, 3), S("W", 2, 1), S("W", 4, 1), S("W", 2, 3), S("W", 4, 3)], P(3, 2), "위아래 흑을 이어요."),
        save([S("B", 4, 2), S("B", 4, 4), S("W", 3, 2), S("W", 5, 2), S("W", 3, 4), S("W", 5, 4)], P(4, 3), "오른쪽 흑을 이어요."),
        save([S("B", 2, 4), S("B", 4, 4), S("W", 2, 3), S("W", 2, 5), S("W", 4, 3), S("W", 4, 5)], P(3, 4), "아래쪽 흑을 이어요."),
      ],
      () => [
        save([S("B", 0, 3), S("B", 2, 3), S("W", 0, 2), S("W", 0, 4), S("W", 2, 2), S("W", 2, 4)], P(1, 3), "왼쪽 흑을 이어요."),
        save([S("B", 5, 1), S("B", 5, 3), S("W", 4, 1), S("W", 6, 1), S("W", 4, 3), S("W", 6, 3)], P(5, 2), "오른쪽 세로를 이어요."),
        save([S("B", 2, 1), S("B", 4, 1), S("W", 2, 0), S("W", 2, 2), S("W", 4, 0), S("W", 4, 2)], P(3, 1), "위쪽 흑을 이어요."),
        save([S("B", 1, 5), S("B", 3, 5), S("W", 1, 4), S("W", 1, 6), S("W", 3, 4), S("W", 3, 6)], P(2, 5), "아래쪽을 이어요."),
        save([S("B", 3, 2), S("B", 5, 2), S("W", 3, 1), S("W", 3, 3), S("W", 5, 1), S("W", 5, 3)], P(4, 2), "가로로 이어요."),
      ],
    ),
  );
}

function seedEyesIntro(): PracticeConceptDraft {
  const ch = "눈과 집";
  const eye = (
    setup: { color: StoneColor; at: Point }[],
    answer: Point,
    prompt: string,
    explanation: string,
  ): Draft => ({
    prompt,
    explanation,
    wrongHint: "흑 울타리에서 아직 열린 한 칸을 막아 눈을 완성해요.",
    size: 7,
    setup,
    answer,
    playAs: "B",
  });
  const bg = [S("W", 6, 5), S("W", 5, 6), S("W", 6, 6), S("B", 0, 6)];
  return concept(
    "seed-eyes-intro",
    "눈 맛보기",
    "빈칸이 집의 씨앗",
    ch,
    7,
    "눈",
    [
      eye(
        [
          S("B", 1, 1),
          S("B", 2, 1),
          S("B", 3, 1),
          S("B", 1, 2),
          S("B", 3, 2),
          S("B", 1, 3),
          S("B", 2, 3),
          S("W", 4, 2),
          S("W", 3, 4),
          S("W", 5, 4),
          ...bg,
        ],
        P(3, 3),
        "흑이 한쪽 눈은 있어요. 백이 다가오기 전에 열린 모서리를 막아 두 번째 눈을 만드세요.",
        "눈이 두 개면 상대가 한 번에 다 못 메워 살아요. 열린 한 칸을 닫으면 두 눈이 됩니다.",
      ),
      eye(
        [
          S("B", 2, 2),
          S("B", 3, 2),
          S("B", 4, 2),
          S("B", 2, 3),
          S("B", 4, 3),
          S("B", 2, 4),
          S("B", 3, 4),
          S("W", 1, 3),
          S("W", 5, 3),
          S("W", 3, 5),
          S("B", 0, 0),
          S("W", 6, 6),
        ],
        P(4, 4),
        "거의 두 눈 모양이에요. 오른쪽 아래 열린 칸을 막아 완성하세요.",
        "한 눈만 있으면 메워져 죽어요. 두 번째 눈을 만드는 수가 살리는 수예요.",
      ),
      captureOne(
        7, 3, 3, [P(2, 3), P(3, 2), P(4, 3)], P(3, 4),
        "흰 돌에는 눈이 없어요. 단수이니 따내 죽이세요.",
        "눈(집 칸)이 없는 돌은 활로만 막으면 잡혀요.",
        "흰 돌 아래 빈칸이에요.",
        [...bg, S("B", 0, 1), S("W", 5, 1)],
      ),
      captureOne(
        7, 4, 3, [P(3, 3), P(4, 2), P(5, 3)], P(4, 4),
        "눈 없는 흰 돌이 단수예요. 따내세요.",
        "사는 모양(두 눈)이 아니면 단수에 약해요.",
        "흰 돌 아래를 막아요.",
        [S("B", 1, 1), S("W", 0, 5), S("B", 6, 5)],
      ),
      eye(
        [
          S("B", 3, 1),
          S("B", 4, 1),
          S("B", 5, 1),
          S("B", 3, 2),
          S("B", 5, 2),
          S("B", 3, 3),
          S("B", 4, 3),
          S("W", 2, 2),
          S("W", 2, 4),
          S("W", 6, 3),
          S("B", 0, 5),
          S("W", 1, 6),
        ],
        P(5, 3),
        "오른쪽이 열린 흑 모양이에요. 막아 두 번째 눈을 만드세요.",
        "열린 모서리를 닫으면 눈이 하나 더 생겨요.",
      ),
      eye(
        [
          S("B", 0, 0),
          S("B", 1, 0),
          S("B", 2, 0),
          S("B", 0, 1),
          S("B", 0, 2),
          S("B", 2, 1),
          S("W", 3, 0),
          S("W", 3, 1),
          S("W", 1, 3),
          S("W", 2, 3),
          S("B", 5, 5),
          S("W", 6, 4),
        ],
        P(1, 1),
        "귀에서 작은 집을 만들어요. 흑 울타리 안 빈칸을 메워 눈을 확보하세요.",
        "귀는 벽이 두 개라 작은 눈·집을 만들기 좋아요.",
      ),
      captureOne(
        7, 2, 4, [P(1, 4), P(2, 3), P(3, 4)], P(2, 5),
        "눈 없이 몰린 흰 돌이에요. 따내세요.",
        "눈이 없으면 활로만 막혀도 죽어요.",
        "흰 돌 아래 빈칸이에요.",
        [...bg, S("B", 5, 1)],
      ),
      eye(
        [
          S("B", 1, 3),
          S("B", 2, 3),
          S("B", 3, 3),
          S("B", 1, 4),
          S("B", 3, 4),
          S("B", 1, 5),
          S("B", 2, 5),
          S("W", 4, 3),
          S("W", 4, 5),
          S("W", 0, 2),
          S("B", 6, 0),
          S("W", 5, 1),
        ],
        P(3, 5),
        "아래쪽 흑 모양의 열린 칸을 막아 눈을 완성하세요.",
        "두 눈이 되면 백이 한 수로 못 잡아요.",
      ),
      captureOne(
        7, 5, 5, [P(4, 5), P(5, 4), P(6, 5)], P(5, 6),
        "아래 귀 근처 흰 돌이 단수예요. 따내세요.",
        "귀·변의 눈 없는 돌은 더 빨리 잡혀요.",
        "흰 돌 아래(변) 빈칸이에요.",
        [S("B", 1, 1), S("W", 0, 3), S("B", 2, 0)],
      ),
      eye(
        [
          S("B", 2, 0),
          S("B", 3, 0),
          S("B", 4, 0),
          S("B", 2, 1),
          S("B", 4, 1),
          S("B", 2, 2),
          S("B", 3, 2),
          S("W", 1, 1),
          S("W", 5, 1),
          S("W", 3, 3),
          S("B", 0, 5),
          S("W", 6, 5),
        ],
        P(4, 2),
        "위쪽 흑 모양에서 오른쪽이 열려 있어요. 막아 두 눈을 만드세요.",
        "한 칸만 닫으면 사는 모양이 됩니다.",
      ),
    ],
  );
}

function seedTerritory(): PracticeConceptDraft {
  const ch = "눈과 집";
  const q = (
    setup: { color: StoneColor; at: Point }[],
    answer: Point | Point[],
    prompt: string,
    explanation: string,
    wrongHint: string,
  ): Draft => ({
    prompt,
    explanation,
    wrongHint,
    size: 7,
    setup,
    answer,
    playAs: "B",
  });
  return concept(
    "seed-territory",
    "집 느낌 익히기",
    "에워싼 빈칸이 집",
    ch,
    7,
    "집",
    [
      q(
        [
          // 좌상 귀 흑 집 — 모서리만 비어 있음. 백이 바깥에서 다가옴
          S("B", 0, 1),
          S("B", 1, 0),
          S("B", 1, 1),
          S("B", 2, 0),
          S("B", 0, 2),
          S("W", 3, 1),
          S("W", 2, 2),
          S("W", 1, 3),
          S("W", 4, 3),
          S("W", 3, 4),
          S("B", 5, 5),
          S("B", 6, 4),
        ],
        P(2, 1),
        "왼쪽 위 귀가 흑 집이에요. 백이 파고들기 전에, 열린 한 칸을 막아 울타리를 닫으세요.",
        "집이 되려면 빈칸을 내 돌로 둘러싸야 해요. 열린 틈을 막으면 백이 못 들어와요.",
        "귀 안쪽과 바깥을 가르는 빈칸을 찾아요. 흑 돌 사이 틈이에요.",
      ),
      q(
        [
          S("B", 5, 0),
          S("B", 6, 0),
          S("B", 6, 1),
          S("B", 6, 2),
          S("B", 5, 2),
          S("W", 4, 1),
          S("W", 3, 2),
          S("W", 4, 3),
          S("W", 2, 4),
          S("B", 1, 5),
          S("B", 0, 6),
        ],
        P(5, 1),
        "오른쪽 위 흑 집에 틈이 있어요. 백(4,1) 옆 빈칸을 막아 집을 완성하세요.",
        "울타리에 구멍 하나면 상대가 들어와 집을 망가뜨려요. 그 구멍을 메우면 돼요.",
        "흑 돌이 ㄱ자로 열린 자리 — (5,1) 근처를 보세요.",
      ),
      q(
        [
          // 좌하 귀 — 흑이 변을 따라 있고 모서리 한 칸만 열림
          S("B", 0, 4),
          S("B", 0, 5),
          S("B", 0, 6),
          S("B", 1, 6),
          S("B", 2, 6),
          S("W", 1, 3),
          S("W", 2, 4),
          S("W", 3, 5),
          S("W", 4, 4),
          S("B", 5, 1),
          S("B", 6, 2),
        ],
        P(1, 5),
        "왼쪽 아래 흑 집이에요. 백이 (2,4)에서 다가오니, 집 안쪽 틈을 닫아 지키세요.",
        "변·귀의 집은 ‘빈칸 + 내 돌 울타리’예요. 울타리 구멍을 메우면 집이 확정돼요.",
        "흑 돌로 둘러싸인 빈칸 중, 아직 안 막힌 한 곳을 찾아요.",
      ),
      q(
        [
          S("B", 4, 5),
          S("B", 5, 5),
          S("B", 6, 5),
          S("B", 6, 6),
          S("B", 5, 6),
          S("W", 3, 4),
          S("W", 4, 3),
          S("W", 3, 6),
          S("W", 2, 5),
          S("B", 1, 1),
          S("B", 2, 0),
        ],
        P(4, 6),
        "오른쪽 아래 귀가 흑 집이에요. 백이 왼쪽에서 위협하니, 열린 모서리를 막으세요.",
        "귀 집은 두 벽(변)을 이미 쓰므로, 안쪽 한두 칸만 막아도 집이 돼요.",
        "귀 안 빈칸 중 흑끼리 이어지지 않은 곳을 막아요.",
      ),
      q(
        [
          // 위 변 흑 집 — 아래쪽 한 줄이 비어 백이 침투 가능
          S("B", 1, 0),
          S("B", 2, 0),
          S("B", 3, 0),
          S("B", 4, 0),
          S("B", 5, 0),
          S("B", 1, 1),
          S("B", 5, 1),
          S("W", 2, 3),
          S("W", 3, 3),
          S("W", 4, 3),
          S("W", 3, 4),
          S("B", 0, 5),
          S("B", 6, 5),
        ],
        [P(2, 1), P(3, 1), P(4, 1)],
        "위 변에 흑 집이 생겨요. 백이 아래에서 올라오기 전에, 가운데 줄을 한 칸 막아 울타리를 두껍게 하세요.",
        "변 집은 ‘변 + 내 돌 한 줄’로 빈칸을 가둬요. 울타리를 한 칸 더 내리면 안전해져요.",
        "위 변 흑 바로 아래 빈줄(1번째 줄) 가운데를 막아 보세요.",
      ),
      q(
        [
          S("B", 0, 1),
          S("B", 0, 2),
          S("B", 0, 3),
          S("B", 0, 4),
          S("B", 0, 5),
          S("B", 1, 1),
          S("B", 1, 5),
          S("W", 3, 2),
          S("W", 3, 3),
          S("W", 3, 4),
          S("W", 4, 3),
          S("B", 5, 0),
          S("B", 6, 1),
        ],
        [P(1, 2), P(1, 3), P(1, 4)],
        "왼쪽 변 흑 집이에요. 백이 가운데에서 밀어붙이니, 안쪽으로 한 칸 막아 집을 굳히세요.",
        "변을 등진 집은 안쪽(판 중앙 방향)으로 울타리를 치면 완성돼요.",
        "왼쪽 흑 바로 오른쪽 빈칸을 막아 보세요.",
      ),
      q(
        [
          S("B", 6, 1),
          S("B", 6, 2),
          S("B", 6, 3),
          S("B", 6, 4),
          S("B", 6, 5),
          S("B", 5, 1),
          S("B", 5, 5),
          S("W", 3, 2),
          S("W", 3, 3),
          S("W", 3, 4),
          S("W", 2, 3),
          S("B", 0, 0),
          S("B", 1, 1),
        ],
        [P(5, 2), P(5, 3), P(5, 4)],
        "오른쪽 변 흑 집이에요. 백이 왼쪽에서 오니, 집 안쪽을 한 칸 막아 지키세요.",
        "상대가 다가올수록 울타리를 안쪽으로 한 겹 더 치는 게 집 지키기의 기본이에요.",
        "오른쪽 흑 바로 왼쪽 빈칸을 막아 보세요.",
      ),
      q(
        [
          S("B", 1, 6),
          S("B", 2, 6),
          S("B", 3, 6),
          S("B", 4, 6),
          S("B", 5, 6),
          S("B", 1, 5),
          S("B", 5, 5),
          S("W", 2, 3),
          S("W", 3, 3),
          S("W", 4, 3),
          S("W", 3, 2),
          S("B", 0, 1),
          S("B", 6, 1),
        ],
        [P(2, 5), P(3, 5), P(4, 5)],
        "아래 변 흑 집이에요. 백이 위에서 내려오기 전에 울타리를 한 칸 올리세요.",
        "아래 변을 등졌으니, 위쪽(중앙)으로 울타리를 올리면 집이 굳어요.",
        "아래 흑 바로 위 빈줄을 막아 보세요.",
      ),
      q(
        [
          // 흑·백이 나뉜 끝내기 — 흑 쪽 작은 틈
          S("B", 0, 0),
          S("B", 1, 0),
          S("B", 2, 0),
          S("B", 0, 1),
          S("B", 0, 2),
          S("B", 2, 1),
          S("W", 3, 0),
          S("W", 3, 1),
          S("W", 3, 2),
          S("W", 2, 3),
          S("W", 1, 3),
          S("W", 4, 2),
          S("B", 5, 5),
          S("B", 6, 6),
          S("W", 6, 4),
        ],
        P(1, 1),
        "끝내기예요. 왼쪽 위 흑 집 안에 아직 빈칸이 있어요. 그곳을 메워 집을 확정하세요.",
        "끝에서는 내 집 빈칸을 메우거나 상대 집 구멍을 노려요. 지금은 내 집 확정!",
        "흑으로 둘러싸인 귀 안 빈칸을 찾아요.",
      ),
      q(
        [
          S("B", 4, 0),
          S("B", 5, 0),
          S("B", 6, 0),
          S("B", 6, 1),
          S("B", 6, 2),
          S("B", 4, 1),
          S("W", 3, 0),
          S("W", 3, 1),
          S("W", 3, 2),
          S("W", 4, 2),
          S("W", 5, 3),
          S("B", 1, 5),
          S("B", 0, 6),
          S("W", 2, 6),
        ],
        P(5, 1),
        "오른쪽 위 흑 집과 백 영역이 맞닿아 있어요. 흑 집 쪽 틈을 막아 백의 침입을 막으세요.",
        "경계가 맞닿으면 ‘누구 집이냐’가 갈려요. 내 쪽 구멍을 먼저 막으면 집이 남아요.",
        "흑 돌 사이, 백과 가까운 빈칸을 막아요.",
      ),
    ],
  );
}

/* ─── sprout / leaf / tree / forest — 패턴 재사용 + 판 크기 ─── */

function farCorner(size: number, avoid: Point[]): { color: StoneColor; at: Point }[] {
  const cands = [
    P(0, 0),
    P(size - 1, 0),
    P(0, size - 1),
    P(size - 1, size - 1),
    P(0, 2),
    P(size - 1, 2),
    P(2, 0),
    P(2, size - 1),
  ];
  const ban = new Set(avoid.map((p) => `${p.x},${p.y}`));
  const out: { color: StoneColor; at: Point }[] = [];
  for (const p of cands) {
    if (ban.has(`${p.x},${p.y}`)) continue;
    out.push(S(out.length % 2 === 0 ? "W" : "B", p.x, p.y));
    if (out.length >= 4) break;
  }
  return out;
}

function captureBank(
  lessonId: string,
  title: string,
  subtitle: string,
  chapter: string,
  size: 7 | 9 | 13 | 19,
  vibe: string,
  spots: { w: Point; blocks: Point[]; a: Point }[],
): PracticeConceptDraft {
  const prompts = [
    "이 장면에서 흰 돌이 단수예요. 남은 숨구멍을 막아 따내세요.",
    "흑이 거의 포위한 흰 돌이에요. 마지막 활로를 막아 따내세요.",
    "단수인 흰 돌을 찾아 따내세요. 상하좌우 빈칸이 하나뿐인 돌이에요.",
    "주변 싸움을 보고, 지금 당장 따낼 수 있는 흰 돌을 처리하세요.",
    "숨구멍이 하나 남은 흰 돌이에요. 그 칸을 두면 들어내요.",
  ];
  const drafts = spots.slice(0, 10).map((s, i) =>
    captureOne(
      size,
      s.w.x,
      s.w.y,
      s.blocks,
      s.a,
      prompts[i % prompts.length],
      "단수(숨구멍 1개)인 돌을 막으면 따내요. 다른 돌은 배경일 뿐이에요.",
      "흰 돌과 선으로 맞닿은 빈칸 중, 아직 안 막힌 한 곳이에요.",
      farCorner(size, [s.w, ...s.blocks, s.a]),
    ),
  );
  while (drafts.length < 10) {
    const s = spots[drafts.length % spots.length];
    drafts.push(
      captureOne(
        size,
        s.w.x,
        s.w.y,
        s.blocks,
        s.a,
        "남은 숨구멍을 막아 따내세요.",
        "단수인 돌을 막으면 따내요.",
        "흰 돌 옆 빈칸을 찾아요.",
        farCorner(size, [s.w, ...s.blocks, s.a]),
      ),
    );
  }
  return concept(lessonId, title, subtitle, chapter, size, vibe, drafts.slice(0, 10));
}

function connectBank(
  lessonId: string,
  title: string,
  subtitle: string,
  chapter: string,
  size: 7 | 9 | 13 | 19,
  vibe: string,
  pairs: { a: Point; b: Point; mid: Point }[],
): PracticeConceptDraft {
  const drafts = pairs.slice(0, 10).map((p) => {
    const threat = [
      S("W", p.mid.x, Math.max(0, p.mid.y - 1)),
      S("W", p.mid.x, Math.min(size - 1, p.mid.y + 1)),
    ].filter((t) => !(t.at.x === p.a.x && t.at.y === p.a.y) && !(t.at.x === p.b.x && t.at.y === p.b.y) && !(t.at.x === p.mid.x && t.at.y === p.mid.y));
    // if threat lands on mid axis wrongly, use side threats
    const sideThreat =
      threat.length >= 1
        ? threat
        : [S("W", Math.max(0, p.mid.x - 1), p.mid.y), S("W", Math.min(size - 1, p.mid.x + 1), p.mid.y)];
    const extras = farCorner(size, [p.a, p.b, p.mid, ...sideThreat.map((t) => t.at)]);
    return {
      prompt: "흑 두 점이 한 칸 떨어져 있고 백이 끊으려 해요. 가운데를 이어 한 덩어리로 만드세요.",
      explanation: "이으면 숨구멍을 같이 쓰고, 백이 사이를 비집고 못 들어와요.",
      wrongHint: "두 흑 사이 빈칸을 이어 보세요.",
      size,
      setup: [S("B", p.a.x, p.a.y), S("B", p.b.x, p.b.y), ...sideThreat, ...extras],
      answer: p.mid,
      playAs: "B" as const,
    };
  });
  while (drafts.length < 10) {
    drafts.push({ ...drafts[drafts.length % Math.max(pairs.length, 1)] });
  }
  return concept(lessonId, title, subtitle, chapter, size, vibe, drafts.slice(0, 10));
}

function eyeBank(
  lessonId: string,
  title: string,
  subtitle: string,
  chapter: string,
  size: 7 | 9,
  vibe: string,
): PracticeConceptDraft {
  const boxes: { setup: Point[]; answer: Point }[] = [
    {
      setup: [P(1, 1), P(2, 1), P(3, 1), P(1, 2), P(3, 2), P(1, 3), P(2, 3)],
      answer: P(3, 3),
    },
    {
      setup: [P(2, 2), P(3, 2), P(4, 2), P(2, 3), P(4, 3), P(2, 4), P(3, 4)],
      answer: P(4, 4),
    },
    {
      setup: [P(3, 1), P(4, 1), P(5, 1), P(3, 2), P(5, 2), P(3, 3), P(4, 3)],
      answer: P(5, 3),
    },
    {
      setup: [P(1, 3), P(2, 3), P(3, 3), P(1, 4), P(3, 4), P(1, 5), P(2, 5)],
      answer: P(3, 5),
    },
    {
      setup: [P(2, 0), P(3, 0), P(4, 0), P(2, 1), P(4, 1), P(2, 2), P(3, 2)],
      answer: P(4, 2),
    },
  ];
  // pad with captures
  const drafts: Draft[] = boxes.map((b) => ({
    prompt: "두 번째 눈을 만들어 살려 보세요.",
    explanation: "열린 한 칸을 막아 눈을 완성해요.",
    wrongHint: "열린 모서리를 막아요.",
    size,
    setup: b.setup.map((p) => S("B", p.x, p.y)),
    answer: b.answer,
    playAs: "B",
  }));
  const caps = [
    captureOne(size, 3, 3, [P(2, 3), P(3, 2), P(4, 3)], P(3, 4), "눈이 없는 흰 돌을 따내세요."),
    captureOne(size, 4, 4, [P(3, 4), P(4, 3), P(5, 4)], P(4, 5), "약한 흰 돌을 따내세요."),
    captureOne(size, 1, 1, [P(0, 1), P(1, 0)], P(2, 1), "귀 근처 흰 돌을 따내세요."),
    captureOne(size, 5, 2, [P(4, 2), P(5, 1), P(6, 2)], P(5, 3), "오른쪽 흰 돌을 따내세요."),
    captureOne(size, 2, 5, [P(1, 5), P(2, 4), P(3, 5)], P(2, 6), "아래 흰 돌을 따내세요."),
  ];
  return concept(lessonId, title, subtitle, chapter, size, vibe, pad10(drafts, () => caps));
}

const PAIRS7 = [
  { a: P(1, 1), b: P(1, 3), mid: P(1, 2) },
  { a: P(2, 2), b: P(4, 2), mid: P(3, 2) },
  { a: P(3, 1), b: P(3, 3), mid: P(3, 2) },
  { a: P(4, 3), b: P(4, 5), mid: P(4, 4) },
  { a: P(2, 4), b: P(4, 4), mid: P(3, 4) },
  { a: P(0, 2), b: P(2, 2), mid: P(1, 2) },
  { a: P(5, 1), b: P(5, 3), mid: P(5, 2) },
  { a: P(2, 0), b: P(4, 0), mid: P(3, 0) },
  { a: P(1, 5), b: P(3, 5), mid: P(2, 5) },
  { a: P(3, 3), b: P(5, 3), mid: P(4, 3) },
];

const SPOTS7 = [
  { w: P(3, 3), blocks: [P(2, 3), P(3, 2), P(4, 3)], a: P(3, 4) },
  { w: P(2, 2), blocks: [P(1, 2), P(2, 1), P(3, 2)], a: P(2, 3) },
  { w: P(4, 4), blocks: [P(3, 4), P(4, 3), P(5, 4)], a: P(4, 5) },
  { w: P(1, 3), blocks: [P(0, 3), P(1, 2), P(1, 4)], a: P(2, 3) },
  { w: P(5, 2), blocks: [P(4, 2), P(5, 1), P(6, 2)], a: P(5, 3) },
  { w: P(3, 1), blocks: [P(2, 1), P(3, 0), P(4, 1)], a: P(3, 2) },
  { w: P(2, 5), blocks: [P(1, 5), P(2, 4), P(3, 5)], a: P(2, 6) },
  { w: P(4, 5), blocks: [P(3, 5), P(4, 4), P(5, 5)], a: P(4, 6) },
  { w: P(5, 4), blocks: [P(4, 4), P(5, 3), P(6, 4)], a: P(5, 5) },
  { w: P(1, 1), blocks: [P(0, 1), P(1, 0)], a: P(2, 1) },
];

/** fetch-practice TRACKS 와 lessonId 동기화 */
function sproutConcepts(): PracticeConceptDraft[] {
  return [
    captureBank("sprout-capture", "따내기", "단수인 돌을 잡아요", "따내기", 7, "따내기", SPOTS7),
    captureBank("sprout-escape", "달아나기", "단수에서 숨구멍을 늘려요", "따내기", 7, "달아나기", SPOTS7),
    eyeBank("sprout-eyes", "두 눈", "사는 모양을 만들어요", "사활 입문", 7, "두 눈"),
    captureBank("sprout-net", "그물", "달아날 길을 막아요", "사활 입문", 7, "그물", SPOTS7),
    connectBank("sprout-cut", "끊기", "상대를 갈라놓아요", "수법", 7, "끊기", PAIRS7),
    connectBank("sprout-connect", "잇기", "한 덩어리로 만들어요", "수법", 7, "잇기", PAIRS7),
    captureBank("sprout-atari", "단수 치기", "먼저 위협해요", "수법", 7, "단수", SPOTS7),
    eyeBank("sprout-life", "사활 맛보기", "살고 죽는 한 수", "사활 입문", 7, "사활"),
  ];
}

function leafConcepts(): PracticeConceptDraft[] {
  const spots9 = [
    { w: P(4, 4), blocks: [P(3, 4), P(4, 3), P(5, 4)], a: P(4, 5) },
    { w: P(2, 2), blocks: [P(1, 2), P(2, 1), P(3, 2)], a: P(2, 3) },
    { w: P(6, 6), blocks: [P(5, 6), P(6, 5), P(7, 6)], a: P(6, 7) },
    { w: P(1, 4), blocks: [P(0, 4), P(1, 3), P(1, 5)], a: P(2, 4) },
    { w: P(7, 3), blocks: [P(6, 3), P(7, 2), P(8, 3)], a: P(7, 4) },
    { w: P(4, 1), blocks: [P(3, 1), P(4, 0), P(5, 1)], a: P(4, 2) },
    { w: P(3, 7), blocks: [P(2, 7), P(3, 6), P(4, 7)], a: P(3, 8) },
    { w: P(6, 2), blocks: [P(5, 2), P(6, 1), P(7, 2)], a: P(6, 3) },
    { w: P(2, 6), blocks: [P(1, 6), P(2, 5), P(3, 6)], a: P(2, 7) },
    { w: P(5, 5), blocks: [P(4, 5), P(5, 4), P(6, 5)], a: P(5, 6) },
  ];
  const pairs9 = [
    { a: P(2, 2), b: P(2, 4), mid: P(2, 3) },
    { a: P(3, 3), b: P(5, 3), mid: P(4, 3) },
    { a: P(4, 1), b: P(4, 3), mid: P(4, 2) },
    { a: P(6, 4), b: P(6, 6), mid: P(6, 5) },
    { a: P(1, 5), b: P(3, 5), mid: P(2, 5) },
    { a: P(5, 2), b: P(7, 2), mid: P(6, 2) },
    { a: P(2, 6), b: P(4, 6), mid: P(3, 6) },
    { a: P(7, 5), b: P(7, 7), mid: P(7, 6) },
    { a: P(0, 3), b: P(2, 3), mid: P(1, 3) },
    { a: P(4, 4), b: P(6, 4), mid: P(5, 4) },
  ];
  return [
    captureBank("leaf-house", "집 지키기", "울타리를 닫아요", "집과 행마", 9, "집", spots9),
    connectBank("leaf-haengma", "행마", "한 칸·연결", "집과 행마", 9, "행마", pairs9),
    eyeBank("leaf-life", "사활", "9줄 사는 수", "사활", 9, "사활"),
    captureBank("leaf-capture", "따내기", "중급 단수·덩어리", "사활", 9, "따내기", spots9),
    captureBank("leaf-endgame", "끝내기", "작은 이득", "끝내기", 9, "끝내기", spots9),
    captureBank("leaf-tesuji", "수법", "맛있는 한 수", "끝내기", 9, "수법", spots9),
  ];
}

function treeConcepts(): PracticeConceptDraft[] {
  const spots13 = [
    { w: P(6, 6), blocks: [P(5, 6), P(6, 5), P(7, 6)], a: P(6, 7) },
    { w: P(3, 3), blocks: [P(2, 3), P(3, 2), P(4, 3)], a: P(3, 4) },
    { w: P(9, 9), blocks: [P(8, 9), P(9, 8), P(10, 9)], a: P(9, 10) },
    { w: P(2, 6), blocks: [P(1, 6), P(2, 5), P(2, 7)], a: P(3, 6) },
    { w: P(10, 4), blocks: [P(9, 4), P(10, 3), P(11, 4)], a: P(10, 5) },
    { w: P(6, 2), blocks: [P(5, 2), P(6, 1), P(7, 2)], a: P(6, 3) },
    { w: P(4, 10), blocks: [P(3, 10), P(4, 9), P(5, 10)], a: P(4, 11) },
    { w: P(8, 3), blocks: [P(7, 3), P(8, 2), P(9, 3)], a: P(8, 4) },
    { w: P(3, 8), blocks: [P(2, 8), P(3, 7), P(4, 8)], a: P(3, 9) },
    { w: P(7, 7), blocks: [P(6, 7), P(7, 6), P(8, 7)], a: P(7, 8) },
  ];
  const pairs13 = [
    { a: P(3, 3), b: P(3, 5), mid: P(3, 4) },
    { a: P(6, 6), b: P(8, 6), mid: P(7, 6) },
    { a: P(4, 2), b: P(6, 2), mid: P(5, 2) },
    { a: P(9, 4), b: P(9, 6), mid: P(9, 5) },
    { a: P(2, 8), b: P(4, 8), mid: P(3, 8) },
    { a: P(7, 9), b: P(9, 9), mid: P(8, 9) },
    { a: P(5, 4), b: P(5, 6), mid: P(5, 5) },
    { a: P(10, 3), b: P(10, 5), mid: P(10, 4) },
    { a: P(1, 5), b: P(3, 5), mid: P(2, 5) },
    { a: P(6, 10), b: P(8, 10), mid: P(7, 10) },
  ];
  return [
    captureBank("tree-corner", "귀 사활", "귀부터 단단히", "포석·사활", 13, "귀", spots13),
    captureBank("tree-life", "사활", "살고 죽는 갈림길", "포석·사활", 13, "사활", spots13),
    captureBank("tree-invade", "침입", "큰 집에 들어가기", "중반", 13, "침입", spots13),
    captureBank("tree-sente", "선수", "상대가 받아야 하는 수", "중반", 13, "선수", spots13),
    connectBank("tree-connect", "연결", "큰 판에서 잇기", "중반", 13, "잇기", pairs13),
    captureBank("tree-capture", "전투 따내기", "실전 단수", "전투", 13, "따내기", spots13),
  ];
}

function forestConcepts(): PracticeConceptDraft[] {
  const spots19 = [
    { w: P(9, 9), blocks: [P(8, 9), P(9, 8), P(10, 9)], a: P(9, 10) },
    { w: P(3, 3), blocks: [P(2, 3), P(3, 2), P(4, 3)], a: P(3, 4) },
    { w: P(15, 15), blocks: [P(14, 15), P(15, 14), P(16, 15)], a: P(15, 16) },
    { w: P(2, 9), blocks: [P(1, 9), P(2, 8), P(2, 10)], a: P(3, 9) },
    { w: P(16, 4), blocks: [P(15, 4), P(16, 3), P(17, 4)], a: P(16, 5) },
    { w: P(9, 2), blocks: [P(8, 2), P(9, 1), P(10, 2)], a: P(9, 3) },
    { w: P(4, 16), blocks: [P(3, 16), P(4, 15), P(5, 16)], a: P(4, 17) },
    { w: P(12, 6), blocks: [P(11, 6), P(12, 5), P(13, 6)], a: P(12, 7) },
    { w: P(6, 12), blocks: [P(5, 12), P(6, 11), P(7, 12)], a: P(6, 13) },
    { w: P(14, 14), blocks: [P(13, 14), P(14, 13), P(15, 14)], a: P(14, 15) },
  ];
  return [
    captureBank("forest-flow", "큰 판 감각", "같은 규칙, 넓은 판", "실전", 19, "흐름", spots19),
    captureBank("forest-life", "실전 사활", "19줄 급소", "실전", 19, "사활", spots19),
    captureBank("forest-shape", "모양", "좋은 수·나쁜 수", "모양·끝내기", 19, "모양", spots19),
    captureBank("forest-endgame", "끝내기", "이득이 큰 곳", "모양·끝내기", 19, "끝내기", spots19),
    captureBank("forest-capture", "실전 따내기", "큰 판 단수", "전투", 19, "따내기", spots19),
    captureBank("forest-tesuji", "수법", "한 수로 바꾸기", "전투", 19, "수법", spots19),
  ];
}

function seedConcepts(): PracticeConceptDraft[] {
  return [
    seedBreath(),
    seedEdge(),
    seedGroup(),
    seedCaptureQuiz(),
    seedAtari(),
    seedEscape(),
    seedConnect(),
    seedCut(),
    seedDoubleAtari(),
    seedMakeAtari(),
    seedSave(),
    seedEyesIntro(),
    seedTerritory(),
  ];
}

async function writeTrack(
  track: TrackId,
  title: string,
  concepts: PracticeConceptDraft[],
  source = "handcrafted",
) {
  let failed = 0;
  for (const c of concepts) {
    for (const p of c.problems) {
      const err = validate(p, `${c.lessonId}/${p.id}`);
      if (err) {
        console.error("✗", err);
        failed++;
      }
    }
    if (c.problems.length !== 10) {
      console.error(`✗ ${c.lessonId}: ${c.problems.length} problems (need 10)`);
      failed++;
    }
  }
  const bank: PracticeBank & { source?: string } = { track, title, source, concepts };
  await writeFile(join(OUT, `${track}.json`), JSON.stringify(bank, null, 2) + "\n");
  const problems = concepts.reduce((n, c) => n + c.problems.length, 0);
  console.log(`✓ ${track}: ${concepts.length} concepts, ${problems} problems (${source})`);
  return { failed, concepts: concepts.length, problems };
}

async function writeIndex() {
  const tracks: TrackId[] = ["seed", "sprout", "leaf", "tree", "forest"];
  const indexTracks: PracticeIndex["tracks"] = [];
  let totalConcepts = 0;
  let totalProblems = 0;
  for (const t of tracks) {
    try {
      const bank = JSON.parse(await readFile(join(OUT, `${t}.json`), "utf8")) as PracticeBank;
      const concepts = bank.concepts.length;
      const problems = bank.concepts.reduce((n, c) => n + c.problems.length, 0);
      indexTracks.push({ track: t, concepts, problems });
      totalConcepts += concepts;
      totalProblems += problems;
    } catch {
      /* missing */
    }
  }
  const index: PracticeIndex = {
    totalConcepts,
    totalProblems,
    tracks: indexTracks,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(join(OUT, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`\nindex: ${totalConcepts} concepts / ${totalProblems} problems`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const argv = process.argv.slice(2);
  const seedOnly = argv.includes("--seed-only");
  const advancedOnly = argv.includes("--advanced-only");

  const seedSpec = { track: "seed" as const, title: "입문 연습", concepts: seedConcepts(), source: "handcrafted-seed" };
  const advancedSpecs: { track: TrackId; title: string; concepts: PracticeConceptDraft[]; source: string }[] = [
    { track: "sprout", title: "기초 연습", concepts: sproutConcepts(), source: "compose" },
    { track: "leaf", title: "중급 연습", concepts: leafConcepts(), source: "compose" },
    { track: "tree", title: "상급 연습", concepts: treeConcepts(), source: "compose" },
    { track: "forest", title: "실전 연습", concepts: forestConcepts(), source: "compose" },
  ];

  const specs = seedOnly ? [seedSpec] : advancedOnly ? advancedSpecs : [seedSpec, ...advancedSpecs];

  let failed = 0;
  for (const s of specs) {
    const r = await writeTrack(s.track, s.title, s.concepts, s.source);
    failed += r.failed;
  }
  await writeIndex();
  process.exit(failed ? 1 : 0);
}

main();
