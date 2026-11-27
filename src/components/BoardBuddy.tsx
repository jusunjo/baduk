import { useEffect, useRef, useState } from "react";
import { HansuMascot } from "@/components/HansuMascot";
import { useHansuAsk } from "@/hooks/useHansuAsk";
import { Spinner } from "./Screen";

const IDLE_NUDGE_MS = 5000;
const NUDGE = "궁금한 거 물어봐요!";
const POS_KEY = "hansu/buddy-pos";
const SIZE = 56;
const DRAG_THRESHOLD = 8;

type Pos = { x: number; y: number };

function defaultPos(): Pos {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return {
    x: Math.max(8, window.innerWidth - SIZE - 16),
    y: Math.max(8, window.innerHeight - SIZE - 100),
  };
}

function loadPos(): Pos {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return defaultPos();
    const parsed = JSON.parse(raw) as Pos;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") return clamp(parsed);
  } catch {
    /* ignore */
  }
  return defaultPos();
}

function clamp(p: Pos): Pos {
  const maxX = Math.max(8, window.innerWidth - SIZE - 8);
  const maxY = Math.max(8, window.innerHeight - SIZE - 8);
  return {
    x: Math.min(maxX, Math.max(8, p.x)),
    y: Math.min(maxY, Math.max(8, p.y)),
  };
}

const DOCKED_SIZE = 40;

/**
 * 우하단 플로팅 한수 — 드래그로 위치 이동, 5초 무터치면 넛지.
 * docked: 문제 머리줄 오른쪽에 붙여 판·보기를 가리지 않아요 (말풍선은 아래로 열려요).
 */
export function BoardBuddy({ docked = false }: { docked?: boolean } = {}) {
  const h = useHansuAsk();
  const [draft, setDraft] = useState("");
  const [nudge, setNudge] = useState(false);
  const [pos, setPos] = useState<Pos>(() => defaultPos());
  const dragging = useRef(false);
  const moved = useRef(false);
  const origin = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    setPos(loadPos());
  }, []);

  useEffect(() => {
    const onResize = () => setPos((p) => clamp(p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
  const bubbleLeft = !docked && pos.x < window.innerWidth / 2;
  const popSide = docked ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]";

  const onPointerDown = (e: React.PointerEvent) => {
    if (docked) return;
    dragging.current = true;
    moved.current = false;
    origin.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) moved.current = true;
    if (!moved.current) return;
    setPos(clamp({ x: origin.current.px + dx, y: origin.current.py + dy }));
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (moved.current) {
      setPos((p) => {
        const next = clamp(p);
        localStorage.setItem(POS_KEY, JSON.stringify(next));
        return next;
      });
      return;
    }
    h.toggle();
  };

  return (
    <div
      className={docked ? "pointer-events-none relative z-40 shrink-0" : "pointer-events-none fixed z-40"}
      style={docked ? { width: DOCKED_SIZE } : { left: pos.x, top: pos.y, width: SIZE }}
    >
      <div className="relative flex flex-col items-center">
        {h.expanded && !h.loading && (
          <form
            className={`pointer-events-auto absolute ${popSide} flex w-[min(calc(100vw-2rem),280px)] gap-2 animate-rise-in ${
              bubbleLeft ? "left-0" : "right-0"
            }`}
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

        {showBubble && (
          <button
            type="button"
            onClick={() => {
              if (!h.loading) h.expand();
            }}
            className={`pointer-events-auto absolute ${popSide} animate-pop rounded-2xl bg-white px-3.5 py-2.5 text-left shadow-[0_6px_20px_rgba(92,61,30,0.12)] ring-1 ring-[#eadcc8] ${
              bubbleLeft ? "left-0" : "right-0"
            } ${
              isAnswer || h.error
                ? "buddy-scroll max-h-[min(40dvh,280px)] w-[min(calc(100vw-5.5rem),260px)] overflow-y-auto overflow-x-hidden"
                : "max-w-[200px]"
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
          </button>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClick={docked ? () => h.toggle() : undefined}
          className="pointer-events-auto touch-none shrink-0 drop-shadow-[0_8px_18px_rgba(92,61,30,0.18)] transition active:scale-95"
          aria-label={docked ? "한수에게 묻기" : "한수에게 묻기 · 길게 끌어 이동"}
        >
          <HansuMascot size={docked ? DOCKED_SIZE : SIZE} bounce={idle || nudge} />
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
