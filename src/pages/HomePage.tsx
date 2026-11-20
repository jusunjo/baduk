import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "@/components/Board";
import { GoalSheet } from "@/components/GoalSheet";
import { RankButton, RankSheet } from "@/components/RankPicker";
import { Headline, PrimaryButton, Reveal, Screen } from "@/components/Screen";
import { Pill } from "@/components/ui";
import { applySetup } from "@/lib/board";
import { dDayLabel, formatDay } from "@/lib/date";
import { useProgress } from "@/lib/progress";

export function HomePage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [sheet, setSheet] = useState<"rank" | "goal" | null>(null);

  const focus = p.next ?? p.lessons[p.lessons.length - 1] ?? null;

  const chapterTitle = useMemo(() => {
    if (!p.curriculum || !focus) return null;
    return p.curriculum.chapters.find((c) => c.lessons.some((l) => l.id === focus.id))?.title ?? null;
  }, [p.curriculum, focus]);

  const preview = useMemo(() => {
    const size = (focus?.boardSize ?? p.rank?.boardSize ?? 5) as 5 | 7 | 9 | 13 | 19;
    if (!focus) return { size, board: applySetup(size) };
    const step = focus.steps[0];
    return {
      size: focus.boardSize,
      board: applySetup(focus.boardSize, step?.setup),
      highlights: step?.highlight,
    };
  }, [focus, p.rank?.boardSize]);

  if (!p.rank) return null;

  const introPhase = p.done === 0;
  const headline = introPhase
    ? "바둑,\n한 수부터 알아가요"
    : p.next
      ? `${p.next.vibe}\n이어서 둘까요?`
      : "이 판의 개념은\n다 익혔어요";

  return (
    <Screen nav right={<RankButton label={p.rank.short} onClick={() => setSheet("rank")} />}>
      <Reveal className="px-1 pt-1">
        <p className="text-[13px] font-semibold text-toss-mute">
          {p.rank.label} · {p.rank.boardSize}줄 판
        </p>
        <Headline>{headline}</Headline>
        {introPhase && (
          <p className="mt-2 break-keep text-[15px] leading-relaxed text-toss-body">
            판 위에 돌을 직접 놓으면서 규칙을 하나씩 알아가요.
          </p>
        )}
      </Reveal>

      {p.goal && p.target && (
        <Reveal order={1} className="mt-4 px-1">
          <button
            type="button"
            onClick={() => setSheet("goal")}
            className="flex w-full items-center gap-2 rounded-2xl bg-toss-soft2 px-3.5 py-2.5 text-left transition active:scale-[0.99]"
          >
            <Pill tone="bg-toss-blue text-white">{p.daysLeft == null ? "목표" : dDayLabel(p.daysLeft)}</Pill>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-toss-body">
              {p.target.label} · {formatDay(p.goal.date)}
            </span>
            <span className="text-[12px] font-semibold text-toss-mute">변경</span>
          </button>
        </Reveal>
      )}

      {focus && (
        <Reveal order={2} className="mt-5">
          <button
            type="button"
            onClick={() => navigate(`/learn/${focus.id}`)}
            className="w-full rounded-[28px] bg-gradient-to-b from-[#f7efe2] to-[#f2f4f6] p-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] transition active:scale-[0.99]"
          >
            <div className="mb-3 flex items-start justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#8a6a3d]">
                  {introPhase ? "첫 번째 한 수" : chapterTitle ?? "이어서"}
                </p>
                <p className="mt-0.5 text-[18px] font-bold tracking-tight text-toss-ink">{focus.title}</p>
                <p className="mt-0.5 break-keep text-[13px] text-toss-mute">{focus.subtitle}</p>
              </div>
              <span className="shrink-0 rounded-pill bg-white/80 px-2.5 py-1 text-[12px] font-semibold text-toss-body ring-1 ring-black/5">
                {focus.minutes}분 · {focus.boardSize}줄
              </span>
            </div>
            <Board
              size={preview.size}
              board={preview.board}
              highlights={preview.highlights}
              interactive={false}
              showSize={false}
              className="max-w-none"
            />
          </button>
          <div className="mt-4">
            <PrimaryButton onClick={() => navigate(`/learn/${p.next?.id ?? focus.id}`)}>
              {introPhase ? "바둑이 뭔지 알아보기" : p.next ? "이 한 수 보기" : "다시 복습하기"}
            </PrimaryButton>
          </div>
        </Reveal>
      )}

      {sheet === "rank" && <RankSheet current={p.rank.id} onClose={() => setSheet(null)} />}
      {sheet === "goal" && <GoalSheet currentRank={p.rank.id} current={p.goal} onClose={() => setSheet(null)} />}
    </Screen>
  );
}
