#!/usr/bin/env node
/**
 * RapidAPI Go Problem → 연습 뱅크 (sprout / leaf / tree / forest)
 *
 *   RAPIDAPI_KEY=xxx npm run fetch:practice
 *   RAPIDAPI_KEY=xxx npm run fetch:practice -- --limit 80
 *   npm run fetch:practice -- --from-exams          # 키 없이 시험 JSON으로 채움
 *   npm run fetch:practice -- --compose             # 시험+기존 compose 메타 유지용
 *
 * seed 트랙은 건드리지 않음 (npm run build:practice).
 */

import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSgf, hasLegalAnswer } from "./lib/go-sgf.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/data/practice");
const EXAM_DIR = join(ROOT, "src/data/exams");
const RAW_DIR = join(OUT_DIR, "raw");

const HOST = "go-problem-api.p.rapidapi.com";
const SEED_USER = "hansu-practice-v1";

/** track별 개념 슬롯 · API 급수 · 목표 판 크기 */
const TRACKS = [
  {
    track: "sprout",
    title: "기초 연습",
    boardSize: 7,
    ranks: ["25k", "20k"],
    perRank: 40,
    concepts: [
      { lessonId: "sprout-capture", title: "따내기", subtitle: "단수인 돌을 잡아요", chapterTitle: "따내기", vibe: "따내기" },
      { lessonId: "sprout-escape", title: "달아나기", subtitle: "단수에서 숨구멍을 늘려요", chapterTitle: "따내기", vibe: "달아나기" },
      { lessonId: "sprout-eyes", title: "두 눈", subtitle: "사는 모양을 만들어요", chapterTitle: "사활 입문", vibe: "두 눈" },
      { lessonId: "sprout-net", title: "그물", subtitle: "달아날 길을 막아요", chapterTitle: "사활 입문", vibe: "그물" },
      { lessonId: "sprout-cut", title: "끊기", subtitle: "상대를 갈라놓아요", chapterTitle: "수법", vibe: "끊기" },
      { lessonId: "sprout-connect", title: "잇기", subtitle: "한 덩어리로 만들어요", chapterTitle: "수법", vibe: "잇기" },
      { lessonId: "sprout-atari", title: "단수 치기", subtitle: "먼저 위협해요", chapterTitle: "수법", vibe: "단수" },
      { lessonId: "sprout-life", title: "사활 맛보기", subtitle: "살고 죽는 한 수", chapterTitle: "사활 입문", vibe: "사활" },
    ],
  },
  {
    track: "leaf",
    title: "중급 연습",
    boardSize: 9,
    ranks: ["15k"],
    perRank: 60,
    concepts: [
      { lessonId: "leaf-house", title: "집 지키기", subtitle: "울타리를 닫아요", chapterTitle: "집과 행마", vibe: "집" },
      { lessonId: "leaf-haengma", title: "행마", subtitle: "한 칸·연결", chapterTitle: "집과 행마", vibe: "행마" },
      { lessonId: "leaf-life", title: "사활", subtitle: "9줄 사는 수", chapterTitle: "사활", vibe: "사활" },
      { lessonId: "leaf-capture", title: "따내기", subtitle: "중급 단수·덩어리", chapterTitle: "사활", vibe: "따내기" },
      { lessonId: "leaf-endgame", title: "끝내기", subtitle: "작은 이득", chapterTitle: "끝내기", vibe: "끝내기" },
      { lessonId: "leaf-tesuji", title: "수법", subtitle: "맛있는 한 수", chapterTitle: "끝내기", vibe: "수법" },
    ],
  },
  {
    track: "tree",
    title: "상급 연습",
    boardSize: 13,
    ranks: ["10k", "7k"],
    perRank: 40,
    concepts: [
      { lessonId: "tree-corner", title: "귀 사활", subtitle: "귀부터 단단히", chapterTitle: "포석·사활", vibe: "귀" },
      { lessonId: "tree-life", title: "사활", subtitle: "살고 죽는 갈림길", chapterTitle: "포석·사활", vibe: "사활" },
      { lessonId: "tree-invade", title: "침입", subtitle: "큰 집에 들어가기", chapterTitle: "중반", vibe: "침입" },
      { lessonId: "tree-sente", title: "선수", subtitle: "상대가 받아야 하는 수", chapterTitle: "중반", vibe: "선수" },
      { lessonId: "tree-connect", title: "연결", subtitle: "큰 판에서 잇기", chapterTitle: "중반", vibe: "잇기" },
      { lessonId: "tree-capture", title: "전투 따내기", subtitle: "실전 단수", chapterTitle: "전투", vibe: "따내기" },
    ],
  },
  {
    track: "forest",
    title: "실전 연습",
    boardSize: 19,
    ranks: ["5k", "3k", "1k"],
    perRank: 30,
    concepts: [
      { lessonId: "forest-flow", title: "큰 판 감각", subtitle: "같은 규칙, 넓은 판", chapterTitle: "실전", vibe: "흐름" },
      { lessonId: "forest-life", title: "실전 사활", subtitle: "19줄 급소", chapterTitle: "실전", vibe: "사활" },
      { lessonId: "forest-shape", title: "모양", subtitle: "좋은 수·나쁜 수", chapterTitle: "모양·끝내기", vibe: "모양" },
      { lessonId: "forest-endgame", title: "끝내기", subtitle: "이득이 큰 곳", chapterTitle: "모양·끝내기", vibe: "끝내기" },
      { lessonId: "forest-capture", title: "실전 따내기", subtitle: "큰 판 단수", chapterTitle: "전투", vibe: "따내기" },
      { lessonId: "forest-tesuji", title: "수법", subtitle: "한 수로 바꾸기", chapterTitle: "전투", vibe: "수법" },
    ],
  },
];

const PROMPTS = {
  capture: "흑 차례예요. 따낼 수 있는 수를 찾아 두세요.",
  escape: "흑 차례예요. 단수인 내 돌을 살릴 수를 두세요.",
  eyes: "흑 차례예요. 사는 수(두 눈)를 찾아 두세요.",
  net: "흑 차례예요. 상대가 달아나지 못하게 막는 수를 두세요.",
  cut: "흑 차례예요. 상대를 끊는 급소를 두세요.",
  connect: "흑 차례예요. 내 돌을 잇는 수를 두세요.",
  atari: "흑 차례예요. 단수를 치는 수를 두세요.",
  life: "흑 차례예요. 살고 죽는 급소를 두세요.",
  house: "흑 차례예요. 집을 지키거나 키우는 수를 두세요.",
  haengma: "흑 차례예요. 좋은 행마를 찾아 두세요.",
  endgame: "흑 차례예요. 끝내기에서 이득이 큰 수를 두세요.",
  tesuji: "흑 차례예요. 수법이 되는 한 수를 두세요.",
  corner: "흑 차례예요. 귀의 급소를 두세요.",
  invade: "흑 차례예요. 침입·삭감에 맞는 수를 두세요.",
  sente: "흑 차례예요. 선수 감각으로 한 수를 두세요.",
  shape: "흑 차례예요. 모양이 좋은 수를 두세요.",
  flow: "흑 차례예요. 이 장면의 급소를 두세요.",
};

function conceptPrompt(lessonId, playAs) {
  const key = lessonId.split("-").slice(1).join("-");
  const base =
    PROMPTS[key] ||
    PROMPTS[lessonId.split("-").pop()] ||
    "한 수만 두세요. 정답 자리를 찾아 보세요.";
  if (playAs === "W") return base.replace(/^흑/, "백");
  return base;
}

function parseArgs(argv) {
  const out = { limit: null, dry: false, fromExams: false, compose: false, track: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = Number(argv[++i]);
    else if (a === "--dry") out.dry = true;
    else if (a === "--from-exams") out.fromExams = true;
    else if (a === "--compose") out.compose = true;
    else if (a === "--track") out.track = String(argv[++i]);
  }
  return out;
}

async function loadEnvKey() {
  if (process.env.RAPIDAPI_KEY) return process.env.RAPIDAPI_KEY;
  try {
    const raw = await readFile(join(ROOT, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*RAPIDAPI_KEY\s*=\s*(.*)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "").trim();
    }
  } catch {
    /* no .env */
  }
  return "";
}

function unwrapPayload(json) {
  if (!json) return null;
  if (json.data && (json.data.sgf_content || json.data.id)) return json.data;
  if (json.sgf_content || json.id) return json;
  return json.data ?? json;
}

async function fetchOne(key, apiRank, userId) {
  const url = new URL("https://go-problem-api.p.rapidapi.com/v1/problem");
  url.searchParams.set("userId", userId);
  url.searchParams.set("rank", apiRank);
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": HOST,
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status} non-JSON: ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  return unwrapPayload(json);
}

function rawToDraft(raw, apiRank, index) {
  const sgf = raw?.sgf_content ?? raw?.sgf ?? raw?.data?.sgf_content;
  const id = String(raw?.id ?? raw?.data?.id ?? `${apiRank}-${index}`);
  const rankDisplay = raw?.rank_display ?? raw?.data?.rank_display ?? apiRank;
  const player = (raw?.player ?? raw?.data?.player ?? "black").toLowerCase();
  const parsed = parseSgf(sgf);
  if (!parsed) return null;
  const playAs = parsed.playAs ?? (player.startsWith("w") ? "W" : "B");
  return {
    id: `prac-${apiRank}-${id}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
    sourceId: id,
    apiRank,
    rankDisplay,
    setup: parsed.setup,
    size: parsed.boardSize,
    answer: parsed.answer,
    playAs,
    sgf,
  };
}

function examFileForRank(apiRank) {
  const n = apiRank.replace("k", "");
  return `g${n}.json`;
}

async function loadExamProblems(apiRank) {
  const file = examFileForRank(apiRank);
  try {
    const raw = JSON.parse(await readFile(join(EXAM_DIR, file), "utf8"));
    return Array.isArray(raw.problems) ? raw.problems : [];
  } catch {
    return [];
  }
}

function examToDraft(p) {
  return {
    id: p.id,
    sourceId: p.sourceId ?? p.id,
    apiRank: p.apiRank,
    rankDisplay: p.rankDisplay ?? p.apiRank,
    setup: p.setup ?? [],
    size: p.size,
    answer: p.answer,
    playAs: p.playAs ?? "B",
    prompt: p.prompt,
    tip: p.tip,
    explanation: p.explanation,
    wrongHint: p.wrongHint,
  };
}

function distribute(drafts, concepts, boardSize) {
  const buckets = concepts.map((c) => ({ ...c, problems: [] }));
  const usable = drafts.filter((d) => hasLegalAnswer(d));
  // 선호 판 크기 우선, 부족하면 다른 크기 허용
  const preferred = usable.filter((d) => d.size === boardSize);
  const rest = usable.filter((d) => d.size !== boardSize);
  const pool = [...preferred, ...rest];

  let i = 0;
  for (const d of pool) {
    const bucket = buckets[i % buckets.length];
    if (bucket.problems.length >= 10) {
      // 꽉 찬 버킷 스킵 — 다음 빈 곳
      const open = buckets.find((b) => b.problems.length < 10);
      if (!open) break;
      open.problems.push(d);
    } else {
      bucket.problems.push(d);
    }
    i++;
  }
  return buckets;
}

function finalizeConcept(conceptMeta, drafts, boardSize) {
  const problems = drafts.slice(0, 10).map((d, idx) => {
    const playAs = d.playAs ?? "B";
    return {
      id: `${conceptMeta.lessonId}-p${String(idx + 1).padStart(2, "0")}`,
      prompt: d.prompt ?? conceptPrompt(conceptMeta.lessonId, playAs),
      tip: d.tip ?? `${d.rankDisplay ?? ""} 수준`.trim(),
      explanation: d.explanation ?? "이 장면의 급소예요. 한 수만 정확하게 두어 보세요.",
      wrongHint: d.wrongHint ?? "다른 자리를 천천히 다시 살펴 보세요.",
      setup: d.setup,
      size: d.size ?? boardSize,
      answer: d.answer,
      playAs,
    };
  });
  return {
    lessonId: conceptMeta.lessonId,
    title: conceptMeta.title,
    subtitle: conceptMeta.subtitle,
    vibe: conceptMeta.vibe,
    chapterTitle: conceptMeta.chapterTitle,
    boardSize,
    minutes: 5,
    problems,
  };
}

async function writeTrack(trackCfg, concepts, source) {
  const incomplete = concepts.filter((c) => c.problems.length < 10);
  if (incomplete.length) {
    console.warn(
      `  ! ${trackCfg.track}: ${incomplete.length}개 개념이 10문항 미만 — ${incomplete.map((c) => `${c.lessonId}(${c.problems.length})`).join(", ")}`,
    );
  }
  const bank = {
    track: trackCfg.track,
    title: trackCfg.title,
    source,
    concepts: concepts.filter((c) => c.problems.length > 0),
  };
  await writeFile(join(OUT_DIR, `${trackCfg.track}.json`), JSON.stringify(bank, null, 2) + "\n");
  const n = bank.concepts.reduce((s, c) => s + c.problems.length, 0);
  console.log(`✓ ${trackCfg.track}: ${bank.concepts.length} concepts / ${n} problems (${source})`);
  return { concepts: bank.concepts.length, problems: n };
}

async function ensureComposeBaseline() {
  console.log("compose baseline (build-practice-banks --advanced-only)…");
  const r = spawnSync(
    "npx",
    ["--yes", "tsx", "--tsconfig", "tsconfig.json", "scripts/build-practice-banks.ts", "--advanced-only"],
    { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" },
  );
  if (r.status !== 0) {
    console.error(r.stdout);
    console.error(r.stderr);
    throw new Error("compose baseline failed");
  }
}

async function loadComposedTrack(track) {
  try {
    return JSON.parse(await readFile(join(OUT_DIR, `${track}.json`), "utf8"));
  } catch {
    return null;
  }
}

/** 시험 문제를 앞에 넣고, compose로 10칸을 채움 */
async function fillFromExams(trackCfg) {
  const examDrafts = [];
  for (const rank of trackCfg.ranks) {
    for (const p of await loadExamProblems(rank)) {
      const d = examToDraft(p);
      if (hasLegalAnswer(d)) examDrafts.push(d);
    }
  }
  const examBuckets = distribute(examDrafts, trackCfg.concepts, trackCfg.boardSize);
  const composed = await loadComposedTrack(trackCfg.track);
  const composedById = new Map((composed?.concepts ?? []).map((c) => [c.lessonId, c]));

  return trackCfg.concepts.map((meta, i) => {
    const fromExam = examBuckets[i]?.problems ?? [];
    const fromCompose = composedById.get(meta.lessonId)?.problems ?? [];
    const merged = [];
    const seen = new Set();
    for (const p of [...fromExam, ...fromCompose]) {
      const key = JSON.stringify(p.setup) + JSON.stringify(p.answer);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(p);
      if (merged.length >= 10) break;
    }
    // compose 문제가 이미 id/prompt를 갖고 있으면 finalize가 덮어씀 — exam은 tip 보강
    return finalizeConcept(meta, merged, trackCfg.boardSize);
  });
}

async function fillFromApi(trackCfg, key, budget, args) {
  const byId = new Map();
  let used = 0;
  let fails = 0;
  const wantTotal = trackCfg.ranks.reduce((s, _) => s + trackCfg.perRank, 0);
  const target = Math.min(wantTotal, budget);

  for (const rank of trackCfg.ranks) {
    let got = 0;
    const want = Math.min(trackCfg.perRank, target - used);
    console.log(`  → API ${rank} 목표 ${want}`);
    fails = 0;
    while (got < want && used < target && fails < 10) {
      if (args.dry) {
        used++;
        got++;
        continue;
      }
      try {
        const raw = await fetchOne(key, rank, SEED_USER);
        used++;
        await mkdir(RAW_DIR, { recursive: true });
        await writeFile(join(RAW_DIR, `${trackCfg.track}-${used}.json`), JSON.stringify(raw, null, 2));
        const draft = rawToDraft(raw, rank, used);
        if (!draft || !hasLegalAnswer(draft)) {
          fails++;
          continue;
        }
        if (byId.has(draft.sourceId)) {
          fails++;
          await new Promise((r) => setTimeout(r, 120));
          continue;
        }
        byId.set(draft.sourceId, draft);
        got++;
        fails = 0;
        if (got % 10 === 0) console.log(`    ${got}/${want}`);
        await new Promise((r) => setTimeout(r, 150));
      } catch (e) {
        fails++;
        console.error(`    error: ${e.message}`);
        if (String(e.message).includes("429")) break;
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }

  // exams로 부족분 보충
  const have = [...byId.values()];
  if (have.length < trackCfg.concepts.length * 10) {
    for (const rank of trackCfg.ranks) {
      for (const p of await loadExamProblems(rank)) {
        const d = examToDraft(p);
        if (!byId.has(d.sourceId) && hasLegalAnswer(d)) byId.set(d.sourceId, d);
      }
    }
  }

  const buckets = distribute([...byId.values()], trackCfg.concepts, trackCfg.boardSize);
  return {
    concepts: buckets.map((b, i) => finalizeConcept(trackCfg.concepts[i], b.problems, trackCfg.boardSize)),
    used,
  };
}

async function updateIndex() {
  const tracks = ["seed", "sprout", "leaf", "tree", "forest"];
  const rows = [];
  let totalConcepts = 0;
  let totalProblems = 0;
  for (const t of tracks) {
    try {
      const bank = JSON.parse(await readFile(join(OUT_DIR, `${t}.json`), "utf8"));
      const concepts = bank.concepts?.length ?? 0;
      const problems = (bank.concepts ?? []).reduce((s, c) => s + (c.problems?.length ?? 0), 0);
      rows.push({ track: t, concepts, problems });
      totalConcepts += concepts;
      totalProblems += problems;
    } catch {
      /* skip */
    }
  }
  await writeFile(
    join(OUT_DIR, "index.json"),
    JSON.stringify({ totalConcepts, totalProblems, tracks: rows, updatedAt: new Date().toISOString() }, null, 2) + "\n",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await mkdir(OUT_DIR, { recursive: true });

  let tracks = TRACKS;
  if (args.track) {
    tracks = TRACKS.filter((t) => t.track === args.track);
    if (!tracks.length) {
      console.error(`unknown track ${args.track}`);
      process.exit(1);
    }
  }

  const key = await loadEnvKey();
  const useApi = !!key && !args.fromExams && !args.compose;

  if (!useApi && !args.fromExams && !args.compose) {
    console.log("RAPIDAPI_KEY 없음 → --from-exams (시험 + compose) 로 채웁니다.");
    args.fromExams = true;
  }

  let apiUsed = 0;
  let budget = args.limit ?? 400;

  if (!useApi) {
    await ensureComposeBaseline();
  }

  for (const trackCfg of tracks) {
    console.log(`\n# ${trackCfg.track}`);
    if (useApi) {
      const { concepts, used } = await fillFromApi(trackCfg, key, budget - apiUsed, args);
      apiUsed += used;
      // API 부족분은 compose+exams로 보충
      const filled = concepts.map((c) => c.problems.length);
      if (filled.some((n) => n < 10)) {
        await ensureComposeBaseline();
        const merged = await fillFromExams(trackCfg);
        const byId = new Map(concepts.map((c) => [c.lessonId, c]));
        for (const m of merged) {
          const cur = byId.get(m.lessonId);
          if (!cur || cur.problems.length >= 10) continue;
          const seen = new Set(cur.problems.map((p) => JSON.stringify(p.setup) + JSON.stringify(p.answer)));
          for (const p of m.problems) {
            const k = JSON.stringify(p.setup) + JSON.stringify(p.answer);
            if (seen.has(k)) continue;
            cur.problems.push(p);
            if (cur.problems.length >= 10) break;
          }
          cur.problems = cur.problems.slice(0, 10);
        }
        await writeTrack(trackCfg, [...byId.values()], "go-problem-api+compose");
      } else {
        await writeTrack(trackCfg, concepts, "go-problem-api.rapidapi.com");
      }
    } else {
      const concepts = await fillFromExams(trackCfg);
      await writeTrack(trackCfg, concepts, "from-exams+compose");
    }
  }

  await updateIndex();
  console.log(`\n완료 · API ${apiUsed}회`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
