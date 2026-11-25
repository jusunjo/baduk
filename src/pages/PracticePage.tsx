import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "@/components/Board";
import { Reveal, Screen } from "@/components/Screen";
import { applySetup } from "@/lib/board";
import { listConcepts } from "@/lib/practice";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";

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
    <Screen nav gray title="문제">
      <Reveal className="px-1 pt-2">
        <div
          className="rounded-2xl px-4 py-4 text-white"
          style={{ backgroundColor: "#1CB0F6", boxShadow: "0 4px 0 #1899D6" }}
        >
          <p className="text-[13px] font-extrabold text-white/90">연습</p>
          <p className="mt-0.5 text-[20px] font-extrabold tracking-tight">개념별 문제 풀기</p>
          <p className="mt-1 text-[13px] font-bold text-white/90">
            개념 {concepts.length}개 · {totalProblems}문항
          </p>
        </div>
      </Reveal>

      {concepts.length === 0 ? (
        <Reveal order={1} className="mt-10 px-1 text-center">
          <p className="text-[18px] font-extrabold text-[#3C3C3C]">아직 연습 문제가 없어요</p>
          <p className="mt-2 break-keep text-[14px] font-semibold text-[#777777]">
            개념 레슨이 추가되면 여기에 모여요.
          </p>
        </Reveal>
      ) : (
        <div className="mt-5 space-y-6 pb-4">
          {byChapter.map(([chapter, list], ci) => (
            <Reveal key={chapter} order={Math.min(ci + 1, 5)} className="px-0.5">
              <p className="mb-2.5 px-1 text-[13px] font-extrabold uppercase tracking-wide text-[#AFAFAF]">
                {chapter}
              </p>
              <ul className="space-y-3">
                {list.map((c) => {
                  const preview = c.problems.find((x) => (x.setup?.length ?? 0) > 0) ?? c.problems[0];
                  const hasSetup = (preview?.setup?.length ?? 0) > 0;
                  return (
                    <li key={c.lessonId}>
                      <button
                        type="button"
                        onClick={() => {
                          sfx.play("tap");
                          navigate(`/practice/${c.lessonId}/${c.problems[0].problemId}`);
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left transition active:translate-y-[2px]"
                        style={{ boxShadow: "0 4px 0 #E5E5E5", border: "2px solid #E5E5E5" }}
                      >
                        {hasSetup && preview ? (
                          <div
                            className="w-[72px] shrink-0 overflow-hidden rounded-xl p-1.5"
                            style={{ background: "linear-gradient(160deg,#f0d4a0,#e8c48a)" }}
                          >
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
                          <span
                            className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-xl"
                            style={{ backgroundColor: "#E7F9D3", color: "#58CC02" }}
                          >
                            <span className="text-[20px] font-extrabold tabular-nums">{c.problems.length}</span>
                            <span className="text-[11px] font-extrabold">문항</span>
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-extrabold tracking-tight text-[#3C3C3C]">
                            {c.title}
                          </span>
                          <span className="mt-0.5 block break-keep text-[13px] font-semibold text-[#777777]">
                            {c.subtitle}
                          </span>
                          <span
                            className="mt-2 inline-flex items-center rounded-lg px-2 py-1 text-[12px] font-extrabold"
                            style={{ backgroundColor: "#DDF4FF", color: "#1CB0F6" }}
                          >
                            {c.problems.length}문항 · {c.boardSize}줄
                          </span>
                        </span>
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: "#58CC02", boxShadow: "0 3px 0 #46A302" }}
                          aria-hidden
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                            <path
                              d="M9 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
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
