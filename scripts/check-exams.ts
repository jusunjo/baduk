import { examProblems, type ExamRankId } from "../src/data/exams/banks";
import { applySetup, isAnswer, playMove, resolveAnswer } from "../src/lib/board";

const ranks: ExamRankId[] = ["g30", "g25", "g20", "g15", "g10", "g7", "g5", "g3", "g1"];

let bad = 0;
for (const rank of ranks) {
  for (const p of examProblems(rank)) {
    const board = applySetup(p.size, p.setup);
    const resolved = resolveAnswer(p.answer, board);
    const candidates =
      resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
    const legal = candidates.filter((pt) => isAnswer(pt, resolved, board) && playMove(board, pt, p.playAs));
    if (!legal.length) {
      bad++;
      console.log(`✗ ${p.id}: no legal answer — ${p.prompt}`);
    } else {
      console.log(`✓ ${p.id}: ${legal.length} answer(s)`);
    }
  }
}
console.log(bad ? `\n${bad} problem(s)` : "\nall exam answers playable");
process.exit(bad ? 1 : 0);
