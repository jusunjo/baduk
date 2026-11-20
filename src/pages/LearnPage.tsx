import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Screen } from "@/components/Screen";
import type { Lesson } from "@/data/curriculum";
import { useProgress } from "@/lib/progress";
import { TRACKS } from "@/lib/ranks";

/** Horizontal offsets (px) that make the nodes snake down the screen. */
const ZIGZAG = [0, 44, 70, 44, 0, -44, -70, -44];

type NodeState = "done" | "current" | "locked";

export function LearnPage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [open, setOpen] = useState<string | null>(p.next?.id ?? null);
  if (!p.rank || !p.curriculum) return null;

  const nextIdx = p.next ? p.lessons.findIndex((l) => l.id === p.next!.id) : p.lessons.length;
  const stateOf = (lesson: Lesson): NodeState => {
    if (p.completed[lesson.id]) return "done";
    if (lesson.id === p.next?.id) return "current";
    return p.lessons.findIndex((l) => l.id === lesson.id) > nextIdx ? "locked" : "done";
  };
  const track = TRACKS[p.rank.track];

  let n = 0;
  return (
    <Screen nav gray>
      <div className="px-1 pt-1">
        <p className="text-[13px] font-semibold text-toss-mute">{track.label} · {p.rank.boardSize}줄 판</p>
        <p className="mt-1 text-[22px] font-bold tracking-tight text-toss-ink">
          {p.done}/{p.total} 레슨 완료
        </p>
      </div>

      <div className="mt-5 space-y-6 pb-10">
        {p.curriculum.chapters.map((ch, ci) => {
          const states = ch.lessons.map(stateOf);
          const chapterDone = states.every((s) => s === "done");
          const chapterNow = states.includes("current");
          return (
            <section key={ch.id}>
              <div
                className={`rounded-[22px] px-5 py-4 ${
                  chapterNow ? "bg-toss-blue text-white" : chapterDone ? "bg-white text-toss-ink" : "bg-white/60 text-toss-mute"
                }`}
              >
                <p className={`text-[12px] font-semibold ${chapterNow ? "text-white/75" : "text-toss-mute"}`}>
                  챕터 {ci + 1}
                  {chapterDone && " · 완료"}
                </p>
                <p className="mt-0.5 text-[18px] font-bold tracking-tight">{ch.title}</p>
                <p className={`mt-0.5 break-keep text-[13px] ${chapterNow ? "text-white/80" : "text-toss-mute"}`}>{ch.blurb}</p>
              </div>

              <div className="mt-6 flex flex-col items-center gap-5">
                {ch.lessons.map((lesson, li) => {
                  const state = states[li];
                  const x = ZIGZAG[n++ % ZIGZAG.length];
                  return (
                    <PathNode
                      key={lesson.id}
                      lesson={lesson}
                      state={state}
                      x={x}
                      open={open === lesson.id}
                      onToggle={() => setOpen(open === lesson.id ? null : lesson.id)}
                      onStart={() => navigate(`/learn/${lesson.id}`)}
                    />
                  );
                })}
                <Chest x={ZIGZAG[n++ % ZIGZAG.length]} done={chapterDone} />
              </div>
            </section>
          );
        })}
      </div>
    </Screen>
  );
}

function PathNode({
  lesson,
  state,
  x,
  open,
  onToggle,
  onStart,
}: {
  lesson: Lesson;
  state: NodeState;
  x: number;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  const locked = state === "locked";
  const face =
    state === "locked"
      ? "bg-[#E5E8EB] shadow-[0_6px_0_#C9CED4]"
      : "bg-toss-blue shadow-[0_6px_0_#1B64DA] active:translate-y-[4px] active:shadow-[0_2px_0_#1B64DA]";

  return (
    <div className={`relative flex flex-col items-center ${open ? "z-30" : ""}`} style={{ transform: `translateX(${x}px)` }}>
      {state === "current" && !open && (
        <span className="absolute -top-10 z-10 animate-pop whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-[13px] font-bold text-toss-blue shadow-[0_4px_12px_rgba(0,0,0,0.08)] ring-1 ring-toss-line">
          시작
          <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-toss-line bg-white" />
        </span>
      )}

      <div className="relative">
        {state === "current" && (
          <span className="absolute -inset-[7px] rounded-full ring-[5px] ring-toss-blue/20 animate-breathe" aria-hidden />
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={lesson.title}
          className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full transition ${face}`}
        >
          <NodeGlyph state={state} />
        </button>
      </div>

      {open && (
        <div
          style={{ marginLeft: -x * 0.7 }}
          className="absolute top-[84px] z-20 w-[248px] animate-pop rounded-[20px] bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
          <p className="text-[16px] font-bold text-toss-ink">{lesson.title}</p>
          <p className="mt-1 break-keep text-[13px] text-toss-mute">
            {locked ? "앞 레슨을 마치면 열려요" : `${lesson.subtitle} · ${lesson.minutes}분`}
          </p>
          {!locked && (
            <button
              type="button"
              onClick={onStart}
              className="mt-3 h-11 w-full rounded-xl bg-toss-blue text-[15px] font-semibold text-white transition active:scale-[0.98]"
            >
              {state === "done" ? "다시 하기" : "시작하기"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NodeGlyph({ state }: { state: NodeState }) {
  if (state === "done")
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <path d="m6 12.5 4 4L18 8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  const locked = state === "locked";
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <circle cx="9.5" cy="10" r="5.5" fill={locked ? "#B0B8C1" : "#191F28"} />
      <circle cx="15" cy="14.5" r="5.5" fill={locked ? "#D1D6DB" : "#fff"} />
    </svg>
  );
}

function Chest({ x, done }: { x: number; done: boolean }) {
  return (
    <div
      className={`flex h-[56px] w-[56px] items-center justify-center rounded-[18px] ${
        done ? "bg-toss-orange shadow-[0_5px_0_#d9771a]" : "bg-[#E5E8EB] shadow-[0_5px_0_#C9CED4]"
      }`}
      style={{ transform: `translateX(${x}px)` }}
      aria-label={done ? "챕터 완료" : "챕터를 마치면 열려요"}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5Z" fill={done ? "#fff" : "#B0B8C1"} />
        <rect x="10.5" y="13" width="3" height="4" fill={done ? "#fff" : "#B0B8C1"} />
        <rect x="7" y="17" width="10" height="3.5" rx="1.5" fill={done ? "#fff" : "#B0B8C1"} />
      </svg>
    </div>
  );
}
