import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "@/components/Board";
import { Headline, Reveal, Screen } from "@/components/Screen";
import { applySetup } from "@/lib/board";
import { listConcepts } from "@/lib/practice";
import { useProgress } from "@/lib/progress";

export function PracticePage() {
  const navigate = useNavigate();
  const p = useProgress();
  const concepts = useMemo(() => (p.rank ? listConcepts(p.rank.track) : []), [p.rank]);

  if (!p.rank) return null;

  const byChapter = useMemo(() => {
    const map = new Map<string, typeof concepts>();
    for (const c of concepts) {
      const list = map.get(c.chapterTitle) ?? [];
      list.push(c);
      map.set(c.chapterTitle, list);
    }
    return [...map.entries()];
  }, [concepts]);

  const totalProblems = concepts.reduce((n, c) => n + c.problems.length, 0);

  return (
    <Screen nav>
      <Reveal className="px-1 pt-1">
        <Headline>문제 풀이</Headline>
        <p className="mt-2 break-keep text-[15px] leading-relaxed text-toss-body">
          개념을 고르면 그 개념의 문제만 이어서 풀어요.
        </p>
        <p className="mt-2 text-[13px] font-semibold text-toss-mute">
          개념 {concepts.length}개 · 문제 {totalProblems}문항
        </p>
      </Reveal>

      {concepts.length === 0 ? (
        <Reveal order={1} className="mt-10 px-1 text-center">
          <p className="text-[16px] font-bold text-toss-ink">아직 연습 문제가 없어요</p>
          <p className="mt-2 break-keep text-[14px] text-toss-mute">개념 레슨이 추가되면 여기에 모여요.</p>
        </Reveal>
      ) : (
        <div className="mt-6 space-y-7">
          {byChapter.map(([chapter, list], ci) => (
            <Reveal key={chapter} order={Math.min(ci + 1, 5)} className="px-1">
              <p className="text-[12px] font-semibold text-toss-mute">{chapter}</p>
              <ul className="mt-2.5 space-y-2">
                {list.map((c) => {
                  const preview = c.problems.find((x) => (x.setup?.length ?? 0) > 0) ?? c.problems[0];
                  const hasSetup = (preview?.setup?.length ?? 0) > 0;
                  return (
                    <li key={c.lessonId}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/practice/${c.lessonId}/${c.problems[0].problemId}`)
                        }
                        className="flex w-full items-center gap-3 rounded-[22px] bg-white p-3.5 text-left ring-1 ring-toss-line transition active:scale-[0.99]"
                      >
                        {hasSetup && preview ? (
                          <div className="w-[76px] shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#f7efe2] to-[#f2f4f6] p-1.5">
                            <Board
                              size={preview.size}
                              board={applySetup(preview.size, preview.setup)}
                              highlights={preview.highlight}
                              interactive={false}
                              showSize={false}
                              className="max-w-none"
                            />
                          </div>
                        ) : (
                          <span className="flex h-[76px] w-[76px] shrink-0 flex-col items-center justify-center rounded-xl bg-toss-soft2">
                            <span className="text-[18px] font-bold tabular-nums text-toss-ink">{c.problems.length}</span>
                            <span className="text-[11px] font-semibold text-toss-mute">문항</span>
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-bold tracking-tight text-toss-ink">{c.title}</span>
                          <span className="mt-0.5 block break-keep text-[13px] text-toss-mute">{c.subtitle}</span>
                          <span className="mt-2 block text-[12px] font-semibold text-toss-blue">
                            {c.problems.length}문항 · {c.boardSize}줄 · 풀어 보기
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      )}
    </Screen>
  );
}
