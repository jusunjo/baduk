import {
  buildQueue,
  COURSE,
  getCourse,
  getRankModule,
  itemKey,
  itemTitle,
  type PathItem,
} from "@/data/path";
import { addDays, dayKey, daysUntil, startOfToday } from "./date";
import { getRank, type Rank } from "./ranks";
import { useStore } from "./store";

export function useProgress() {
  const state = useStore();
  const rank = state.currentRank ? getRank(state.currentRank) : null;
  const course = getCourse();
  const module = rank ? getRankModule(rank.id) : null;
  const queue = rank ? buildQueue(rank.id) : [];

  const doneKeys = queue.filter((item) => state.completed[itemKey(item)]).length;
  const nextItem = queue.find((item) => !state.completed[itemKey(item)]) ?? null;
  const nextId = nextItem ? itemKey(nextItem) : null;
  const nextTitle = nextItem ? itemTitle(nextItem) : null;

  const courseLessons = COURSE.units.flatMap((u) => u.lessons);
  const courseDone = courseLessons.filter((l) => state.completed[l.id]).length;
  const courseComplete = courseDone >= courseLessons.length;

  const moduleItems: PathItem[] = module
    ? [
        { kind: "rank-intro", module },
        ...module.parts.map((part) => ({ kind: "rank-part" as const, module, part })),
      ]
    : [];
  const moduleDone = moduleItems.filter((item) => state.completed[itemKey(item)]).length;
  const moduleComplete = moduleItems.length > 0 && moduleDone >= moduleItems.length;
  const examKey = module ? `exam:${module.rankId}` : null;
  const examPassed = examKey ? !!state.completed[examKey] : false;
  const canTakeExam = !!module?.exam && moduleComplete && !examPassed;

  const target: Rank | null = state.goal ? getRank(state.goal.targetRank) : null;
  const daysLeft = state.goal ? daysUntil(state.goal.date) : null;

  const today = dayKey(startOfToday());
  const yesterday = dayKey(addDays(startOfToday(), -1));
  const streakAlive = state.lastActiveDay === today || state.lastActiveDay === yesterday;
  const streakDays = streakAlive ? state.streakDays : 0;
  const missionDoneToday = state.missionCompletedDay === today;

  return {
    ...state,
    rank,
    course,
    module,
    queue,
    done: doneKeys,
    total: queue.length,
    next: nextItem,
    nextId,
    nextTitle,
    courseDone,
    courseTotal: courseLessons.length,
    courseComplete,
    moduleDone,
    moduleTotal: moduleItems.length,
    moduleComplete,
    canTakeExam,
    examPassed,
    target,
    daysLeft,
    pct: queue.length ? doneKeys / queue.length : 0,
    streakDays,
    missionDoneToday,
  };
}

export function isUnlocked(completed: Record<string, number>, queue: PathItem[], key: string): boolean {
  const idx = queue.findIndex((item) => itemKey(item) === key);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    if (!completed[itemKey(queue[i]!)]) return false;
  }
  return true;
}
