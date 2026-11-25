import type { Point, StoneColor } from "@/data/curriculum";
import type { RankId } from "@/lib/ranks";

export type ExerciseType = "read" | "choice" | "move";

export type StoneSetup = { color: StoneColor; at: Point };

export type BoardMark =
  | { at: Point; type: "target" | "glow" | "triangle" | "x" }
  | { at: Point; type: "liberty" | "label" | "not"; label: string };

/** PlayGo식 짧은 미션 한 칸 */
export type Exercise = {
  id: string;
  type: ExerciseType;
  size: 7 | 9 | 13 | 19;
  prompt: string;
  hint?: string;
  setup?: StoneSetup[];
  marks?: BoardMark[];
  /** move: 정답 착점(복수 허용). choice: 고른 칸 */
  correct?: Point[];
  /** choice 보기 */
  choices?: { at: Point; label: string }[];
  correctText?: string;
  wrongText?: string;
  /** move일 때 흑/백 */
  playAs?: StoneColor;
  /** 활로 숫자 표시 */
  showLibs?: boolean;
};

export type PathLesson = {
  id: string;
  title: string;
  subtitle?: string;
  /** 복습 레슨 */
  review?: boolean;
  exercises: Exercise[];
};

export type PathUnit = {
  id: string;
  title: string;
  blurb: string;
  lessons: PathLesson[];
};

/** 규칙 입문 Course */
export type Course = {
  id: "course";
  title: string;
  blurb: string;
  units: PathUnit[];
};

/** 급수 단원 안의 Part */
export type RankPart = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  exercises: Exercise[];
};

/** 급수 사다리 한 칸 (30급, 25급…) */
export type RankModule = {
  rankId: Exclude<RankId, "beginner">;
  title: string;
  blurb: string;
  /** 개념 소개 미션(짧게) */
  intro: PathLesson;
  parts: RankPart[];
  /** 승급 시험 있음 */
  exam: boolean;
};

export type PathItem =
  | { kind: "course-lesson"; unitId: string; lesson: PathLesson }
  | { kind: "rank-intro"; module: RankModule }
  | { kind: "rank-part"; module: RankModule; part: RankPart }
  | { kind: "rank-exam"; module: RankModule };
