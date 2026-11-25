/**
 * 자작 승급 시험 문제 → src/data/exams/*.json
 *   npx tsx --tsconfig tsconfig.json scripts/build-handmade-exams.ts
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applySetup, playMove, resolveAnswer, isAnswer, type Answer } from "../src/lib/board";
import type { Point, StoneColor } from "../src/data/curriculum";
import type { ExamBank, ExamProblem } from "../src/data/exams/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/exams");

type Draft = {
  id: string;
  prompt: string;
  tip?: string;
  explanation?: string;
  setup: { color: StoneColor; at: Point }[];
  size: 7 | 9 | 13 | 19;
  answer: Answer;
  playAs?: StoneColor;
};

type RankSpec = {
  file: string;
  apiRank: string;
  rankDisplay: string;
  problems: Draft[];
};

function P(x: number, y: number): Point {
  return { x, y };
}
function S(color: StoneColor, x: number, y: number) {
  return { color, at: P(x, y) };
}

/** 흰 돌 단수 → 흑이 따냄 (한 점) */
function captureOne(
  size: 7 | 9 | 13 | 19,
  wx: number,
  wy: number,
  around: Point[],
  answer: Point,
  prompt: string,
  tip?: string,
): Draft {
  return {
    id: "",
    prompt,
    tip,
    explanation: "단수인 돌을 따내면 돼요.",
    size,
    setup: [S("W", wx, wy), ...around.map((p) => S("B", p.x, p.y))],
    answer,
    playAs: "B",
  };
}

const RANKS: RankSpec[] = [
  {
    file: "g30",
    apiRank: "30k",
    rankDisplay: "30급",
    problems: [
      captureOne(7, 3, 3, [P(2, 3), P(3, 2), P(4, 3)], P(3, 4), "흰 돌이 단수예요. 따내 보세요.", "남은 숨구멍을 막아요."),
      captureOne(7, 1, 1, [P(0, 1), P(1, 0)], P(2, 1), "귀 근처 흰 돌이 단수예요. 따내세요."),
      captureOne(7, 5, 1, [P(4, 1), P(5, 0), P(6, 1)], P(5, 2), "변의 흰 돌을 따내 보세요."),
      {
        id: "",
        prompt: "흰 돌 숨구멍이 2개예요. 하나를 막아 단수로 만드세요.",
        tip: "어느 쪽이든 한 칸만 막아도 돼요.",
        size: 7,
        setup: [S("W", 3, 3), S("B", 2, 3), S("B", 4, 3)],
        answer: [P(3, 2), P(3, 4)],
        playAs: "B",
        explanation: "숨구멍 2개 → 단수 → 따내기 순서로 익혀요.",
      },
      {
        id: "",
        prompt: "흑부터 두세요. 빛나는 곳이면 어디든 괜찮아요.",
        size: 7,
        setup: [],
        answer: "any",
        playAs: "B",
        explanation: "첫 수는 부담 없이 두어도 돼요.",
      },
      captureOne(7, 2, 4, [P(1, 4), P(2, 3), P(2, 5)], P(3, 4), "가운데 쪽 흰 돌을 따내세요."),
      captureOne(7, 4, 4, [P(3, 4), P(4, 3), P(5, 4)], P(4, 5), "가운데 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흰 돌 두 개 덩어리가 단수예요. 통째로 따내세요.",
        size: 7,
        setup: [
          S("W", 2, 3),
          S("W", 3, 3),
          S("B", 1, 3),
          S("B", 2, 2),
          S("B", 3, 2),
          S("B", 4, 3),
          S("B", 2, 4),
        ],
        answer: P(3, 4),
        playAs: "B",
        explanation: "덩어리도 숨구멍이 0이 되면 한꺼번에 잡혀요.",
      },
      captureOne(7, 0, 3, [P(0, 2), P(1, 3)], P(0, 4), "변에 붙은 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흑 돌을 한 칸 늘여 이어 보세요.",
        tip: "끊기지 않게 옆칸에 두세요.",
        size: 7,
        setup: [S("B", 2, 3), S("B", 4, 3)],
        answer: P(3, 3),
        playAs: "B",
        explanation: "이으면 숨구멍을 같이 써요.",
      },
    ],
  },
  {
    file: "g25",
    apiRank: "25k",
    rankDisplay: "25급",
    problems: [
      captureOne(7, 3, 2, [P(2, 2), P(3, 1), P(4, 2)], P(3, 3), "단수인 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흑이 단수예요. 도망갈 칸에 두세요.",
        tip: "남은 숨구멍 쪽으로 늘어요.",
        size: 7,
        setup: [S("B", 3, 3), S("W", 2, 3), S("W", 3, 2), S("W", 4, 3)],
        answer: P(3, 4),
        playAs: "B",
        explanation: "단수일 때 늘어서 숨구멍을 늘려요.",
      },
      {
        id: "",
        prompt: "오른쪽 아래를 막아 두 번째 눈을 완성하세요.",
        size: 7,
        setup: [
          S("B", 2, 2),
          S("B", 3, 2),
          S("B", 4, 2),
          S("B", 2, 3),
          S("B", 4, 3),
          S("B", 2, 4),
          S("B", 3, 4),
        ],
        answer: P(4, 4),
        playAs: "B",
        explanation: "눈이 두 개면 잡혀도 살아요.",
      },
      {
        id: "",
        prompt: "흰 돌이 아래로 달아나지 못하게 막아 보세요.",
        size: 7,
        setup: [S("W", 3, 3), S("B", 2, 3), S("B", 3, 2), S("B", 4, 3)],
        answer: P(3, 4),
        playAs: "B",
        explanation: "달아날 길을 먼저 막는 게 그물이에요.",
      },
      captureOne(7, 5, 5, [P(4, 5), P(5, 4), P(6, 5)], P(5, 6), "귀 쪽 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흰 두 점 사이를 끊어 보세요.",
        size: 7,
        setup: [S("W", 2, 3), S("W", 4, 3), S("B", 3, 2)],
        answer: P(3, 3),
        playAs: "B",
        explanation: "끊으면 각각 따로 잡으러 갈 수 있어요.",
      },
      {
        id: "",
        prompt: "흑으로 가운데를 지켜 가짜 눈을 막으세요.",
        size: 7,
        setup: [
          S("B", 2, 2),
          S("B", 3, 2),
          S("B", 4, 2),
          S("B", 2, 3),
          S("B", 4, 3),
          S("B", 2, 4),
          S("B", 4, 4),
          S("W", 3, 5),
        ],
        answer: P(3, 3),
        playAs: "B",
        explanation: "가운데를 지키면 눈이 진짜로 남아요.",
      },
      captureOne(7, 1, 5, [P(0, 5), P(1, 4), P(1, 6)], P(2, 5), "변의 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "먼저 단수를 치세요.",
        tip: "축의 첫 수는 단수예요.",
        size: 7,
        setup: [S("W", 2, 2), S("B", 1, 2), S("B", 2, 1)],
        answer: P(3, 2),
        playAs: "B",
        explanation: "단수를 이어 치면 축이 시작돼요.",
      },
      {
        id: "",
        prompt: "흰 돌이 단수예요. 따내세요.",
        size: 7,
        setup: [S("W", 3, 4), S("B", 2, 4), S("B", 3, 3), S("B", 4, 4)],
        answer: P(3, 5),
        playAs: "B",
      },
    ],
  },
  {
    file: "g20",
    apiRank: "20k",
    rankDisplay: "20급",
    problems: [
      {
        id: "",
        prompt: "흰 돌을 단수로 만드세요.",
        size: 7,
        setup: [S("W", 2, 2), S("B", 1, 2), S("B", 2, 1)],
        answer: [P(3, 2), P(2, 3)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "그물로 가두세요. 달아날 길을 막아요.",
        size: 7,
        setup: [S("W", 3, 3), S("B", 2, 2), S("B", 2, 3), S("B", 2, 4), S("B", 3, 2), S("B", 4, 2)],
        answer: P(4, 3),
        playAs: "B",
        explanation: "옆길을 막으면 그물이 돼요.",
      },
      captureOne(7, 4, 2, [P(3, 2), P(4, 1), P(5, 2)], P(4, 3), "단수인 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흑을 이어서 한 덩어리로 만드세요.",
        size: 7,
        setup: [S("B", 2, 2), S("B", 4, 2), S("W", 3, 1), S("W", 3, 3)],
        answer: P(3, 2),
        playAs: "B",
      },
      {
        id: "",
        prompt: "흰 두 점이 단수예요. 따내세요.",
        size: 7,
        setup: [
          S("W", 3, 3),
          S("W", 4, 3),
          S("B", 2, 3),
          S("B", 3, 2),
          S("B", 4, 2),
          S("B", 5, 3),
          S("B", 3, 4),
        ],
        answer: P(4, 4),
        playAs: "B",
      },
      {
        id: "",
        prompt: "흑이 살려면 어디를 둘까요?",
        tip: "두 눈을 만드는 급소예요.",
        size: 7,
        setup: [
          S("B", 2, 2),
          S("B", 3, 2),
          S("B", 4, 2),
          S("B", 2, 3),
          S("B", 4, 3),
          S("B", 2, 4),
          S("B", 3, 4),
          S("W", 1, 2),
          S("W", 1, 3),
          S("W", 1, 4),
          S("W", 5, 2),
          S("W", 5, 3),
          S("W", 5, 4),
        ],
        answer: P(4, 4),
        playAs: "B",
      },
      {
        id: "",
        prompt: "상대를 먼저 단수로 만드세요.",
        size: 7,
        setup: [S("W", 3, 3), S("B", 2, 3), S("B", 3, 2), S("B", 4, 3), S("B", 5, 4)],
        answer: P(3, 4),
        playAs: "B",
      },
      captureOne(7, 0, 0, [P(1, 0)], P(0, 1), "귀의 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "백으로 두 눈을 완성하세요.",
        size: 7,
        playAs: "W",
        setup: [
          S("W", 2, 2),
          S("W", 3, 2),
          S("W", 4, 2),
          S("W", 2, 3),
          S("W", 4, 3),
          S("W", 2, 4),
          S("W", 3, 4),
          S("B", 1, 2),
          S("B", 1, 3),
          S("B", 1, 4),
          S("B", 5, 2),
          S("B", 5, 3),
          S("B", 5, 4),
        ],
        answer: P(4, 4),
        explanation: "한가운데가 두 번째 눈 자리예요.",
      },
      {
        id: "",
        prompt: "끊긴 흑을 한 수로 이으세요.",
        size: 7,
        setup: [S("B", 1, 3), S("B", 3, 3), S("W", 2, 2), S("W", 2, 4)],
        answer: P(2, 3),
        playAs: "B",
      },
    ],
  },
  {
    file: "g15",
    apiRank: "15k",
    rankDisplay: "15급",
    problems: [
      {
        id: "",
        prompt: "왼쪽 위를 이어서 구석 집을 더 단단히 하세요.",
        size: 9,
        setup: [S("B", 1, 1), S("B", 2, 1), S("B", 1, 2)],
        answer: P(2, 2),
        playAs: "B",
      },
      {
        id: "",
        prompt: "흑 집을 더 닫는 수는?",
        size: 9,
        setup: [S("B", 1, 1), S("B", 2, 1), S("B", 3, 1), S("B", 1, 2), S("B", 1, 3)],
        answer: [P(2, 2), P(2, 3), P(3, 2)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "상대 집을 줄이는 침입 급소는?",
        size: 9,
        setup: [S("W", 6, 1), S("W", 7, 1), S("W", 7, 2), S("W", 7, 3), S("B", 5, 2)],
        answer: P(6, 2),
        playAs: "B",
      },
      {
        id: "",
        prompt: "흑에서 날일자로 넓혀 보세요.",
        tip: "한 칸 뛰고 옆칸(날일)이에요.",
        size: 9,
        setup: [S("B", 2, 2)],
        answer: [P(3, 4), P(4, 3), P(1, 4), P(0, 3), P(3, 0), P(4, 1), P(1, 0), P(0, 1)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "한칸 뜀으로 확장하세요.",
        size: 9,
        setup: [S("B", 4, 4)],
        answer: [P(4, 6), P(4, 2), P(6, 4), P(2, 4)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "끊기지 않게 이어 주세요.",
        size: 9,
        setup: [S("B", 3, 3), S("B", 5, 3), S("W", 4, 2), S("W", 4, 4)],
        answer: P(4, 3),
        playAs: "B",
      },
      captureOne(9, 4, 4, [P(3, 4), P(4, 3), P(5, 4)], P(4, 5), "단수인 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "왼쪽 위 집 쪽을 골라 보세요.",
        size: 9,
        setup: [S("B", 1, 1), S("B", 2, 1), S("B", 1, 2), S("W", 7, 7)],
        answer: [P(2, 2), P(3, 1), P(1, 3)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "가운데 흰 돌을 따내 보세요.",
        size: 9,
        setup: [S("W", 4, 4), S("B", 3, 4), S("B", 4, 3), S("B", 5, 4)],
        answer: P(4, 5),
        playAs: "B",
      },
      {
        id: "",
        prompt: "단수인 흰 돌을 따내세요.",
        size: 9,
        setup: [S("W", 2, 2), S("B", 1, 2), S("B", 2, 1), S("B", 3, 2)],
        answer: P(2, 3),
        playAs: "B",
      },
    ],
  },
  {
    file: "g10",
    apiRank: "10k",
    rankDisplay: "10급",
    problems: [
      {
        id: "",
        prompt: "왼쪽 위 화점 근처에 첫 수를 두어 보세요.",
        size: 13,
        setup: [],
        answer: [P(3, 3), P(2, 3), P(3, 2), P(4, 3), P(3, 4)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "네 화점 중 한곳에 두세요.",
        size: 13,
        setup: [],
        answer: [P(3, 3), P(3, 9), P(9, 3), P(9, 9)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "흑이 이미 한 구석을 잡았어요. 다른 구석으로!",
        size: 13,
        setup: [S("B", 3, 3)],
        answer: [P(3, 9), P(9, 3), P(9, 9), P(2, 9), P(9, 2)],
        playAs: "B",
      },
      captureOne(13, 6, 6, [P(5, 6), P(6, 5), P(7, 6)], P(6, 7), "흰 돌이 단수예요. 따내는 수는 강한 선수예요."),
      {
        id: "",
        prompt: "가장 급한 수(단수 처리)를 두세요.",
        tip: "내 돌이 단수예요.",
        size: 13,
        setup: [S("B", 5, 5), S("W", 4, 5), S("W", 5, 4), S("W", 6, 5)],
        answer: P(5, 6),
        playAs: "B",
      },
      {
        id: "",
        prompt: "가운데를 지키면 두 눈으로 살 수 있어요.",
        size: 13,
        setup: [
          S("B", 5, 5),
          S("B", 6, 5),
          S("B", 7, 5),
          S("B", 5, 6),
          S("B", 7, 6),
          S("B", 5, 7),
          S("B", 6, 7),
          S("B", 7, 7),
        ],
        answer: P(6, 6),
        playAs: "B",
      },
      {
        id: "",
        prompt: "흰 진영 안쪽 빈칸에 흑으로 들어가 보세요.",
        size: 13,
        setup: [S("W", 9, 9), S("W", 10, 9), S("W", 9, 10), S("W", 11, 10), S("W", 10, 11)],
        answer: [P(10, 10), P(11, 9)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "끊긴 흑을 이으세요.",
        size: 13,
        setup: [S("B", 4, 6), S("B", 6, 6), S("W", 5, 5), S("W", 5, 7)],
        answer: P(5, 6),
        playAs: "B",
      },
      captureOne(13, 2, 2, [P(1, 2), P(2, 1), P(3, 2)], P(2, 3), "단수인 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흑 경계를 한 줄 미세요.",
        size: 13,
        setup: [S("B", 2, 2), S("B", 3, 2), S("B", 4, 2), S("W", 2, 4), S("W", 3, 4), S("W", 4, 4)],
        answer: [P(2, 3), P(3, 3), P(4, 3)],
        playAs: "B",
      },
    ],
  },
  {
    file: "g7",
    apiRank: "7k",
    rankDisplay: "7급",
    problems: [
      {
        id: "",
        prompt: "흑을 살리려면?",
        size: 13,
        setup: [
          S("B", 5, 5),
          S("B", 6, 5),
          S("B", 7, 5),
          S("B", 5, 6),
          S("B", 7, 6),
          S("B", 5, 7),
          S("B", 6, 7),
        ],
        answer: P(7, 7),
        playAs: "B",
      },
      {
        id: "",
        prompt: "백이 두 눈을 만들기 전, 살릴 급소를 백으로 두세요.",
        size: 13,
        playAs: "W",
        setup: [
          S("W", 5, 5),
          S("W", 6, 5),
          S("W", 7, 5),
          S("W", 5, 6),
          S("W", 7, 6),
          S("W", 5, 7),
          S("W", 6, 7),
          S("W", 7, 7),
          S("B", 4, 5),
          S("B", 4, 6),
          S("B", 4, 7),
          S("B", 8, 5),
          S("B", 8, 6),
          S("B", 8, 7),
        ],
        answer: P(6, 6),
      },
      {
        id: "",
        prompt: "흰 집 쪽에 침투하세요.",
        size: 13,
        setup: [S("W", 8, 2), S("W", 9, 2), S("W", 10, 2), S("W", 10, 3), S("W", 10, 4)],
        answer: [P(9, 3), P(8, 3), P(9, 4)],
        playAs: "B",
      },
      captureOne(13, 7, 7, [P(6, 7), P(7, 6), P(8, 7)], P(7, 8), "선수 따내기 — 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "그물로 흰 돌을 가두세요.",
        size: 13,
        setup: [S("W", 6, 6), S("B", 5, 5), S("B", 5, 6), S("B", 5, 7), S("B", 6, 5), S("B", 7, 5)],
        answer: P(7, 6),
        playAs: "B",
      },
      {
        id: "",
        prompt: "축의 첫 단수를 두세요.",
        size: 13,
        setup: [S("W", 4, 4), S("B", 3, 4), S("B", 4, 3)],
        answer: P(5, 4),
        playAs: "B",
      },
      {
        id: "",
        prompt: "가짜 눈을 지키세요. 가운데를 두세요.",
        size: 13,
        setup: [
          S("B", 5, 5),
          S("B", 6, 5),
          S("B", 7, 5),
          S("B", 5, 6),
          S("B", 7, 6),
          S("B", 5, 7),
          S("B", 7, 7),
          S("W", 6, 8),
        ],
        answer: P(6, 6),
        playAs: "B",
      },
      {
        id: "",
        prompt: "흑을 이으세요.",
        size: 13,
        setup: [S("B", 3, 5), S("B", 5, 5), S("W", 4, 4), S("W", 4, 6)],
        answer: P(4, 5),
        playAs: "B",
      },
      {
        id: "",
        prompt: "왼쪽 위 경계를 밀어 보세요.",
        size: 13,
        setup: [S("B", 2, 2), S("B", 3, 2), S("B", 4, 2), S("W", 2, 4), S("W", 3, 4), S("W", 4, 4)],
        answer: [P(2, 3), P(3, 3), P(4, 3)],
        playAs: "B",
      },
      captureOne(13, 1, 1, [P(0, 1), P(1, 0)], P(2, 1), "귀 근처 단수를 따내세요."),
    ],
  },
  {
    file: "g5",
    apiRank: "5k",
    rankDisplay: "5급",
    problems: [
      {
        id: "",
        prompt: "오른쪽 아래 화점 근처에 두어 보세요.",
        size: 19,
        setup: [],
        answer: [P(15, 15), P(14, 15), P(15, 14), P(16, 15), P(15, 16)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "포석에 어울리는 첫 수는?",
        size: 19,
        setup: [],
        answer: [P(3, 3), P(3, 15), P(15, 3), P(15, 15), P(2, 3), P(3, 2)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "흰 돌이 변으로 기대지 못하게 막아 보세요.",
        size: 19,
        setup: [S("W", 3, 3), S("B", 2, 3), S("B", 3, 2)],
        answer: [P(3, 4), P(4, 3)],
        playAs: "B",
      },
      captureOne(19, 9, 9, [P(8, 9), P(9, 8), P(10, 9)], P(9, 10), "흰 돌의 활로를 줄이세요 — 따내세요."),
      {
        id: "",
        prompt: "흑 화점에서 날일자로 확장해 보세요.",
        size: 19,
        setup: [S("B", 3, 3)],
        answer: [P(4, 5), P(5, 4), P(2, 5), P(1, 4), P(4, 1), P(5, 2), P(2, 1), P(1, 2)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "한칸 뜀으로 확장하세요.",
        size: 19,
        setup: [S("B", 9, 9)],
        answer: [P(9, 11), P(9, 7), P(11, 9), P(7, 9)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "끊긴 흑을 이으세요.",
        size: 19,
        setup: [S("B", 8, 9), S("B", 10, 9), S("W", 9, 8), S("W", 9, 10)],
        answer: P(9, 9),
        playAs: "B",
      },
      {
        id: "",
        prompt: "왼쪽 위 경계를 밀어 보세요.",
        size: 19,
        setup: [S("B", 2, 2), S("B", 3, 2), S("B", 4, 2), S("W", 2, 4), S("W", 3, 4), S("W", 4, 4)],
        answer: [P(2, 3), P(3, 3), P(4, 3)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "흑 경계를 한 줄 미세요.",
        size: 19,
        setup: [S("B", 14, 14), S("B", 15, 14), S("B", 16, 14), S("W", 14, 16), S("W", 15, 16), S("W", 16, 16)],
        answer: [P(14, 15), P(15, 15), P(16, 15)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "백으로 두 눈 급소를 두세요.",
        size: 19,
        playAs: "W",
        setup: [
          S("W", 8, 8),
          S("W", 9, 8),
          S("W", 10, 8),
          S("W", 8, 9),
          S("W", 10, 9),
          S("W", 8, 10),
          S("W", 9, 10),
          S("W", 10, 10),
          S("B", 7, 8),
          S("B", 7, 9),
          S("B", 7, 10),
          S("B", 11, 8),
          S("B", 11, 9),
          S("B", 11, 10),
        ],
        answer: P(9, 9),
      },
    ],
  },
  {
    file: "g3",
    apiRank: "3k",
    rankDisplay: "3급",
    problems: [
      {
        id: "",
        prompt: "형세에 맞는 첫 화점 수는?",
        size: 19,
        setup: [],
        answer: [P(3, 3), P(3, 15), P(15, 3), P(15, 15)],
        playAs: "B",
      },
      captureOne(19, 10, 10, [P(9, 10), P(10, 9), P(11, 10)], P(10, 11), "급소 따내기 — 단수인 흰 돌을 따내세요."),
      {
        id: "",
        prompt: "흑이 단수예요. 먼저 도망가세요.",
        size: 19,
        setup: [S("B", 6, 6), S("W", 5, 6), S("W", 6, 5), S("W", 7, 6)],
        answer: P(6, 7),
        playAs: "B",
      },
      {
        id: "",
        prompt: "그물로 가두세요.",
        size: 19,
        setup: [S("W", 9, 9), S("B", 8, 8), S("B", 8, 9), S("B", 8, 10), S("B", 9, 8), S("B", 10, 8)],
        answer: P(10, 9),
        playAs: "B",
      },
      {
        id: "",
        prompt: "두 눈을 완성하세요.",
        size: 19,
        setup: [
          S("B", 8, 8),
          S("B", 9, 8),
          S("B", 10, 8),
          S("B", 8, 9),
          S("B", 10, 9),
          S("B", 8, 10),
          S("B", 9, 10),
        ],
        answer: P(10, 10),
        playAs: "B",
      },
      {
        id: "",
        prompt: "침투 급소를 두세요.",
        size: 19,
        setup: [S("W", 14, 2), S("W", 15, 2), S("W", 16, 2), S("W", 16, 3), S("W", 16, 4), S("B", 13, 3)],
        answer: [P(15, 3), P(14, 3)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "끊긴 흑을 이으세요.",
        size: 19,
        setup: [S("B", 7, 10), S("B", 9, 10), S("W", 8, 9), S("W", 8, 11)],
        answer: P(8, 10),
        playAs: "B",
      },
      {
        id: "",
        prompt: "끝내기 — 경계를 미세요.",
        size: 19,
        setup: [S("B", 3, 3), S("B", 4, 3), S("B", 5, 3), S("W", 3, 5), S("W", 4, 5), S("W", 5, 5)],
        answer: [P(3, 4), P(4, 4), P(5, 4)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "축의 첫 단수를 치세요.",
        size: 19,
        setup: [S("W", 5, 5), S("B", 4, 5), S("B", 5, 4)],
        answer: P(6, 5),
        playAs: "B",
      },
      {
        id: "",
        prompt: "백으로 살릴 급소를 두세요.",
        size: 19,
        playAs: "W",
        setup: [
          S("W", 10, 10),
          S("W", 11, 10),
          S("W", 12, 10),
          S("W", 10, 11),
          S("W", 12, 11),
          S("W", 10, 12),
          S("W", 11, 12),
          S("W", 12, 12),
          S("B", 9, 10),
          S("B", 9, 11),
          S("B", 9, 12),
          S("B", 13, 10),
          S("B", 13, 11),
          S("B", 13, 12),
        ],
        answer: P(11, 11),
      },
    ],
  },
  {
    file: "g1",
    apiRank: "1k",
    rankDisplay: "1급",
    problems: [
      {
        id: "",
        prompt: "실전 첫 수 — 화점에 두세요.",
        size: 19,
        setup: [],
        answer: [P(3, 3), P(3, 15), P(15, 3), P(15, 15)],
        playAs: "B",
      },
      captureOne(19, 11, 11, [P(10, 11), P(11, 10), P(12, 11)], P(11, 12), "단수를 따내 선수를 잡으세요."),
      {
        id: "",
        prompt: "흑 단수 — 도망가세요.",
        size: 19,
        setup: [S("B", 8, 8), S("W", 7, 8), S("W", 8, 7), S("W", 9, 8)],
        answer: P(8, 9),
        playAs: "B",
      },
      {
        id: "",
        prompt: "그물로 가두세요.",
        size: 19,
        setup: [S("W", 10, 10), S("B", 9, 9), S("B", 9, 10), S("B", 9, 11), S("B", 10, 9), S("B", 11, 9)],
        answer: P(11, 10),
        playAs: "B",
      },
      {
        id: "",
        prompt: "두 눈 급소를 두세요.",
        size: 19,
        setup: [
          S("B", 9, 9),
          S("B", 10, 9),
          S("B", 11, 9),
          S("B", 9, 10),
          S("B", 11, 10),
          S("B", 9, 11),
          S("B", 10, 11),
        ],
        answer: P(11, 11),
        playAs: "B",
      },
      {
        id: "",
        prompt: "침투하세요.",
        size: 19,
        setup: [S("W", 15, 3), S("W", 16, 3), S("W", 17, 3), S("W", 17, 4), S("W", 17, 5)],
        answer: [P(16, 4), P(15, 4), P(16, 5)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "이어서 형태를 잡으세요.",
        size: 19,
        setup: [S("B", 6, 9), S("B", 8, 9), S("W", 7, 8), S("W", 7, 10)],
        answer: P(7, 9),
        playAs: "B",
      },
      {
        id: "",
        prompt: "끝내기 경계를 미세요.",
        size: 19,
        setup: [S("B", 12, 12), S("B", 13, 12), S("B", 14, 12), S("W", 12, 14), S("W", 13, 14), S("W", 14, 14)],
        answer: [P(12, 13), P(13, 13), P(14, 13)],
        playAs: "B",
      },
      {
        id: "",
        prompt: "축 단수를 치세요.",
        size: 19,
        setup: [S("W", 7, 7), S("B", 6, 7), S("B", 7, 6)],
        answer: P(8, 7),
        playAs: "B",
      },
      {
        id: "",
        prompt: "백으로 살 급소를 두세요.",
        size: 19,
        playAs: "W",
        setup: [
          S("W", 12, 12),
          S("W", 13, 12),
          S("W", 14, 12),
          S("W", 12, 13),
          S("W", 14, 13),
          S("W", 12, 14),
          S("W", 13, 14),
          S("W", 14, 14),
          S("B", 11, 12),
          S("B", 11, 13),
          S("B", 11, 14),
          S("B", 15, 12),
          S("B", 15, 13),
          S("B", 15, 14),
        ],
        answer: P(13, 13),
      },
    ],
  },
];

function validate(draft: Draft, label: string): string | null {
  const board = applySetup(draft.size, draft.setup);
  // setup stones must not already be captured (0 liberties)
  for (const s of draft.setup) {
    if (board[s.at.y][s.at.x] !== s.color) return `${label}: setup stone missing at ${s.at.x},${s.at.y}`;
  }
  for (const s of draft.setup) {
    const next = playMove(board, s.at, s.color); // occupied → null; use liberties via playMove on empty? 
    void next;
  }
  // check each stone has liberties by trying: if group has 0 libs, illegal setup
  const seen = new Set<string>();
  for (const s of draft.setup) {
    const k = `${s.at.x},${s.at.y}`;
    if (seen.has(k)) continue;
    // flood
    const color = board[s.at.y][s.at.x];
    if (!color) continue;
    const stack = [s.at];
    const stones: Point[] = [];
    const libs = new Set<string>();
    const vis = new Set<string>();
    vis.add(k);
    while (stack.length) {
      const cur = stack.pop()!;
      stones.push(cur);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= draft.size || ny >= draft.size) continue;
        const c = board[ny][nx];
        if (!c) libs.add(`${nx},${ny}`);
        else if (c === color) {
          const kk = `${nx},${ny}`;
          if (!vis.has(kk)) {
            vis.add(kk);
            stack.push({ x: nx, y: ny });
          }
        }
      }
    }
    stones.forEach((p) => seen.add(`${p.x},${p.y}`));
    if (libs.size === 0) return `${label}: dead group in setup at ${s.at.x},${s.at.y}`;
  }

  const playAs = draft.playAs ?? "B";
  const resolved = resolveAnswer(draft.answer, board);
  const candidates =
    resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
  const legal = candidates.filter((p) => isAnswer(p, resolved, board) && playMove(board, p, playAs));
  if (!legal.length) return `${label}: no legal answer — ${draft.prompt}`;
  return null;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  let total = 0;
  const indexRanks: { file: string; apiRank: string; count: number }[] = [];
  let failed = 0;

  for (const rank of RANKS) {
    const problems: ExamProblem[] = [];
    rank.problems.forEach((d, i) => {
      const id = `${rank.file}-${String(i + 1).padStart(2, "0")}`;
      // skip known-broken placeholders by validating
      const err = validate(d, id);
      if (err) {
        console.error("✗", err);
        failed++;
        return;
      }
      problems.push({
        id,
        sourceId: `handmade-${id}`,
        apiRank: rank.apiRank,
        rankDisplay: rank.rankDisplay,
        prompt: d.prompt,
        tip: d.tip,
        explanation: d.explanation,
        setup: d.setup,
        size: d.size,
        answer: d.answer,
        playAs: d.playAs ?? "B",
      });
    });

    // pad / ensure 10 — only write if we have issues we'll fix
    const bank: ExamBank = {
      meta: {
        apiRank: rank.apiRank,
        file: rank.file,
        count: problems.length,
        fetchedAt: new Date().toISOString(),
        source: "handmade",
      },
      problems,
    };
    await writeFile(join(OUT, `${rank.file}.json`), JSON.stringify(bank, null, 2) + "\n");
    console.log(`✓ ${rank.file}: ${problems.length} problems`);
    total += problems.length;
    indexRanks.push({ file: `${rank.file}.json`, apiRank: rank.apiRank, count: problems.length });
  }

  const index = {
    seedUser: "hansu-handmade-v1",
    total,
    apiCallsUsed: 0,
    ranks: indexRanks,
    updatedAt: new Date().toISOString(),
    note: "자작 승급 시험 (급수당 최대 10문제). RapidAPI 시드는 fetch:exams.",
  };
  await writeFile(join(OUT, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`\ntotal ${total}, failed ${failed}`);
  process.exit(failed ? 1 : 0);
}

main();
