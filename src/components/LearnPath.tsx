import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PathItem } from "@/data/path/types";
import { isUnlocked, useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";

/** Duolingo-style horizontal snake offsets (px) */
const ZIGZAG = [0, 52, 78, 52, 0, -52, -78, -52];

type NodeState = "done" | "current" | "locked";

type PathNode = {
  key: string;
  title: string;
  kind: "mission" | "exam" | "chest" | "promote";
  item?: PathItem;
  unitDone?: boolean;
};

type PathSection = {
  id: string;
  title: string;
  tone: "blue" | "green" | "orange" | "purple";
  nodes: PathNode[];
};

export function LearnPath() {
  const navigate = useNavigate();
  const p = useProgress();
  const [open, setOpen] = useState<string | null>(p.nextId);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!currentRef.current) return;
    const t = window.setTimeout(() => {
      currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [p.nextId]);

  if (!p.rank || !p.course) return null;

  const stateOf = (key: string): NodeState => {
    if (p.completed[key]) return "done";
    if (key === p.nextId) return "current";
    if (!isUnlocked(p.completed, p.queue, key)) return "locked";
    return "locked";
  };

  const sections = buildSections(p);
  let zig = 0;

  return (
    <div className="relative pb-10">
      {sections.map((sec, si) => {
        const playable = sec.nodes.filter((n) => n.kind === "mission" || n.kind === "exam");
        const anyCurrent = playable.some((n) => stateOf(n.key) === "current");
        const allDone = playable.every((n) => stateOf(n.key) === "done");
        return (
          <section key={sec.id} className="mb-1">
            <UnitBanner title={sec.title} tone={sec.tone} active={anyCurrent} done={allDone} />
            <div className="relative flex flex-col items-center gap-8 py-7">
              <PathTrail />
              {si % 2 === 1 ? <SideDecor side="left" /> : <SideDecor side="right" />}
              {sec.nodes.map((node) => {
                const x = ZIGZAG[zig++ % ZIGZAG.length]!;
                if (node.kind === "chest") {
                  return <ChestNode key={node.key} x={x} open={!!node.unitDone} />;
                }
                if (node.kind === "promote") {
                  return (
                    <PromoteNode
                      key={node.key}
                      x={x}
                      active={!!node.unitDone}
                      onStart={() => {
                        sfx.play("start");
                        actions.setCurrentRank("g30");
                      }}
                    />
                  );
                }
                const st = stateOf(node.key);
                const isOpen = open === node.key;
                return (
                  <div
                    key={node.key}
                    ref={st === "current" ? currentRef : undefined}
                    className={`relative flex flex-col items-center ${isOpen ? "z-30" : "z-10"}`}
                    style={{ transform: `translateX(${x}px)` }}
                  >
                    {st === "current" && !isOpen && <StartTip />}
                    <PathCircle
                      state={st}
                      kind={node.kind}
                      onClick={() => {
                        if (st === "locked") {
                          sfx.play("wrong");
                          return;
                        }
                        sfx.play("tap");
                        setOpen(isOpen ? null : node.key);
                      }}
                    />
                    {isOpen && st !== "locked" && (
                      <NodePopover
                        title={node.title}
                        state={st}
                        offset={-x * 0.65}
                        onStart={() => {
                          sfx.play("start");
                          if (node.kind === "exam" && node.item?.kind === "rank-exam") {
                            navigate(`/exam/${node.item.module.rankId}`);
                          } else {
                            navigate(`/mission/${node.key}`);
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function PathTrail() {
  return (
    <div
      className="pointer-events-none absolute inset-y-8 left-1/2 w-3 -translate-x-1/2 rounded-full opacity-40"
      style={{
        backgroundImage: "repeating-linear-gradient(to bottom, #CECECE 0 10px, transparent 10px 18px)",
      }}
      aria-hidden
    />
  );
}

function SideDecor({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`pointer-events-none absolute top-16 ${side === "left" ? "left-2" : "right-2"} opacity-90`}
      aria-hidden
    >
      <svg width="56" height="64" viewBox="0 0 56 64" fill="none">
        <ellipse cx="28" cy="48" rx="18" ry="8" fill="#89E219" opacity="0.55" />
        <circle cx="20" cy="34" r="12" fill="#58CC02" />
        <circle cx="34" cy="30" r="14" fill="#7AC70C" />
        <circle cx="28" cy="22" r="10" fill="#58CC02" />
      </svg>
    </div>
  );
}

function buildSections(p: ReturnType<typeof useProgress>): PathSection[] {
  const sections: PathSection[] = [];
  const tones: PathSection["tone"][] = ["blue", "green", "orange", "purple"];

  p.course!.units.forEach((unit, ui) => {
    const nodes: PathNode[] = unit.lessons.map((lesson) => ({
      key: lesson.id,
      title: lesson.title,
      kind: "mission" as const,
      item: { kind: "course-lesson" as const, unitId: unit.id, lesson },
    }));
    const unitDone = unit.lessons.every((l) => p.completed[l.id]);
    nodes.push({ key: `chest:${unit.id}`, title: "상자", kind: "chest", unitDone });
    sections.push({
      id: unit.id,
      title: unit.title,
      tone: tones[ui % tones.length]!,
      nodes,
    });
  });

  if (p.rank?.id === "beginner" && p.courseComplete) {
    sections.push({
      id: "promote-g30",
      title: "다음 급수",
      tone: "orange",
      nodes: [{ key: "promote:g30", title: "30급 시작", kind: "promote", unitDone: true }],
    });
  }

  if (p.module) {
    const mod = p.module;
    const nodes: PathNode[] = [
      {
        key: mod.intro.id,
        title: mod.intro.title,
        kind: "mission",
        item: { kind: "rank-intro", module: mod },
      },
      ...mod.parts.map((part) => ({
        key: part.id,
        title: part.title.replace(/^Part\s*\d+\s*·\s*/, ""),
        kind: "mission" as const,
        item: { kind: "rank-part" as const, module: mod, part },
      })),
    ];
    if (mod.exam) {
      nodes.push({
        key: `exam:${mod.rankId}`,
        title: "승급 시험",
        kind: "exam",
        item: { kind: "rank-exam", module: mod },
      });
    }
    sections.push({
      id: `rank-${mod.rankId}`,
      title: mod.title,
      tone: "green",
      nodes,
    });
  }

  return sections;
}

function UnitBanner({
  title,
  tone,
  active,
  done,
}: {
  title: string;
  tone: PathSection["tone"];
  active: boolean;
  done: boolean;
}) {
  const bg =
    tone === "green"
      ? "bg-[#58CC02]"
      : tone === "orange"
        ? "bg-[#FF9600]"
        : tone === "purple"
          ? "bg-[#CE82FF]"
          : "bg-duo-blue";
  const deep =
    tone === "green"
      ? "#46A302"
      : tone === "orange"
        ? "#E07E00"
        : tone === "purple"
          ? "#A568D0"
          : "#1899D6";
  return (
    <div
      className={`relative mx-1 overflow-hidden rounded-2xl px-4 py-3.5 text-white ${bg} ${
        !active && !done ? "opacity-75" : ""
      }`}
      style={{ boxShadow: `0 4px 0 ${deep}` }}
    >
      <p className="relative z-10 text-[17px] font-extrabold tracking-tight">{title}</p>
      {done ? <span className="relative z-10 text-[12px] font-bold text-white/90">완료</span> : null}
      <span className="pointer-events-none absolute -right-2 -top-4 h-20 w-20 rounded-full bg-white/15" aria-hidden />
      <span className="pointer-events-none absolute -bottom-6 right-10 h-16 w-16 rounded-full bg-white/10" aria-hidden />
    </div>
  );
}

function StartTip() {
  return (
    <span className="absolute -top-9 z-20 animate-pop whitespace-nowrap rounded-xl bg-[#58CC02] px-3 py-1 text-[13px] font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#46A302]">
      시작
      <span className="absolute -bottom-[5px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#58CC02]" />
    </span>
  );
}

function PathCircle({
  state,
  kind,
  onClick,
}: {
  state: NodeState;
  kind: PathNode["kind"];
  onClick: () => void;
}) {
  const locked = state === "locked";
  const current = state === "current";
  const face = locked
    ? "bg-[#E5E5E5] shadow-[0_6px_0_#C9CED4]"
    : kind === "exam"
      ? "bg-[#FFC800] shadow-[0_6px_0_#E29F03] active:translate-y-[4px] active:shadow-[0_2px_0_#E29F03]"
      : "bg-[#58CC02] shadow-[0_6px_0_#46A302] active:translate-y-[4px] active:shadow-[0_2px_0_#46A302]";

  return (
    <div className="relative">
      {current && (
        <span className="absolute -inset-[8px] rounded-full ring-[6px] ring-[#58CC02]/25 animate-breathe" aria-hidden />
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={locked ? "잠김" : kind === "exam" ? "시험" : "미션"}
        className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition ${face}`}
      >
        <NodeGlyph state={state} kind={kind} />
      </button>
    </div>
  );
}

function NodeGlyph({ state, kind }: { state: NodeState; kind: PathNode["kind"] }) {
  if (state === "done") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9" aria-hidden>
        <path d="m6 12.5 4 4L18 8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (state === "locked") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <rect x="6" y="10" width="12" height="9" rx="2" fill="#AFAFAF" />
        <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" stroke="#AFAFAF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "exam") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5Z" fill="#fff" />
        <rect x="10.5" y="13" width="3" height="4" fill="#fff" />
        <rect x="7" y="17" width="10" height="3.5" rx="1.5" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
      <circle cx="9.5" cy="10" r="5.5" fill="#191F28" />
      <circle cx="15" cy="14.5" r="5.5" fill="#fff" />
    </svg>
  );
}

function NodePopover({
  title,
  state,
  offset,
  onStart,
}: {
  title: string;
  state: NodeState;
  offset: number;
  onStart: () => void;
}) {
  return (
    <div
      style={{ marginLeft: offset }}
      className="absolute top-[88px] z-20 w-[220px] animate-pop rounded-[20px] bg-white p-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
    >
      <p className="truncate text-[16px] font-extrabold text-toss-ink">{title}</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-[#58CC02] text-[16px] font-extrabold text-white shadow-[0_4px_0_#46A302] transition active:translate-y-[3px] active:shadow-[0_1px_0_#46A302]"
      >
        {state === "done" ? "다시" : "시작"}
      </button>
    </div>
  );
}

function ChestNode({ x, open }: { x: number; open: boolean }) {
  return (
    <div
      className={`flex h-[56px] w-[56px] items-center justify-center rounded-[18px] ${
        open ? "bg-[#FFC800] shadow-[0_5px_0_#E29F03]" : "bg-[#E5E5E5] shadow-[0_5px_0_#C9CED4]"
      }`}
      style={{ transform: `translateX(${x}px)` }}
      aria-label={open ? "유닛 완료" : "유닛을 마치면 열려요"}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5Z" fill={open ? "#fff" : "#B0B8C1"} />
        <rect x="10.5" y="13" width="3" height="4" fill={open ? "#fff" : "#B0B8C1"} />
        <rect x="7" y="17" width="10" height="3.5" rx="1.5" fill={open ? "#fff" : "#B0B8C1"} />
      </svg>
    </div>
  );
}

function PromoteNode({ x, active, onStart }: { x: number; active: boolean; onStart: () => void }) {
  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${x}px)` }}>
      {active && <StartTip />}
      <button
        type="button"
        onClick={onStart}
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF9600] shadow-[0_6px_0_#E07E00] transition active:translate-y-[4px] active:shadow-[0_2px_0_#E07E00]"
        aria-label="30급 시작"
      >
        <span className="text-[15px] font-extrabold text-white">30</span>
      </button>
    </div>
  );
}
