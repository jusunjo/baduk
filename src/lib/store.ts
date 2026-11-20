import { useSyncExternalStore } from "react";
import type { RankId } from "./ranks";

export interface Goal {
  /** YYYY-MM-DD */
  date: string;
  targetRank: RankId;
}

export interface AppState {
  version: 1;
  /** null이면 온보딩 */
  currentRank: RankId | null;
  goal: Goal | null;
  /** lessonId -> completedAt */
  completed: Record<string, number>;
  /** 마지막으로 본 레슨 */
  lastLessonId: string | null;
}

const KEY = "hansu/state";

const EMPTY: AppState = {
  version: 1,
  currentRank: null,
  goal: null,
  completed: {},
  lastLessonId: null,
};

function load(): AppState {
  if (import.meta.env.DEV) {
    localStorage.removeItem(KEY);
    return EMPTY;
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as AppState;
    return parsed.version === EMPTY.version ? { ...EMPTY, ...parsed } : EMPTY;
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

export const actions = {
  completeOnboarding(currentRank: RankId, goal: Goal | null = null) {
    set({ ...state, currentRank, goal });
  },

  setCurrentRank(currentRank: RankId) {
    set({ ...state, currentRank });
  },

  setGoal(goal: Goal | null) {
    set({ ...state, goal });
  },

  completeLesson(lessonId: string) {
    set({
      ...state,
      completed: { ...state.completed, [lessonId]: Date.now() },
      lastLessonId: lessonId,
    });
  },

  setLastLesson(lessonId: string) {
    set({ ...state, lastLessonId: lessonId });
  },

  reset() {
    set(EMPTY);
  },
};
