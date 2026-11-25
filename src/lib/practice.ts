import type { Point, StoneColor } from "@/data/curriculum";
import type { PracticeBank, PracticeProblemDraft } from "@/data/practice/types";
import type { TrackId } from "@/lib/ranks";
import type { Answer } from "@/lib/board";
import seed from "@/data/practice/seed.json";
import sprout from "@/data/practice/sprout.json";
import leaf from "@/data/practice/leaf.json";
import tree from "@/data/practice/tree.json";
import forest from "@/data/practice/forest.json";

export type PracticeItem = {
  id: string;
  lessonId: string;
  problemId: string;
  lessonTitle: string;
  lessonSubtitle: string;
  chapterTitle: string;
  prompt: string;
  tip?: string;
  explanation?: string;
  boardSize: 7 | 9 | 13 | 19;
  size: 7 | 9 | 13 | 19;
  setup?: { color: StoneColor; at: Point }[];
  answer: Answer;
  playAs?: StoneColor;
  highlight?: Point[];
  feedback?: string;
  wrongHint?: string;
  libertiesFor?: StoneColor | "both";
};

export type PracticeConcept = {
  lessonId: string;
  title: string;
  subtitle: string;
  vibe: string;
  chapterTitle: string;
  boardSize: 7 | 9 | 13 | 19;
  minutes: number;
  problems: PracticeItem[];
};

const BANKS: Record<TrackId, PracticeBank> = {
  seed: seed as PracticeBank,
  sprout: sprout as PracticeBank,
  leaf: leaf as PracticeBank,
  tree: tree as PracticeBank,
  forest: forest as PracticeBank,
};

function toItem(
  concept: PracticeBank["concepts"][number],
  problem: PracticeProblemDraft,
): PracticeItem {
  return {
    id: `${concept.lessonId}/${problem.id}`,
    lessonId: concept.lessonId,
    problemId: problem.id,
    lessonTitle: concept.title,
    lessonSubtitle: concept.subtitle,
    chapterTitle: concept.chapterTitle,
    prompt: problem.prompt,
    tip: problem.tip,
    explanation: problem.explanation,
    boardSize: concept.boardSize,
    size: problem.size,
    setup: problem.setup,
    answer: problem.answer,
    playAs: problem.playAs,
    feedback: problem.feedback,
    wrongHint: problem.wrongHint,
  };
}

/** 개념(레슨)별 문제 묶음 — 연습 뱅크 기준, 전부 개방 */
export function listConcepts(track: TrackId): PracticeConcept[] {
  return BANKS[track].concepts.map((c) => ({
    lessonId: c.lessonId,
    title: c.title,
    subtitle: c.subtitle,
    vibe: c.vibe,
    chapterTitle: c.chapterTitle,
    boardSize: c.boardSize,
    minutes: c.minutes,
    problems: c.problems.map((p) => toItem(c, p)),
  }));
}

export function findConcept(track: TrackId, lessonId: string): PracticeConcept | null {
  return listConcepts(track).find((c) => c.lessonId === lessonId) ?? null;
}

export function listPractice(track: TrackId): PracticeItem[] {
  return listConcepts(track).flatMap((c) => c.problems);
}

export function findPractice(
  track: TrackId,
  lessonId: string,
  problemId: string,
): PracticeItem | null {
  return listPractice(track).find((p) => p.lessonId === lessonId && p.problemId === problemId) ?? null;
}
