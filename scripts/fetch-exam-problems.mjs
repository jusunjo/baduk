#!/usr/bin/env node
/**
 * Go Problem API(RapidAPI) Basic 월 2000회를 급수별로 받아
 * src/data/exams/*.json 에 저장한다.
 *
 * 사용:
 *   RAPIDAPI_KEY=xxx npm run fetch:exams
 *   RAPIDAPI_KEY=xxx npm run fetch:exams -- --limit 50        # 테스트
 *   RAPIDAPI_KEY=xxx npm run fetch:exams -- --rank 30k --count 20
 *
 * .env 의 RAPIDAPI_KEY 도 읽는다.
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/data/exams");
const RAW_DIR = join(OUT_DIR, "raw");

const HOST = "go-problem-api.p.rapidapi.com";
const SEED_USER = "hansu-seed-v1";

/** 한수 급수 → API rank · Basic 2000 배분 */
const PLAN = [
  { apiRank: "30k", file: "g30", count: 250 },
  { apiRank: "25k", file: "g25", count: 250 },
  { apiRank: "20k", file: "g20", count: 250 },
  { apiRank: "15k", file: "g15", count: 250 },
  { apiRank: "10k", file: "g10", count: 250 },
  { apiRank: "7k", file: "g7", count: 200 },
  { apiRank: "5k", file: "g5", count: 200 },
  { apiRank: "3k", file: "g3", count: 200 },
  { apiRank: "1k", file: "g1", count: 150 },
];
// 합계 2000

function parseArgs(argv) {
  const out = { limit: null, rank: null, count: null, dry: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = Number(argv[++i]);
    else if (a === "--rank") out.rank = String(argv[++i]);
    else if (a === "--count") out.count = Number(argv[++i]);
    else if (a === "--dry") out.dry = true;
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

function sgfCoord(ch) {
  if (!ch || ch.length !== 2) return null;
  const x = ch.charCodeAt(0) - 97;
  const y = ch.charCodeAt(1) - 97;
  if (x < 0 || y < 0 || x > 24 || y > 24) return null;
  return { x, y };
}

/** 루트 AB/AW/SZ + 첫 수(들) 추출. 변형 여러 개면 첫 수를 전부 배열로. */
function parseSgf(sgf) {
  if (!sgf || typeof sgf !== "string") return null;
  const sizeM = sgf.match(/SZ\[(\d+)\]/);
  const size = sizeM ? Number(sizeM[1]) : 19;
  if (![7, 9, 13, 19].includes(size) && size !== 19) {
    /* 11 등 비표준은 19로 취급하지 않고 스킵 후보 */
  }

  const setup = [];
  const ab = [...sgf.matchAll(/\bAB((?:\[[^\]]*\])+)/g)];
  const aw = [...sgf.matchAll(/\bAW((?:\[[^\]]*\])+)/g)];
  for (const block of ab) {
    for (const m of block[1].matchAll(/\[([a-z]{0,2})\]/g)) {
      const p = sgfCoord(m[1]);
      if (p) setup.push({ color: "B", at: p });
    }
  }
  for (const block of aw) {
    for (const m of block[1].matchAll(/\[([a-z]{0,2})\]/g)) {
      const p = sgfCoord(m[1]);
      if (p) setup.push({ color: "W", at: p });
    }
  }

  const firstMoves = [];
  let playAs = "B";
  const firstColor = sgf.match(/;([BW])\[([a-z]{2})\]/);
  if (firstColor) {
    playAs = firstColor[1] === "B" ? "B" : "W";
    const slice = sgf.slice(sgf.indexOf(";") + 1);
    const alts = [...slice.matchAll(/\([;\s]*([BW])\[([a-z]{2})\]/g)];
    if (alts.length) {
      for (const a of alts) {
        if (a[1] === firstColor[1]) {
          const p = sgfCoord(a[2]);
          if (p) firstMoves.push(p);
        }
      }
    }
    if (!firstMoves.length) {
      const p = sgfCoord(firstColor[2]);
      if (p) firstMoves.push(p);
    }
  }

  // 중복 제거
  const seen = new Set();
  const answer = firstMoves.filter((p) => {
    const k = `${p.x},${p.y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (!answer.length) return null;

  const boardSize = [7, 9, 13, 19].includes(size) ? size : 19;
  return {
    boardSize,
    setup,
    answer: answer.length === 1 ? answer[0] : answer,
    playAs,
  };
}

function toProblem(raw, apiRank, index) {
  const sgf = raw?.sgf_content ?? raw?.sgf ?? raw?.data?.sgf_content;
  const id = String(raw?.id ?? raw?.data?.id ?? `${apiRank}-${index}`);
  const rankDisplay = raw?.rank_display ?? raw?.data?.rank_display ?? apiRank;
  const player = (raw?.player ?? raw?.data?.player ?? "black").toLowerCase();
  const parsed = parseSgf(sgf);
  if (!parsed) return null;

  return {
    id: `exam-${apiRank}-${id}`.replace(/[^a-zA-Z0-9_-]/g, "-"),
    sourceId: id,
    apiRank,
    rankDisplay,
    prompt: player.startsWith("w") ? "백이 둘 차례예요. 한 수만 두세요." : "흑이 둘 차례예요. 한 수만 두세요.",
    tip: `${rankDisplay} 수준 · 한수 승급 시험`,
    explanation: "정답 수 외의 변화는 시험에선 보지 않아요.",
    setup: parsed.setup,
    size: parsed.boardSize,
    answer: parsed.answer,
    playAs: parsed.playAs ?? (player.startsWith("w") ? "W" : "B"),
    sgf,
  };
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
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return unwrapPayload(json);
}

async function loadExisting(file) {
  const path = join(OUT_DIR, `${file}.json`);
  try {
    await access(path);
    const raw = JSON.parse(await readFile(path, "utf8"));
    return Array.isArray(raw.problems) ? raw : { meta: raw.meta ?? {}, problems: raw.problems ?? [] };
  } catch {
    return { meta: {}, problems: [] };
  }
}

async function saveRank(file, apiRank, problems) {
  await mkdir(OUT_DIR, { recursive: true });
  const payload = {
    meta: {
      apiRank,
      file,
      count: problems.length,
      fetchedAt: new Date().toISOString(),
      source: "go-problem-api.rapidapi.com",
    },
    problems,
  };
  await writeFile(join(OUT_DIR, `${file}.json`), JSON.stringify(payload, null, 2), "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = await loadEnvKey();
  if (!key && !args.dry) {
    console.error("RAPIDAPI_KEY 가 필요합니다. .env 또는 환경변수에 넣으세요.");
    process.exit(1);
  }

  await mkdir(RAW_DIR, { recursive: true });

  let plan = PLAN;
  if (args.rank) {
    const one = PLAN.find((p) => p.apiRank === args.rank || p.file === args.rank);
    if (!one) {
      console.error(`알 수 없는 rank: ${args.rank}`);
      process.exit(1);
    }
    plan = [{ ...one, count: args.count ?? one.count }];
  }

  let budget = args.limit ?? plan.reduce((s, p) => s + p.count, 0);
  console.log(`시드 시작 · budget=${budget} · userId=${SEED_USER}`);

  const index = [];
  let used = 0;

  for (const slot of plan) {
    if (used >= budget) break;
    const want = Math.min(slot.count, budget - used);
    const existing = await loadExisting(slot.file);
    const byId = new Map(existing.problems.map((p) => [p.sourceId, p]));
    let got = 0;
    let fails = 0;

    console.log(`\n→ ${slot.apiRank} (${slot.file}) 목표 ${want} · 기존 ${byId.size}`);

    while (got < want && used < budget && fails < 8) {
      if (args.dry) {
        used++;
        got++;
        continue;
      }
      try {
        const raw = await fetchOne(key, slot.apiRank, SEED_USER);
        used++;
        const rawPath = join(RAW_DIR, `${slot.file}-${used}.json`);
        await writeFile(rawPath, JSON.stringify(raw, null, 2), "utf8");

        const problem = toProblem(raw, slot.apiRank, used);
        if (!problem) {
          fails++;
          console.warn("  skip: SGF 파싱 실패");
          continue;
        }
        if (byId.has(problem.sourceId)) {
          // 중복 — API가 같은 걸 주면 계속 시도하되 fail 카운트
          fails++;
          console.warn(`  dup ${problem.sourceId}`);
          await new Promise((r) => setTimeout(r, 120));
          continue;
        }
        byId.set(problem.sourceId, problem);
        got++;
        fails = 0;
        if (got % 10 === 0 || got === want) {
          console.log(`  ${got}/${want} (api calls ${used})`);
          await saveRank(slot.file, slot.apiRank, [...byId.values()]);
        }
        await new Promise((r) => setTimeout(r, 150));
      } catch (e) {
        fails++;
        console.error(`  error: ${e.message}`);
        if (String(e.message).includes("429")) {
          console.error("레이트리밋 — 중단");
          break;
        }
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const list = [...byId.values()];
    await saveRank(slot.file, slot.apiRank, list);
    index.push({
      file: slot.file,
      apiRank: slot.apiRank,
      count: list.length,
    });
    console.log(`✓ ${slot.file}: ${list.length}문제 저장`);
  }

  await writeFile(
    join(OUT_DIR, "index.json"),
    JSON.stringify(
      {
        seedUser: SEED_USER,
        total: index.reduce((s, i) => s + i.count, 0),
        apiCallsUsed: used,
        ranks: index,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\n완료 · API ${used}회 · index.json 갱신`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
