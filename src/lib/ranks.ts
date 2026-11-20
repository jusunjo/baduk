/** 낮을수록 초보. level 값이 클수록 강함. */
export type RankId =
  | "beginner"
  | "g30"
  | "g25"
  | "g20"
  | "g15"
  | "g10"
  | "g7"
  | "g5"
  | "g3"
  | "g1";

export interface Rank {
  id: RankId;
  /** 화면 표기 */
  label: string;
  /** 짧은 표기 (홈 칩 등) */
  short: string;
  /** 급수 옆 설명글 */
  meaning: string;
  /** 이 급수에서 주로 쓰는 판 크기 */
  boardSize: 5 | 7 | 9 | 13 | 19;
  /** 학습 트랙 키 */
  track: TrackId;
  /** 정렬용 실력 점수 (클수록 강함) */
  level: number;
}

export type TrackId = "seed" | "sprout" | "leaf" | "tree" | "forest";

export const TRACKS: Record<
  TrackId,
  { label: string; boardSize: 5 | 7 | 9 | 13 | 19; blurb: string }
> = {
  seed: { label: "씨앗", boardSize: 5, blurb: "돌 놓기와 따내기의 감각을 익혀요" },
  sprout: { label: "새싹", boardSize: 7, blurb: "활로와 두 눈을 배워요" },
  leaf: { label: "잎새", boardSize: 9, blurb: "집을 만들고 작은 대국을 끝낼 수 있어요" },
  tree: { label: "나무", boardSize: 13, blurb: "포석·사활의 기본을 쌓아요" },
  forest: { label: "숲", boardSize: 19, blurb: "19줄 판에서 한 판을 끝까지 두어요" },
};

export const RANKS: Rank[] = [
  {
    id: "beginner",
    label: "처음이에요",
    short: "입문",
    meaning: "바둑판을 처음 보거나, 돌만 놓아본 정도예요",
    boardSize: 5,
    track: "seed",
    level: 0,
  },
  {
    id: "g30",
    label: "30급",
    short: "30급",
    meaning: "바둑 규칙을 막 알기 시작했어요. 5줄 판에서 연습하기 좋아요",
    boardSize: 5,
    track: "seed",
    level: 1,
  },
  {
    id: "g25",
    label: "25급",
    short: "25급",
    meaning: "따내기와 숨구멍을 조금씩 알아요. 7줄 판이 딱 맞아요",
    boardSize: 7,
    track: "sprout",
    level: 2,
  },
  {
    id: "g20",
    label: "20급",
    short: "20급",
    meaning: "작은 판에서 한 판을 끝까지 둘 수 있어요",
    boardSize: 7,
    track: "sprout",
    level: 3,
  },
  {
    id: "g15",
    label: "15급",
    short: "15급",
    meaning: "집을 만들고 끝내는 감각이 생겨요. 9줄 판이 좋아요",
    boardSize: 9,
    track: "leaf",
    level: 4,
  },
  {
    id: "g10",
    label: "10급",
    short: "10급",
    meaning: "19줄 바둑판에서 바둑을 끝낼 수 있을 정도의 실력이에요",
    boardSize: 13,
    track: "tree",
    level: 5,
  },
  {
    id: "g7",
    label: "7급",
    short: "7급",
    meaning: "기본 사활과 정석 느낌이 잡혀가요",
    boardSize: 13,
    track: "tree",
    level: 6,
  },
  {
    id: "g5",
    label: "5급",
    short: "5급",
    meaning: "중반 전투를 읽고, 19줄에서 안정적으로 한 판을 둡니다",
    boardSize: 19,
    track: "forest",
    level: 7,
  },
  {
    id: "g3",
    label: "3급",
    short: "3급",
    meaning: "형세 판단과 끝내기가 꽤 탄탄해요",
    boardSize: 19,
    track: "forest",
    level: 8,
  },
  {
    id: "g1",
    label: "1급",
    short: "1급",
    meaning: "유단자 입문 직전. 실전에서 흔들리지 않는 기초가 있어요",
    boardSize: 19,
    track: "forest",
    level: 9,
  },
];

export function getRank(id: RankId): Rank {
  return RANKS.find((r) => r.id === id)!;
}

/** 목표 급수는 현재보다 높은 것만 */
export function goalRanks(current: RankId): Rank[] {
  const cur = getRank(current).level;
  return RANKS.filter((r) => r.level > cur);
}
