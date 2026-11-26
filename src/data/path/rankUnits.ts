import type { RankId } from "@/lib/ranks";

export type RankUnitDef = {
  tag: string;
  title: string;
  subtitle: string;
};

export type RankCatalogEntry = {
  blurb: string;
  introTitle: string;
  introSubtitle: string;
  units: RankUnitDef[];
};

type PlayRankId = Exclude<RankId, "beginner">;

/** 급수마다 30급처럼 대단원(Part)으로 쪼갠 학습 골격 */
export const RANK_CATALOG: Record<PlayRankId, RankCatalogEntry> = {
  g30: {
    blurb: "한 수로 잡고 살리고, 잇고 끊는 감각을 만들어요.",
    introTitle: "30급에서 배울 것",
    introSubtitle: "따내기 · 살리기 · 연결",
    units: [
      { tag: "따내기", title: "잡기 / 살리기", subtitle: "한 수로 따내거나 숨구멍을 늘려요" },
      { tag: "연결", title: "잇기 / 끊기", subtitle: "한 칸을 이어 한 덩어리로" },
      { tag: "판단", title: "선택하기", subtitle: "잡기·살리기·잇기 중 고르기" },
    ],
  },
  g29: {
    blurb: "단수를 재빨리 찾고 한 수로 처리해요.",
    introTitle: "29급에서 배울 것",
    introSubtitle: "단수 · 따냄 · 도망",
    units: [
      { tag: "단수", title: "단수 찾기", subtitle: "숨구멍 1개인 돌을 찾아요" },
      { tag: "따냄", title: "한 수 따냄", subtitle: "남은 칸을 막아 들어내요" },
      { tag: "도망", title: "도망치기", subtitle: "늘려서 숨구멍을 늘려요" },
    ],
  },
  g28: {
    blurb: "잇고 끊으며 돌의 강약을 느껴 봐요.",
    introTitle: "28급에서 배울 것",
    introSubtitle: "연결 · 끊기 · 강약",
    units: [
      { tag: "연결", title: "잇기", subtitle: "내 돌을 한 덩어리로" },
      { tag: "끊기", title: "끊기", subtitle: "상대 연결을 갈라요" },
      { tag: "강약", title: "강한 돌 · 약한 돌", subtitle: "호구 안엔 들어가지 않아요" },
    ],
  },
  g27: {
    blurb: "양단수와 축·장문의 기본 모양을 익혀요.",
    introTitle: "27급에서 배울 것",
    introSubtitle: "양단수 · 축 · 장문",
    units: [
      { tag: "양단수", title: "양단수", subtitle: "한 수로 두 곳을 동시에" },
      { tag: "축", title: "축 맛보기", subtitle: "지그재그로 몰아가요" },
      { tag: "장문", title: "장문 맛보기", subtitle: "길을 넓게 막아 잡아요" },
    ],
  },
  g26: {
    blurb: "축을 끝까지 읽고 촉촉수로 마무리해요.",
    introTitle: "26급에서 배울 것",
    introSubtitle: "축 · 촉촉수 · 판단",
    units: [
      { tag: "축", title: "축 몰이", subtitle: "축머리가 있는지 확인해요" },
      { tag: "촉촉수", title: "촉촉수", subtitle: "잡으러 온 돌까지 함께" },
      { tag: "판단", title: "살릴까 버릴까", subtitle: "이미 잡힌 돌은 버려요" },
    ],
  },
  g25: {
    blurb: "두 눈과 집, 귀·변·중앙을 구분해요.",
    introTitle: "25급에서 배울 것",
    introSubtitle: "두 눈 · 집 · 방향",
    units: [
      { tag: "두눈", title: "두 눈", subtitle: "독립된 두 집이 살아요" },
      { tag: "집", title: "집 개념", subtitle: "둘러싼 빈칸이 집이에요" },
      { tag: "방향", title: "귀 · 변 · 중앙", subtitle: "어디에 두기 쉬운지" },
    ],
  },
  g24: {
    blurb: "옥집과 빅, 잘못된 축·장문을 가려요.",
    introTitle: "24급에서 배울 것",
    introSubtitle: "옥집 · 빅 · 함정",
    units: [
      { tag: "옥집", title: "옥집", subtitle: "가짜 눈을 알아봐요" },
      { tag: "빅", title: "빅", subtitle: "서로 손댈 수 없는 공존" },
      { tag: "함정", title: "잘못된 축 · 장문", subtitle: "안 되는 몰이를 피해요" },
    ],
  },
  g23: {
    blurb: "약한 돌만 치고, 잡지 않아도 되는 돌을 남겨요.",
    introTitle: "23급에서 배울 것",
    introSubtitle: "선택 · 빅 · 효율",
    units: [
      { tag: "선택", title: "약한 돌만 치기", subtitle: "강한 돌과는 안 싸워요" },
      { tag: "빅", title: "빅 만들기", subtitle: "공존으로 마무리해요" },
      { tag: "효율", title: "잡지 않아도 되는 돌", subtitle: "급한 곳에 수를 써요" },
    ],
  },
  g22: {
    blurb: "약할 때는 지키고, 기회를 봐서 싸워요.",
    introTitle: "22급에서 배울 것",
    introSubtitle: "수비 · 옥집 · 타이밍",
    units: [
      { tag: "수비", title: "약할 때 지키기", subtitle: "먼저 내 돌을 튼튼히" },
      { tag: "옥집", title: "옥집 만들기", subtitle: "상대 눈을 망가뜨려요" },
      { tag: "타이밍", title: "싸울 타이밍", subtitle: "약한 돌과만 싸워요" },
    ],
  },
  g21: {
    blurb: "지키면서 집을 짓는 기본 운영을 익혀요.",
    introTitle: "21급에서 배울 것",
    introSubtitle: "강약 · 보호 · 집",
    units: [
      { tag: "강약", title: "돌의 강약", subtitle: "누가 더 튼튼한지" },
      { tag: "보호", title: "내 돌 보호", subtitle: "끊기지 않게 이어요" },
      { tag: "집", title: "막으며 집 짓기", subtitle: "막는 수가 곧 집이에요" },
    ],
  },
  g20: {
    blurb: "궁도 사활과 수상전으로 한 수를 앞서 읽어요.",
    introTitle: "20급에서 배울 것",
    introSubtitle: "사활 · 수상전 · 수읽기",
    units: [
      { tag: "사활", title: "궁도 사활", subtitle: "눈 공간의 기본형" },
      { tag: "수상전", title: "수상전 입문", subtitle: "활로 개수로 승부" },
      { tag: "수읽기", title: "한 수 앞서", subtitle: "상대 다음 수를 떠올려요" },
    ],
  },
  g19: {
    blurb: "기초 사활과 먹여치기를 실전에 써 봐요.",
    introTitle: "19급에서 배울 것",
    introSubtitle: "사활 · 먹여치기 · 응용",
    units: [
      { tag: "사활", title: "기초 사활", subtitle: "4사6활 · 6사8활" },
      { tag: "먹여치기", title: "먹여치기", subtitle: "희생으로 모양을 무너뜨려요" },
      { tag: "응용", title: "실전 사활", subtitle: "판 위에서 바로 써 봐요" },
    ],
  },
  g18: {
    blurb: "공배를 정리하고 한 판을 계가까지 마무리해요.",
    introTitle: "18급에서 배울 것",
    introSubtitle: "공배 · 마무리 · 계가",
    units: [
      { tag: "공배", title: "공배 메우기", subtitle: "어느 쪽 집도 아닌 칸" },
      { tag: "마무리", title: "한 판 마무리", subtitle: "둘 곳이 없을 때까지" },
      { tag: "계가", title: "계가", subtitle: "집을 세어 승패를 가려요" },
    ],
  },
  g17: {
    blurb: "한칸뜀·날일자로 넓게 움직이는 행마를 익혀요.",
    introTitle: "17급에서 배울 것",
    introSubtitle: "행마 · 걸침 · 굳힘",
    units: [
      { tag: "행마", title: "기초 행마", subtitle: "한칸뜀 · 날일자" },
      { tag: "걸침", title: "걸침", subtitle: "귀에 다가가는 첫 수" },
      { tag: "굳힘", title: "굳힘", subtitle: "귀를 튼튼히 지키며" },
    ],
  },
  g16: {
    blurb: "기초 정석과 형세 감각을 살짝 열어 봐요.",
    introTitle: "16급에서 배울 것",
    introSubtitle: "정석 · 형세 · 복기",
    units: [
      { tag: "정석", title: "기초 정석", subtitle: "귀에서 자주 나오는 수순" },
      { tag: "형세", title: "형세 감각", subtitle: "누가 더 넓어 보이는지" },
      { tag: "복기", title: "복기 습관", subtitle: "방금 판을 다시 봐요" },
    ],
  },
  g15: {
    blurb: "사활을 실전에 쓰고 자리의 가치를 가려요.",
    introTitle: "15급에서 배울 것",
    introSubtitle: "사활 · 가치 · 급소",
    units: [
      { tag: "사활", title: "사활 실전", subtitle: "살리고 죽이는 급소" },
      { tag: "가치", title: "귀 · 변 · 중앙", subtitle: "어디에 더 큰 이득이" },
      { tag: "급소", title: "급한 곳", subtitle: "큰곳보다 급한 곳 먼저" },
    ],
  },
  g14: {
    blurb: "맞끊기와 격언을 판 위에서 써 봐요.",
    introTitle: "14급에서 배울 것",
    introSubtitle: "맞끊기 · 격언 · 연결",
    units: [
      { tag: "맞끊기", title: "맞끊기 행마", subtitle: "끊긴 뒤 어떻게 둘까" },
      { tag: "격언", title: "격언 적용", subtitle: "급소는 한가운데" },
      { tag: "연결", title: "연결 유지", subtitle: "갈라지지 않게" },
    ],
  },
  g13: {
    blurb: "둘 곳과 안 둘 곳, 큰자리와 작은자리를 가려요.",
    introTitle: "13급에서 배울 것",
    introSubtitle: "선택 · 크기 · 방향",
    units: [
      { tag: "선택", title: "둘 곳 · 안 둘 곳", subtitle: "금기 자리를 피해요" },
      { tag: "크기", title: "큰자리 · 작은자리", subtitle: "집의 크기를 비교해요" },
      { tag: "방향", title: "방향 잡기", subtitle: "어디로 뻗어 나갈까" },
    ],
  },
  g12: {
    blurb: "포석·정석을 쓰고 다음 수를 대비해요.",
    introTitle: "12급에서 배울 것",
    introSubtitle: "포석 · 정석 · 대비",
    units: [
      { tag: "포석", title: "포석 활용", subtitle: "초반 큰 그림" },
      { tag: "정석", title: "정석 활용", subtitle: "귀에 익은 수순" },
      { tag: "대비", title: "다음 수 대비", subtitle: "상대가 올 곳을 막아요" },
    ],
  },
  g11: {
    blurb: "2~3수 수읽기와 끝내기 기본을 익혀요.",
    introTitle: "11급에서 배울 것",
    introSubtitle: "수읽기 · 끝내기 · 우선",
    units: [
      { tag: "수읽기", title: "수읽기 2~3수", subtitle: "결과를 미리 떠올려요" },
      { tag: "끝내기", title: "끝내기 기본", subtitle: "경계를 정리해요" },
      { tag: "우선", title: "큰 끝내기 먼저", subtitle: "작은 곳은 나중에" },
    ],
  },
  g10: {
    blurb: "실리와 세력, 선수와 후수를 구분해요.",
    introTitle: "10급에서 배울 것",
    introSubtitle: "실리 · 세력 · 선수",
    units: [
      { tag: "실리", title: "실리 vs 세력", subtitle: "확실한 집과 영향력" },
      { tag: "선수", title: "선수 · 후수", subtitle: "누가 먼저 둘 수 있나" },
      { tag: "정석", title: "화점 정석 기본", subtitle: "자주 나오는 귀 수순" },
    ],
  },
  g9: {
    blurb: "삼삼 침입과 화점·소목의 차이를 배워요.",
    introTitle: "9급에서 배울 것",
    introSubtitle: "삼삼 · 착점 · 선택",
    units: [
      { tag: "삼삼", title: "삼삼 침입", subtitle: "귀 안으로 들어가는 수" },
      { tag: "착점", title: "화점 · 소목 · 외목", subtitle: "첫 수의 성격 차이" },
      { tag: "선택", title: "정석 선택", subtitle: "판 전체에 맞는 변화" },
    ],
  },
  g8: {
    blurb: "다양한 행마와 대략적인 집 계산을 연습해요.",
    introTitle: "8급에서 배울 것",
    introSubtitle: "행마 · 복기 · 집계산",
    units: [
      { tag: "행마", title: "행마 다양화", subtitle: "상황에 맞는 간격" },
      { tag: "복기", title: "부분 복기", subtitle: "방금 싸움을 되짚어요" },
      { tag: "집계산", title: "대략 집 계산", subtitle: "누가 앞서는지 가늠해요" },
    ],
  },
  g7: {
    blurb: "침투·삭감과 공격·수비의 방향을 잡아요.",
    introTitle: "7급에서 배울 것",
    introSubtitle: "침투 · 공격 · 집",
    units: [
      { tag: "침투", title: "침투 · 삭감", subtitle: "상대 세력을 줄여요" },
      { tag: "공격", title: "공격과 수비", subtitle: "언제 치고 언제 막을까" },
      { tag: "집", title: "집 크기 감각", subtitle: "목산으로 비교해요" },
    ],
  },
  g6: {
    blurb: "끝내기 가치와 급소·큰곳의 우선순위를 익혀요.",
    introTitle: "6급에서 배울 것",
    introSubtitle: "끝내기 · 우선 · 귀삼수",
    units: [
      { tag: "끝내기", title: "끝내기 가치", subtitle: "몇 집짜리 수인지" },
      { tag: "우선", title: "급소 vs 큰곳", subtitle: "급한 수부터" },
      { tag: "귀삼수", title: "귀삼수", subtitle: "귀 끝내기의 기본" },
    ],
  },
  g5: {
    blurb: "근거를 빼앗으며 중반 전투를 운영해요.",
    introTitle: "5급에서 배울 것",
    introSubtitle: "근거 · 공격 · 형세",
    units: [
      { tag: "근거", title: "근거 빼앗기", subtitle: "상대가 쉴 곳을 막아요" },
      { tag: "공격", title: "공격 방향", subtitle: "어디로 몰아갈까" },
      { tag: "형세", title: "형세 ±20집", subtitle: "대략 앞선 쪽을 알아요" },
    ],
  },
  g4: {
    blurb: "포석·사활·끝내기를 균형 있게 다뤄요.",
    introTitle: "4급에서 배울 것",
    introSubtitle: "전투 · 균형 · 복기",
    units: [
      { tag: "전투", title: "전투 운영", subtitle: "싸움을 끝까지 읽어요" },
      { tag: "균형", title: "전 구간 균형", subtitle: "포석·사활·끝내기" },
      { tag: "복기", title: "50수 복기", subtitle: "초반을 되짚어요" },
    ],
  },
  g3: {
    blurb: "깊은 수읽기와 비교적 정확한 형세를 목표로 해요.",
    introTitle: "3급에서 배울 것",
    introSubtitle: "수읽기 · 형세 · 복기",
    units: [
      { tag: "수읽기", title: "깊은 수읽기", subtitle: "변화를 더 길게" },
      { tag: "형세", title: "형세 ±15집", subtitle: "오차를 줄여요" },
      { tag: "복기", title: "100수 복기", subtitle: "중반까지 되짚어요" },
    ],
  },
  g2: {
    blurb: "초반부터 종반까지 구상하고 버릴 돌을 알아요.",
    introTitle: "2급에서 배울 것",
    introSubtitle: "구상 · 형세 · 버림돌",
    units: [
      { tag: "구상", title: "초반~종반 구상", subtitle: "큰 그림을 먼저" },
      { tag: "형세", title: "형세 정확도", subtitle: "집을 더 정확히" },
      { tag: "버림돌", title: "버릴 돌", subtitle: "작은 것을 내주고 큰 것을" },
    ],
  },
  g1: {
    blurb: "상대별 작전과 전체 복기, 유단 직전을 다져요.",
    introTitle: "1급에서 배울 것",
    introSubtitle: "작전 · 복기 · 정리",
    units: [
      { tag: "작전", title: "상대별 작전", subtitle: "성향에 맞춰 두어요" },
      { tag: "복기", title: "전체 복기", subtitle: "한 판을 처음부터" },
      { tag: "정리", title: "유단 직전 정리", subtitle: "약한 고리를 메워요" },
    ],
  },
};
