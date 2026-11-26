import type { Point, StoneColor } from "@/data/curriculum";
import type { Exercise, RankPart, RankStage, RankStageKind, StoneSetup } from "./types";

const STAGE_META: { kind: RankStageKind; title: string; subtitle: string }[] = [
  { kind: "learn", title: "학습", subtitle: "개념을 판 위에서 익혀요" },
  { kind: "drill", title: "반복 학습", subtitle: "같은 감각을 여러 번 굳혀요" },
  { kind: "situation", title: "실전 상황", subtitle: "주변에 돌이 있어도 급소를 찾아요" },
  { kind: "test", title: "테스트", subtitle: "힌트 없이 확인해 봐요" },
];

function keyOf(p: Point) {
  return `${p.x},${p.y}`;
}

function occupied(setup: StoneSetup[] | undefined, correct: Point[] | undefined): Set<string> {
  const s = new Set<string>();
  for (const st of setup ?? []) s.add(keyOf(st.at));
  for (const c of correct ?? []) s.add(keyOf(c));
  return s;
}

/** 정답·핵심 돌 근처에 방해 돌을 뿌려 실전처럼 보이게 */
export function withNoise(ex: Exercise, salt: number): Exercise {
  if (ex.type === "read" || !ex.setup?.length) return ex;
  const size = ex.size;
  const blocked = occupied(ex.setup, ex.correct);
  // 정답·기존 돌 주변 1칸도 비움 (모양 파괴 방지)
  for (const st of ex.setup) {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      blocked.add(keyOf({ x: st.at.x + dx, y: st.at.y + dy }));
    }
  }
  for (const c of ex.correct ?? []) {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const) {
      blocked.add(keyOf({ x: c.x + dx, y: c.y + dy }));
    }
  }

  const extras: StoneSetup[] = [];
  const candidates: Point[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!blocked.has(keyOf({ x, y }))) candidates.push({ x, y });
    }
  }
  // 가장자리·먼 곳 위주
  candidates.sort((a, b) => {
    const ea = Math.min(a.x, a.y, size - 1 - a.x, size - 1 - a.y);
    const eb = Math.min(b.x, b.y, size - 1 - b.x, size - 1 - b.y);
    return ea - eb;
  });

  const n = Math.min(4 + (salt % 3), candidates.length);
  for (let i = 0; i < n; i++) {
    const at = candidates[(i * 3 + salt) % candidates.length]!;
    if (blocked.has(keyOf(at))) continue;
    const color: StoneColor = (i + salt) % 2 === 0 ? "B" : "W";
    extras.push({ color, at });
    blocked.add(keyOf(at));
  }

  return {
    ...ex,
    id: `${ex.id}-sit`,
    prompt: `${ex.prompt} (주변에 다른 돌이 있어도 같은 급소예요.)`,
    setup: [...ex.setup, ...extras],
  };
}

function rotate<T>(arr: T[], offset: number): T[] {
  if (!arr.length) return arr;
  const o = ((offset % arr.length) + arr.length) % arr.length;
  return [...arr.slice(o), ...arr.slice(0, o)];
}

function take(pool: Exercise[], count: number, offset: number): Exercise[] {
  if (!pool.length) return pool;
  const rotated = rotate(pool, offset);
  if (rotated.length <= count) return rotated;
  return rotated.slice(0, count);
}

/** 대단원 연습 풀 → 학습 / 반복 / 실전 / 테스트 */
export function buildPartStages(part: RankPart): RankStage[] {
  if (part.stages?.length) return part.stages;
  const pool = part.exercises.filter((e) => e.type !== "read");
  const base = pool.length ? pool : part.exercises;
  const salt = part.id.length;

  return STAGE_META.map((meta) => {
    let exercises: Exercise[];
    if (meta.kind === "learn") {
      exercises = take(base, Math.max(2, Math.ceil(base.length * 0.6)), 0);
    } else if (meta.kind === "drill") {
      exercises = take(base, Math.max(2, Math.ceil(base.length * 0.7)), salt + 1).map((e, j) => ({
        ...e,
        id: `${e.id}-drill${j}`,
        prompt: e.type === "read" ? e.prompt : `다시: ${e.prompt}`,
      }));
    } else if (meta.kind === "situation") {
      const src = take(base, Math.max(2, Math.min(4, base.length)), salt + 2);
      exercises = src.map((e, j) => withNoise(e, salt + j));
    } else {
      // test — 힌트 제거
      exercises = take(base, Math.max(2, Math.min(3, base.length)), salt + 3).map((e, j) => ({
        ...e,
        id: `${e.id}-test${j}`,
        hint: undefined,
        prompt: e.type === "read" ? e.prompt : e.prompt.replace(/\s*힌트:.*/u, ""),
      }));
    }

    if (!exercises.length) {
      exercises = [
        {
          id: `${part.id}-${meta.kind}-empty`,
          type: "read",
          size: part.exercises[0]?.size ?? 9,
          prompt: `${part.title} · ${meta.title}`,
          correctText: "다음으로 가요.",
        },
      ];
    }

    return {
      id: `${part.id}-${meta.kind}`,
      kind: meta.kind,
      title: meta.title,
      subtitle: meta.subtitle,
      exercises,
    };
  });
}

export function attachStages(part: RankPart): RankPart {
  return { ...part, stages: buildPartStages(part) };
}
