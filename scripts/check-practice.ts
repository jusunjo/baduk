/**
 * 연습 뱅크 전 문항 합법수 검증
 *   npm run check:practice
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applySetup, playMove, resolveAnswer, isAnswer } from "../src/lib/board";
import type { PracticeBank } from "../src/data/practice/types";
import type { TrackId } from "../src/lib/ranks";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "../src/data/practice");
const TRACKS: TrackId[] = ["seed", "sprout", "leaf", "tree", "forest"];

let bad = 0;
for (const track of TRACKS) {
  const bank = JSON.parse(await readFile(join(DIR, `${track}.json`), "utf8")) as PracticeBank;
  for (const c of bank.concepts) {
    if (c.problems.length < 5) {
      console.log(`✗ ${c.lessonId}: only ${c.problems.length} problems`);
      bad++;
    }
    for (const p of c.problems) {
      const board = applySetup(p.size, p.setup);
      const playAs = p.playAs ?? "B";
      const resolved = resolveAnswer(p.answer, board);
      const candidates =
        resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
      const legal = candidates.filter((pt) => isAnswer(pt, resolved, board) && playMove(board, pt, playAs));
      if (!legal.length) {
        bad++;
        console.log(`✗ ${c.lessonId}/${p.id}: no legal answer — ${p.prompt}`);
      }
    }
  }
  console.log(`✓ ${track}: ${bank.concepts.length} concepts`);
}
console.log(bad ? `\n${bad} problem(s)` : "\nall practice answers playable");
process.exit(bad ? 1 : 0);
