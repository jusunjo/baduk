/** 낮을수록 초보. level 값이 클수록 강함. */
export type RankId =
  | "beginner"
  | "g30"
  | "g29"
  | "g28"
  | "g27"
  | "g26"
  | "g25"
  | "g24"
  | "g23"
  | "g22"
  | "g21"
  | "g20"
  | "g19"
  | "g18"
  | "g17"
  | "g16"
  | "g15"
  | "g14"
  | "g13"
  | "g12"
  | "g11"
  | "g10"
  | "g9"
  | "g8"
  | "g7"
  | "g6"
  | "g5"
  | "g4"
  | "g3"
  | "g2"
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
  boardSize: 7 | 9 | 13 | 19;
  /** 학습 트랙 키 */
  track: TrackId;
  /** 정렬용 실력 점수 (클수록 강함) */
  level: number;
}

export type TrackId = "seed" | "sprout" | "leaf" | "tree" | "forest";

export const TRACKS: Record<
  TrackId,
  { label: string; boardSize: 7 | 9 | 13 | 19; blurb: string }
> = {
  seed: { label: "입문", boardSize: 7, blurb: "규칙의 뼈대만, 부담 없이" },
  sprout: { label: "기초", boardSize: 7, blurb: "활로·두 눈도 생각보다 단순해요" },
  leaf: { label: "중급", boardSize: 9, blurb: "집 짓기까지, 한 판을 끝낼 수 있어요" },
  tree: { label: "상급", boardSize: 13, blurb: "포석·사활도 기본만 익히면 돼요" },
  forest: { label: "실전", boardSize: 19, blurb: "큰 판도 같은 규칙으로 두어요" },
};

type RankSeed = {
  n: number;
  meaning: string;
  boardSize: 7 | 9 | 13 | 19;
  track: TrackId;
};

/** 한국기원·학원식 급수 지표를 앱용으로 압축 */
const SEEDS: RankSeed[] = [
  { n: 30, meaning: "돌 놓기·숨구멍·따내기부터, 잡고 살리는 감각까지", boardSize: 7, track: "seed" },
  { n: 29, meaning: "단수를 찾고, 한 수로 따내거나 도망치는 연습", boardSize: 7, track: "seed" },
  { n: 28, meaning: "잇고 끊으며, 강한 돌·약한 돌의 차이를 느껴요", boardSize: 7, track: "seed" },
  { n: 27, meaning: "양단수·축·장문의 맛을 살짝 봐요", boardSize: 7, track: "seed" },
  { n: 26, meaning: "축 몰이와 촉촉수로 잡는 감각을 굳혀요", boardSize: 7, track: "seed" },
  { n: 25, meaning: "두 눈과 집 개념, 귀·변·중앙을 구분해요", boardSize: 7, track: "sprout" },
  { n: 24, meaning: "옥집·빅, 잘못된 축·장문을 가려요", boardSize: 7, track: "sprout" },
  { n: 23, meaning: "약한 돌만 치고, 잡지 않아도 되는 돌을 남겨요", boardSize: 9, track: "sprout" },
  { n: 22, meaning: "약할 때 지키고, 강한 돌과 안 싸우는 지혜", boardSize: 9, track: "sprout" },
  { n: 21, meaning: "내 돌을 지키며 집을 짓는 기본 운영", boardSize: 9, track: "sprout" },
  { n: 20, meaning: "궁도 사활·수상전 입문, 한 수 앞서 읽기", boardSize: 9, track: "sprout" },
  { n: 19, meaning: "기초 사활과 먹여치기를 실전에 써 봐요", boardSize: 9, track: "sprout" },
  { n: 18, meaning: "공배를 메우고 한 판을 계가까지 마무리해요", boardSize: 9, track: "sprout" },
  { n: 17, meaning: "한칸뜀·날일자 등 기초 행마를 익혀요", boardSize: 9, track: "sprout" },
  { n: 16, meaning: "기초 정석 맛보기와 형세 감각의 시작", boardSize: 9, track: "sprout" },
  { n: 15, meaning: "사활을 실전에 쓰고 귀·변·중앙 가치를 알아요", boardSize: 9, track: "leaf" },
  { n: 14, meaning: "맞끊기 행마와 격언을 판 위에서 써 봐요", boardSize: 13, track: "leaf" },
  { n: 13, meaning: "둘 곳·안 둘 곳, 큰자리와 작은자리를 가려요", boardSize: 13, track: "leaf" },
  { n: 12, meaning: "포석·정석을 활용하고 다음 수를 대비해요", boardSize: 13, track: "leaf" },
  { n: 11, meaning: "수읽기 2~3수와 끝내기 기본을 익혀요", boardSize: 13, track: "leaf" },
  { n: 10, meaning: "실리와 세력, 선수·후수의 차이를 알아요", boardSize: 13, track: "tree" },
  { n: 9, meaning: "삼삼 침입과 화점·소목의 차이를 배워요", boardSize: 13, track: "tree" },
  { n: 8, meaning: "다양한 행마와 대략적인 집 계산", boardSize: 13, track: "tree" },
  { n: 7, meaning: "침투·삭감, 공격과 수비의 방향을 잡아요", boardSize: 13, track: "tree" },
  { n: 6, meaning: "끝내기 가치와 급소·큰곳의 우선순위", boardSize: 19, track: "forest" },
  { n: 5, meaning: "근거를 빼앗으며 중반 전투를 운영해요", boardSize: 19, track: "forest" },
  { n: 4, meaning: "포석·사활·끝내기를 균형 있게 다뤄요", boardSize: 19, track: "forest" },
  { n: 3, meaning: "깊은 수읽기와 비교적 정확한 형세 판단", boardSize: 19, track: "forest" },
  { n: 2, meaning: "초반부터 종반까지 구상하고 버릴 돌을 알아요", boardSize: 19, track: "forest" },
  { n: 1, meaning: "상대별 작전과 전체 복기, 유단 직전 정리", boardSize: 19, track: "forest" },
];

function seedToRank(s: RankSeed): Rank {
  const id = `g${s.n}` as RankId;
  const label = `${s.n}급`;
  return {
    id,
    label,
    short: label,
    meaning: s.meaning,
    boardSize: s.boardSize,
    track: s.track,
    /** 30급=1 … 1급=30 */
    level: 31 - s.n,
  };
}

export const RANKS: Rank[] = [
  {
    id: "beginner",
    label: "처음이에요",
    short: "30급",
    meaning: "몰라도 괜찮아요. 30급 규칙 입문부터 차근차근 익혀요",
    boardSize: 7,
    track: "seed",
    level: 0,
  },
  ...SEEDS.map(seedToRank),
];

export function getRank(id: RankId): Rank {
  return RANKS.find((r) => r.id === id)!;
}

/** 다음 급수 (없으면 null) */
export function nextRank(id: RankId): Rank | null {
  const i = RANKS.findIndex((r) => r.id === id);
  if (i < 0 || i + 1 >= RANKS.length) return null;
  return RANKS[i + 1]!;
}

/** 목표 급수는 현재보다 높은 것만 */
export function goalRanks(current: RankId): Rank[] {
  const cur = getRank(current).level;
  return RANKS.filter((r) => r.level > cur);
}

/** g30 → 30 */
export function rankNumber(id: RankId): number | null {
  if (id === "beginner") return null;
  const n = Number(id.slice(1));
  return Number.isFinite(n) ? n : null;
}
