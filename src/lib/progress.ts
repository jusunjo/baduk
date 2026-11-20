import { allLessons, curriculumForRank } from "@/data/curriculum";
import { daysUntil } from "./date";
import { getRank, type Rank } from "./ranks";
import { useStore } from "./store";

export function useProgress() {
  const state = useStore();
  const rank = state.currentRank ? getRank(state.currentRank) : null;
  const curriculum = rank ? curriculumForRank(rank.id) : null;
  const lessons = rank ? allLessons(rank.track) : [];
  const done = lessons.filter((l) => state.completed[l.id]).length;
  const next = lessons.find((l) => !state.completed[l.id]) ?? null;
  const target: Rank | null = state.goal ? getRank(state.goal.targetRank) : null;
  const daysLeft = state.goal ? daysUntil(state.goal.date) : null;

  return {
    ...state,
    rank,
    curriculum,
    lessons,
    done,
    total: lessons.length,
    next,
    target,
    daysLeft,
    pct: lessons.length ? done / lessons.length : 0,
  };
}
