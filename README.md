# 한수 — 쉬운 바둑 (MVP)

처음이에요 ~ 1급까지, **급수**가 중심인 바둑 학습 웹앱. `driving-license-app`과 같은 토스 톤 UI/UX.

스토어 배포는 **Expo WebView** (`apps/mobile`, `used_scouter`와 동일 방식). 패키지: `com.jusun.hansu`.

## 실행

```bash
npm install
npm run dev          # http://localhost:43212
npm run build
```

### AI 대국 (Read19 KataGo)

클라우드 KataGo로 9×9 대국. API 키는 브라우저에 넣지 않고 로컬 프록시만 사용합니다.

1. [Read19](https://read19.com/register) 가입 → [콘솔](https://read19.com/app)에서 `kg_live_...` analysis key 발급  
2. `.env`에 추가 (깃에 올리지 마세요):

```bash
READ19_API_KEY=kg_live_...
```

3. 터미널 두 개:

```bash
npm run katago       # http://localhost:8787 프록시
npm run dev          # 앱
```

4. 앱 하단 **AI** 탭 → 판 크기·레벨 선택 → 대국 (`/play`)

초급 설정: 수당 `maxVisits=50`. 9×9 한 판(AI ~40수)이면 대략 **2,000 visits** — Free 월 10만 unit이면 수십 판 가능.

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

[GoProblems](https://goproblems.com) 급수 문항을 **레퍼런스**로만 보고, 같은 전술 모티프(단수·덩어리·눈·장문·축·이중단수 등)를 위치·회전·판 크기로 변주한 **자작** 뱅크입니다. GP SGF를 그대로 넣지 않습니다.

```bash
npm run build:practice     # 자작 뱅크 재생성 (개념당 약 20문항)
npm run check:practice
npm run fetch:goproblems   # (선택) 레퍼런스용 raw 캐시만 — 앱 뱅크에 직접 쓰지 않음
```

`.env`의 `GOPROBLEMS_API_KEY`는 레퍼런스 fetch 전용입니다. 클라이언트/깃에 올리지 마세요.
