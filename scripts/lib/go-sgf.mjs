/** SGF 파싱 + 최소 착수 검증 (fetch/compose 공용) */

export function sgfCoord(ch) {
  if (!ch || ch.length !== 2) return null;
  const x = ch.charCodeAt(0) - 97;
  const y = ch.charCodeAt(1) - 97;
  if (x < 0 || y < 0 || x > 24 || y > 24) return null;
  return { x, y };
}

/** 루트 AB/AW/SZ + 첫 수(들) */
export function parseSgf(sgf) {
  if (!sgf || typeof sgf !== "string") return null;
  const sizeM = sgf.match(/SZ\[(\d+)\]/);
  const size = sizeM ? Number(sizeM[1]) : 19;

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

  const seen = new Set();
  const answer = firstMoves.filter((p) => {
    const k = `${p.x},${p.y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // GoProblems: RIGHT 가 달린 변화의 첫 수를 정답으로 우선
  const rightAnswers = [];
  const varRe = /\(\s*;?\s*([BW])\[([a-z]{2})\]([\s\S]*?)(?=\(\s*;?\s*[BW]\[|\)$)/gi;
  // 루트 이후 최상위 변화들을 대략 훑음
  const body = sgf.replace(/^\(\s*;/, "");
  const chunks = body.split(/\n?\(/).slice(1);
  for (const chunk of chunks) {
    const m = chunk.match(/^\s*;?\s*([BW])\[([a-z]{2})\]/);
    if (!m) continue;
    if (!/RIGHT/i.test(chunk)) continue;
    if (m[1] !== (playAs === "B" ? "B" : "W") && firstColor && m[1] !== firstColor[1]) {
      /* still accept if RIGHT */
    }
    const p = sgfCoord(m[2]);
    if (p) rightAnswers.push(p);
  }
  // 보조: 문자열 전체에서 RIGHT 직전 수순의 첫 착점 패턴
  if (!rightAnswers.length) {
    for (const m of sgf.matchAll(/\(([;\s]*([BW])\[([a-z]{2})\])[\s\S]{0,800}?RIGHT/gi)) {
      if (m[2] === (firstColor ? firstColor[1] : "B")) {
        const p = sgfCoord(m[3]);
        if (p) rightAnswers.push(p);
      }
    }
  }

  const merged = [];
  const seenAns = new Set();
  for (const p of [...rightAnswers, ...answer]) {
    const k = `${p.x},${p.y}`;
    if (seenAns.has(k)) continue;
    seenAns.add(k);
    merged.push(p);
  }
  if (!merged.length) return null;

  const boardSize = [7, 9, 13, 19].includes(size) ? size : null;
  return {
    boardSize: boardSize ?? (size >= 19 ? 19 : size >= 13 ? 13 : size >= 9 ? 9 : 7),
    rawSize: size,
    setup,
    answer: merged.length === 1 ? merged[0] : merged,
    playAs,
    hasRight: rightAnswers.length > 0,
  };
}

function emptyBoard(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

function neighbors(size, p) {
  const out = [];
  if (p.x > 0) out.push({ x: p.x - 1, y: p.y });
  if (p.x < size - 1) out.push({ x: p.x + 1, y: p.y });
  if (p.y > 0) out.push({ x: p.x, y: p.y - 1 });
  if (p.y < size - 1) out.push({ x: p.x, y: p.y + 1 });
  return out;
}

function groupLibs(board, start) {
  const color = board[start.y][start.x];
  if (!color) return { stones: [], liberties: [] };
  const size = board.length;
  const seen = new Set();
  const lib = new Set();
  const stones = [];
  const stack = [start];
  seen.add(`${start.x},${start.y}`);
  while (stack.length) {
    const cur = stack.pop();
    stones.push(cur);
    for (const n of neighbors(size, cur)) {
      const c = board[n.y][n.x];
      if (!c) lib.add(`${n.x},${n.y}`);
      else if (c === color) {
        const k = `${n.x},${n.y}`;
        if (!seen.has(k)) {
          seen.add(k);
          stack.push(n);
        }
      }
    }
  }
  return {
    stones,
    liberties: [...lib].map((s) => {
      const [x, y] = s.split(",").map(Number);
      return { x, y };
    }),
  };
}

export function playMove(board, point, color) {
  if (board[point.y][point.x]) return null;
  const next = board.map((row) => row.slice());
  next[point.y][point.x] = color;
  const size = board.length;
  const opp = color === "B" ? "W" : "B";
  for (const n of neighbors(size, point)) {
    if (next[n.y][n.x] !== opp) continue;
    const g = groupLibs(next, n);
    if (g.liberties.length === 0) {
      for (const s of g.stones) next[s.y][s.x] = null;
    }
  }
  if (groupLibs(next, point).liberties.length === 0) return null;
  return next;
}

export function applySetup(size, setup = []) {
  const board = emptyBoard(size);
  for (const s of setup) {
    if (s.at.x >= 0 && s.at.y >= 0 && s.at.x < size && s.at.y < size) {
      board[s.at.y][s.at.x] = s.color;
    }
  }
  return board;
}

export function resolveAnswer(answer, board) {
  if (!answer) return [];
  if (answer === "any") return "any";
  if (Array.isArray(answer)) return answer;
  if (answer.libertiesOf) {
    const p = answer.libertiesOf;
    if (!board[p.y]?.[p.x]) return [];
    return groupLibs(board, p).liberties;
  }
  return [answer];
}

/** 정답 후보 중 합법수가 하나라도 있으면 OK */
export function hasLegalAnswer(problem) {
  const size = problem.size;
  const playAs = problem.playAs ?? "B";
  const board = applySetup(size, problem.setup ?? []);
  const resolved = resolveAnswer(problem.answer, board);
  const candidates =
    resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
  return candidates.some((p) => {
    if (p.x < 0 || p.y < 0 || p.x >= size || p.y >= size) return false;
    if (board[p.y][p.x]) return false;
    return !!playMove(board, p, playAs);
  });
}
