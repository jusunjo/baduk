/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  /** KataGo 프록시 베이스 URL (기본 http://localhost:8787) */
  readonly VITE_KATAGO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
