import type { Exercise } from "@/data/path/types";
import { addDays, dayKey, parseDay, startOfToday } from "./date";

/**
 * 30급 반복 학습 카드 (라이트너 상자 방식).
 * box 0 → 1일 뒤, box 1 → 3일 뒤, box 2 → 7일 뒤 다시 풀어요.
 * box 2에서 한 번에 맞히면 졸업(카드 삭제).
 */
export type ReviewCard = {
  /** 다시 낼 문제 (처음 본 모양 그대로) */
  ex: Exercise;
  box: number;
  /** 다음 복습일 YYYY-MM-DD */
  due: string;
  /** 누적 오답 수 */
  wrong: number;
  /** 마지막으로 푼 시각 */
  seenAt: number;
};

export const REVIEW_INTERVALS = [1, 3, 7] as const;
export const DAILY_REVIEW_SIZE = 5;
/** 복습 세션의 미션 id */
export const DAILY_REVIEW_ID = "daily-review";

/** 반복 학습에 쌓을 미션인지 (지금은 30급만) */
export function isReviewTracked(missionId: string): boolean {
  return missionId.startsWith("g30-");
}

/** g30-c1-drill2 / g30-c1-sit / g30-c1-retry → g30-c1 */
export function reviewKey(exerciseId: string): string {
  return exerciseId.replace(/(-drill\d+|-test\d+|-sit|-retry)+$/u, "");
}

function todayKey(): string {
  return dayKey(startOfToday());
}

function dueIn(days: number): string {
  return dayKey(addDays(startOfToday(), days));
}

/** 복습 카드에 담을 깨끗한 문제 (드릴 접두어 제거) */
function snapshot(ex: Exercise, key: string): Exercise {
  return {
    ...ex,
    id: key,
    prompt: ex.prompt.replace(/^(다시|한 번 더): /u, ""),
  };
}

/**
 * 첫 시도 결과를 카드에 반영.
 * - 처음 보는 문제: box 0, 내일 복습
 * - 틀림: box 0으로 되돌리고 내일 복습
 * - 복습 중 맞힘: 다음 상자로 (마지막 상자면 졸업)
 * - 학습 중 다시 맞힘: 일정 유지
 */
export function nextCards(
  cards: Record<string, ReviewCard>,
  ex: Exercise,
  correct: boolean,
  inReview: boolean,
): Record<string, ReviewCard> {
  if (ex.type === "read") return cards;
  const key = reviewKey(ex.id);
  const prev = cards[key];
  const now = Date.now();
  const out = { ...cards };

  if (!correct) {
    out[key] = {
      ex: prev?.ex ?? snapshot(ex, key),
      box: 0,
      due: dueIn(REVIEW_INTERVALS[0]),
      wrong: (prev?.wrong ?? 0) + 1,
      seenAt: now,
    };
    return out;
  }

  if (!prev) {
    out[key] = { ex: snapshot(ex, key), box: 0, due: dueIn(REVIEW_INTERVALS[0]), wrong: 0, seenAt: now };
    return out;
  }

  if (!inReview) {
    out[key] = { ...prev, seenAt: now };
    return out;
  }

  const box = prev.box + 1;
  if (box >= REVIEW_INTERVALS.length) {
    delete out[key];
    return out;
  }
  out[key] = { ...prev, box, due: dueIn(REVIEW_INTERVALS[box]!), seenAt: now };
  return out;
}

/** 오늘 풀 복습 문제: 기한이 된 카드, 오답 많은 것·오래된 것 먼저 */
export function dueCards(cards: Record<string, ReviewCard>, limit = DAILY_REVIEW_SIZE): ReviewCard[] {
  const today = todayKey();
  return Object.values(cards)
    .filter((c) => c.due <= today)
    .sort((a, b) => b.wrong - a.wrong || a.due.localeCompare(b.due) || a.seenAt - b.seenAt)
    .slice(0, limit);
}

export function dueCount(cards: Record<string, ReviewCard>): number {
  const today = todayKey();
  return Object.values(cards).filter((c) => c.due <= today).length;
}

/** 가장 가까운 다음 복습까지 남은 날 (카드 없으면 null) */
export function daysToNextReview(cards: Record<string, ReviewCard>): number | null {
  const dues = Object.values(cards).map((c) => c.due);
  if (!dues.length) return null;
  const next = dues.sort()[0]!;
  const diff = Math.round((parseDay(next).getTime() - startOfToday().getTime()) / 86400000);
  return Math.max(0, diff);
}

export function wrongCount(cards: Record<string, ReviewCard>): number {
  return Object.values(cards).filter((c) => c.wrong > 0 && c.box === 0).length;
}
