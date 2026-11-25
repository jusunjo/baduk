import type { Answer } from "@/lib/board";
import type { Point, StoneColor } from "@/data/curriculum";
import type { TrackId } from "@/lib/ranks";

export type PracticeProblemDraft = {
  id: string;
  prompt: string;
  tip?: string;
  explanation?: string;
  setup: { color: StoneColor; at: Point }[];
  size: 7 | 9 | 13 | 19;
  answer: Answer;
  playAs?: StoneColor;
  wrongHint?: string;
  feedback?: string;
};

export type PracticeConceptDraft = {
  lessonId: string;
  title: string;
  subtitle: string;
  vibe: string;
  chapterTitle: string;
  boardSize: 7 | 9 | 13 | 19;
  minutes: number;
  problems: PracticeProblemDraft[];
};

export type PracticeBank = {
  track: TrackId;
  title: string;
  concepts: PracticeConceptDraft[];
};

export type PracticeIndex = {
  totalConcepts: number;
  totalProblems: number;
  tracks: { track: TrackId; concepts: number; problems: number }[];
  updatedAt: string;
};
