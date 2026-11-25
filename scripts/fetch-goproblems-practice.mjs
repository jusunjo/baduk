#!/usr/bin/env node
/**
 * GoProblems.com → raw 레퍼런스 캐시 (앱 뱅크에 직접 넣지 않음)
 *
 * 연습 문항은 `npm run build:practice`(자작 모티프 변주)로 만듭니다.
 * 이 스크립트는 급수·장르 레퍼런스 수집용입니다.
 *
 *   npm run fetch:goproblems
 *   npm run fetch:goproblems -- --limit 120
 *   npm run fetch:goproblems -- --track sprout
 */

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSgf, hasLegalAnswer } from "./lib/go-sgf.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "src/data/practice");
const RAW_DIR = join(OUT_DIR, "raw-goproblems");
const PER_CONCEPT = 15;
const LIST_PAGE = 30; // API hard-caps around 30
const LIST_PAGES = 6; // offset 0..150
const DELAY_MS = 550;

/** elo 대략 구간 · 장르 · 개념(더 풍성) */
const TRACKS = [
  {
    track: "seed",
    title: "입문 연습",
    mergeHandcrafted: true,
    elo: [0, 750],
    kyuMax: 28,
    kyuMin: 40,
    queries: [
      { genres: ["life and death"], elo: [0, 500] },
      { genres: ["life and death"], elo: [500, 750] },
      { genres: ["tesuji"], elo: [0, 750] },
      { genres: ["best move"], elo: [0, 750] },
    ],
    concepts: [
      { lessonId: "seed-gp-life", title: "입문 사활", subtitle: "살고 죽는 첫걸음", chapterTitle: "실전 맛보기", vibe: "사활", genres: ["life and death"] },
      { lessonId: "seed-gp-tesuji", title: "입문 수법", subtitle: "한 수로 바꾸기", chapterTitle: "실전 맛보기", vibe: "수법", genres: ["tesuji"] },
      { lessonId: "seed-gp-capture", title: "입문 따내기", subtitle: "실전에서 잡기", chapterTitle: "실전 맛보기", vibe: "따내기", genres: ["life and death", "tesuji"] },
      { lessonId: "seed-gp-best", title: "입문 급소", subtitle: "어디가 큰가", chapterTitle: "실전 맛보기", vibe: "급소", genres: ["best move", "tesuji"] },
    ],
  },
  {
    track: "sprout",
    title: "기초 연습",
    elo: [400, 1000],
    kyuMax: 18,
    kyuMin: 30,
    queries: [
      { genres: ["life and death"], elo: [400, 700] },
      { genres: ["life and death"], elo: [700, 1000] },
      { genres: ["tesuji"], elo: [400, 1000] },
      { genres: ["best move"], elo: [400, 1000] },
      { genres: ["endgame"], elo: [400, 1000] },
    ],
    concepts: [
      { lessonId: "sprout-life", title: "사활", subtitle: "살고 죽는 수", chapterTitle: "사활", vibe: "사활", genres: ["life and death"] },
      { lessonId: "sprout-eyes", title: "눈·집", subtitle: "사는 모양", chapterTitle: "사활", vibe: "눈", genres: ["life and death"] },
      { lessonId: "sprout-net", title: "그물·포위", subtitle: "달아날 길 막기", chapterTitle: "사활", vibe: "그물", genres: ["life and death"] },
      { lessonId: "sprout-tesuji", title: "수법", subtitle: "맛있는 한 수", chapterTitle: "수법", vibe: "수법", genres: ["tesuji"] },
      { lessonId: "sprout-capture", title: "따내기", subtitle: "실전 단수", chapterTitle: "수법", vibe: "따내기", genres: ["tesuji", "life and death"] },
      { lessonId: "sprout-cut", title: "끊고 잇기", subtitle: "갈라놓고 연결", chapterTitle: "수법", vibe: "끊기", genres: ["tesuji"] },
      { lessonId: "sprout-best", title: "급소", subtitle: "가장 큰 곳", chapterTitle: "판단", vibe: "급소", genres: ["best move"] },
      { lessonId: "sprout-endgame", title: "초급 끝내기", subtitle: "작은 이득", chapterTitle: "판단", vibe: "끝내기", genres: ["endgame"] },
      { lessonId: "sprout-corner", title: "귀 싸움", subtitle: "귀에서 사는 법", chapterTitle: "사활", vibe: "귀", genres: ["life and death"] },
      { lessonId: "sprout-side", title: "변 싸움", subtitle: "변의 급소", chapterTitle: "판단", vibe: "변", genres: ["tesuji", "best move"] },
      { lessonId: "sprout-escape", title: "달아나기", subtitle: "살리는 수", chapterTitle: "사활", vibe: "달아나기", genres: ["life and death"] },
      { lessonId: "sprout-mixed", title: "종합", subtitle: "뭐든 나와요", chapterTitle: "종합", vibe: "종합", genres: ["life and death", "tesuji", "best move"] },
    ],
  },
  {
    track: "leaf",
    title: "중급 연습",
    elo: [800, 1250],
    kyuMax: 12,
    kyuMin: 22,
    queries: [
      { genres: ["life and death"], elo: [800, 1050] },
      { genres: ["life and death"], elo: [1050, 1250] },
      { genres: ["tesuji"], elo: [800, 1250] },
      { genres: ["endgame"], elo: [800, 1250] },
      { genres: ["best move"], elo: [800, 1250] },
      { genres: ["joseki"], elo: [800, 1250] },
    ],
    concepts: [
      { lessonId: "leaf-life", title: "사활", subtitle: "중급 사활", chapterTitle: "사활", vibe: "사활", genres: ["life and death"] },
      { lessonId: "leaf-tesuji", title: "수법", subtitle: "중급 수법", chapterTitle: "수법", vibe: "수법", genres: ["tesuji"] },
      { lessonId: "leaf-endgame", title: "끝내기", subtitle: "집 계산 감각", chapterTitle: "끝내기", vibe: "끝내기", genres: ["endgame"] },
      { lessonId: "leaf-best", title: "급소", subtitle: "형세 판단", chapterTitle: "판단", vibe: "급소", genres: ["best move"] },
      { lessonId: "leaf-capture", title: "전투", subtitle: "따내고 달아나고", chapterTitle: "전투", vibe: "전투", genres: ["tesuji", "life and death"] },
      { lessonId: "leaf-corner", title: "귀 사활", subtitle: "귀의 정석적 급소", chapterTitle: "사활", vibe: "귀", genres: ["life and death"] },
      { lessonId: "leaf-joseki", title: "정석 맛보기", subtitle: "귀에 자주 나오는 수", chapterTitle: "정석", vibe: "정석", genres: ["joseki", "best move", "tesuji"] },
      { lessonId: "leaf-shape", title: "모양", subtitle: "좋은 수·나쁜 수", chapterTitle: "판단", vibe: "모양", genres: ["best move", "tesuji"] },
      { lessonId: "leaf-side", title: "변·중앙", subtitle: "큰 곳 고르기", chapterTitle: "판단", vibe: "변", genres: ["best move"] },
      { lessonId: "leaf-cut", title: "끊기·연결", subtitle: "갈라놓고 잇기", chapterTitle: "수법", vibe: "끊기", genres: ["tesuji"] },
      { lessonId: "leaf-escape", title: "달아나기", subtitle: "살리는 수", chapterTitle: "사활", vibe: "달아나기", genres: ["life and death", "tesuji"] },
      { lessonId: "leaf-mixed", title: "종합", subtitle: "중급 모의고사", chapterTitle: "종합", vibe: "종합", genres: ["life and death", "tesuji", "endgame"] },
    ],
  },
  {
    track: "tree",
    title: "상급 연습",
    elo: [1000, 1600],
    kyuMax: 3,
    kyuMin: 16,
    queries: [
      { genres: ["life and death"], elo: [1000, 1300] },
      { genres: ["life and death"], elo: [1300, 1600] },
      { genres: ["tesuji"], elo: [1000, 1600] },
      { genres: ["endgame"], elo: [1000, 1600] },
      { genres: ["best move"], elo: [1000, 1600] },
      { genres: ["joseki"], elo: [1000, 1600] },
      { genres: ["fuseki"], elo: [1000, 1600] },
    ],
    concepts: [
      { lessonId: "tree-life", title: "사활", subtitle: "상급 사활", chapterTitle: "사활", vibe: "사활", genres: ["life and death"] },
      { lessonId: "tree-tesuji", title: "수법", subtitle: "날카로운 한 수", chapterTitle: "수법", vibe: "수법", genres: ["tesuji"] },
      { lessonId: "tree-endgame", title: "끝내기", subtitle: "큰 끝내기", chapterTitle: "끝내기", vibe: "끝내기", genres: ["endgame"] },
      { lessonId: "tree-best", title: "급소", subtitle: "국면 판단", chapterTitle: "판단", vibe: "급소", genres: ["best move"] },
      { lessonId: "tree-invade", title: "침입·삭감", subtitle: "큰 집 흔들기", chapterTitle: "중반", vibe: "침입", genres: ["best move", "tesuji"] },
      { lessonId: "tree-joseki", title: "정석", subtitle: "귀에 두기", chapterTitle: "정석", vibe: "정석", genres: ["joseki", "best move", "tesuji"] },
      { lessonId: "tree-fuseki", title: "포석", subtitle: "첫 판 구상", chapterTitle: "포석", vibe: "포석", genres: ["fuseki", "best move"] },
      { lessonId: "tree-corner", title: "귀 사활", subtitle: "어려운 귀", chapterTitle: "사활", vibe: "귀", genres: ["life and death"] },
      { lessonId: "tree-fight", title: "전투", subtitle: "맞붙어 이기기", chapterTitle: "전투", vibe: "전투", genres: ["tesuji", "life and death"] },
      { lessonId: "tree-escape", title: "대마 살리기", subtitle: "큰 돌 살리는 수", chapterTitle: "사활", vibe: "달아나기", genres: ["life and death", "tesuji"] },
      { lessonId: "tree-endgame-big", title: "큰 끝내기", subtitle: "집 차이 나는 곳", chapterTitle: "끝내기", vibe: "끝내기", genres: ["endgame", "best move"] },
      { lessonId: "tree-mixed", title: "종합", subtitle: "상급 모의고사", chapterTitle: "종합", vibe: "종합", genres: ["life and death", "tesuji", "endgame", "best move"] },
    ],
  },
  {
    track: "forest",
    title: "실전 연습",
    elo: [1300, 2100],
    kyuMax: 1,
    kyuMin: 10,
    queries: [
      { genres: ["life and death"], elo: [1300, 1600] },
      { genres: ["life and death"], elo: [1600, 1900] },
      { genres: ["life and death"], elo: [1900, 2200] },
      { genres: ["tesuji"], elo: [1300, 2100] },
      { genres: ["endgame"], elo: [1300, 2100] },
      { genres: ["best move"], elo: [1300, 2100] },
      { genres: ["joseki"], elo: [1300, 2100] },
      { genres: ["fuseki"], elo: [1300, 2100] },
    ],
    concepts: [
      { lessonId: "forest-life", title: "실전 사활", subtitle: "19줄 급소", chapterTitle: "사활", vibe: "사활", genres: ["life and death"] },
      { lessonId: "forest-tesuji", title: "실전 수법", subtitle: "한 수로 국면 전환", chapterTitle: "수법", vibe: "수법", genres: ["tesuji"] },
      { lessonId: "forest-endgame", title: "실전 끝내기", subtitle: "이득이 큰 곳", chapterTitle: "끝내기", vibe: "끝내기", genres: ["endgame"] },
      { lessonId: "forest-best", title: "국면 판단", subtitle: "어디에 둘까", chapterTitle: "판단", vibe: "급소", genres: ["best move"] },
      { lessonId: "forest-fuseki", title: "포석", subtitle: "큰 판 구상", chapterTitle: "포석", vibe: "포석", genres: ["fuseki", "best move"] },
      { lessonId: "forest-joseki", title: "정석·변화", subtitle: "귀에 깊게", chapterTitle: "정석", vibe: "정석", genres: ["joseki", "best move", "tesuji"] },
      { lessonId: "forest-invade", title: "침입", subtitle: "대마·큰 집", chapterTitle: "중반", vibe: "침입", genres: ["best move", "tesuji"] },
      { lessonId: "forest-fight", title: "전투", subtitle: "맞바둑 감각", chapterTitle: "전투", vibe: "전투", genres: ["tesuji", "life and death"] },
      { lessonId: "forest-shape", title: "모양", subtitle: "두터움과 얇음", chapterTitle: "판단", vibe: "모양", genres: ["best move"] },
      { lessonId: "forest-corner", title: "귀 사활", subtitle: "어려운 귀 급소", chapterTitle: "사활", vibe: "귀", genres: ["life and death"] },
      { lessonId: "forest-endgame-big", title: "끝내기 계산", subtitle: "큰 곳과 급한 곳", chapterTitle: "끝내기", vibe: "끝내기", genres: ["endgame", "best move"] },
      { lessonId: "forest-mixed", title: "종합", subtitle: "실전 모의고사", chapterTitle: "종합", vibe: "종합", genres: ["life and death", "tesuji", "endgame", "best move"] },
    ],
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const out = { limit: null, track: null, dry: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = Number(argv[++i]);
    else if (a === "--track") out.track = String(argv[++i]);
    else if (a === "--dry") out.dry = true;
  }
  return out;
}

async function loadKey() {
  if (process.env.GOPROBLEMS_API_KEY) return process.env.GOPROBLEMS_API_KEY.trim();
  try {
    const raw = await readFile(join(ROOT, ".env"), "utf8");
    const m = raw.match(/^\s*GOPROBLEMS_API_KEY\s*=\s*(.*)\s*$/m);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  } catch {
    /* */
  }
  return "";
}

function headers(key) {
  const h = { accept: "application/json" };
  if (key) h["X-Api-Key"] = key;
  return h;
}

async function fetchJson(url, key, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: headers(key) });
    const text = await res.text();
    if (res.status === 429 && attempt < retries) {
      const wait = DELAY_MS * (attempt + 2) * 2;
      console.warn(`  429 — ${wait}ms 대기 후 재시도 (${attempt + 1}/${retries})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    return JSON.parse(text);
  }
  throw new Error("HTTP 429: retries exhausted");
}

function listUrl({ eloFrom, eloTo, genres, resultNumber = LIST_PAGE, offset = 0, sort = "desc" }) {
  const u = new URL("https://goproblems.com/api/v2/problems");
  u.searchParams.set("result_number", String(resultNumber));
  u.searchParams.set("offset", String(offset));
  u.searchParams.set("difficulty_from_elo", String(eloFrom));
  u.searchParams.set("difficulty_to_elo", String(eloTo));
  u.searchParams.set("type", "canon");
  u.searchParams.set("sort_direction", sort);
  u.searchParams.set("rating_from", "1");
  u.searchParams.set("rating_to", "5");
  u.searchParams.set("include_not_rated", "true");
  for (const g of genres) u.searchParams.append("genres[]", g);
  for (const s of ["untried", "tried_but_not_solved", "solved"]) u.searchParams.append("statuses[]", s);
  return u.toString();
}

function kyuValue(rank) {
  if (!rank) return null;
  if (rank.unit === "kyu") return rank.value;
  if (rank.unit === "dan") return -rank.value;
  return null;
}

function detailToDraft(j) {
  if (!j?.sgf) return null;
  const parsed = parseSgf(j.sgf);
  if (!parsed) return null;
  const size = [7, 9, 13, 19].includes(parsed.boardSize)
    ? parsed.boardSize
    : parsed.rawSize >= 19
      ? 19
      : parsed.rawSize >= 13
        ? 13
        : parsed.rawSize >= 9
          ? 9
          : 7;
  // 비표준 판은 스킵
  if (![7, 9, 13, 19].includes(parsed.rawSize) && parsed.rawSize !== size) {
    if (![7, 9, 13, 19].includes(parsed.rawSize)) return null;
  }
  const playAs = j.playerColor === "white" ? "W" : parsed.playAs ?? "B";
  const kyu = kyuValue(j.rank);
  const rankLabel = j.rank ? `${j.rank.value}${j.rank.unit === "dan" ? "단" : "급"}` : "";
  const genre = j.genre || "life and death";
  const prompt =
    playAs === "W"
      ? `백 차례예요. ${genreKo(genre)} 급소를 찾아 두세요.`
      : `흑 차례예요. ${genreKo(genre)} 급소를 찾아 두세요.`;
  const draft = {
    id: `gp-${j.id}`,
    sourceId: String(j.id),
    genre,
    kyu,
    rankLabel,
    prompt,
    tip: `GoProblems · ${rankLabel} · ${genre}`,
    explanation: "정답 변화는 여러 갈래일 수 있어요. 급소 한 수를 맞춰 보세요.",
    wrongHint: "다른 급소를 천천히 다시 살펴 보세요.",
    setup: parsed.setup,
    size: parsed.rawSize && [7, 9, 13, 19].includes(parsed.rawSize) ? parsed.rawSize : size,
    answer: parsed.answer,
    playAs,
    sgf: j.sgf,
  };
  if (!hasLegalAnswer(draft)) return null;
  return draft;
}

function genreKo(g) {
  const map = {
    "life and death": "사활",
    tesuji: "수법",
    endgame: "끝내기",
    "best move": "급소",
    joseki: "정석",
    fuseki: "포석",
  };
  return map[g] || "바둑";
}

function genreMatch(d, genres) {
  return genres.some((g) => d.genre === g || (d.genre || "").includes(g));
}

/** 장르 우선 라운드로빈 → 남는 슬롯은 공용 풀로 채움 */
function assignConcepts(pool, concepts, n) {
  const used = new Set();
  const buckets = concepts.map(() => []);
  const preferred = concepts.map((c) => pool.filter((d) => genreMatch(d, c.genres)));

  let progressed = true;
  while (progressed) {
    progressed = false;
    for (let i = 0; i < concepts.length; i++) {
      if (buckets[i].length >= n) continue;
      const next = preferred[i].find((d) => !used.has(d.sourceId));
      if (!next) continue;
      used.add(next.sourceId);
      buckets[i].push(next);
      progressed = true;
    }
  }

  let fill = true;
  while (fill) {
    fill = false;
    for (let i = 0; i < concepts.length; i++) {
      if (buckets[i].length >= n) continue;
      const next = pool.find((d) => !used.has(d.sourceId));
      if (!next) return buckets;
      used.add(next.sourceId);
      buckets[i].push(next);
      fill = true;
    }
  }
  return buckets;
}

function toProblem(conceptId, d, idx) {
  return {
    id: `${conceptId}-p${String(idx + 1).padStart(2, "0")}`,
    prompt: d.prompt,
    tip: d.tip,
    explanation: d.explanation,
    wrongHint: d.wrongHint,
    setup: d.setup,
    size: d.size,
    answer: d.answer,
    playAs: d.playAs,
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
      /* */
    }
  }
  await writeFile(
    join(OUT_DIR, "index.json"),
    JSON.stringify({ totalConcepts, totalProblems, tracks: rows, updatedAt: new Date().toISOString(), source: "goproblems.com" }, null, 2) +
      "\n",
  );
  console.log(`\nindex: ${totalConcepts} concepts / ${totalProblems} problems`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = await loadKey();
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  let tracks = TRACKS;
  if (args.track) {
    tracks = TRACKS.filter((t) => t.track === args.track);
    if (!tracks.length) {
      console.error("unknown track", args.track);
      process.exit(1);
    }
  }

  let detailBudget = args.limit ?? 1500;
  let detailsFetched = 0;

  for (const track of tracks) {
    console.log(`\n# ${track.track} 목표 개념 ${track.concepts.length} × ${PER_CONCEPT}`);
    const idSet = new Map(); // id -> list meta

    for (const q of track.queries) {
      const elo = q.elo || track.elo;
      for (let page = 0; page < LIST_PAGES; page++) {
        try {
          const url = listUrl({
            eloFrom: elo[0],
            eloTo: elo[1],
            genres: q.genres,
            resultNumber: LIST_PAGE,
            offset: page * LIST_PAGE,
            sort: page % 2 === 0 ? "desc" : "asc",
          });
          const list = await fetchJson(url, key);
          const arr = Array.isArray(list) ? list : [];
          let added = 0;
          for (const p of arr) {
            if (!p?.id) continue;
            if (!idSet.has(p.id)) added++;
            idSet.set(p.id, p);
          }
          console.log(
            `  list ${q.genres.join(",")} @${elo[0]}-${elo[1]} off${page * LIST_PAGE}: +${arr.length} new${added} (pool ${idSet.size})`,
          );
          await sleep(DELAY_MS);
          if (arr.length < LIST_PAGE) break;
        } catch (e) {
          console.warn(`  list fail: ${e.message}`);
          break;
        }
      }
    }

    const ids = [...idSet.keys()];
    const drafts = [];
    for (const id of ids) {
      if (args.dry) {
        detailsFetched++;
        continue;
      }
      const cachePath = join(RAW_DIR, `${id}.json`);
      let j;
      try {
        await access(cachePath);
        j = JSON.parse(await readFile(cachePath, "utf8"));
      } catch {
        if (detailsFetched >= detailBudget) continue;
        try {
          j = await fetchJson(`https://goproblems.com/api/v2/problems/${id}`, key);
          detailsFetched++;
          await writeFile(cachePath, JSON.stringify(j, null, 2));
          await sleep(DELAY_MS);
        } catch (e) {
          console.warn(`  detail ${id}: ${e.message}`);
          await sleep(DELAY_MS);
          continue;
        }
      }
      // elo 밴드로 난이도 맞춤 — 급수는 극단만 제외
      const kyu = kyuValue(j.rank);
      if (kyu != null && kyu > 0) {
        if (kyu > track.kyuMin + 8) continue;
        if (track.kyuMax > 1 && kyu < track.kyuMax - 6) continue;
      } else if (kyu != null && kyu < 0) {
        if (track.track === "seed" || track.track === "sprout") continue;
        if (track.track === "leaf" && kyu < -3) continue;
      }
      const d = detailToDraft(j);
      if (d) drafts.push(d);
      if (drafts.length % 25 === 0) console.log(`  drafts ${drafts.length} (fetched ${detailsFetched})`);
    }

    console.log(`  usable drafts: ${drafts.length}`);

    const buckets = assignConcepts(drafts, track.concepts, PER_CONCEPT);
    const concepts = [];
    for (let i = 0; i < track.concepts.length; i++) {
      const c = track.concepts[i];
      const picked = buckets[i];
      if (!picked.length) {
        console.warn(`  ! empty ${c.lessonId}`);
        continue;
      }
      concepts.push({
        lessonId: c.lessonId,
        title: c.title,
        subtitle: c.subtitle,
        vibe: c.vibe,
        chapterTitle: c.chapterTitle,
        boardSize: picked[0]?.size ?? 19,
        minutes: 6,
        problems: picked.map((d, i) => toProblem(c.lessonId, d, i)),
      });
      console.log(`  ✓ ${c.lessonId}: ${picked.length}`);
    }

    if (track.mergeHandcrafted) {
      try {
        const prev = JSON.parse(await readFile(join(OUT_DIR, "seed.json"), "utf8"));
        const hand = (prev.concepts || []).filter((c) => !String(c.lessonId).startsWith("seed-gp-"));
        const bank = {
          track: "seed",
          title: track.title,
          source: "handcrafted+goproblems.com",
          concepts: [...hand, ...concepts],
        };
        await writeFile(join(OUT_DIR, "seed.json"), JSON.stringify(bank, null, 2) + "\n");
        const n = bank.concepts.reduce((s, c) => s + c.problems.length, 0);
        console.log(`✓ seed merged: ${bank.concepts.length} concepts / ${n} problems`);
      } catch (e) {
        console.warn("seed merge failed, writing GP only", e.message);
        await writeFile(
          join(OUT_DIR, "seed.json"),
          JSON.stringify({ track: "seed", title: track.title, source: "goproblems.com", concepts }, null, 2) + "\n",
        );
      }
    } else {
      const bank = {
        track: track.track,
        title: track.title,
        source: "goproblems.com",
        concepts,
      };
      await writeFile(join(OUT_DIR, `${track.track}.json`), JSON.stringify(bank, null, 2) + "\n");
      const n = concepts.reduce((s, c) => s + c.problems.length, 0);
      console.log(`✓ ${track.track}: ${concepts.length} concepts / ${n} problems`);
    }
  }

  await updateIndex();
  console.log(`\n완료 · detail fetches(this run approx): ${detailsFetched}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
