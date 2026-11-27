import { useSyncExternalStore } from "react";
import { addDays, dayKey, startOfToday } from "./date";
import type { Exercise } from "@/data/path/types";
import type { RankId } from "./ranks";
import { nextCards, type ReviewCard } from "./review";
import { XP_MISSION_BONUS } from "./sfx";

export interface Goal {
  /** YYYY-MM-DD */
  date: string;
  targetRank: RankId;
}

export interface AppState {
  version: 2;
  /** null이면 온보딩 */
  currentRank: RankId | null;
  goal: Goal | null;
  /** lessonId -> completedAt */
  completed: Record<string, number>;
  /** conceptIntro.id -> 본 시각 */
  introSeen: Record<string, number>;
  /** 마지막으로 본 레슨 */
  lastLessonId: string | null;
  /** 연속 학습 일수 */
  streakDays: number;
  /** 마지막으로 레슨을 완료한 날 YYYY-MM-DD */
  lastActiveDay: string | null;
  /** 오늘 미션(한 수)을 완료한 날 YYYY-MM-DD */
  missionCompletedDay: string | null;
  /** 누적 포인트 */
  xp: number;
  /** 오늘 번 XP */
  xpToday: number;
  /** xpToday가 속한 날 */
  xpDay: string | null;
  /** 반복 학습 카드 (reviewKey → 카드) */
  reviews: Record<string, ReviewCard>;
  /** 오늘의 복습을 마친 날 YYYY-MM-DD */
  reviewDoneDay: string | null;
}

const KEY = "hansu/state";

const EMPTY: AppState = {
  version: 2,
  currentRank: null,
  goal: null,
  completed: {},
  introSeen: {},
  lastLessonId: null,
  streakDays: 0,
  lastActiveDay: null,
  missionCompletedDay: null,
  xp: 0,
  xpToday: 0,
  xpDay: null,
  reviews: {},
  reviewDoneDay: null,
};

function migrate(raw: Record<string, unknown>): AppState {
  const introSeen =
    raw.introSeen && typeof raw.introSeen === "object" && !Array.isArray(raw.introSeen)
      ? (raw.introSeen as Record<string, number>)
      : {};
  return {
    ...EMPTY,
    ...raw,
    version: 2,
    introSeen,
    xp: typeof raw.xp === "number" ? raw.xp : 0,
    xpToday: typeof raw.xpToday === "number" ? raw.xpToday : 0,
    xpDay: typeof raw.xpDay === "string" ? raw.xpDay : null,
    reviews:
      raw.reviews && typeof raw.reviews === "object" && !Array.isArray(raw.reviews)
        ? (raw.reviews as Record<string, ReviewCard>)
        : {},
    reviewDoneDay: typeof raw.reviewDoneDay === "string" ? raw.reviewDoneDay : null,
  };
}

function load(): AppState {
  if (import.meta.env.DEV) {
    localStorage.removeItem(KEY);
    return EMPTY;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrate(parsed);
  } catch {
    return EMPTY;
  }
}

let state = load();
const listeners = new Set<() => void>();

function set(next: AppState) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getState(): AppState {
  return state;
}

function bumpActivity(from: AppState): Pick<AppState, "streakDays" | "lastActiveDay" | "missionCompletedDay"> {
  const today = dayKey(startOfToday());
  const yesterday = dayKey(addDays(startOfToday(), -1));
  let streakDays = from.streakDays;
  if (from.lastActiveDay !== today) {
    streakDays = from.lastActiveDay === yesterday ? from.streakDays + 1 : 1;
  }
  return {
    streakDays,
    lastActiveDay: today,
    missionCompletedDay: today,
  };
}

function withXp(from: AppState, amount: number): Pick<AppState, "xp" | "xpToday" | "xpDay"> {
  if (amount <= 0) return { xp: from.xp, xpToday: from.xpToday, xpDay: from.xpDay };
  const today = dayKey(startOfToday());
  const xpToday = from.xpDay === today ? from.xpToday + amount : amount;
  return { xp: from.xp + amount, xpToday, xpDay: today };
}

export const actions = {
  completeOnboarding(currentRank: RankId, goal: Goal | null = null) {
    set({ ...state, currentRank, goal });
  },

  setCurrentRank(currentRank: RankId) {
    set({ ...state, currentRank });
  },

  /** 승급 시험 통과 시 */
  promoteRank(next: RankId) {
    set({ ...state, currentRank: next, ...bumpActivity(state), ...withXp(state, 50) });
  },

  setGoal(goal: Goal | null) {
    set({ ...state, goal });
  },

  addXp(amount: number) {
    if (amount <= 0) return;
    set({ ...state, ...withXp(state, amount) });
  },

  completeLesson(lessonId: string) {
    const first = !state.completed[lessonId];
    const bonus = first ? XP_MISSION_BONUS : 0;
    set({
      ...state,
      completed: { ...state.completed, [lessonId]: Date.now() },
      lastLessonId: lessonId,
      ...bumpActivity(state),
      ...withXp(state, bonus),
    });
  },

  markIntroSeen(introId: string) {
    if (state.introSeen[introId]) return;
    set({
      ...state,
      introSeen: { ...state.introSeen, [introId]: Date.now() },
    });
  },

  /** 문제 첫 시도 결과를 반복 학습 카드에 기록 */
  recordAttempt(ex: Exercise, correct: boolean, inReview = false) {
    const reviews = nextCards(state.reviews, ex, correct, inReview);
    if (reviews === state.reviews) return;
    set({ ...state, reviews });
  },

  /** 오늘의 복습 완료 */
  completeReview() {
    set({ ...state, reviewDoneDay: dayKey(startOfToday()), ...bumpActivity(state) });
  },

  setLastLesson(lessonId: string) {
    set({ ...state, lastLessonId: lessonId });
  },

  reset() {
    set(EMPTY);
  },
};
