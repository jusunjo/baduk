/**
 * Read19 KataGo 프록시 — API 키를 브라우저에 노출하지 않음.
 * 실행: npm run katago  (기본 포트 8787)
 */
import http from "node:http";

const PORT = Number(process.env.KATAGO_PROXY_PORT || 8787);
const API_KEY = (process.env.READ19_API_KEY || "").trim();
const READ19 = "https://read19.com/v1/analyze";
const ALLOW_ORIGIN = process.env.KATAGO_CORS_ORIGIN || "http://localhost:43212";

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(json);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

/** 앱 moves → KataGo [["B","D4"], ...] */
function toKataMoves(moves) {
  if (!Array.isArray(moves)) return [];
  return moves.map((m) => {
    const color = m.color === "W" ? "W" : "B";
    if (m.pass) return [color, "pass"];
    if (typeof m.gtp === "string" && m.gtp) return [color, m.gtp];
    throw new Error("each move needs gtp or pass");
  });
}

function pickBestMove(payload) {
  // Read19: { results: [ KataGo analysis result, ... ], usage }
  const root = Array.isArray(payload?.results) ? payload.results[0] : payload;
  const moveInfos = root?.moveInfos ?? root?.move_infos ?? [];
  const rootInfo = root?.rootInfo ?? root?.root_info ?? {};
  const sorted = [...moveInfos].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  const top = sorted[0];
  const move = top?.move ?? "pass";
  return {
    move: typeof move === "string" ? move : "pass",
    winrate: typeof rootInfo.winrate === "number" ? rootInfo.winrate : null,
    scoreLead: typeof rootInfo.scoreLead === "number" ? rootInfo.scoreLead : null,
    visits: typeof rootInfo.visits === "number" ? rootInfo.visits : null,
    usageVisits: payload?.usage?.visits ?? null,
  };
}

async function analyze({ size, moves, maxVisits }) {
  if (!API_KEY) {
    const err = new Error("READ19_API_KEY missing in .env");
    err.status = 503;
    throw err;
  }
  const n = Number(size) || 9;
  const visits = Math.max(1, Math.min(1000, Number(maxVisits) || 50));
  const kataMoves = toKataMoves(moves);
  const query = {
    id: `hansu-${Date.now()}`,
    moves: kataMoves,
    boardXSize: n,
    boardYSize: n,
    // Read19 OpenAPI: japanese | chinese | aga | ... (korean 문자열 없음)
    rules: "japanese",
    komi: 6.5,
    maxVisits: visits,
    includeOwnership: false,
  };

  const res = await fetch(READ19, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const err = new Error(`Read19 non-JSON (${res.status}): ${text.slice(0, 200)}`);
    err.status = 502;
    throw err;
  }

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      (typeof data?.error === "string" ? data.error : null) ||
      data?.message ||
      text.slice(0, 300) ||
      res.statusText;
    const err = new Error(`Read19 ${res.status}: ${msg}`);
    err.status = res.status === 401 || res.status === 402 || res.status === 429 ? res.status : 502;
    throw err;
  }

  return pickBestMove(data);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/katago/health") {
    send(res, 200, { ok: true, hasKey: Boolean(API_KEY), port: PORT });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/katago/move") {
    try {
      const body = await readBody(req);
      const result = await analyze({
        size: body.size,
        moves: body.moves,
        maxVisits: body.maxVisits,
      });
      send(res, 200, result);
    } catch (e) {
      const status = e.status && Number.isFinite(e.status) ? e.status : 500;
      send(res, status, { error: e.message || "proxy error" });
    }
    return;
  }

  send(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`[katago-proxy] http://localhost:${PORT}`);
  console.log(`[katago-proxy] key: ${API_KEY ? "loaded" : "MISSING — set READ19_API_KEY in .env"}`);
});
