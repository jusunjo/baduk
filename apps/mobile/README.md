# 한수 모바일 (Expo WebView)

`used_scouter/apps/mobile`과 같은 방식: 한수 웹을 네이티브 셸로 감싸 Play Store / App Store에 올립니다.

- 앱 이름: 한수
- Android package / iOS bundle: `com.jusun.hansu`

## 시작

```bash
cd apps/mobile
cp .env.example .env   # EXPO_PUBLIC_WEB_URL 수정
npm install
npm start
```

배포는 [DEPLOYMENT.md](./DEPLOYMENT.md) 참고.
