import { examProblems, nearestExamRank } from "@/data/exams/banks";
import type { ExamProblem } from "@/data/exams/types";
import type { Point } from "@/data/curriculum";
import { getRank, type RankId } from "@/lib/ranks";
import { RANK_CATALOG } from "../rankUnits";
import { attachStages } from "../stages";
import type { Exercise, PathLesson, RankModule, RankPart } from "../types";

type PlayRankId = Exclude<RankId, "beginner">;

function answerPoints(answer: ExamProblem["answer"]): Point[] {
  if (answer === "any") return [];
  if (Array.isArray(answer)) return answer;
  if (typeof answer === "object" && answer && "libertiesOf" in answer) return [];
  if (typeof answer === "object" && answer && "x" in answer && "y" in answer) {
    return [{ x: answer.x, y: answer.y }];
  }
  return [];
}

function toExercise(p: ExamProblem, prefix: string): Exercise | null {
  const correct = answerPoints(p.answer);
  if (correct.length === 0) return null;
  return {
    id: `${prefix}-${p.id}`,
    type: "move",
    size: p.size,
    prompt: p.prompt,
    hint: p.tip,
    setup: p.setup,
    correct,
    playAs: p.playAs,
    correctText: p.explanation ?? "좋아요!",
    wrongText: "다른 자리를 생각해 보세요.",
  };
}

/** 급수 번호로 문제 순서를 살짝 돌려 같은 은행을 나눠 씀 */
function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;
  const o = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(o), ...arr.slice(0, o)];
}

function chunkInto<T>(arr: T[], buckets: number): T[][] {
  const n = Math.max(1, buckets);
  const out: T[][] = Array.from({ length: n }, () => []);
  arr.forEach((item, i) => out[i % n]!.push(item));
  return out;
}

function fallbackRead(rankId: PlayRankId, catalog = RANK_CATALOG[rankId]): Exercise {
  const rank = getRank(rankId);
  return {
    id: `${rankId}-intro-read`,
    type: "read",
    size: rank.boardSize,
    prompt: `${rank.label}이에요. ${catalog.blurb}`,
    correctText: "대단원으로 가요.",
  };
}

/** 카탈로그 대단원 + (가장 가까운) 시험 문제로 급수 모듈 구성 */
export function buildRankModule(rankId: PlayRankId): RankModule {
  const rank = getRank(rankId);
  const catalog = RANK_CATALOG[rankId];
  const bankId = nearestExamRank(rankId);
  const offset = Number(rankId.slice(1));
  const drills = rotate(examProblems(bankId), offset)
    .map((p) => toExercise(p, rankId))
    .filter(Boolean) as Exercise[];

  const introPool = drills.slice(0, 2);
  const rest = drills.slice(2);

  const intro: PathLesson = {
    id: `${rankId}-intro`,
    title: catalog.introTitle,
    subtitle: catalog.introSubtitle,
    exercises: introPool.length > 0 ? introPool : [fallbackRead(rankId, catalog)],
  };

  const buckets = chunkInto(rest.length ? rest : drills, catalog.units.length);
  const parts: RankPart[] = catalog.units.map((unit, i) => {
    const exercises = buckets[i] ?? [];
    const filled =
      exercises.length > 0
        ? exercises
        : [
            {
              id: `${rankId}-part-${i + 1}-read`,
              type: "read" as const,
              size: rank.boardSize,
              prompt: `${unit.title}: ${unit.subtitle}`,
              correctText: "다음으로 가요.",
            },
          ];
    return attachStages({
      id: `${rankId}-part-${i + 1}`,
      title: `Part ${i + 1} · ${unit.title}`,
      subtitle: unit.subtitle,
      tag: unit.tag,
      exercises: filled,
    });
  });

  return {
    rankId,
    title: rank.label,
    blurb: catalog.blurb,
    intro,
    parts,
    // 전 급수 승급 시험 — 문제 은행이 없으면 가장 가까운 급 은행 사용
    exam: true,
  };
}
