# 한수 모바일 앱 배포 (Expo WebView · used_scouter 방식)

패키지명: `com.jusun.hansu`

## 0. 웹 먼저 배포

이 앱은 웹을 WebView로 엽니다. **공개 HTTPS URL**이 있어야 합니다.

1. 루트에서 웹 빌드·호스팅 (Vercel / Railway / Cloudflare 등)
2. `apps/mobile/.env` 작성:

```bash
EXPO_PUBLIC_WEB_URL=https://여기에-한수-웹주소
```

3. `App.tsx` 기본값도 같은 URL로 바꿔 두면 안전합니다.

## 1. 의존성 · Expo 로그인

```bash
cd apps/mobile
npm install
npx eas-cli login
npx eas init
```

`eas init`이 `app.json`의 `extra.eas.projectId`를 채워 줍니다.

## 2. 테스트 APK

```bash
npm run build:android -- --profile preview
```

빌드 끝나면 링크에서 APK 받아 폰에 설치.

## 3. Play Console 앱 만들기 (수동 · Google 계정 필요)

자동으로 대신 눌러 줄 수 없는 부분입니다.

1. https://play.google.com/console → 개발자 등록 ($25 1회)
2. **앱 만들기** → 이름 `한수`, 언어 한국어, 앱/게임 = 앱
3. 패키지명은 폼에 따로 안 넣고, 올리는 **AAB의 `com.jusun.hansu`** 가 곧 패키지명

## 4. 스토어용 AAB

```bash
npm run build:android -- --profile production
```

Play Console → 테스트/프로덕션 트랙 → AAB 업로드 → 스토어 등록정보·개인정보처리방침·데이터 보안 작성 → 검토 제출.

## 자주 쓰는 명령

```bash
npm start                                          # Expo Go 개발
EXPO_PUBLIC_WEB_URL=http://<PC LAN IP>:43212 npm start
npm run build:android -- --profile preview         # APK
npm run build:android -- --profile production      # AAB
```
