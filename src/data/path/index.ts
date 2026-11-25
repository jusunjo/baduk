import type { RankId } from "@/lib/ranks";
import { COURSE } from "./course";
import { MODULE_G30 } from "./modules/g30";
import type { Course, PathItem, PathLesson, RankModule, RankPart } from "./types";

export { COURSE } from "./course";
export type * from "./types";

const MODULES: Partial<Record<Exclude<RankId, "beginner">, RankModule>> = {
  g30: MODULE_G30,
};

export function getCourse(): Course {
  return COURSE;
}

export function getRankModule(rankId: RankId): RankModule | null {
  if (rankId === "beginner") return null;
  return MODULES[rankId] ?? null;
}

export function listRankModules(): RankModule[] {
  return Object.values(MODULES).filter(Boolean) as RankModule[];
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

export function findRankPart(rankId: RankId, partId: string): { module: RankModule; part: RankPart } | null {
  const module = getRankModule(rankId);
  if (!module) return null;
  const part = module.parts.find((p) => p.id === partId);
  if (!part) return null;
  return { module, part };
}

/** 학습 순서: Course 전체 → (급수 모듈이면) intro → parts → exam */
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
  for (const part of mod.parts) q.push({ kind: "rank-part", module: mod, part });
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
    case "rank-exam":
      return `${item.module.title} 승급 시험`;
  }
}
