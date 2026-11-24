import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CompanionArt } from "@/components/Companion";
import { askGemini } from "@/lib/gemini";
import { buildPageContext, pageMeta } from "@/lib/pageContext";
import { useProgress } from "@/lib/progress";
import { Spinner } from "./Screen";
import { Sheet } from "./Sheet";

export function PageAsk() {
  const { pathname } = useLocation();
  const p = useProgress();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const meta = useMemo(() => pageMeta(pathname), [pathname]);
  const track = p.rank?.track ?? "seed";
  const context = useMemo(
    () =>
      buildPageContext(pathname, {
        rank: p.rank,
        done: p.done,
        total: p.total,
        streakDays: p.streakDays,
        missionDoneToday: p.missionDoneToday,
        nextTitle: p.next?.title ?? null,
        curriculumTitle: p.curriculum?.title ?? null,
      }),
    [pathname, p.rank, p.done, p.total, p.streakDays, p.missionDoneToday, p.next?.title, p.curriculum?.title],
  );

  const lessonMode = pathname.startsWith("/learn/");
  const hasNav = pathname === "/" || pathname === "/learn" || pathname === "/path";

  const ask = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const text = await askGemini({ question: trimmed, pageContext: context, pageTitle: meta.title });
      setAnswer(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "잠시 후 다시 두어 볼까요?");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setAnswer(null);
    setError(null);
    setQuestion("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="한수 AI에게 묻기"
        className={`fixed right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#1a1f27] pl-1.5 pr-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(25,31,40,0.28)] transition active:scale-95 ${
          lessonMode
            ? "bottom-[calc(92px+env(safe-area-inset-bottom))]"
            : hasNav
              ? "bottom-[calc(12px+var(--nav-h,72px))]"
              : "bottom-[calc(88px+env(safe-area-inset-bottom))]"
        }`}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#f0d4a0] to-[#d4a66a]">
          <span className="h-3.5 w-3.5 rounded-full bg-[#1a1f27]" />
        </span>
        한수 AI
      </button>

      {open && (
        <Sheet title="한수 AI" onClose={close}>
          <div className="pb-2">
            <div className="flex max-h-[42dvh] items-start gap-3 overflow-y-auto rounded-[22px] bg-gradient-to-br from-[#f7efe2] to-toss-soft2 px-3.5 py-3.5">
              <CompanionArt track={track} stage={1} mood="intro" size={48} />
              <div className="min-w-0 flex-1 pt-0.5">
                {loading ? (
                  <p className="flex items-center gap-2 text-[15px] text-toss-mute">
                    <Spinner className="h-4 w-4" />
                    생각 중…
                  </p>
                ) : error ? (
                  <p className="break-keep text-[15px] font-medium leading-relaxed text-toss-orange">{error}</p>
                ) : answer ? (
                  <p className="whitespace-pre-wrap break-keep text-[15px] leading-relaxed text-toss-ink">{answer}</p>
                ) : (
                  <p className="break-keep text-[15px] leading-relaxed text-toss-ink">
                    궁금한 거 있으면 물어보세요. 같이 볼게요.
                  </p>
                )}
              </div>
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void ask();
              }}
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="궁금한 점을 적어 주세요"
                className="h-14 min-w-0 flex-1 rounded-2xl bg-toss-soft2 px-4 text-[15px] text-toss-ink outline-none ring-1 ring-toss-line placeholder:text-toss-mute focus:ring-toss-blue"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-toss-blue text-white transition hover:bg-toss-blue-hover active:scale-95 disabled:bg-toss-blue/40"
                aria-label="묻기"
              >
                {loading ? <Spinner className="h-5 w-5" /> : <SendIcon />}
              </button>
            </form>
          </div>
        </Sheet>
      )}
    </>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
