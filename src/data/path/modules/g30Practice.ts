import seed from "@/data/practice/seed.json";
import type { PracticeBank, PracticeProblemDraft } from "@/data/practice/types";
import { applySetup, playMove, resolveAnswer } from "@/lib/board";
import type { Exercise, RankModule, RankPart, RankStageKind } from "../types";

/** 30급 대단원 → 입문 연습 뱅크 개념 (실제 문제 모양 기준으로 고름) */
const PART_CONCEPTS: Record<string, string[]> = {
  "g30-capture": ["seed-breath", "seed-edge-breath", "seed-group-capture", "seed-capture", "seed-atari"],
  "g30-connect": ["seed-connect", "seed-cut"],
  "g30-choose": ["seed-double-atari", "seed-mixed", "seed-save"],
};

/** 단계마다 덧붙일 새 문제 수 (학습 단계는 손대지 않아요) */
const EXTRA_PER_STAGE: Partial<Record<RankStageKind, number>> = {
  drill: 4,
  situation: 2,
  test: 2,
};

const BANK = seed as PracticeBank;

function toExercise(p: PracticeProblemDraft, withHint: boolean): Exercise | null {
  const board = applySetup(p.size, p.setup);
  const resolved = resolveAnswer(p.answer, board);
  if (resolved === "any" || resolved.length === 0) return null;
  const playAs = p.playAs ?? "B";
  // 착수 금지 자리가 정답이면 버려요
  const correct = resolved.filter((pt) => playMove(board, pt, playAs) !== null);
  if (!correct.length) return null;
  return {
    id: `g30x-${p.id}`,
    type: "move",
    size: p.size,
    prompt: p.prompt,
    hint: withHint ? p.tip : undefined,
    setup: p.setup,
    correct,
    playAs,
    correctText: p.explanation ?? "좋아요!",
    wrongText: p.wrongHint ?? "다른 자리를 생각해 보세요.",
  };
}

/** 개념별 문제를 번갈아 섞은 풀 */
function poolFor(partId: string): PracticeProblemDraft[] {
  const lists = (PART_CONCEPTS[partId] ?? [])
    .map((id) => BANK.concepts.find((c) => c.lessonId === id)?.problems ?? [])
    .filter((l) => l.length);
  const out: PracticeProblemDraft[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const l of lists) if (l[i]) out.push(l[i]!);
  }
  return out;
}

function dayIndex(): number {
  const d = new Date();
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
}

function withExtras(part: RankPart, day: number): RankPart {
  const pool = poolFor(part.id);
  if (!pool.length || !part.stages?.length) return part;
  const perDay = Object.values(EXTRA_PER_STAGE).reduce((a, b) => a + (b ?? 0), 0);
  // 날마다 다른 구간을 꺼내 같은 단계를 다시 해도 새 문제가 나와요
  let cursor = (day * perDay) % pool.length;
  const next = (n: number, withHint: boolean): Exercise[] => {
    const got: Exercise[] = [];
    let guard = 0;
    while (got.length < n && guard < pool.length) {
      const ex = toExercise(pool[cursor % pool.length]!, withHint);
      cursor++;
      guard++;
      if (ex) got.push(ex);
    }
    return got;
  };
  const stages = part.stages.map((st) => {
    const n = EXTRA_PER_STAGE[st.kind];
    if (!n) return st;
    return { ...st, exercises: [...st.exercises, ...next(n, st.kind !== "test")] };
  });
  return { ...part, stages };
}

/** 30급 반복·실전·테스트 단계에 입문 연습 문제를 이어 붙여요 */
export function withG30Practice(mod: RankModule, day = dayIndex()): RankModule {
  return { ...mod, parts: mod.parts.map((p) => withExtras(p, day)) };
}
