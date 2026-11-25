# 한수 — 쉬운 바둑 (MVP)

처음이에요 ~ 1급까지, **급수**가 중심인 바둑 학습 웹앱. `driving-license-app`과 같은 토스 톤 UI/UX.

스토어 배포는 **Expo WebView** (`apps/mobile`, `used_scouter`와 동일 방식). 패키지: `com.jusun.hansu`.

## 실행

```bash
npm install
npm run dev          # http://localhost:43212
npm run build
```

### 모바일 (Play Store)

```bash
cd apps/mobile
cp .env.example .env   # EXPO_PUBLIC_WEB_URL=배포된 웹 주소
npm install
npm start
# 배포 가이드: apps/mobile/DEPLOYMENT.md
```

## MVP 플로우

1. **온보딩** — 현재 급수 선택 → (선택) 목표 급수·날짜  
2. **홈** — 나의 급수, 연속·미션, 다음 레슨 CTA  
3. **배우기** — 현재 급수에 맞는 판(7~19줄) 챕터·레슨  
4. **레슨** — 개념 → 예시 → 문제(+오답 복습) + 인터랙티브 바둑판  
5. **나의 급수** — 지금/목표 급수, 급수가 올라가는 길  

## 급수 → 판 크기

| 급수 | 판 | 비고 |
|------|-----|------|
| 처음이에요 · 30 · 25 · 20급 | 7줄 | 규칙·활로·따내기 |
| 15급 | 9줄 | 집·끝내기 |
| 10 · 7급 | 13줄 | 포석·사활 |
| 5 · 3 · 1급 | 19줄 | 실전 판 |

급수는 실력 표시예요. **숫자가 작을수록 강해요.**  
10급 설명 예: *19줄 바둑판에서 바둑을 끝낼 수 있을 정도의 실력*

## 승급 시험

급수당 **자작 10문제** (`src/data/exams/g30.json` … `g1.json`). 통과 기준 **8/10**.  
다시 생성·검증: `npm run build:exams` · `npm run check:exams`

선택으로 [RapidAPI Go Problem API](https://rapidapi.com/thousandapisit/api/go-problem-api) Basic(월 2000회) 시드도 가능합니다.

```bash
# .env 에 RAPIDAPI_KEY=... 추가 후
npm run fetch:exams              # 최대 2000회 배분 시드
npm run fetch:exams -- --limit 20   # 소량 테스트
```

배분: 30k~10k 각 250 · 7k~3k 각 200 · 1k 150 (합 2000).

## 연습 문제 (문제 풀이)

개념·문항을 [GoProblems](https://goproblems.com) canon으로 채웁니다(약 65개념 / 860문항).

| 트랙 | 개념 | 문항 | 소스 |
|------|------|------|------|
| **seed** | 17 | 190 | 자작 규칙 드릴 + GP 입문 |
| **sprout** | 12 | 180 | GP (기초) |
| **leaf** | 12 | 180 | GP (중급) |
| **tree** | 12 | 180 | GP (상급) |
| **forest** | 12 | 130 | GP (실전) |

```bash
npm run build:practice                 # seed 자작 부분
npm run fetch:goproblems               # 전 트랙 시드
npm run fetch:goproblems -- --track forest
npm run check:practice
```

`.env`에 `GOPROBLEMS_API_KEY`(설정→API 토큰)를 넣으세요. 클라이언트/깃에 올리지 마세요.  
원본 응답은 `src/data/practice/raw-goproblems/`에 캐시되며 gitignore됩니다. 요청은 딜레이·429 재시도로 천천히 — [API 안내](https://goproblems.com/article/api).
