/** 25·20급 — seed와 겹치지 않게 사활·수법 입문 */
export const sprout = {
  track: "sprout",
  title: "7줄 판",
  chapters: [
    {
      id: "sprout-eyes",
      title: "두 눈과 옥집",
      blurb: "진짜 집과 가짜 집",
      lessons: [
        {
          id: "sprout-two-eyes",
          title: "두 눈이 있으면 살아요",
          subtitle: "한 번에 막을 수 없는 두 칸",
          boardSize: 7,
          minutes: 4,
          vibe: "사는 모양",
          steps: [],
          session: {
            concept: [
              {
                text: "눈이 두 칸이면, 상대가 한 번에 둘 다 막을 수 없어 살아요.",
                tip: "한 눈만 있으면 상대가 메울 수 있어요.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 4, y: 4 } },
                ],
                highlight: [
                  { x: 3, y: 3 },
                  { x: 3, y: 5 },
                ],
                cta: "예시 보기",
              },
            ],
            example: [
              {
                text: "오른쪽 아래를 막아 두 번째 눈을 완성해 보세요.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                answer: { x: 4, y: 4 },
                feedback: "두 눈이 생겼어요. 이 모양은 쉽게 안 죽어요.",
              },
            ],
            problems: [
              {
                id: "sprout-eyes-p1",
                prompt: "흑이 두 눈으로 살려면 어디를 둘까요?",
                explanation: "열린 한 칸을 막아 두 번째 눈을 만들어요.",
                setup: [
                  { color: "B", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 2, y: 1 } },
                  { color: "B", at: { x: 3, y: 1 } },
                  { color: "B", at: { x: 1, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 1, y: 3 } },
                  { color: "B", at: { x: 2, y: 3 } },
                ],
                answer: { x: 3, y: 3 },
                wrongHint: "오른쪽 아래 빈칸을 막아 보세요.",
              },
              {
                id: "sprout-eyes-p2",
                prompt: "흰 덩어리가 단수예요. 따내 죽이세요.",
                explanation: "눈이 없는 돌은 활로만 막으면 잡혀요.",
                setup: [
                  { color: "W", at: { x: 3, y: 3 } },
                  { color: "W", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 5, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                answer: { x: 4, y: 4 },
                wrongHint: "아래쪽 남은 활로를 막아요.",
              },
            ],
          },
        },
        {
          id: "sprout-false-eye",
          title: "옥집(가짜 눈)",
          subtitle: "눈처럼 보여도 막히는 자리",
          boardSize: 7,
          minutes: 4,
          vibe: "가짜 눈",
          steps: [],
          session: {
            concept: [
              {
                text: "돌로 둘러싸인 빈칸이라도, 연결이 끊기면 ‘옥집’이라 진짜 눈이 아니에요.",
                tip: "옥집은 상대가 둘 수 있어 눈이 안 돼요.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 4, y: 4 } },
                  { color: "W", at: { x: 3, y: 3 } },
                ],
                highlight: [{ x: 3, y: 3 }],
                cta: "문제 풀기",
              },
            ],
            example: [
              {
                text: "가운데를 백이 차지하면 흑 눈이 깨져요. 흑으로 가운데를 지켜 보세요.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 4, y: 4 } },
                ],
                answer: { x: 3, y: 3 },
                feedback: "가운데를 지키면 두 눈 모양이 유지돼요.",
              },
            ],
            problems: [
              {
                id: "sprout-false-p1",
                prompt: "흑이 살려면 급소는 어디일까요?",
                explanation: "한 눈만 열린 쪽의 급소를 먼저 지켜요.",
                setup: [
                  { color: "B", at: { x: 1, y: 4 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 1, y: 5 } },
                  { color: "B", at: { x: 3, y: 5 } },
                  { color: "B", at: { x: 1, y: 6 } },
                  { color: "B", at: { x: 2, y: 6 } },
                  { color: "B", at: { x: 3, y: 6 } },
                  { color: "W", at: { x: 0, y: 4 } },
                  { color: "W", at: { x: 0, y: 5 } },
                  { color: "W", at: { x: 0, y: 6 } },
                  { color: "W", at: { x: 4, y: 4 } },
                  { color: "W", at: { x: 4, y: 5 } },
                  { color: "W", at: { x: 4, y: 6 } },
                ],
                answer: { x: 2, y: 5 },
                wrongHint: "가운데 빈칸이 두 번째 눈 자리예요.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "sprout-net-ladder",
      title: "장문과 축",
      blurb: "도망갈 길을 막는 수법",
      lessons: [
        {
          id: "sprout-net",
          title: "장문 — 넓게 가두기",
          subtitle: "바로 잡지 않고 길을 막아요",
          boardSize: 7,
          minutes: 4,
          vibe: "가두기",
          steps: [],
          session: {
            concept: [
              {
                text: "장문은 상대 돌이 빠져나갈 길을 미리 막아, 잡히는 모양으로 만드는 수예요.",
                tip: "단수로 몰아붙이기보다, 도망 길을 끊는 수가 장문이에요.",
                setup: [
                  { color: "W", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 4 } },
                ],
                cta: "잡아 보기",
              },
            ],
            example: [
              {
                text: "흰 돌이 아래로 달아나지 못하게 막아 보세요.",
                setup: [
                  { color: "W", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 4, y: 3 } },
                ],
                answer: { x: 2, y: 4 },
                feedback: "도망 길을 막는 수가 장문의 감각이에요.",
                wrongHint: "왼쪽 아래를 막아 보세요.",
              },
            ],
            problems: [
              {
                id: "sprout-net-p1",
                prompt: "흰 돌을 달아나지 못하게 가두세요.",
                explanation: "열린 쪽으로 나가는 길을 먼저 막아요.",
                setup: [
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 1, y: 2 } },
                  { color: "B", at: { x: 2, y: 1 } },
                  { color: "B", at: { x: 3, y: 2 } },
                ],
                answer: { x: 2, y: 3 },
                wrongHint: "아래쪽 빈칸을 막아 보세요.",
              },
              {
                id: "sprout-net-p2",
                prompt: "단수가 아닌 수로 흰 돌을 가두세요.",
                explanation: "바로 따내지 않아도, 탈출구를 막으면 잡혀요.",
                setup: [
                  { color: "W", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 5, y: 3 } },
                ],
                answer: { x: 4, y: 4 },
                wrongHint: "아래를 막아 도망을 끊어요.",
              },
            ],
          },
        },
        {
          id: "sprout-ladder",
          title: "축 — 지그재그로 몰기",
          subtitle: "단수를 이어 가며 잡아요",
          boardSize: 7,
          minutes: 5,
          vibe: "축",
          steps: [],
          session: {
            concept: [
              {
                text: "축은 단수를 번갈아 주며 지그재그로 몰아, 판 끝까지 잡는 수법이에요.",
                tip: "축머리가 막혀 있으면 축이 안 통해요.",
                setup: [
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 1, y: 2 } },
                  { color: "B", at: { x: 2, y: 1 } },
                ],
                cta: "축으로 잡기",
              },
            ],
            example: [
              {
                text: "먼저 단수를 치세요. 그다음 이어지는 축은 자동으로 느껴 보세요.",
                setup: [
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 1, y: 2 } },
                  { color: "B", at: { x: 2, y: 1 } },
                ],
                answer: { x: 3, y: 2 },
                feedback: "단수로 몰기 시작! 축의 첫 수예요.",
                wrongHint: "오른쪽을 단수 치세요.",
              },
            ],
            problems: [
              {
                id: "sprout-ladder-p1",
                prompt: "축의 첫 단수를 두세요.",
                explanation: "옆을 막아 단수로 만드는 게 축의 시작이에요.",
                setup: [
                  { color: "W", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 0, y: 1 } },
                  { color: "B", at: { x: 1, y: 0 } },
                ],
                answer: { x: 2, y: 1 },
                wrongHint: "오른쪽을 단수 치세요.",
              },
              {
                id: "sprout-ladder-p2",
                prompt: "흰 돌을 단수로 만드세요.",
                explanation: "열린 활로를 하나 줄여 단수로 만들어요.",
                setup: [
                  { color: "W", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 1 } },
                  { color: "B", at: { x: 4, y: 2 } },
                ],
                answer: { x: 3, y: 3 },
                wrongHint: "아래를 막아 단수를 만드세요.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "sprout-race",
      title: "수상전 감각",
      blurb: "누가 먼저 따내나요",
      lessons: [
        {
          id: "sprout-semeai",
          title: "서로 잡기",
          subtitle: "활로 수를 세어 보세요",
          boardSize: 7,
          minutes: 4,
          vibe: "수상전",
          steps: [],
          session: {
            concept: [
              {
                text: "양쪽이 서로 잡으려 할 때, 남은 활로가 더 많은 쪽이 유리해요.",
                tip: "내 돌을 살리면서 상대 활로를 줄이는 수를 찾아요.",
                setup: [
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "W", at: { x: 4, y: 3 } },
                  { color: "W", at: { x: 4, y: 4 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "W", at: { x: 3, y: 5 } },
                ],
                cta: "따내기",
              },
            ],
            example: [
              {
                text: "흰 두 점이 단수예요. 따내 보세요.",
                setup: [
                  { color: "W", at: { x: 3, y: 3 } },
                  { color: "W", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 4, y: 4 } },
                  { color: "B", at: { x: 3, y: 2 } },
                ],
                answer: { x: 3, y: 5 },
                feedback: "남은 활로를 막는 수가 수상전의 기본이에요.",
              },
            ],
            problems: [
              {
                id: "sprout-race-p1",
                prompt: "흰 돌을 따내세요.",
                explanation: "단수가 된 돌의 마지막 활로를 막아요.",
                setup: [
                  { color: "W", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                ],
                answer: { x: 3, y: 2 },
                wrongHint: "위쪽 빈칸이 마지막 활로예요.",
              },
              {
                id: "sprout-race-p2",
                prompt: "먼저 상대를 단수로 만드세요.",
                explanation: "활로를 하나 줄여 단수로 만들어요.",
                setup: [
                  { color: "W", at: { x: 4, y: 4 } },
                  { color: "W", at: { x: 5, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 5, y: 3 } },
                  { color: "B", at: { x: 6, y: 4 } },
                ],
                answer: { x: 4, y: 5 },
                wrongHint: "아래쪽을 막아 단수를 만드세요.",
              },
            ],
          },
        },
      ],
    },
  ],
};

/** 15급 — 집·행마·끝내기 */
export const leaf = {
  track: "leaf",
  title: "9줄 판",
  chapters: [
    {
      id: "leaf-territory",
      title: "집과 경계",
      blurb: "내 땅과 큰 자리",
      lessons: [
        {
          id: "leaf-house",
          title: "집을 단단히",
          subtitle: "구석·변을 이어요",
          boardSize: 9,
          minutes: 4,
          vibe: "집의 감각",
          steps: [],
          session: {
            concept: [
              {
                text: "바둑은 상대보다 집을 더 많이 만들면 이겨요. 구석과 변이 집이 잘 생겨요.",
                tip: "중앙보다 구석이 집이 빨리 닫혀요.",
                setup: [
                  { color: "B", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 2, y: 1 } },
                  { color: "B", at: { x: 1, y: 2 } },
                ],
                cta: "이어 보기",
              },
            ],
            example: [
              {
                text: "왼쪽 위를 이어서 구석 집을 더 단단히 해 보세요.",
                setup: [
                  { color: "B", at: { x: 1, y: 1 } },
                  { color: "B", at: { x: 2, y: 1 } },
                  { color: "B", at: { x: 1, y: 2 } },
                ],
                answer: { x: 0, y: 1 },
                feedback: "구석·변은 집이 잘 생기는 자리예요.",
              },
            ],
            problems: [
              {
                id: "leaf-house-p1",
                prompt: "흑 집을 더 닫는 수는?",
                explanation: "열린 쪽을 이어 경계를 만들어요.",
                setup: [
                  { color: "B", at: { x: 0, y: 2 } },
                  { color: "B", at: { x: 1, y: 2 } },
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 2, y: 1 } },
                ],
                answer: { x: 2, y: 0 },
                wrongHint: "위쪽을 막아 구석을 닫아요.",
              },
              {
                id: "leaf-house-p2",
                prompt: "상대 집을 줄이는 침입 급소는?",
                explanation: "아직 닫히지 않은 집 안의 급소를 노려요.",
                setup: [
                  { color: "W", at: { x: 6, y: 6 } },
                  { color: "W", at: { x: 7, y: 6 } },
                  { color: "W", at: { x: 8, y: 6 } },
                  { color: "W", at: { x: 6, y: 7 } },
                  { color: "W", at: { x: 6, y: 8 } },
                ],
                answer: { x: 7, y: 7 },
                wrongHint: "흰 집 안쪽 빈칸을 눌러 보세요.",
              },
            ],
          },
        },
        {
          id: "leaf-haengma",
          title: "한칸·날일자",
          subtitle: "넓으면서도 이어지는 수",
          boardSize: 9,
          minutes: 4,
          vibe: "행마",
          steps: [],
          session: {
            concept: [
              {
                text: "한칸 뜀과 날일자는 너무 붙지 않으면서 연결을 유지하는 기본 행마예요.",
                tip: "너무 멀면 끊기고, 너무 붙으면 답답해요.",
                setup: [{ color: "B", at: { x: 2, y: 2 } }],
                highlight: [
                  { x: 2, y: 4 },
                  { x: 4, y: 3 },
                ],
                cta: "확장하기",
              },
            ],
            example: [
              {
                text: "흑에서 날일자로 넓혀 보세요.",
                setup: [{ color: "B", at: { x: 2, y: 2 } }],
                answer: [
                  { x: 4, y: 1 },
                  { x: 4, y: 3 },
                  { x: 1, y: 4 },
                  { x: 3, y: 4 },
                ],
                feedback: "날일자는 넓으면서도 이어지기 쉬운 모양이에요.",
              },
            ],
            problems: [
              {
                id: "leaf-haengma-p1",
                prompt: "한칸 뜀으로 확장하세요.",
                explanation: "같은 줄로 한 칸 뛰는 수가 한칸 뜀이에요.",
                setup: [{ color: "B", at: { x: 3, y: 3 } }],
                answer: [
                  { x: 3, y: 5 },
                  { x: 3, y: 1 },
                  { x: 5, y: 3 },
                  { x: 1, y: 3 },
                ],
                wrongHint: "같은 가로·세로로 한 칸 뛰어 보세요.",
              },
              {
                id: "leaf-haengma-p2",
                prompt: "끊기지 않게 이어 주세요.",
                explanation: "떨어진 돌을 잇는 수를 찾아요.",
                setup: [
                  { color: "B", at: { x: 2, y: 4 } },
                  { color: "B", at: { x: 4, y: 4 } },
                  { color: "W", at: { x: 3, y: 3 } },
                ],
                answer: { x: 3, y: 4 },
                wrongHint: "두 흑 사이를 이어 보세요.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "leaf-end",
      title: "끝내기 맛보기",
      blurb: "경계를 나누고 집 정리",
      lessons: [
        {
          id: "leaf-pass-feel",
          title: "큰 집 쪽부터",
          subtitle: "끝내기의 기본 감각",
          boardSize: 9,
          minutes: 3,
          vibe: "끝내기",
          steps: [],
          session: {
            concept: [
              {
                text: "형세가 갈리면, 남은 큰 집·경계부터 정리해요.",
                tip: "작은 곳보다 집 차이가 큰 곳을 먼저.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "W", at: { x: 6, y: 6 } },
                  { color: "W", at: { x: 5, y: 6 } },
                ],
                cta: "큰 쪽 두기",
              },
            ],
            example: [
              {
                text: "왼쪽 위 집 쪽을 골라 보세요.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "W", at: { x: 6, y: 6 } },
                  { color: "W", at: { x: 5, y: 6 } },
                  { color: "W", at: { x: 6, y: 5 } },
                ],
                answer: [
                  { x: 1, y: 1 },
                  { x: 2, y: 1 },
                  { x: 1, y: 2 },
                ],
                feedback: "집 쪽에 두는 게 끝내기의 기본 감각이에요.",
              },
            ],
            problems: [
              {
                id: "leaf-end-p1",
                prompt: "흑 집을 늘리는 수는?",
                explanation: "열린 경계를 밀어 집을 키워요.",
                setup: [
                  { color: "B", at: { x: 1, y: 3 } },
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 3, y: 3 } },
                  { color: "W", at: { x: 5, y: 5 } },
                ],
                answer: [
                  { x: 1, y: 2 },
                  { x: 2, y: 2 },
                  { x: 3, y: 2 },
                ],
                wrongHint: "흑 줄 위쪽을 밀어 보세요.",
              },
            ],
          },
        },
        {
          id: "leaf-snapback",
          title: "되따내기",
          subtitle: "한 점 주고 더 크게",
          boardSize: 9,
          minutes: 4,
          vibe: "환격",
          steps: [],
          session: {
            concept: [
              {
                text: "상대가 따낸 직후, 그 돌을 다시 잡는 ‘되따내기(환격)’가 있어요.",
                tip: "잡히더라도 상대 덩어리가 단수가 되면 되따낼 수 있어요.",
                setup: [
                  { color: "B", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 5, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 5, y: 4 } },
                  { color: "B", at: { x: 3, y: 5 } },
                  { color: "B", at: { x: 4, y: 5 } },
                  { color: "W", at: { x: 4, y: 4 } },
                ],
                cta: "따내기",
              },
            ],
            example: [
              {
                text: "가운데 흰 돌을 따내 보세요.",
                setup: [
                  { color: "B", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 5, y: 3 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 5, y: 4 } },
                  { color: "B", at: { x: 3, y: 5 } },
                  { color: "B", at: { x: 4, y: 5 } },
                  { color: "W", at: { x: 4, y: 4 } },
                ],
                answer: { x: 4, y: 2 },
                feedback: "단수인 돌을 막는 수가 따내기예요.",
                wrongHint: "흰 돌 위쪽 활로를 막아요.",
              },
            ],
            problems: [
              {
                id: "leaf-snap-p1",
                prompt: "단수인 흰 돌을 따내세요.",
                explanation: "마지막 활로를 막으면 따내요.",
                setup: [
                  { color: "W", at: { x: 4, y: 4 } },
                  { color: "B", at: { x: 3, y: 4 } },
                  { color: "B", at: { x: 5, y: 4 } },
                  { color: "B", at: { x: 4, y: 3 } },
                ],
                answer: { x: 4, y: 5 },
                wrongHint: "아래 활로를 막아요.",
              },
            ],
          },
        },
      ],
    },
  ],
};

/** 10·7급 — 포석·사활·가치 */
export const tree = {
  track: "tree",
  title: "13줄 판",
  chapters: [
    {
      id: "tree-opening",
      title: "포석의 방향",
      blurb: "구석 → 변 → 중앙",
      lessons: [
        {
          id: "tree-corner",
          title: "구석부터",
          subtitle: "집이 빨리 생기는 자리",
          boardSize: 13,
          minutes: 3,
          vibe: "포석",
          steps: [],
          session: {
            concept: [
              {
                text: "큰 판에서는 보통 구석 근처부터 집을 지어요.",
                tip: "화점은 구석을 빠르게 다루는 기준점이에요.",
                highlight: [
                  { x: 3, y: 3 },
                  { x: 9, y: 3 },
                  { x: 3, y: 9 },
                  { x: 9, y: 9 },
                ],
                cta: "구석에 두기",
              },
            ],
            example: [
              {
                text: "왼쪽 위 화점 근처에 첫 수를 두어 보세요.",
                answer: [
                  { x: 2, y: 2 },
                  { x: 3, y: 3 },
                  { x: 2, y: 3 },
                  { x: 3, y: 2 },
                ],
                feedback: "구석을 먼저 잡는 게 포석의 시작이에요.",
              },
            ],
            problems: [
              {
                id: "tree-corner-p1",
                prompt: "네 화점 중 한곳에 두세요.",
                explanation: "화점은 포석의 기본 출발점이에요.",
                setup: [],
                answer: [
                  { x: 3, y: 3 },
                  { x: 9, y: 3 },
                  { x: 3, y: 9 },
                  { x: 9, y: 9 },
                ],
                wrongHint: "굵은 점(화점) 근처에 두세요.",
              },
              {
                id: "tree-corner-p2",
                prompt: "흑이 이미 한 구석을 잡았어요. 다른 구석으로!",
                explanation: "같은 구석만 파기보다 다른 큰 자리를 잡아요.",
                setup: [{ color: "B", at: { x: 3, y: 3 } }],
                answer: [
                  { x: 9, y: 3 },
                  { x: 3, y: 9 },
                  { x: 9, y: 9 },
                  { x: 9, y: 2 },
                  { x: 2, y: 9 },
                ],
                wrongHint: "비어 있는 다른 구석·화점을 보세요.",
              },
            ],
          },
        },
        {
          id: "tree-sente",
          title: "선수와 후수",
          subtitle: "두고 나서 누가 더 급한가",
          boardSize: 13,
          minutes: 4,
          vibe: "선수",
          steps: [],
          session: {
            concept: [
              {
                text: "내가 두고도 상대가 꼭 받아야 하면 ‘선수’, 안 받아도 되면 ‘후수’에 가까워요.",
                tip: "급한 단수·급소가 선수감이에요.",
                setup: [
                  { color: "W", at: { x: 6, y: 6 } },
                  { color: "B", at: { x: 5, y: 6 } },
                  { color: "B", at: { x: 7, y: 6 } },
                  { color: "B", at: { x: 6, y: 7 } },
                ],
                cta: "선수 두기",
              },
            ],
            example: [
              {
                text: "흰 돌이 단수예요. 따내는 수는 강한 선수예요.",
                setup: [
                  { color: "W", at: { x: 6, y: 6 } },
                  { color: "B", at: { x: 5, y: 6 } },
                  { color: "B", at: { x: 7, y: 6 } },
                  { color: "B", at: { x: 6, y: 7 } },
                ],
                answer: { x: 6, y: 5 },
                feedback: "따내기는 상대가 무시하기 어려운 수예요.",
              },
            ],
            problems: [
              {
                id: "tree-sente-p1",
                prompt: "가장 급한 수(단수 처리)를 두세요.",
                explanation: "잡히기 직전인 쪽을 먼저 해결해요.",
                setup: [
                  { color: "B", at: { x: 4, y: 4 } },
                  { color: "W", at: { x: 3, y: 4 } },
                  { color: "W", at: { x: 5, y: 4 } },
                  { color: "W", at: { x: 4, y: 5 } },
                ],
                answer: { x: 4, y: 3 },
                playAs: "B",
                wrongHint: "흑 돌의 남은 활로를 늘리세요.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "tree-life",
      title: "사활 입문",
      blurb: "살고 죽는 모양",
      lessons: [
        {
          id: "tree-life-1",
          title: "눈 하나로는 부족해요",
          subtitle: "두 번째 눈을 지키세요",
          boardSize: 13,
          minutes: 4,
          vibe: "사활",
          steps: [],
          session: {
            concept: [
              {
                text: "눈이 하나뿐이면 상대가 메울 수 있어요. 두 번째 눈 자리를 지켜야 살아요.",
                tip: "급소는 종종 모양의 한가운데예요.",
                setup: [
                  { color: "B", at: { x: 5, y: 5 } },
                  { color: "B", at: { x: 6, y: 5 } },
                  { color: "B", at: { x: 7, y: 5 } },
                  { color: "B", at: { x: 5, y: 6 } },
                  { color: "B", at: { x: 7, y: 6 } },
                  { color: "B", at: { x: 5, y: 7 } },
                  { color: "B", at: { x: 6, y: 7 } },
                  { color: "B", at: { x: 7, y: 7 } },
                  { color: "W", at: { x: 4, y: 5 } },
                  { color: "W", at: { x: 4, y: 6 } },
                  { color: "W", at: { x: 4, y: 7 } },
                  { color: "W", at: { x: 8, y: 5 } },
                  { color: "W", at: { x: 8, y: 6 } },
                  { color: "W", at: { x: 8, y: 7 } },
                ],
                cta: "급소 지키기",
              },
            ],
            example: [
              {
                text: "가운데를 지키면 두 눈으로 살 수 있어요.",
                setup: [
                  { color: "B", at: { x: 5, y: 5 } },
                  { color: "B", at: { x: 6, y: 5 } },
                  { color: "B", at: { x: 7, y: 5 } },
                  { color: "B", at: { x: 5, y: 6 } },
                  { color: "B", at: { x: 7, y: 6 } },
                  { color: "B", at: { x: 5, y: 7 } },
                  { color: "B", at: { x: 6, y: 7 } },
                  { color: "B", at: { x: 7, y: 7 } },
                  { color: "W", at: { x: 4, y: 5 } },
                  { color: "W", at: { x: 4, y: 6 } },
                  { color: "W", at: { x: 4, y: 7 } },
                  { color: "W", at: { x: 8, y: 5 } },
                  { color: "W", at: { x: 8, y: 6 } },
                  { color: "W", at: { x: 8, y: 7 } },
                ],
                answer: { x: 6, y: 6 },
                feedback: "가운데를 지키면 두 눈으로 살 수 있어요.",
              },
            ],
            problems: [
              {
                id: "tree-life-p1",
                prompt: "흑을 살리려면?",
                explanation: "두 번째 눈 급소를 차지하세요.",
                setup: [
                  { color: "B", at: { x: 5, y: 5 } },
                  { color: "B", at: { x: 6, y: 5 } },
                  { color: "B", at: { x: 7, y: 5 } },
                  { color: "B", at: { x: 5, y: 6 } },
                  { color: "B", at: { x: 7, y: 6 } },
                  { color: "B", at: { x: 5, y: 7 } },
                  { color: "B", at: { x: 6, y: 7 } },
                  { color: "B", at: { x: 7, y: 7 } },
                  { color: "W", at: { x: 4, y: 5 } },
                  { color: "W", at: { x: 4, y: 6 } },
                  { color: "W", at: { x: 4, y: 7 } },
                  { color: "W", at: { x: 8, y: 5 } },
                  { color: "W", at: { x: 8, y: 6 } },
                  { color: "W", at: { x: 8, y: 7 } },
                ],
                answer: { x: 6, y: 6 },
                wrongHint: "한가운데가 급소예요.",
              },
              {
                id: "tree-life-p2",
                prompt: "백이 두 눈을 만들기 전, 살릴 급소를 백으로 두세요.",
                explanation: "한가운데가 두 번째 눈 자리예요.",
                playAs: "W",
                setup: [
                  { color: "W", at: { x: 5, y: 5 } },
                  { color: "W", at: { x: 6, y: 5 } },
                  { color: "W", at: { x: 7, y: 5 } },
                  { color: "W", at: { x: 5, y: 6 } },
                  { color: "W", at: { x: 7, y: 6 } },
                  { color: "W", at: { x: 5, y: 7 } },
                  { color: "W", at: { x: 6, y: 7 } },
                  { color: "W", at: { x: 7, y: 7 } },
                  { color: "B", at: { x: 4, y: 5 } },
                  { color: "B", at: { x: 4, y: 6 } },
                  { color: "B", at: { x: 4, y: 7 } },
                  { color: "B", at: { x: 8, y: 5 } },
                  { color: "B", at: { x: 8, y: 6 } },
                  { color: "B", at: { x: 8, y: 7 } },
                ],
                answer: { x: 6, y: 6 },
                wrongHint: "백 모양 한가운데를 두세요.",
              },
            ],
          },
        },
        {
          id: "tree-invade",
          title: "침투 감각",
          subtitle: "상대 집을 흔들기",
          boardSize: 13,
          minutes: 4,
          vibe: "침투",
          steps: [],
          session: {
            concept: [
              {
                text: "상대 집이 완전히 닫히기 전에, 안으로 들어가 집을 줄이거나 살 자리를 만들 수 있어요.",
                tip: "근거(눈 만들 자리)를 남겨 두는 침투가 좋아요.",
                setup: [
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "W", at: { x: 3, y: 2 } },
                  { color: "W", at: { x: 4, y: 2 } },
                  { color: "W", at: { x: 2, y: 3 } },
                  { color: "W", at: { x: 2, y: 4 } },
                ],
                cta: "들어가 보기",
              },
            ],
            example: [
              {
                text: "흰 진영 안쪽 빈칸에 흑으로 들어가 보세요.",
                setup: [
                  { color: "W", at: { x: 2, y: 2 } },
                  { color: "W", at: { x: 3, y: 2 } },
                  { color: "W", at: { x: 4, y: 2 } },
                  { color: "W", at: { x: 2, y: 3 } },
                  { color: "W", at: { x: 2, y: 4 } },
                  { color: "W", at: { x: 4, y: 4 } },
                ],
                answer: [
                  { x: 3, y: 3 },
                  { x: 3, y: 4 },
                ],
                feedback: "닫히기 전 안으로 들어가는 게 침투예요.",
              },
            ],
            problems: [
              {
                id: "tree-invade-p1",
                prompt: "흰 집 쪽에 침투하세요.",
                explanation: "열린 공간의 급소에 들어가요.",
                setup: [
                  { color: "W", at: { x: 8, y: 8 } },
                  { color: "W", at: { x: 9, y: 8 } },
                  { color: "W", at: { x: 10, y: 8 } },
                  { color: "W", at: { x: 8, y: 9 } },
                  { color: "W", at: { x: 8, y: 10 } },
                ],
                answer: [
                  { x: 9, y: 9 },
                  { x: 10, y: 9 },
                  { x: 9, y: 10 },
                ],
                wrongHint: "흰 돌이 둘러싼 안쪽을 보세요.",
              },
            ],
          },
        },
      ],
    },
  ],
};

/** 5·3·1급 — 큰 판 감각 */
export const forest = {
  track: "forest",
  title: "19줄 판",
  chapters: [
    {
      id: "forest-whole",
      title: "한 판의 흐름",
      blurb: "포석 → 중반 → 끝내기",
      lessons: [
        {
          id: "forest-flow",
          title: "대국의 세 단계",
          subtitle: "큰 그림을 먼저",
          boardSize: 19,
          minutes: 3,
          vibe: "큰 판",
          steps: [],
          session: {
            concept: [
              {
                text: "처음엔 구석과 변(포석), 중간에 싸움(중반), 마지막에 집 정리(끝내기)예요.",
                tip: "큰 판도 작은 판에서 익힌 원칙이 그대로예요.",
                highlight: [
                  { x: 3, y: 3 },
                  { x: 9, y: 9 },
                  { x: 15, y: 15 },
                ],
                cta: "첫 수 두기",
              },
            ],
            example: [
              {
                text: "오른쪽 아래 화점 근처에 두어 보세요.",
                answer: [
                  { x: 15, y: 15 },
                  { x: 15, y: 16 },
                  { x: 16, y: 15 },
                  { x: 16, y: 16 },
                ],
                feedback: "큰 판도 구석부터예요.",
              },
            ],
            problems: [
              {
                id: "forest-flow-p1",
                prompt: "포석에 어울리는 첫 수는?",
                explanation: "화점·구석 근처가 기본이에요.",
                setup: [],
                answer: [
                  { x: 3, y: 3 },
                  { x: 3, y: 15 },
                  { x: 15, y: 3 },
                  { x: 15, y: 15 },
                  { x: 2, y: 3 },
                  { x: 3, y: 2 },
                ],
                wrongHint: "네 구석 화점 쪽을 보세요.",
              },
            ],
          },
        },
        {
          id: "forest-base",
          title: "근거를 빼앗기",
          subtitle: "상대가 살 자리를 줄이기",
          boardSize: 19,
          minutes: 4,
          vibe: "공격",
          steps: [],
          session: {
            concept: [
              {
                text: "공격할 때는 상대 돌의 ‘근거’(눈 만들 자리)를 빼앗는 수가 강해요.",
                tip: "무작정 다가가기보다 살 자리를 좁혀요.",
                setup: [
                  { color: "W", at: { x: 3, y: 3 } },
                  { color: "W", at: { x: 4, y: 3 } },
                  { color: "B", at: { x: 2, y: 5 } },
                ],
                cta: "좁히기",
              },
            ],
            example: [
              {
                text: "흰 돌이 변으로 기대지 못하게 막아 보세요.",
                setup: [
                  { color: "W", at: { x: 3, y: 2 } },
                  { color: "W", at: { x: 4, y: 2 } },
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 5, y: 3 } },
                ],
                answer: [
                  { x: 3, y: 1 },
                  { x: 4, y: 1 },
                ],
                feedback: "변·귀 쪽 근거를 막는 감각이에요.",
              },
            ],
            problems: [
              {
                id: "forest-base-p1",
                prompt: "흰 돌의 활로를 줄이세요.",
                explanation: "열린 쪽을 막아 근거를 좁혀요.",
                setup: [
                  { color: "W", at: { x: 10, y: 3 } },
                  { color: "B", at: { x: 9, y: 3 } },
                  { color: "B", at: { x: 11, y: 3 } },
                  { color: "B", at: { x: 10, y: 4 } },
                ],
                answer: { x: 10, y: 2 },
                wrongHint: "위쪽 활로를 막아요.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "forest-shape",
      title: "좋은 모양",
      blurb: "효율적인 돌의 배치",
      lessons: [
        {
          id: "forest-shape-1",
          title: "날일자·한칸",
          subtitle: "너무 붙지도, 너무 멀지도 않게",
          boardSize: 19,
          minutes: 4,
          vibe: "모양",
          steps: [],
          session: {
            concept: [
              {
                text: "날일자는 넓으면서도 연결이 쉬운 기본 모양이에요.",
                tip: "빈삼각(답답한 붙임)은 피해요.",
                setup: [{ color: "B", at: { x: 3, y: 3 } }],
                cta: "확장",
              },
            ],
            example: [
              {
                text: "흑 화점에서 날일자로 확장해 보세요.",
                setup: [{ color: "B", at: { x: 3, y: 3 } }],
                answer: [
                  { x: 5, y: 2 },
                  { x: 2, y: 5 },
                  { x: 5, y: 4 },
                  { x: 4, y: 5 },
                ],
                feedback: "날일자는 넓으면서도 연결이 쉬운 모양이에요.",
              },
            ],
            problems: [
              {
                id: "forest-shape-p1",
                prompt: "한칸 뜀으로 확장하세요.",
                explanation: "같은 선으로 한 칸 뛰어요.",
                setup: [{ color: "B", at: { x: 15, y: 15 } }],
                answer: [
                  { x: 15, y: 13 },
                  { x: 15, y: 17 },
                  { x: 13, y: 15 },
                  { x: 17, y: 15 },
                ],
                wrongHint: "가로·세로로 한 칸 뛰어 보세요.",
              },
              {
                id: "forest-shape-p2",
                prompt: "끊긴 흑을 이으세요.",
                explanation: "두 돌 사이를 잇는 수를 찾아요.",
                setup: [
                  { color: "B", at: { x: 8, y: 9 } },
                  { color: "B", at: { x: 10, y: 9 } },
                  { color: "W", at: { x: 9, y: 8 } },
                ],
                answer: { x: 9, y: 9 },
                wrongHint: "두 흑 가운데를 이어 보세요.",
              },
            ],
          },
        },
        {
          id: "forest-endgame",
          title: "끝내기 가치",
          subtitle: "큰 곳과 급한 곳",
          boardSize: 19,
          minutes: 4,
          vibe: "끝내기",
          steps: [],
          session: {
            concept: [
              {
                text: "끝내기에서는 ‘급한 단수’와 ‘큰 집 경계’를 구분해요.",
                tip: "집이 걸려 있지 않은 한 칸보다, 집 차이가 나는 곳이 커요.",
                setup: [
                  { color: "B", at: { x: 2, y: 2 } },
                  { color: "B", at: { x: 3, y: 2 } },
                  { color: "W", at: { x: 16, y: 16 } },
                ],
                cta: "큰 수",
              },
            ],
            example: [
              {
                text: "왼쪽 위 경계를 밀어 보세요.",
                setup: [
                  { color: "B", at: { x: 2, y: 3 } },
                  { color: "B", at: { x: 3, y: 3 } },
                  { color: "B", at: { x: 4, y: 3 } },
                  { color: "W", at: { x: 15, y: 15 } },
                ],
                answer: [
                  { x: 2, y: 2 },
                  { x: 3, y: 2 },
                  { x: 4, y: 2 },
                ],
                feedback: "집 경계를 미는 수가 끝내기예요.",
              },
            ],
            problems: [
              {
                id: "forest-end-p1",
                prompt: "흑 경계를 한 줄 미세요.",
                explanation: "흑 줄과 나란히 앞줄을 차지해요.",
                setup: [
                  { color: "B", at: { x: 5, y: 5 } },
                  { color: "B", at: { x: 6, y: 5 } },
                  { color: "B", at: { x: 7, y: 5 } },
                ],
                answer: [
                  { x: 5, y: 4 },
                  { x: 6, y: 4 },
                  { x: 7, y: 4 },
                ],
                wrongHint: "흑 줄 위쪽을 밀어 보세요.",
              },
            ],
          },
        },
      ],
    },
  ],
};
