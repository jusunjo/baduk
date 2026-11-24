import { CURRICULUM, playableSteps, type Lesson, type LessonStep, type Problem } from "../src/data/curriculum";
import { applySetup, emptyBoard, isAnswer, playMove, resolveAnswer, type Grid } from "../src/lib/board";

function hasAnswer(step: LessonStep | Problem): step is (LessonStep | Problem) & { answer: NonNullable<LessonStep["answer"]> } {
  return "answer" in step && step.answer != null;
}

function entryFromSetup(boardSize: number, step: LessonStep | Problem, prev: Grid | null): Grid {
  const size = ("size" in step && step.size ? step.size : boardSize) as number;
  if (step.setup) return applySetup(size, step.setup);
  if (prev && prev.length === size) return prev;
  return emptyBoard(size);
}

let problems = 0;
for (const track of Object.values(CURRICULUM)) {
  for (const lesson of track.chapters.flatMap((c) => c.lessons) as Lesson[]) {
    let board: Grid | null = null;
    for (const { text, step, boardSize } of playableSteps(lesson)) {
      board = entryFromSetup(boardSize, step, board);
      for (const m of ("autoplay" in step ? step.autoplay : undefined) ?? []) {
        board = playMove(board, m.at, m.color) ?? board;
      }
      if (!hasAnswer(step)) continue;
      const resolved = resolveAnswer(step.answer, board);
      const candidates =
        resolved === "any" ? board.flatMap((row, y) => row.map((_, x) => ({ x, y }))) : resolved;
      const legal = candidates.filter((p) => isAnswer(p, resolved, board!) && playMove(board!, p, step.playAs ?? "B"));
      if (!legal.length) {
        problems++;
        console.log(`✗ ${lesson.id}: no legal answer — ${text}`);
        continue;
      }
      const before = board.flat().filter(Boolean).length;
      board = playMove(board, legal[0], step.playAs ?? "B")!;
      if ("reply" in step && step.reply) {
        const answered = playMove(board, step.reply(legal[0]), step.playAs === "W" ? "B" : "W");
        if (!answered) {
          problems++;
          console.log(`✗ ${lesson.id}: reply is illegal — ${text}`);
          continue;
        }
        board = answered;
      }
      const after = board.flat().filter(Boolean).length;
      const captured = before + ("reply" in step && step.reply ? 2 : 1) - after;
      console.log(`✓ ${lesson.id}: ${legal.length} answer(s)${captured ? `, captured ${captured}` : ""} — ${text.slice(0, 40)}`);
    }
  }
}
console.log(problems ? `\n${problems} problem(s)` : "\nall answer steps playable");
process.exit(problems ? 1 : 0);
