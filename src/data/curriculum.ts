import type { Answer } from "@/lib/board";
import { getRank, type RankId, type TrackId } from "@/lib/ranks";
import { sprout, leaf, tree, forest } from "./tracks";

export type StoneColor = "B" | "W";

export interface Point {
  x: number;
  y: number;
}

export interface LessonStep {
  /** 메인 설명. 쉽고 짧게. */
  text: string;
  /** 보조 설명 */
  tip?: string;
  /** 판을 이 모양으로 새로 깐다. 없으면 직전 단계의 판(내가 둔 돌 포함)을 그대로 이어 쓴다. */
  setup?: { color: StoneColor; at: Point }[];
  /** 이 단계에서만 보여 줄 판 크기 (19줄 → 작은 판 소개용) */
  size?: 7 | 9 | 13 | 19;
  /** 유저가 두어야 할 자리. "any"는 빈 자리 아무 곳, libertiesOf는 그 돌 덩어리의 숨구멍 */
  answer?: Answer;
  /** 정답 돌 색. 기본 흑 */
  playAs?: StoneColor;
  /** 하이라이트. 빈 배열이면 정답 위치를 숨긴다. */
  highlight?: Point[];
  feedback?: string;
  /** 틀렸을 때 한 줄 */
  wrongHint?: string;
  cta?: string;
  /** 유저가 둔 뒤 상대가 자동으로 받아 두는 자리 */
  reply?: (played: Point) => Point;
  /** 풀고 나면 버튼 없이 다음 단계로 넘어간다 */
  autoNext?: boolean;
  /** 판 아래에 흑·백 집 수를 보여 준다 */
  score?: boolean;
  /** 예/아니요로 묻는다. 아니요면 noGoto 단계로, 예면 yesGoto(없으면 다음) 단계로 */
  ask?: { yes: string; no: string; yesGoto?: number; noGoto: number };
  /** 버튼을 누르면 다음 단계 대신 이 단계로 간다 */
  goto?: number;
  /** 바둑판 대신 보여 줄 그림 */
  visual?: "roadmap";
  /** 단계에 들어오면 이 수들이 차례로 자동으로 놓인다 */
  autoplay?: { color: StoneColor; at: Point }[];
}

/** 개념 세션의 문제. 맞출 때까지 진행하고, 한 번이라도 틀리면 오답 복습 큐에 들어간다. */
export interface Problem {
  id: string;
  prompt: string;
  tip?: string;
  /** 오답 복습 때 짧게 보여 줄 해설 */
  explanation?: string;
  setup?: { color: StoneColor; at: Point }[];
  size?: 7 | 9 | 13 | 19;
  answer: Answer;
  playAs?: StoneColor;
  highlight?: Point[];
  feedback?: string;
  wrongHint?: string;
  reply?: (played: Point) => Point;
  autoNext?: boolean;
  libertiesFor?: StoneColor | "both";
}

export interface LessonSession {
  concept: LessonStep[];
  example: LessonStep[];
  problems: Problem[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  boardSize: 7 | 9 | 13 | 19;
  minutes: number;
  vibe: string;
  /** 앞 레슨에서 이 레슨으로 넘어올 때 하는 말 */
  bridge?: string;
  /** 돌 위에 숨구멍 수를 보여 줄 색 */
  libertiesFor?: StoneColor | "both";
  /** 끝나면 정리 화면 없이 다음 레슨으로 바로 이어진다 */
  flowNext?: boolean;
  /** 레거시 선형 스텝. session이 있으면 플레이어는 session을 우선한다. */
  steps: LessonStep[];
  /** 개념 → 예시 → 문제 → 오답 복습 */
  session?: LessonSession;
}

export interface Chapter {
  id: string;
  title: string;
  blurb: string;
  lessons: Lesson[];
}

export interface TrackCurriculum {
  track: TrackId;
  title: string;
  chapters: Chapter[];
}

/** 7줄 천원 — 옛 5줄 중심(2,2)에서 옮김 */
const C = { x: 3, y: 3 };
/** 첫 판: 7줄 가운데를 가로로 끝까지 막아 판을 둘로 나눔 */
const GAME_ROW = [0, 1, 2, 3, 4, 5, 6].map((x) => ({ x, y: 3 }));
const GAME_MOVE = {
  answer: GAME_ROW,
  reply: (p: Point) => ({ x: p.x, y: 4 }),
  autoNext: true,
  wrongHint: "빛나는 점 중에서 골라 보세요.",
};
const AROUND_C = [
  { x: 3, y: 2 },
  { x: 2, y: 3 },
  { x: 4, y: 3 },
  { x: 3, y: 4 },
];
const BLACK_CORNER = [
  { color: "B" as const, at: { x: 2, y: 0 } },
  { color: "B" as const, at: { x: 2, y: 1 } },
  { color: "B" as const, at: { x: 1, y: 2 } },
  { color: "B" as const, at: { x: 0, y: 2 } },
];
const WHITE_CORNER = [
  { color: "W" as const, at: { x: 4, y: 6 } },
  { color: "W" as const, at: { x: 4, y: 5 } },
  { color: "W" as const, at: { x: 5, y: 4 } },
  { color: "W" as const, at: { x: 6, y: 4 } },
];

const seed: TrackCurriculum = {
  track: "seed",
  title: "규칙 · 7줄 판",
  chapters: [
    {
      id: "seed-big-picture",
      title: "바둑이 뭐예요?",
      blurb: "생각보다 단순한 규칙부터",
      lessons: [
        {
          id: "seed-first-game",
          title: "첫 판",
          subtitle: "몰라도 괜찮아요, 일단 두어 보기",
          boardSize: 7,
          minutes: 2,
          vibe: "어렵지 않은 시작",
          steps: [
            {
              text: "흑부터 둬요. 빛나는 점 중 아무 데나 눌러 보세요.",
              tip: "7줄 판이에요. 가운데 줄을 가로로 이으면 판이 둘로 나뉘어요.",
              ...GAME_MOVE,
            },
            {
              text: "백도 한 수 뒀어요. 다시 흑 차례예요.",
              tip: "흑과 백이 번갈아 두는 게 전부예요. 간단하죠?",
              ...GAME_MOVE,
            },
            {
              text: "흑 돌이 한 줄로 이어지고 있어요.",
              tip: "한번 놓은 돌은 움직이지 않아요.",
              ...GAME_MOVE,
            },
            {
              text: "좋아요, 계속 이어요.",
              tip: "돌은 칸 안이 아니라 선이 만나는 점에 놓아요.",
              ...GAME_MOVE,
            },
            {
              text: "양끝까지 막아 보세요.",
              tip: "7줄이니 가로로 일곱 점이 한 줄이에요.",
              ...GAME_MOVE,
            },
            {
              text: "거의 다 왔어요. 남은 빛나는 점을 이어 주세요.",
              ...GAME_MOVE,
            },
            {
              text: "마지막 한 수예요. 줄을 끝까지 막아 보세요.",
              ...GAME_MOVE,
            },
            {
              text: "판이 둘로 나뉘었어요. 흑이 이겼어요!",
              tip: "칠해진 칸이 각자 차지한 땅이에요.",
              score: true,
              cta: "이긴 이유 보기",
            },
            {
              text: "흑이 7줄을 가로막아 위쪽 21칸을 감쌌어요. 이렇게 돌로 둘러싼 땅을 ‘집’이라고 해요.",
              highlight: [0, 1, 2].flatMap((y) => [0, 1, 2, 3, 4, 5, 6].map((x) => ({ x, y }))),
              score: true,
              cta: "백 땅 보기",
            },
            {
              text: "백은 아래쪽 14칸뿐이에요. 바둑은 이렇게 집을 더 많이 지은 쪽이 이겨요.",
              highlight: [5, 6].flatMap((y) => [0, 1, 2, 3, 4, 5, 6].map((x) => ({ x, y }))),
              score: true,
              cta: "진짜 바둑 알아보기",
            },
          ],
        },
        {
          id: "seed-read-ahead",
          title: "진짜 바둑은 수 싸움",
          subtitle: "상대의 다음 수를 읽어요",
          boardSize: 7,
          minutes: 2,
          vibe: "수 읽기",
          bridge: "방금은 연습이라 줄만 쭉 그었죠. 진짜 바둑은 훨씬 치열해요.",
          flowNext: true,
          steps: [
            {
              text: "오목 해 본 적 있죠? 같은 색 돌 다섯 개를 먼저 한 줄로 놓으면 이겨요.",
              tip: "흑과 백이 번갈아 두는 걸 잠깐 볼게요.",
              size: 9,
              setup: [],
              autoplay: [
                { color: "B", at: { x: 4, y: 4 } },
                { color: "W", at: { x: 4, y: 3 } },
                { color: "B", at: { x: 3, y: 4 } },
                { color: "W", at: { x: 5, y: 5 } },
                { color: "B", at: { x: 5, y: 4 } },
              ],
              cta: "다음으로",
            },
            {
              text: "흑이 셋을 이었어요. 백은 흑이 몇 수 뒤에 다섯을 만들 걸 읽고, 미리 한쪽 끝을 막아요.",
              size: 9,
              autoplay: [{ color: "W", at: { x: 6, y: 4 } }],
              cta: "다음으로",
            },
            {
              text: "흑이 넷을 만들자, 백은 남은 끝까지 막아요. 오목은 이렇게 서로 몇 수 뒤를 예측하면서 둬요.",
              size: 9,
              autoplay: [
                { color: "B", at: { x: 2, y: 4 } },
                { color: "W", at: { x: 1, y: 4 } },
              ],
              cta: "바둑과 비교하기",
            },
            {
              text: "바둑도 마찬가지예요. 그런데 훨씬 더 치열해요.",
              tip: "오목은 줄 하나만 막으면 되지만, 바둑은 판 전체의 땅을 두고 서로 파고들어요.",
              setup: [
                { color: "B", at: { x: 0, y: 2 } },
                { color: "B", at: { x: 1, y: 2 } },
                { color: "B", at: { x: 2, y: 2 } },
                { color: "W", at: { x: 3, y: 1 } },
              ],
              highlight: [{ x: 3, y: 1 }],
              cta: "다음으로",
            },
            {
              text: "바둑이 대충 어떤 게임인지 알 것 같나요?",
              tip: "번갈아 두면서, 상대의 수를 읽고, 땅을 더 많이 차지하는 게임이에요.",
              ask: { yes: "네, 이해했어요", no: "아니요, 아직 이해 못 했어요", yesGoto: 7, noGoto: 5 },
            },
            {
              text: "괜찮아요, 다시 볼게요. 아까 첫 판에서 흑과 백은 돌로 줄을 그어 판을 나눠 가졌어요.",
              setup: [
                ...[0, 1, 2, 3, 4, 5, 6].map((x) => ({ color: "B" as const, at: { x, y: 3 } })),
                ...[0, 1, 2, 3, 4, 5, 6].map((x) => ({ color: "W" as const, at: { x, y: 4 } })),
              ],
              score: true,
              cta: "계속 보기",
            },
            {
              text: "흑이 땅을 더 넓게 가져서 이겼죠. 그런데 진짜 상대는 내 땅을 가만두지 않아요. 그래서 서로 다음 수를 읽으며 땅을 다퉈요.",
              tip: "땅을 더 많이 지킨 쪽이 이겨요.",
              cta: "다시 생각해 보기",
              goto: 4,
            },
            {
              text: "좋아요! 집 짓기 전에, 더 쉬운 규칙부터 짚고 갈게요.",
              tip: "집을 지키려면 돌이 언제 잡히는지만 알면 돼요. 그래서 이 순서로 배워요.",
              visual: "roadmap",
              cta: "배울 순서 보기",
            },
            {
              text: "돌 따먹기부터 해요. 이해하기 쉽고, 바둑의 핵심 규칙이에요.",
              tip: "돌이 숨 쉬는 자리, ‘활로’만 알면 따먹기는 금방이에요.",
              setup: [{ color: "W", at: C }],
              cta: "따먹기 시작하기",
            },
          ],
        },
      ],
    },
    {
      id: "seed-liberty-capture",
      title: "숨구멍과 따내기",
      blurb: "돌이 숨 쉬는 법, 잡히는 법",
      lessons: [
        {
          id: "seed-breath",
          title: "돌도 숨을 쉬어요",
          subtitle: "숨구멍을 막으면 따낼 수 있어요",
          boardSize: 7,
          minutes: 4,
          vibe: "숨구멍과 따내기",
          libertiesFor: "W",
          bridge: "돌 하나로 천천히 볼게요.",
          steps: [],
          session: {
            concept: [
              {
                text: "바둑에서 ‘옆’은 선으로 바로 이어진 위·아래·왼쪽·오른쪽, 네 곳이에요.",
                tip: "대각선은 선으로 이어져 있지 않아서 옆이 아니에요.",
                setup: [{ color: "W", at: C }],
                highlight: AROUND_C,
                cta: "숨구멍 알아보기",
              },
              {
                text: "이 네 곳이 비어 있으면 돌이 숨을 쉬어요. 돌 위의 숫자 4가 숨구멍 수예요.",
                tip: "숨구멍은 바둑 용어로 ‘활로’라고 해요. 다 막히면 돌은 잡혀요.",
                highlight: AROUND_C,
                cta: "예시 보기",
              },
            ],
            example: [
              {
                text: "흑으로 흰 돌 숨구멍을 하나씩 막아 볼게요. 먼저 하나!",
                setup: [{ color: "W", at: C }],
                answer: { libertiesOf: C },
                autoNext: true,
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
              {
                text: "3개 남았어요. 하나 더 막아 보세요.",
                answer: { libertiesOf: C },
                autoNext: true,
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
              {
                text: "2개 남았어요. 하나 더!",
                answer: { libertiesOf: C },
                autoNext: true,
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
              {
                text: "이제 단수예요. 마지막 숨구멍을 막아 따내 보세요.",
                answer: { libertiesOf: C },
                feedback: "따냈어요! 숨을 못 쉬게 된 돌은 판에서 들어내요.",
                wrongHint: "남은 숨구멍은 하나뿐이에요.",
              },
            ],
            problems: [
              {
                id: "breath-p1",
                prompt: "흰 돌이 단수예요. 따내 보세요.",
                explanation: "숨구멍이 하나 남았을 때 그 자리를 막으면 따내요.",
                setup: [
                  { color: "W", at: C },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                answer: { libertiesOf: C },
                highlight: [],
                autoNext: true,
                wrongHint: "숫자가 1인 돌의 남은 빈자리를 찾아요.",
              },
              {
                id: "breath-p2",
                prompt: "숨구멍이 두 개예요. 하나를 막아 보세요.",
                explanation: "옆(상하좌우) 빈자리가 숨구멍이에요.",
                setup: [
                  { color: "W", at: C },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                ],
                answer: { libertiesOf: C },
                highlight: [],
                autoNext: true,
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
              {
                id: "breath-p3",
                prompt: "가운데 흰 돌의 숨구멍을 하나 막아 보세요.",
                explanation: "가운데 돌은 숨구멍이 최대 4개예요.",
                setup: [{ color: "W", at: C }],
                answer: { libertiesOf: C },
                highlight: [],
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
            ],
          },
        },
        {
          id: "seed-edge-breath",
          title: "가장자리는 숨이 적어요",
          subtitle: "가운데 4 · 변 3 · 귀 2",
          boardSize: 7,
          minutes: 4,
          vibe: "자리마다 다른 숨구멍",
          libertiesFor: "W",
          bridge: "같은 돌이라도 어디에 있느냐에 따라 숨구멍 수가 달라요.",
          steps: [],
          session: {
            concept: [
              {
                text: "가운데는 숨구멍 4개, 변은 3개, 귀는 2개예요.",
                tip: "판 끝이 벽을 대신해서, 자리마다 숨구멍 수가 달라요.",
                setup: [{ color: "W", at: { x: 2, y: 0 } }],
                highlight: [
                  { x: 1, y: 0 },
                  { x: 3, y: 0 },
                  { x: 2, y: 1 },
                ],
                cta: "예시 보기",
              },
            ],
            example: [
              {
                text: "변의 돌이에요. 숨구멍을 하나씩 막아 보세요.",
                setup: [{ color: "W", at: { x: 2, y: 0 } }],
                answer: { libertiesOf: { x: 2, y: 0 } },
                autoNext: true,
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
              {
                text: "2개 남았어요. 하나 더!",
                answer: { libertiesOf: { x: 2, y: 0 } },
                autoNext: true,
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
              {
                text: "단수예요. 따내 보세요!",
                answer: { libertiesOf: { x: 2, y: 0 } },
                feedback: "변의 돌은 세 수면 잡혀요.",
                wrongHint: "남은 숨구멍은 하나뿐이에요.",
              },
            ],
            problems: [
              {
                id: "edge-p1",
                prompt: "변에 있는 흰 돌이 단수예요. 따내 보세요.",
                explanation: "변의 돌은 숨구멍이 최대 3개라 가운데보다 빨리 잡혀요.",
                setup: [
                  { color: "W", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 4, y: 1 } },
                  { color: "B", at: { x: 3, y: 2 } },
                ],
                answer: { libertiesOf: { x: 4, y: 2 } },
                highlight: [],
                autoNext: true,
                wrongHint: "흰 돌 아래쪽을 보세요.",
              },
              {
                id: "edge-p2",
                prompt: "귀의 흰 돌이 단수예요. 따내 보세요.",
                explanation: "귀는 숨구멍이 2개뿐이라 두 수면 끝나요.",
                setup: [
                  { color: "W", at: { x: 0, y: 0 } },
                  { color: "B", at: { x: 1, y: 0 } },
                ],
                answer: { libertiesOf: { x: 0, y: 0 } },
                highlight: [],
                autoNext: true,
                wrongHint: "남은 숨구멍은 하나뿐이에요.",
              },
              {
                id: "edge-p3",
                prompt: "귀의 돌 숨구멍을 하나 막아 보세요.",
                explanation: "귀를 막으면 바로 단수가 돼요.",
                setup: [{ color: "W", at: { x: 0, y: 0 } }],
                answer: { libertiesOf: { x: 0, y: 0 } },
                highlight: [],
                wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
              },
            ],
          },
        },
        {
          id: "seed-group-capture",
          title: "붙은 돌은 한 덩어리",
          subtitle: "덩어리째 따내기",
          boardSize: 7,
          minutes: 3,
          vibe: "덩어리 따내기",
          libertiesFor: "W",
          bridge: "돌이 여러 개 붙어 있으면 어떻게 될까요?",
          steps: [],
          session: {
            concept: [
              {
                text: "붙은 돌은 한 덩어리라서 숨구멍을 같이 써요.",
                tip: "숫자는 돌 하나가 아니라 덩어리 전체의 숨구멍 수예요.",
                setup: [
                  { color: "W", at: { x: 1, y: 2 } },
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 0, y: 2 } },
                  { color: "B", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 2, y: 1 } },
                ],
                cta: "예시 보기",
              },
            ],
            example: [
              {
                text: "덩어리의 숨구멍을 막아 보세요.",
                setup: [
                  { color: "W", at: { x: 1, y: 2 } },
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 0, y: 2 } },
                  { color: "B", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 2, y: 1 } },
                ],
                answer: { libertiesOf: { x: 1, y: 2 } },
                autoNext: true,
                wrongHint: "흰 돌 두 개 둘레의 빈자리를 찾아요.",
              },
              {
                text: "좋아요, 하나 더!",
                answer: { libertiesOf: { x: 1, y: 2 } },
                autoNext: true,
                wrongHint: "흰 돌 두 개 둘레의 빈자리를 찾아요.",
              },
              {
                text: "덩어리가 단수예요. 통째로 따내 보세요!",
                answer: { libertiesOf: { x: 1, y: 2 } },
                feedback: "두 점을 한 번에 따냈어요!",
                wrongHint: "남은 숨구멍은 하나뿐이에요.",
              },
            ],
            problems: [
              {
                id: "group-p1",
                prompt: "흰 돌 두 개 덩어리가 단수예요. 따내 보세요.",
                explanation: "이어진 돌은 숨구멍을 공유해요. 마지막 하나만 막으면 통째로 잡혀요.",
                setup: [
                  { color: "W", at: { x: 1, y: 1 } },
                  { color: "W", at: { x: 2, y: 1 } },
                  { color: "B", at: { x: 0, y: 1 } },
                  { color: "B", at: { x: 3, y: 1 } },
                  { color: "B", at: { x: 1, y: 0 } },
                  { color: "B", at: { x: 2, y: 0 } },
                  { color: "B", at: { x: 1, y: 2 } },
                ],
                answer: { libertiesOf: { x: 1, y: 1 } },
                highlight: [],
                autoNext: true,
                wrongHint: "두 돌 둘레에 아직 비어 있는 곳은 한 군데예요.",
              },
              {
                id: "group-p2",
                prompt: "귀의 흰 돌 두 개를 한 번에 잡아 보세요.",
                explanation: "귀에서도 붙은 돌은 한 덩어리예요.",
                setup: [
                  { color: "W", at: { x: 0, y: 0 } },
                  { color: "W", at: { x: 1, y: 0 } },
                  { color: "B", at: { x: 2, y: 0 } },
                  { color: "B", at: { x: 0, y: 1 } },
                ],
                answer: { libertiesOf: { x: 0, y: 0 } },
                highlight: [],
                autoNext: true,
                wrongHint: "두 돌을 한 덩어리로 보고, 남은 빈자리를 찾아요.",
              },
              {
                id: "group-p3",
                prompt: "덩어리 숨구멍을 하나 막아 보세요.",
                explanation: "돌이 붙을수록 숨구멍도 늘어나서 잡기 어려워져요.",
                setup: [
                  { color: "W", at: { x: 1, y: 2 } },
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 0, y: 2 } },
                  { color: "B", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 2, y: 1 } },
                ],
                answer: { libertiesOf: { x: 1, y: 2 } },
                highlight: [],
                wrongHint: "흰 돌 두 개 둘레의 빈자리를 찾아요.",
              },
            ],
          },
        },
        {
          id: "seed-capture",
          title: "따내기 퀴즈",
          subtitle: "어디를 막으면 잡힐까요?",
          boardSize: 7,
          minutes: 3,
          vibe: "따내기 실력 확인",
          libertiesFor: "W",
          bridge: "배운 걸로 문제를 풀어 볼게요.",
          steps: [],
          session: {
            concept: [
              {
                text: "숨구멍을 모두 막으면 돌을 따내요. 단수(숨구멍 1개)를 찾으면 쉬워요.",
                tip: "가운데·변·귀, 한 점·덩어리 모두 같은 규칙이에요.",
                setup: [
                  { color: "W", at: C },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                highlight: [{ x: 3, y: 2 }],
                cta: "예시 보기",
              },
            ],
            example: [
              {
                text: "이 흰 돌은 단수예요. 남은 숨구멍을 막아 따내 보세요.",
                setup: [
                  { color: "W", at: C },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                answer: { libertiesOf: C },
                highlight: [],
                feedback: "이 감각으로 문제를 풀어 볼게요.",
                wrongHint: "숫자가 1인 돌의 남은 빈자리를 찾아요.",
              },
            ],
            problems: [
              {
                id: "quiz-p1",
                prompt: "흰 돌을 따내 보세요.",
                explanation: "숨구멍 하나만 남은 자리를 막으면 됩니다.",
                setup: [
                  { color: "W", at: C },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                answer: { libertiesOf: C },
                highlight: [],
                autoNext: true,
                wrongHint: "숫자가 1인 돌의 남은 빈자리를 찾아요.",
              },
              {
                id: "quiz-p2",
                prompt: "변에 있는 흰 돌이에요.",
                explanation: "변의 돌은 숨구멍이 최대 3개예요.",
                setup: [
                  { color: "W", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 4, y: 1 } },
                  { color: "B", at: { x: 3, y: 2 } },
                ],
                answer: { libertiesOf: { x: 4, y: 2 } },
                highlight: [],
                autoNext: true,
                wrongHint: "흰 돌 아래쪽을 보세요.",
              },
              {
                id: "quiz-p3",
                prompt: "귀에 있는 흰 돌 두 개를 한 번에 잡아 보세요.",
                explanation: "붙은 돌은 한 덩어리로 숨구멍을 공유해요.",
                setup: [
                  { color: "W", at: { x: 0, y: 0 } },
                  { color: "W", at: { x: 1, y: 0 } },
                  { color: "B", at: { x: 2, y: 0 } },
                  { color: "B", at: { x: 0, y: 1 } },
                ],
                answer: { libertiesOf: { x: 0, y: 0 } },
                highlight: [],
                autoNext: true,
                wrongHint: "두 돌을 한 덩어리로 보고, 남은 빈자리를 찾아요.",
              },
              {
                id: "quiz-p4",
                prompt: "흰 돌 두 개 덩어리예요. 따내 보세요.",
                explanation: "덩어리 둘레의 마지막 빈자리를 막으면 통째로 잡혀요.",
                setup: [
                  { color: "W", at: { x: 1, y: 1 } },
                  { color: "W", at: { x: 2, y: 1 } },
                  { color: "B", at: { x: 0, y: 1 } },
                  { color: "B", at: { x: 3, y: 1 } },
                  { color: "B", at: { x: 1, y: 0 } },
                  { color: "B", at: { x: 2, y: 0 } },
                  { color: "B", at: { x: 1, y: 2 } },
                ],
                answer: { libertiesOf: { x: 1, y: 1 } },
                highlight: [],
                wrongHint: "두 돌 둘레에 아직 비어 있는 곳은 한 군데예요.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "seed-atari",
      title: "단수",
      blurb: "숨구멍이 하나 남았을 때",
      lessons: [
        {
          id: "seed-atari-1",
          title: "단수 만들기",
          subtitle: "잡히기 직전으로 몰아요",
          boardSize: 7,
          minutes: 2,
          vibe: "단수 치기",
          libertiesFor: "W",
          bridge: "숨구멍이 하나 남은 ‘단수’를 더 자세히 볼게요.",
          steps: [
            {
              text: "흰 돌의 숨구멍이 2개 남았어요. 하나를 막아 단수로 만들어 보세요.",
              setup: [
                { color: "W", at: C },
                { color: "B", at: { x: 2, y: 3 } },
                { color: "B", at: { x: 3, y: 2 } },
              ],
              answer: { libertiesOf: C },
              reply: (p) => (p.x === 4 ? { x: 3, y: 4 } : { x: 4, y: 3 }),
              feedback: "단수! 그런데 백이 도망쳤어요.",
              wrongHint: "흰 돌 바로 옆 빈자리를 눌러요.",
            },
            {
              text: "단수가 된 돌은 숨구멍 쪽으로 한 칸 늘어서 도망갈 수 있어요. 숫자가 다시 3이 됐죠.",
              tip: "그래서 단수를 만들었다고 끝난 게 아니에요.",
              cta: "놓치지 않는 법 보기",
            },
            {
              text: "단수일 때 상대가 도망가기 전에 바로 따내면 돼요. 따내 보세요!",
              setup: [
                { color: "W", at: C },
                { color: "B", at: { x: 2, y: 3 } },
                { color: "B", at: { x: 3, y: 2 } },
                { color: "B", at: { x: 4, y: 3 } },
              ],
              answer: { libertiesOf: C },
              highlight: [],
              feedback: "놓치지 않고 따냈어요!",
              wrongHint: "숫자가 1인 돌의 남은 빈자리예요.",
            },
            {
              text: "단수를 보면 바로 따내기. 이것만 기억해도 실력이 쑥 늘어요.",
              cta: "다음으로",
            },
          ],
        },
        {
          id: "seed-escape",
          title: "단수에서 도망가기",
          subtitle: "내 돌을 살려요",
          boardSize: 7,
          minutes: 2,
          vibe: "도망가기",
          libertiesFor: "B",
          bridge: "이번엔 반대로, 내 돌이 단수가 됐을 때예요.",
          steps: [
            {
              text: "내 흑 돌이 단수예요! 숫자가 1이죠.",
              setup: [
                { color: "B", at: C },
                { color: "W", at: { x: 2, y: 3 } },
                { color: "W", at: { x: 3, y: 2 } },
                { color: "W", at: { x: 4, y: 3 } },
              ],
              cta: "도망가 보기",
            },
            {
              text: "남은 숨구멍 쪽으로 한 칸 늘어서 도망가 보세요.",
              answer: { x: 3, y: 4 },
              highlight: [],
              feedback: "숨구멍이 3개로 늘었어요. 살았어요!",
              wrongHint: "흑 돌 아래쪽이 유일한 숨구멍이에요.",
            },
            {
              text: "변에 있는 흑 돌도 단수예요. 도망가 보세요.",
              setup: [
                { color: "B", at: { x: 4, y: 2 } },
                { color: "W", at: { x: 4, y: 1 } },
                { color: "W", at: { x: 3, y: 2 } },
              ],
              answer: { x: 4, y: 3 },
              highlight: [],
              feedback: "숨구멍이 2개로 늘었어요!",
              wrongHint: "남은 숨구멍은 하나뿐이에요.",
            },
            {
              text: "도망갈 땐 숨구멍이 늘어나는 쪽으로 가요. 늘어나지 않으면 차라리 다른 곳에 두는 게 나아요.",
              cta: "다음으로",
            },
          ],
        },
      ],
    },
    {
      id: "seed-connect",
      title: "잇기와 끊기",
      blurb: "내 돌은 잇고, 상대 돌은 끊고",
      lessons: [
        {
          id: "seed-connect-1",
          title: "돌을 이어 지켜요",
          subtitle: "이어진 돌은 숨구멍을 함께 써요",
          boardSize: 7,
          minutes: 2,
          vibe: "연결의 감각",
          libertiesFor: "B",
          bridge: "따내는 법을 알았으니, 이번엔 내 돌이 잡히지 않게 지키는 법이에요.",
          steps: [
            {
              text: "흑 두 점이 떨어져 있고, 백이 그 사이를 노리고 있어요.",
              tip: "백이 가운데에 두면 두 흑 돌이 갈라져서 따로따로 공격받아요.",
              setup: [
                { color: "B", at: { x: 2, y: 3 } },
                { color: "B", at: { x: 4, y: 3 } },
                { color: "W", at: { x: 3, y: 2 } },
                { color: "W", at: { x: 3, y: 4 } },
              ],
              cta: "지키는 법 보기",
            },
            {
              text: "가운데를 이어서 한 덩어리로 만들어 보세요.",
              answer: C,
              feedback: "이어졌어요!",
              wrongHint: "두 흑 돌 사이의 빈자리예요.",
            },
            {
              text: "이제 백은 흑을 갈라놓을 수 없어요. 한 덩어리가 된 흑은 숨구멍 6개를 함께 써요.",
              cta: "다음으로",
            },
          ],
        },
        {
          id: "seed-cut",
          title: "끊어서 약하게",
          subtitle: "상대 돌을 갈라놓아요",
          boardSize: 7,
          minutes: 2,
          vibe: "끊기",
          libertiesFor: "W",
          bridge: "이번엔 반대로, 상대 돌을 끊어 볼게요.",
          steps: [
            {
              text: "흰 돌 두 개 사이가 비어 있어요. 흑이 가운데를 차지해서 둘을 끊어 보세요.",
              setup: [
                { color: "W", at: { x: 2, y: 3 } },
                { color: "W", at: { x: 4, y: 3 } },
                { color: "B", at: { x: 3, y: 2 } },
                { color: "B", at: { x: 3, y: 4 } },
              ],
              answer: C,
              highlight: [],
              feedback: "끊었어요! 이제 흰 돌은 따로따로예요.",
              wrongHint: "두 흰 돌 사이의 빈자리예요.",
            },
            {
              text: "끊어진 돌은 각자 숨구멍이 3개뿐이에요. 하나씩 잡으러 가 볼까요? 왼쪽 흰 돌부터요.",
              answer: { libertiesOf: { x: 2, y: 3 } },
              autoNext: true,
              wrongHint: "왼쪽 흰 돌 옆 빈자리를 눌러요.",
            },
            {
              text: "백이 가만있진 않겠지만, 이번엔 계속 몰아붙여 보세요.",
              answer: { libertiesOf: { x: 2, y: 3 } },
              autoNext: true,
              wrongHint: "왼쪽 흰 돌 옆 빈자리를 눌러요.",
            },
            {
              text: "단수! 따내 보세요.",
              answer: { libertiesOf: { x: 2, y: 3 } },
              feedback: "끊어서 잡았어요!",
              wrongHint: "남은 숨구멍은 하나뿐이에요.",
            },
            {
              text: "내 돌은 잇고, 상대 돌은 끊기. 바둑 싸움의 기본이에요.",
              cta: "다음으로",
            },
          ],
        },
      ],
    },
    {
      id: "seed-rules",
      title: "둘 수 없는 곳",
      blurb: "착수 금지와 패",
      lessons: [
        {
          id: "seed-no-entry",
          title: "숨구멍 없는 자리",
          subtitle: "놓자마자 잡히는 곳엔 못 둬요",
          boardSize: 7,
          minutes: 2,
          vibe: "착수 금지",
          bridge: "바둑엔 둘 수 없는 자리가 딱 하나 있어요.",
          steps: [
            {
              text: "흰 돌로 둘러싸인 왼쪽 위 구석에 흑을 두면, 놓자마자 숨구멍이 0이에요.",
              tip: "이런 자리엔 둘 수 없어요. ‘착수 금지’라고 해요.",
              setup: [
                { color: "W", at: { x: 1, y: 0 } },
                { color: "W", at: { x: 0, y: 1 } },
              ],
              highlight: [{ x: 0, y: 0 }],
              cta: "예외 보기",
            },
            {
              text: "그런데 예외가 있어요. 두는 순간 상대 돌을 따낼 수 있으면 둘 수 있어요. 구석에 둬 보세요.",
              setup: [
                { color: "W", at: { x: 1, y: 0 } },
                { color: "W", at: { x: 0, y: 1 } },
                { color: "B", at: { x: 2, y: 0 } },
                { color: "B", at: { x: 1, y: 1 } },
                { color: "B", at: { x: 0, y: 2 } },
              ],
              answer: { x: 0, y: 0 },
              feedback: "두는 순간 흰 돌 두 개를 따냈어요!",
              wrongHint: "왼쪽 위 구석이에요.",
            },
            {
              text: "흰 돌이 둘 다 단수였기 때문에, 숨구멍이 없어 보이는 자리여도 둘 수 있었어요.",
              cta: "다음으로",
            },
          ],
        },
        {
          id: "seed-ko",
          title: "패",
          subtitle: "바로 되따낼 수 없어요",
          boardSize: 7,
          minutes: 2,
          vibe: "패",
          bridge: "따내고, 되따내고… 끝없이 반복되면 어떡할까요?",
          steps: [
            {
              text: "가운데 흰 돌이 단수예요. 따내 보세요.",
              setup: [
                { color: "B", at: { x: 1, y: 1 } },
                { color: "B", at: { x: 2, y: 0 } },
                { color: "B", at: { x: 2, y: 2 } },
                { color: "W", at: { x: 2, y: 1 } },
                { color: "W", at: { x: 3, y: 0 } },
                { color: "W", at: { x: 4, y: 1 } },
                { color: "W", at: { x: 3, y: 2 } },
              ],
              answer: { x: 3, y: 1 },
              highlight: [],
              feedback: "따냈어요! 그런데 방금 둔 흑 돌도 단수가 됐어요.",
              wrongHint: "흰 돌 오른쪽 빈자리예요.",
            },
            {
              text: "백이 곧바로 되따내면, 서로 따내고 따내고를 끝없이 반복하게 돼요.",
              highlight: [{ x: 2, y: 1 }],
              cta: "그래서 규칙이 있어요",
            },
            {
              text: "그래서 바로 되따내는 건 금지예요. 이 모양을 ‘패’라고 해요.",
              tip: "다른 곳에 한 수 두고 난 다음에는 다시 따낼 수 있어요.",
              cta: "다음으로",
            },
          ],
        },
      ],
    },
    {
      id: "seed-life",
      title: "살아 있는 돌",
      blurb: "절대 잡히지 않는 모양",
      lessons: [
        {
          id: "seed-eyes",
          title: "눈 두 개면 살아요",
          subtitle: "백이 들어올 수 없는 빈자리",
          boardSize: 7,
          minutes: 3,
          vibe: "두 눈",
          bridge: "아무리 둘러싸여도 절대 잡히지 않는 돌이 있어요.",
          steps: [
            {
              text: "흑 덩어리 안에 빈자리가 하나 있어요. 이걸 ‘눈’이라고 해요.",
              tip: "그런데 눈이 하나뿐이면 어떻게 될까요?",
              setup: [
                { color: "B", at: { x: 1, y: 0 } },
                { color: "B", at: { x: 1, y: 1 } },
                { color: "B", at: { x: 0, y: 1 } },
                { color: "W", at: { x: 2, y: 0 } },
                { color: "W", at: { x: 2, y: 1 } },
                { color: "W", at: { x: 1, y: 2 } },
                { color: "W", at: { x: 0, y: 2 } },
              ],
              highlight: [{ x: 0, y: 0 }],
              cta: "백이 두면?",
            },
            {
              text: "백이 눈 안에 두자, 흑 덩어리가 통째로 잡혔어요. 눈이 하나면 마지막 숨구멍일 뿐이에요.",
              autoplay: [{ color: "W", at: { x: 0, y: 0 } }],
              cta: "눈 두 개 만들어 보기",
            },
            {
              text: "흑이 위쪽을 감싸고 있어요. 한 수로 안쪽을 나눠 눈을 두 개 이상 만들어 보세요.",
              setup: [
                ...[0, 1, 2, 3, 4].map((x) => ({ color: "B" as const, at: { x, y: 1 } })),
                { color: "B", at: { x: 1, y: 0 } },
                ...[0, 1, 2, 3, 4].map((x) => ({ color: "W" as const, at: { x, y: 2 } })),
              ],
              answer: [
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                { x: 4, y: 0 },
              ],
              highlight: [],
              feedback: "눈이 두 개가 됐어요!",
              wrongHint: "오른쪽 빈 곳을 둘로 나눠 보세요.",
            },
            {
              text: "백은 한 번에 한 곳만 둘 수 있어서, 두 눈을 동시에 막을 수 없어요. 이 흑은 절대 잡히지 않아요.",
              tip: "눈 두 개, 이게 ‘살아 있는 돌’의 조건이에요.",
              cta: "다음으로",
            },
          ],
        },
      ],
    },
    {
      id: "seed-house",
      title: "집 짓기",
      blurb: "땅을 차지하고 세기",
      lessons: [
        {
          id: "seed-territory-intro",
          title: "구석은 집 짓기 좋은 곳",
          subtitle: "판 끝이 벽이 되어 줘요",
          boardSize: 7,
          minutes: 2,
          vibe: "적은 돌로 집 짓기",
          bridge: "잡고 지키고 사는 법까지 알았으니, 다시 집 짓기로 돌아가요.",
          steps: [
            {
              text: "흑 돌 세 개가 왼쪽 위 구석을 감싸고 있어요. 판 끝은 벽 역할을 해 줘요.",
              setup: BLACK_CORNER.slice(0, 3),
              cta: "구석 막아 보기",
            },
            {
              text: "한 수만 더 두면 구석이 막혀요. 어디일까요?",
              answer: { x: 0, y: 2 },
              highlight: [],
              feedback: "구석이 막히자 안쪽 4칸이 흑의 집이 됐어요!",
              wrongHint: "흑 돌 줄을 판 끝까지 이어 보세요.",
            },
            {
              text: "백도 반대편 구석을 막았어요. 지금은 4집 대 4집이에요.",
              setup: [...BLACK_CORNER, ...WHITE_CORNER],
              score: true,
              cta: "다음으로",
            },
            {
              text: "남은 빈자리를 두고 서로 집을 넓혀요. 그 과정에서 따내기, 잇기, 끊기를 쓰게 돼요.",
              tip: "귀에서 시작해 변, 가운데로 넓혀 가는 게 바둑의 기본 순서예요.",
              cta: "다음으로",
            },
          ],
        },
        {
          id: "seed-count",
          title: "집 세기",
          subtitle: "판이 끝나면 누가 이겼을까?",
          boardSize: 7,
          minutes: 2,
          vibe: "집 세기",
          bridge: "마지막이에요. 끝난 판에서 누가 이겼는지 세어 볼게요.",
          steps: [
            {
              text: "판이 끝났어요. 양쪽 모두 더 둘 곳이 없죠?",
              tip: "더 둘 곳이 없으면 서로 ‘통과’하고 집을 세요.",
              setup: [
                { color: "B", at: { x: 0, y: 2 } },
                { color: "B", at: { x: 1, y: 2 } },
                { color: "B", at: { x: 2, y: 2 } },
                { color: "B", at: { x: 3, y: 1 } },
                { color: "B", at: { x: 4, y: 1 } },
                { color: "W", at: { x: 0, y: 3 } },
                { color: "W", at: { x: 1, y: 3 } },
                { color: "W", at: { x: 2, y: 3 } },
                { color: "W", at: { x: 3, y: 2 } },
                { color: "W", at: { x: 4, y: 2 } },
              ],
              cta: "집 세어 보기",
            },
            {
              text: "칠해진 칸이 각자의 집이에요. 흑 8집, 백 7집. 흑이 1집 차이로 이겼어요!",
              score: true,
              cta: "다음으로",
            },
            {
              text: "이제 7줄 판에서 바둑 한 판을 끝까지 이해할 수 있어요. 왕초보 졸업이에요!",
              tip: "다음은 같은 7줄에서 숨구멍·따내기를 더 익혀 볼 차례예요.",
              score: true,
              cta: "졸업하기",
            },
          ],
        },
      ],
    },
  ],
};

export const CURRICULUM: Record<TrackId, TrackCurriculum> = {
  seed,
  sprout: sprout as TrackCurriculum,
  leaf: leaf as TrackCurriculum,
  tree: tree as TrackCurriculum,
  forest: forest as TrackCurriculum,
};

export function curriculumForRank(rankId: RankId): TrackCurriculum {
  return CURRICULUM[getRank(rankId).track];
}

export function allLessons(track: TrackId): Lesson[] {
  return CURRICULUM[track].chapters.flatMap((c) => c.lessons);
}

/** 홈 미리보기·검사에 쓸 첫 보드 스텝 */
export function previewStep(lesson: Lesson): LessonStep | null {
  if (lesson.session) {
    const s = lesson.session;
    const first = s.concept[0] ?? s.example[0];
    if (first) return first;
    const p = s.problems[0];
    if (p) {
      return {
        text: p.prompt,
        tip: p.tip,
        setup: p.setup,
        size: p.size,
        answer: p.answer,
        playAs: p.playAs,
        highlight: p.highlight,
      };
    }
    return null;
  }
  return lesson.steps[0] ?? null;
}

/** 홈용 — 돌이 있는 문제/스텝을 우선해 의미 있는 미리보기 */
export function homePractice(lesson: Lesson): {
  kind: "problem" | "step";
  title: string;
  tip?: string;
  size: 7 | 9 | 13 | 19;
  setup?: { color: StoneColor; at: Point }[];
  highlight?: Point[];
  problemCount: number;
} | null {
  const size = lesson.boardSize;
  if (lesson.session) {
    const problems = lesson.session.problems;
    const pick =
      problems.find((p) => (p.setup?.length ?? 0) > 0) ??
      problems[0] ??
      null;
    if (pick) {
      return {
        kind: "problem",
        title: pick.prompt,
        tip: pick.tip ?? pick.explanation,
        size: pick.size ?? size,
        setup: pick.setup,
        highlight: pick.highlight,
        problemCount: problems.length,
      };
    }
    const step =
      [...lesson.session.concept, ...lesson.session.example].find((s) => (s.setup?.length ?? 0) > 0) ??
      lesson.session.concept[0] ??
      lesson.session.example[0] ??
      null;
    if (!step) return null;
    return {
      kind: "step",
      title: step.text,
      tip: step.tip,
      size: step.size ?? size,
      setup: step.setup,
      highlight: step.highlight,
      problemCount: problems.length,
    };
  }
  const step =
    lesson.steps.find((s) => (s.setup?.length ?? 0) > 0) ??
    lesson.steps.find((s) => !!s.answer) ??
    lesson.steps[0] ??
    null;
  if (!step) return null;
  return {
    kind: step.answer ? "problem" : "step",
    title: step.text,
    tip: step.tip,
    size: step.size ?? size,
    setup: step.setup,
    highlight: step.highlight,
    problemCount: lesson.steps.filter((s) => !!s.answer).length,
  };
}

/** 세션/레거시 answer 스텝을 평탄화 (검증용) */
export function playableSteps(lesson: Lesson): { text: string; step: LessonStep | Problem; boardSize: number }[] {
  if (lesson.session) {
    const { concept, example, problems } = lesson.session;
    const out: { text: string; step: LessonStep | Problem; boardSize: number }[] = [];
    for (const step of [...concept, ...example]) {
      out.push({ text: step.text, step, boardSize: step.size ?? lesson.boardSize });
    }
    for (const p of problems) {
      out.push({ text: p.prompt, step: p, boardSize: p.size ?? lesson.boardSize });
    }
    return out;
  }
  return lesson.steps.map((step) => ({ text: step.text, step, boardSize: step.size ?? lesson.boardSize }));
}

export function findLesson(track: TrackId, lessonId: string): { chapter: Chapter; lesson: Lesson } | null {
  for (const chapter of CURRICULUM[track].chapters) {
    const lesson = chapter.lessons.find((l) => l.id === lessonId);
    if (lesson) return { chapter, lesson };
  }
  return null;
}

export function lessonIndex(track: TrackId, lessonId: string): number {
  return allLessons(track).findIndex((l) => l.id === lessonId);
}

export function nextLesson(track: TrackId, lessonId: string): Lesson | null {
  const list = allLessons(track);
  const i = list.findIndex((l) => l.id === lessonId);
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
}
