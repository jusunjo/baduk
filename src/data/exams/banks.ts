import type { RankId } from "@/lib/ranks";
import type { ExamBank, ExamProblem } from "./types";
import g30 from "./g30.json";
import g25 from "./g25.json";
import g20 from "./g20.json";
import g15 from "./g15.json";
import g10 from "./g10.json";
import g7 from "./g7.json";
import g5 from "./g5.json";
import g3 from "./g3.json";
import g1 from "./g1.json";
import index from "./index.json";

/** 승급 시험 JSON이 준비된 급수 */
export type ExamRankId = "g30" | "g25" | "g20" | "g15" | "g10" | "g7" | "g5" | "g3" | "g1";

export const EXAM_RANK_IDS: ExamRankId[] = ["g30", "g25", "g20", "g15", "g10", "g7", "g5", "g3", "g1"];

const BANKS: Record<ExamRankId, ExamBank> = {
  g30: g30 as ExamBank,
  g25: g25 as ExamBank,
  g20: g20 as ExamBank,
  g15: g15 as ExamBank,
  g10: g10 as ExamBank,
  g7: g7 as ExamBank,
  g5: g5 as ExamBank,
  g3: g3 as ExamBank,
  g1: g1 as ExamBank,
};

export const EXAM_INDEX = index;

export function isExamRank(id: string): id is ExamRankId {
  return (EXAM_RANK_IDS as string[]).includes(id);
}

export function examBank(rank: ExamRankId): ExamBank {
  return BANKS[rank];
}

export function examProblems(rank: ExamRankId): ExamProblem[] {
  return BANKS[rank].problems;
}

/** 시험 통과: 10문제 중 8개 이상 */
export const EXAM_PASS_SCORE = 8;
export const EXAM_TOTAL = 10;

export function examPassed(correct: number, total = EXAM_TOTAL): boolean {
  return correct >= EXAM_PASS_SCORE && total >= EXAM_TOTAL;
}

/** 학습 드릴용 — 가장 가까운 시험 은행 */
export function nearestExamRank(rankId: Exclude<RankId, "beginner">): ExamRankId {
  if (isExamRank(rankId)) return rankId;
  const n = Number(rankId.slice(1));
  const nums = EXAM_RANK_IDS.map((id) => Number(id.slice(1)));
  let best = EXAM_RANK_IDS[0]!;
  let bestDist = Infinity;
  for (let i = 0; i < nums.length; i++) {
    const d = Math.abs(nums[i]! - n);
    if (d < bestDist) {
      bestDist = d;
      best = EXAM_RANK_IDS[i]!;
    }
  }
  return best;
}
