import type { RankId } from "@/lib/ranks";
import { RANKS } from "@/lib/ranks";
import { COURSE } from "./course";
import { MODULE_G30 } from "./modules/g30";
import { buildRankModule } from "./modules/buildRank";
import { attachStages, buildPartStages } from "./stages";
import type { ConceptIntro, Course, PathItem, PathLesson, RankModule, RankPart, RankStage } from "./types";

export { COURSE } from "./course";
export { CAPTURE_INTRO } from "./conceptIntros";
export type * from "./types";

type PlayRankId = Exclude<RankId, "beginner">;

function allPlayRanks(): PlayRankId[] {
  return RANKS.filter((r) => r.id !== "beginner").map((r) => r.id as PlayRankId);
}

function withPartStages(mod: RankModule): RankModule {
  return { ...mod, parts: mod.parts.map(attachStages) };
}

const MODULES: Record<PlayRankId, RankModule> = Object.fromEntries(
  allPlayRanks().map((id) => [id, withPartStages(id === "g30" ? MODULE_G30 : buildRankModule(id))]),
) as Record<PlayRankId, RankModule>;

export function getCourse(): Course {
  return COURSE;
}

export function getRankModule(rankId: RankId): RankModule | null {
  if (rankId === "beginner") return null;
  return MODULES[rankId] ?? null;
}

export function listRankModules(): RankModule[] {
  return allPlayRanks().map((id) => MODULES[id]!);
}

/** Course 레슨을 순서대로 */
export function courseLessonsFlat(): { unitId: string; unitTitle: string; lesson: PathLesson }[] {
  const out: { unitId: string; unitTitle: string; lesson: PathLesson }[] = [];
  for (const u of COURSE.units) {
    for (const lesson of u.lessons) out.push({ unitId: u.id, unitTitle: u.title, lesson });
  }
  return out;
}

export function findCourseLesson(lessonId: string): { unitId: string; lesson: PathLesson } | null {
  for (const u of COURSE.units) {
    const lesson = u.lessons.find((l) => l.id === lessonId);
    if (lesson) return { unitId: u.id, lesson };
  }
  return null;
}

/** 미션 진입 시 보여줄 일상 비유 인트로 (없으면 null) */
export function getConceptIntroForMission(missionId: string, rankId: RankId | null): ConceptIntro | null {
  for (const u of COURSE.units) {
    const lesson = u.lessons.find((l) => l.id === missionId);
    if (!lesson || !u.conceptIntro) continue;
    if (u.conceptIntro.forLessonId && u.conceptIntro.forLessonId !== missionId) continue;
    return u.conceptIntro;
  }

  if (!rankId || rankId === "beginner") return null;
  const stageHit = findRankStage(rankId, missionId);
  if (stageHit?.stage.kind === "learn" && stageHit.part.conceptIntro) {
    return stageHit.part.conceptIntro;
  }
  return null;
}

export function findRankPart(rankId: RankId, partId: string): { module: RankModule; part: RankPart } | null {
  const module = getRankModule(rankId);
  if (!module) return null;
  const part = module.parts.find((p) => p.id === partId);
  if (!part) return null;
  return { module, part };
}

export function findRankStage(
  rankId: RankId,
  stageId: string,
): { module: RankModule; part: RankPart; stage: RankStage } | null {
  const module = getRankModule(rankId);
  if (!module) return null;
  for (const part of module.parts) {
    const stages = part.stages?.length ? part.stages : buildPartStages(part);
    const stage = stages.find((s) => s.id === stageId);
    if (stage) return { module, part, stage };
  }
  return null;
}

/** 학습 순서: Course → intro → (대단원마다 학습·반복·실전·테스트) → exam */
export function buildQueue(rankId: RankId | null): PathItem[] {
  const q: PathItem[] = [];
  for (const u of COURSE.units) {
    for (const lesson of u.lessons) {
      q.push({ kind: "course-lesson", unitId: u.id, lesson });
    }
  }
  if (!rankId || rankId === "beginner") return q;
  const mod = getRankModule(rankId);
  if (!mod) return q;
  q.push({ kind: "rank-intro", module: mod });
  for (const part of mod.parts) {
    const stages = part.stages?.length ? part.stages : buildPartStages(part);
    for (const stage of stages) {
      q.push({ kind: "rank-stage", module: mod, part, stage });
    }
  }
  if (mod.exam) q.push({ kind: "rank-exam", module: mod });
  return q;
}

export function itemKey(item: PathItem): string {
  switch (item.kind) {
    case "course-lesson":
      return item.lesson.id;
    case "rank-intro":
      return item.module.intro.id;
    case "rank-part":
      return item.part.id;
    case "rank-stage":
      return item.stage.id;
    case "rank-exam":
      return `exam:${item.module.rankId}`;
  }
}

export function itemTitle(item: PathItem): string {
  switch (item.kind) {
    case "course-lesson":
      return item.lesson.title;
    case "rank-intro":
      return item.module.intro.title;
    case "rank-part":
      return item.part.title;
    case "rank-stage":
      return `${item.part.tag} · ${item.stage.title}`;
    case "rank-exam":
      return `${item.module.title} 승급 시험`;
  }
}
