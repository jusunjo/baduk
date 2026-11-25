import type { Answer } from "@/lib/board";
import type { Point, StoneColor } from "@/data/curriculum";

/** 승급 시험 문제 (자작 JSON 또는 RapidAPI 시드) */
export interface ExamProblem {
  id: string;
  sourceId: string;
  apiRank: string;
  rankDisplay: string;
  prompt: string;
  tip?: string;
  explanation?: string;
  setup: { color: StoneColor; at: Point }[];
  size: 7 | 9 | 13 | 19;
  answer: Answer;
  playAs: StoneColor;
  /** 원본 SGF (디버그·재변환용) */
  sgf?: string;
}

export interface ExamBank {
  meta: {
    apiRank: string;
    file: string;
    count: number;
    fetchedAt: string;
    source: string;
  };
  problems: ExamProblem[];
}

export interface ExamIndex {
  seedUser: string;
  total: number;
  apiCallsUsed: number;
  ranks: { file: string; apiRank: string; count: number }[];
  updatedAt: string | null;
}
