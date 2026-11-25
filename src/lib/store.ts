import { useSyncExternalStore } from "react";
import { addDays, dayKey, startOfToday } from "./date";
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
  /** 연속 학습 일수 */
  streakDays: number;
  /** 마지막으로 레슨을 완료한 날 YYYY-MM-DD */
  lastActiveDay: string | null;
  /** 오늘 미션(한 수)을 완료한 날 YYYY-MM-DD */
  missionCompletedDay: string | null;
}

const KEY = "hansu/state";

const EMPTY: AppState = {
  version: 1,
  currentRank: null,
  goal: null,
  completed: {},
  lastLessonId: null,
  streakDays: 0,
  lastActiveDay: null,
  missionCompletedDay: null,
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

export const actions = {
  completeOnboarding(currentRank: RankId, goal: Goal | null = null) {
    set({ ...state, currentRank, goal });
  },

  setCurrentRank(currentRank: RankId) {
    set({ ...state, currentRank });
  },

  /** 승급 시험 통과 시 */
  promoteRank(next: RankId) {
    set({ ...state, currentRank: next, ...bumpActivity(state) });
  },

  setGoal(goal: Goal | null) {
    set({ ...state, goal });
  },

  completeLesson(lessonId: string) {
    set({
      ...state,
      completed: { ...state.completed, [lessonId]: Date.now() },
      lastLessonId: lessonId,
      ...bumpActivity(state),
    });
  },

  setLastLesson(lessonId: string) {
    set({ ...state, lastLessonId: lessonId });
  },

  reset() {
    set(EMPTY);
  },
};
