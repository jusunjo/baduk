import { useEffect, useState } from "react";
import { HansuMascot } from "@/components/HansuMascot";
import { useHansuAsk } from "@/hooks/useHansuAsk";
import { Spinner } from "./Screen";

const IDLE_NUDGE_MS = 5000;
const NUDGE = "궁금한 거 물어봐요!";

/** 우하단 플로팅 한수 — 5초 무터치면 넛지 말풍선, AI 답은 전부 표시 */
export function BoardBuddy() {
  const h = useHansuAsk();
  const [draft, setDraft] = useState("");
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    if (!h.expanded) setDraft("");
  }, [h.expanded]);

  useEffect(() => {
    if (!h.onBoard) return;
    if (h.expanded || h.loading || h.answer || h.error) {
      setNudge(false);
      return;
    }

    let timer = 0;
    const arm = () => {
      setNudge(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setNudge(true), IDLE_NUDGE_MS);
    };

    arm();
    const opts: AddEventListenerOptions = { capture: true };
    window.addEventListener("pointerdown", arm, opts);
    window.addEventListener("keydown", arm, opts);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", arm, opts);
      window.removeEventListener("keydown", arm, opts);
    };
  }, [h.onBoard, h.expanded, h.loading, h.answer, h.error]);

  if (!h.onBoard) return null;

  const content = h.bubbleText;
  const showBubble = !!content || nudge;
  const bubbleLabel = content ?? NUDGE;
  const idle = !h.loading && !h.error && !h.answer && !h.expanded;
  const isAnswer = !!h.answer && !h.loading;

  return (
    <div className="pointer-events-none fixed right-4 z-40 bottom-[calc(88px+env(safe-area-inset-bottom))] flex flex-col items-end gap-2">
      {h.expanded && !h.loading && (
        <form
          className="pointer-events-auto flex w-[min(calc(100vw-2rem),300px)] gap-2 animate-rise-in"
          onSubmit={(e) => {
            e.preventDefault();
            void h.ask(draft);
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="한수에게 묻기"
            className="h-11 min-w-0 flex-1 rounded-full bg-white px-4 text-[14px] text-toss-ink outline-none ring-1 ring-[#eadcc8] placeholder:text-toss-mute focus:ring-toss-blue"
            disabled={h.loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={h.loading || !draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1a1f27] text-white transition active:scale-95 disabled:opacity-40"
            aria-label="보내기"
          >
            {h.loading ? <Spinner className="h-4 w-4" /> : <SendIcon />}
          </button>
        </form>
      )}

      <div className="pointer-events-auto flex items-end gap-2">
        {showBubble && (
          <button
            type="button"
            onClick={() => {
              if (!h.loading) h.expand();
            }}
            className={`relative mb-3 animate-pop rounded-2xl bg-white px-3.5 py-2.5 text-left shadow-[0_6px_20px_rgba(92,61,30,0.12)] ring-1 ring-[#eadcc8] ${
              isAnswer || h.error
                ? "buddy-scroll max-h-[min(40dvh,280px)] w-[min(calc(100vw-5.5rem),280px)] overflow-y-auto overflow-x-hidden"
                : "max-w-[220px]"
            }`}
            aria-label="한수에게 묻기"
          >
            <p
              key={String(bubbleLabel).slice(0, 24)}
              className={`whitespace-pre-wrap break-keep text-[13px] font-semibold leading-snug tracking-tight ${
                h.error ? "text-toss-orange" : h.loading ? "text-toss-mute" : "text-toss-ink"
              }`}
            >
              {h.loading ? (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Spinner className="h-3 w-3" />
                  …
                </span>
              ) : (
                bubbleLabel
              )}
            </p>
            {h.showedBoard && !h.expanded && h.answer && (
              <p className="mt-1.5 text-[11px] font-semibold text-toss-blue">판에도 표시</p>
            )}
            <span
              className="absolute -right-1 bottom-3 h-2.5 w-2.5 rotate-45 bg-white ring-1 ring-[#eadcc8]"
              aria-hidden
            />
            <span className="absolute -right-0.5 bottom-3 h-2.5 w-2.5 rotate-45 bg-white" aria-hidden />
          </button>
        )}

        <button
          type="button"
          onClick={() => h.toggle()}
          className="shrink-0 drop-shadow-[0_8px_18px_rgba(92,61,30,0.18)] transition active:scale-95"
          aria-label="한수에게 묻기"
        >
          <HansuMascot size={56} bounce={idle || nudge} />
        </button>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
