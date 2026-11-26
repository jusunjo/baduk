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
};

export type PathLesson = {
  id: string;
  title: string;
  subtitle?: string;
  /** 복습 레슨 */
  review?: boolean;
  exercises: Exercise[];
};

/** 일상 비유 마이크로 애니 클립 id */
export type ConceptAnimationId = "capture-doors";

/** 대단원 진입 시 일상 비유 인트로 */
export type ConceptIntro = {
  id: string;
  metaphorTitle: string;
  metaphorBody: string;
  bridgeText: string;
  animation: ConceptAnimationId;
  /** Course: 이 레슨에 들어갈 때만 표시 */
  forLessonId?: string;
};

export type PathUnit = {
  id: string;
  title: string;
  blurb: string;
  lessons: PathLesson[];
  /** 일상 비유 개념 인트로 (선택) */
  conceptIntro?: ConceptIntro;
};

/** 규칙 입문 Course */
export type Course = {
  id: "course";
  title: string;
  blurb: string;
  units: PathUnit[];
};

/** 대단원 안 학습 단계 */
export type RankStageKind = "learn" | "drill" | "situation" | "test";

export type RankStage = {
  id: string;
  kind: RankStageKind;
  title: string;
  subtitle?: string;
  exercises: Exercise[];
};

/** 급수 단원 안의 Part */
export type RankPart = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  exercises: Exercise[];
  /** 학습·반복·실전·테스트 (없으면 런타임에 생성) */
  stages?: RankStage[];
  /** 일상 비유 개념 인트로 (선택) — 학습 단계 첫 진입 시 */
  conceptIntro?: ConceptIntro;
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
  | { kind: "rank-stage"; module: RankModule; part: RankPart; stage: RankStage }
  | { kind: "rank-exam"; module: RankModule };
