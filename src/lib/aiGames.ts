import { useSyncExternalStore } from "react";

export type AiBoardSize = 7 | 9 | 13 | 19;
export type AiLevelId = "easy" | "normal" | "hard";
export type AiGameResult = "resign" | "finished";

export type AiGameRecord = {
  id: string;
  at: number;
  size: AiBoardSize;
  level: AiLevelId;
  result: AiGameResult;
  moveCount: number;
};

export const AI_LEVELS: { id: AiLevelId; label: string; blurb: string; visits: number }[] = [
  { id: "easy", label: "약함", blurb: "초보 연습", visits: 10 },
  { id: "normal", label: "보통", blurb: "균형 있게", visits: 50 },
  { id: "hard", label: "강함", blurb: "진지한 대국", visits: 200 },
];

export const AI_SIZES: { size: AiBoardSize; label: string; blurb: string }[] = [
  { size: 7, label: "7줄", blurb: "아주 짧게" },
  { size: 9, label: "9줄", blurb: "입문에 좋아요" },
  { size: 13, label: "13줄", blurb: "중반 감각" },
  { size: 19, label: "19줄", blurb: "정식 판" },
];

const KEY = "hansu/ai-games";
const MAX = 30;

function load(): AiGameRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (g): g is AiGameRecord =>
        !!g &&
        typeof g === "object" &&
        typeof (g as AiGameRecord).id === "string" &&
        typeof (g as AiGameRecord).at === "number",
    );
  } catch {
    return [];
  }
}

let games = load();
const listeners = new Set<() => void>();

function emit() {
  localStorage.setItem(KEY, JSON.stringify(games));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAiGames(): AiGameRecord[] {
  return useSyncExternalStore(subscribe, () => games);
}

export function levelMeta(id: AiLevelId) {
  return AI_LEVELS.find((l) => l.id === id) ?? AI_LEVELS[1]!;
}

export const aiGameActions = {
  add(record: Omit<AiGameRecord, "id" | "at"> & { id?: string; at?: number }) {
    const next: AiGameRecord = {
      id: record.id ?? `ai-${Date.now()}`,
      at: record.at ?? Date.now(),
      size: record.size,
      level: record.level,
      result: record.result,
      moveCount: record.moveCount,
    };
    games = [next, ...games].slice(0, MAX);
    emit();
    return next;
  },

  clear() {
    games = [];
    emit();
  },
};

export function formatAiWhen(at: number): string {
  const d = new Date(at);
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mi = `${d.getMinutes()}`.padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

export function resultLabel(r: AiGameResult): string {
  return r === "resign" ? "기권 · AI 승" : "대국 종료";
}
