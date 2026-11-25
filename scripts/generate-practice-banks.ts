/**
 * GoProblems 급수 문항을 레퍼런스 삼아 자작 연습 뱅크를 생성합니다.
 * GP SGF를 그대로 넣지 않고, 같은 전술 모티프를 위치·회전·판 크기로 변주합니다.
 *
 *   npm run build:practice
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PracticeBank, PracticeConceptDraft, PracticeIndex } from "../src/data/practice/types";
import type { TrackId } from "../src/lib/ranks";
import { buildConceptProblems, validate, type Draft, type Size } from "./lib/practice-motifs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/practice");
const PER = 20;

type ConceptSpec = {
  lessonId: string;
  title: string;
  subtitle: string;
  chapterTitle: string;
  vibe: string;
  kind: Parameters<typeof buildConceptProblems>[0];
  size: Size;
};

function finalize(spec: ConceptSpec, drafts: Draft[]): PracticeConceptDraft {
  const ok = drafts.filter(validate).slice(0, PER);
  if (ok.length < 8) {
    console.warn(`! ${spec.lessonId}: only ${ok.length} valid`);
  }
  return {
    lessonId: spec.lessonId,
    title: spec.title,
    subtitle: spec.subtitle,
    vibe: spec.vibe,
    chapterTitle: spec.chapterTitle,
    boardSize: spec.size,
    minutes: 6,
    problems: ok.map((d, i) => ({
      id: `${spec.lessonId}-p${String(i + 1).padStart(2, "0")}`,
      prompt: d.prompt,
      tip: d.tip,
      explanation: d.explanation,
      wrongHint: d.wrongHint,
      setup: d.setup,
      size: d.size,
      answer: d.answer,
      playAs: d.playAs ?? "B",
      feedback: d.feedback,
    })),
  };
}

function buildTrack(specs: ConceptSpec[]): PracticeConceptDraft[] {
  return specs.map((s) => finalize(s, buildConceptProblems(s.kind, s.size, PER)));
}

const SEED: ConceptSpec[] = [
  { lessonId: "seed-breath", title: "돌도 숨을 쉬어요", subtitle: "숨구멍을 막으면 따내요", chapterTitle: "숨구멍과 따내기", vibe: "숨구멍", kind: "capture", size: 7 },
  { lessonId: "seed-edge-breath", title: "가장자리는 숨이 적어요", subtitle: "가운데 4 · 변 3 · 귀 2", chapterTitle: "숨구멍과 따내기", vibe: "변·귀", kind: "edge", size: 7 },
  { lessonId: "seed-group-capture", title: "붙은 돌은 한 덩어리", subtitle: "덩어리째 따내기", chapterTitle: "숨구멍과 따내기", vibe: "덩어리", kind: "two", size: 7 },
  { lessonId: "seed-capture", title: "따내기 연습", subtitle: "단수를 찾아 잡아요", chapterTitle: "따내기", vibe: "따내기", kind: "capture", size: 7 },
  { lessonId: "seed-atari", title: "단수 치기", subtitle: "먼저 위협해요", chapterTitle: "따내기", vibe: "단수", kind: "reduce", size: 7 },
  { lessonId: "seed-escape", title: "달아나기", subtitle: "숨구멍을 늘려요", chapterTitle: "따내기", vibe: "달아나기", kind: "reduce", size: 7 },
  { lessonId: "seed-connect", title: "잇기", subtitle: "한 덩어리로", chapterTitle: "연결", vibe: "잇기", kind: "connect", size: 7 },
  { lessonId: "seed-cut", title: "끊기 막기", subtitle: "사이를 지켜요", chapterTitle: "연결", vibe: "끊기", kind: "connect", size: 7 },
  { lessonId: "seed-double-atari", title: "이중 단수", subtitle: "한 수로 두 곳", chapterTitle: "수법", vibe: "이중단수", kind: "double", size: 7 },
  { lessonId: "seed-make-atari", title: "단수 만들기", subtitle: "활로를 줄여요", chapterTitle: "수법", vibe: "단수", kind: "reduce", size: 7 },
  { lessonId: "seed-save", title: "내 돌 살리기", subtitle: "급한 곳부터", chapterTitle: "수법", vibe: "살리기", kind: "capture", size: 7 },
  { lessonId: "seed-eyes-intro", title: "눈 맛보기", subtitle: "사는 모양", chapterTitle: "사활 입문", vibe: "눈", kind: "eyes", size: 7 },
  { lessonId: "seed-territory", title: "집 감각", subtitle: "울타리를 닫아요", chapterTitle: "집", vibe: "집", kind: "connect", size: 7 },
  { lessonId: "seed-net", title: "그물", subtitle: "도망 길을 막아요", chapterTitle: "사활 입문", vibe: "장문", kind: "net", size: 7 },
  { lessonId: "seed-ladder", title: "축 맛보기", subtitle: "단수를 이어 가요", chapterTitle: "사활 입문", vibe: "축", kind: "ladder", size: 7 },
  { lessonId: "seed-mixed", title: "입문 종합", subtitle: "뭐든 나와요", chapterTitle: "종합", vibe: "종합", kind: "mixed", size: 7 },
];

const SPROUT: ConceptSpec[] = [
  { lessonId: "sprout-capture", title: "따내기", subtitle: "단수인 돌을 잡아요", chapterTitle: "따내기", vibe: "따내기", kind: "capture", size: 7 },
  { lessonId: "sprout-escape", title: "달아나기", subtitle: "활로를 늘려요", chapterTitle: "따내기", vibe: "달아나기", kind: "reduce", size: 7 },
  { lessonId: "sprout-eyes", title: "두 눈", subtitle: "사는 모양", chapterTitle: "사활", vibe: "두 눈", kind: "eyes", size: 7 },
  { lessonId: "sprout-net", title: "그물", subtitle: "달아날 길을 막아요", chapterTitle: "사활", vibe: "장문", kind: "net", size: 7 },
  { lessonId: "sprout-ladder", title: "축", subtitle: "지그재그로 몰기", chapterTitle: "사활", vibe: "축", kind: "ladder", size: 7 },
  { lessonId: "sprout-cut", title: "끊기", subtitle: "상대를 갈라놓아요", chapterTitle: "수법", vibe: "끊기", kind: "connect", size: 7 },
  { lessonId: "sprout-connect", title: "잇기", subtitle: "한 덩어리로", chapterTitle: "수법", vibe: "잇기", kind: "connect", size: 7 },
  { lessonId: "sprout-atari", title: "단수 치기", subtitle: "먼저 위협해요", chapterTitle: "수법", vibe: "단수", kind: "reduce", size: 7 },
  { lessonId: "sprout-double", title: "이중 단수", subtitle: "한 수로 두 곳", chapterTitle: "수법", vibe: "이중단수", kind: "double", size: 7 },
  { lessonId: "sprout-two", title: "덩어리 따내기", subtitle: "두 점 한꺼번에", chapterTitle: "따내기", vibe: "덩어리", kind: "two", size: 7 },
  { lessonId: "sprout-edge", title: "변·귀 따내기", subtitle: "숨이 적은 자리", chapterTitle: "따내기", vibe: "변·귀", kind: "edge", size: 7 },
  { lessonId: "sprout-life", title: "사활 맛보기", subtitle: "살고 죽는 한 수", chapterTitle: "사활", vibe: "사활", kind: "eyes", size: 7 },
  { lessonId: "sprout-mixed", title: "기초 종합", subtitle: "모의고사", chapterTitle: "종합", vibe: "종합", kind: "mixed", size: 7 },
];

const LEAF: ConceptSpec[] = [
  { lessonId: "leaf-house", title: "집 지키기", subtitle: "울타리를 닫아요", chapterTitle: "집과 행마", vibe: "집", kind: "connect", size: 9 },
  { lessonId: "leaf-haengma", title: "행마", subtitle: "한 칸·연결", chapterTitle: "집과 행마", vibe: "행마", kind: "connect", size: 9 },
  { lessonId: "leaf-life", title: "사활", subtitle: "9줄 사는 수", chapterTitle: "사활", vibe: "사활", kind: "eyes", size: 9 },
  { lessonId: "leaf-capture", title: "따내기", subtitle: "중급 단수", chapterTitle: "사활", vibe: "따내기", kind: "capture", size: 9 },
  { lessonId: "leaf-two", title: "덩어리", subtitle: "이어진 돌 잡기", chapterTitle: "사활", vibe: "덩어리", kind: "two", size: 9 },
  { lessonId: "leaf-net", title: "그물", subtitle: "도망 길 차단", chapterTitle: "수법", vibe: "장문", kind: "net", size: 9 },
  { lessonId: "leaf-ladder", title: "축", subtitle: "단수 이어가기", chapterTitle: "수법", vibe: "축", kind: "ladder", size: 9 },
  { lessonId: "leaf-double", title: "이중 단수", subtitle: "급소 한 수", chapterTitle: "수법", vibe: "이중단수", kind: "double", size: 9 },
  { lessonId: "leaf-edge", title: "변·귀", subtitle: "가장자리 급소", chapterTitle: "판단", vibe: "변·귀", kind: "edge", size: 9 },
  { lessonId: "leaf-endgame", title: "끝내기", subtitle: "작은 이득", chapterTitle: "끝내기", vibe: "끝내기", kind: "capture", size: 9 },
  { lessonId: "leaf-tesuji", title: "수법", subtitle: "맛있는 한 수", chapterTitle: "끝내기", vibe: "수법", kind: "mixed", size: 9 },
  { lessonId: "leaf-mixed", title: "중급 종합", subtitle: "모의고사", chapterTitle: "종합", vibe: "종합", kind: "mixed", size: 9 },
];

const TREE: ConceptSpec[] = [
  { lessonId: "tree-corner", title: "귀 사활", subtitle: "귀부터 단단히", chapterTitle: "포석·사활", vibe: "귀", kind: "edge", size: 13 },
  { lessonId: "tree-life", title: "사활", subtitle: "살고 죽는 갈림길", chapterTitle: "포석·사활", vibe: "사활", kind: "eyes", size: 13 },
  { lessonId: "tree-invade", title: "침입 감각", subtitle: "큰 집 흔들기", chapterTitle: "중반", vibe: "침입", kind: "capture", size: 13 },
  { lessonId: "tree-sente", title: "선수", subtitle: "상대가 받아야 하는 수", chapterTitle: "중반", vibe: "선수", kind: "reduce", size: 13 },
  { lessonId: "tree-connect", title: "연결", subtitle: "큰 판에서 잇기", chapterTitle: "중반", vibe: "잇기", kind: "connect", size: 13 },
  { lessonId: "tree-capture", title: "전투 따내기", subtitle: "실전 단수", chapterTitle: "전투", vibe: "따내기", kind: "capture", size: 13 },
  { lessonId: "tree-two", title: "덩어리 전투", subtitle: "큰 돌 잡기", chapterTitle: "전투", vibe: "덩어리", kind: "two", size: 13 },
  { lessonId: "tree-net", title: "그물", subtitle: "달아남 차단", chapterTitle: "전투", vibe: "장문", kind: "net", size: 13 },
  { lessonId: "tree-ladder", title: "축", subtitle: "판 끝까지", chapterTitle: "전투", vibe: "축", kind: "ladder", size: 13 },
  { lessonId: "tree-double", title: "이중 단수", subtitle: "전투 급소", chapterTitle: "수법", vibe: "이중단수", kind: "double", size: 13 },
  { lessonId: "tree-tesuji", title: "수법", subtitle: "날카로운 한 수", chapterTitle: "수법", vibe: "수법", kind: "mixed", size: 13 },
  { lessonId: "tree-mixed", title: "상급 종합", subtitle: "모의고사", chapterTitle: "종합", vibe: "종합", kind: "mixed", size: 13 },
];

const FOREST: ConceptSpec[] = [
  { lessonId: "forest-flow", title: "큰 판 감각", subtitle: "같은 규칙, 넓은 판", chapterTitle: "실전", vibe: "흐름", kind: "capture", size: 19 },
  { lessonId: "forest-life", title: "실전 사활", subtitle: "19줄 급소", chapterTitle: "실전", vibe: "사활", kind: "eyes", size: 19 },
  { lessonId: "forest-shape", title: "모양", subtitle: "좋은 수·나쁜 수", chapterTitle: "모양·끝내기", vibe: "모양", kind: "connect", size: 19 },
  { lessonId: "forest-endgame", title: "끝내기", subtitle: "이득이 큰 곳", chapterTitle: "모양·끝내기", vibe: "끝내기", kind: "edge", size: 19 },
  { lessonId: "forest-capture", title: "실전 따내기", subtitle: "큰 판 단수", chapterTitle: "전투", vibe: "따내기", kind: "capture", size: 19 },
  { lessonId: "forest-tesuji", title: "수법", subtitle: "한 수로 바꾸기", chapterTitle: "전투", vibe: "수법", kind: "mixed", size: 19 },
  { lessonId: "forest-two", title: "대마 감각", subtitle: "큰 덩어리", chapterTitle: "전투", vibe: "덩어리", kind: "two", size: 19 },
  { lessonId: "forest-net", title: "그물", subtitle: "실전 장문", chapterTitle: "전투", vibe: "장문", kind: "net", size: 19 },
  { lessonId: "forest-ladder", title: "축", subtitle: "넓은 판에서", chapterTitle: "전투", vibe: "축", kind: "ladder", size: 19 },
  { lessonId: "forest-double", title: "이중 단수", subtitle: "실전 급소", chapterTitle: "수법", vibe: "이중단수", kind: "double", size: 19 },
  { lessonId: "forest-invade", title: "침입", subtitle: "큰 집 흔들기", chapterTitle: "중반", vibe: "침입", kind: "reduce", size: 19 },
  { lessonId: "forest-mixed", title: "실전 종합", subtitle: "모의고사", chapterTitle: "종합", vibe: "종합", kind: "mixed", size: 19 },
];

async function writeTrack(track: TrackId, title: string, concepts: PracticeConceptDraft[]) {
  let failed = 0;
  for (const c of concepts) {
    for (const p of c.problems) {
      if (!validate(p)) {
        console.error(`✗ ${c.lessonId}/${p.id}`);
        failed++;
      }
    }
  }
  const bank: PracticeBank & { source?: string } = {
    track,
    title,
    source: "handcrafted-inspired-by-goproblems",
    concepts,
  };
  await writeFile(join(OUT, `${track}.json`), JSON.stringify(bank, null, 2) + "\n");
  const problems = concepts.reduce((n, c) => n + c.problems.length, 0);
  console.log(`✓ ${track}: ${concepts.length} concepts / ${problems} problems`);
  return failed;
}

async function writeIndex() {
  const tracks: TrackId[] = ["seed", "sprout", "leaf", "tree", "forest"];
  const rows: PracticeIndex["tracks"] = [];
  let totalConcepts = 0;
  let totalProblems = 0;
  for (const t of tracks) {
    try {
      const bank = JSON.parse(await readFile(join(OUT, `${t}.json`), "utf8")) as PracticeBank;
      const concepts = bank.concepts.length;
      const problems = bank.concepts.reduce((n, c) => n + c.problems.length, 0);
      rows.push({ track: t, concepts, problems });
      totalConcepts += concepts;
      totalProblems += problems;
    } catch {
      /* */
    }
  }
  const index: PracticeIndex & { source?: string } = {
    totalConcepts,
    totalProblems,
    tracks: rows,
    updatedAt: new Date().toISOString(),
    source: "handcrafted-inspired-by-goproblems",
  };
  await writeFile(join(OUT, "index.json"), JSON.stringify(index, null, 2) + "\n");
  console.log(`\nindex: ${totalConcepts} concepts / ${totalProblems} problems`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  let failed = 0;
  failed += await writeTrack("seed", "입문 연습", buildTrack(SEED));
  failed += await writeTrack("sprout", "기초 연습", buildTrack(SPROUT));
  failed += await writeTrack("leaf", "중급 연습", buildTrack(LEAF));
  failed += await writeTrack("tree", "상급 연습", buildTrack(TREE));
  failed += await writeTrack("forest", "실전 연습", buildTrack(FOREST));
  await writeIndex();
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
