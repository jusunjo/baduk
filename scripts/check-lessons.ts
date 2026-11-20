import { CURRICULUM, type Lesson } from "../src/data/curriculum";
import { applySetup, emptyBoard, isAnswer, playMove, resolveAnswer, type Grid } from "../src/lib/board";

function entry(lesson: Lesson, idx: number, prev: Grid | null): Grid {
  const step = lesson.steps[idx];
  const size = step.size ?? lesson.boardSize;
  if (step.setup) return applySetup(size, step.setup);
  if (prev && prev.length === size) return prev;
  return emptyBoard(size);
}

let problems = 0;
for (const track of Object.values(CURRICULUM)) {
  for (const lesson of track.chapters.flatMap((c) => c.lessons)) {
    let board: Grid | null = null;
    lesson.steps.forEach((step, i) => {
      board = entry(lesson, i, board);
      for (const m of step.autoplay ?? []) board = playMove(board, m.at, m.color) ?? board;
      if (!step.answer) return;
      const resolved = resolveAnswer(step.answer, board);
      const candidates =
        resolved === "any"
          ? board.flatMap((row, y) => row.map((_, x) => ({ x, y })))
          : resolved;
      const legal = candidates.filter((p) => isAnswer(p, resolved, board!) && playMove(board!, p, step.playAs ?? "B"));
      if (!legal.length) {
        problems++;
        console.log(`✗ ${lesson.id} step ${i + 1}: no legal answer — ${step.text}`);
        return;
      }
      const before = board.flat().filter(Boolean).length;
      board = playMove(board, legal[0], step.playAs ?? "B")!;
      if (step.reply) {
        const answered = playMove(board, step.reply(legal[0]), step.playAs === "W" ? "B" : "W");
        if (!answered) {
          problems++;
          console.log(`✗ ${lesson.id} step ${i + 1}: reply is illegal`);
          return;
        }
        board = answered;
      }
      const after = board.flat().filter(Boolean).length;
      const captured = before + (step.reply ? 2 : 1) - after;
      console.log(`✓ ${lesson.id} step ${i + 1}: ${legal.length} answer(s)${captured ? `, captured ${captured}` : ""}`);
    });
  }
}
console.log(problems ? `\n${problems} problem(s)` : "\nall answer steps playable");
process.exit(problems ? 1 : 0);
