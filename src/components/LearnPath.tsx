import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRankModule, type PathItem } from "@/data/path";
import { RANKS } from "@/lib/ranks";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";

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
  const [open, setOpen] = useState<string | null>(null);
  const currentRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!currentRef.current) return;
    const t = window.setTimeout(() => {
      currentRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [p.nextId]);

  if (!p.rank || !p.course) return null;

  const stateOf = (key: string): NodeState => {
    if (p.completed[key]) return "done";
    if (key === p.nextId) return "current";
    return "locked";
  };

  const sections = buildSections(p);

  return (
    <div className="relative z-0 space-y-8 pb-[max(7rem,calc(var(--nav-h,72px)+3rem))] pt-1">
      {sections.map((sec) => {
        const playable = sec.nodes.filter((n) => n.kind === "mission" || n.kind === "exam");
        const anyCurrent = playable.some((n) => stateOf(n.key) === "current");
        const allDone = playable.every((n) => stateOf(n.key) === "done");
        return (
          <section key={sec.id}>
            <UnitBanner title={sec.title} tone={sec.tone} active={anyCurrent} done={allDone} />
            <ul className="relative mt-4 flex flex-col items-center gap-6">
              <PathTrail />
              {sec.nodes.map((node) => {
                if (node.kind === "chest") {
                  return (
                    <li key={node.key} className="relative z-[1]">
                      <ChestNode open={!!node.unitDone} />
                    </li>
                  );
                }
                if (node.kind === "promote") {
                  return (
                    <li key={node.key} className="relative z-[1]">
                      <PromoteNode
                        active={!!node.unitDone}
                        onStart={() => {
                          sfx.play("start");
                          actions.setCurrentRank("g30");
                        }}
                      />
                    </li>
                  );
                }
                const st = stateOf(node.key);
                const isOpen = open === node.key;
                return (
                  <li
                    key={node.key}
                    ref={st === "current" ? currentRef : undefined}
                    className="relative z-[1] flex w-full flex-col items-center"
                    style={{ scrollMarginTop: "140px" }}
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
                        onStart={() => {
                          sfx.play("start");
                          if (node.kind === "exam" && node.item?.kind === "rank-exam") {
                            navigate(`/exam/${node.item.module.rankId}`);
                          } else {
                            navigate(`/mission/${node.key}`);
                          }
                        }}
                        onClose={() => setOpen(null)}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function PathTrail() {
  return (
    <div
      className="pointer-events-none absolute inset-y-2 left-1/2 z-0 w-2.5 -translate-x-1/2 rounded-full opacity-40"
      style={{
        backgroundImage: "repeating-linear-gradient(to bottom, #D4D4D4 0 8px, transparent 8px 16px)",
      }}
      aria-hidden
    />
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
    sections.push(rankModuleSection(p.module, "green"));
  }

  // 현재 급수 이후는 잠긴 채로 세로로 이어서 보여 준다
  const myLevel = p.rank?.level ?? 0;
  const upcoming = RANKS.filter((r) => r.level > myLevel);
  upcoming.forEach((rank, i) => {
    const tone = tones[(sections.length + i) % tones.length]!;
    const mod = getRankModule(rank.id);
    if (mod) {
      const sec = rankModuleSection(mod, tone);
      sections.push({
        ...sec,
        id: `soon-${rank.id}`,
        nodes: sec.nodes.map((n) => ({ ...n, key: `soon:${rank.id}:${n.key}` })),
      });
      return;
    }
    sections.push({
      id: `soon-${rank.id}`,
      title: rank.label,
      tone,
      nodes: [
        { key: `soon:${rank.id}:a`, title: rank.label, kind: "mission" },
        { key: `soon:${rank.id}:b`, title: rank.label, kind: "mission" },
        { key: `soon:${rank.id}:chest`, title: "상자", kind: "chest", unitDone: false },
      ],
    });
  });

  return sections;
}

function rankModuleSection(mod: NonNullable<ReturnType<typeof getRankModule>>, tone: PathSection["tone"]): PathSection {
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
  return {
    id: `rank-${mod.rankId}`,
    title: mod.title,
    tone,
    nodes,
  };
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
  const palette =
    tone === "green"
      ? { bg: "#58CC02", deep: "#46A302" }
      : tone === "orange"
        ? { bg: "#FF9600", deep: "#E07E00" }
        : tone === "purple"
          ? { bg: "#CE82FF", deep: "#A568D0" }
          : { bg: "#1CB0F6", deep: "#1899D6" };

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-4 text-white"
      style={{
        background: palette.bg,
        boxShadow: `0 4px 0 ${palette.deep}`,
        opacity: !active && !done ? 0.55 : 1,
      }}
    >
      <div className="relative z-10 flex items-center justify-between gap-2">
        <p className="text-[16px] font-extrabold tracking-tight">{title}</p>
        {done ? <span className="shrink-0 text-[12px] font-bold text-white/95">완료</span> : null}
        {active && !done ? (
          <span className="shrink-0 rounded-pill bg-white/25 px-2 py-0.5 text-[11px] font-extrabold">지금</span>
        ) : null}
      </div>
      <span className="pointer-events-none absolute -right-3 -top-5 h-24 w-24 rounded-full bg-white/20" aria-hidden />
    </div>
  );
}

function StartTip() {
  return (
    <span className="mb-2 rounded-xl bg-[#58CC02] px-3.5 py-1.5 text-[13px] font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#46A302]">
      시작
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
      ? "bg-[#FFC800] shadow-[0_6px_0_#E29F03] active:translate-y-[3px] active:shadow-[0_3px_0_#E29F03]"
      : "bg-[#58CC02] shadow-[0_6px_0_#46A302] active:translate-y-[3px] active:shadow-[0_3px_0_#46A302]";

  return (
    <div className="relative">
      {current && (
        <span className="absolute -inset-[8px] rounded-full ring-[6px] ring-[#58CC02]/30 animate-breathe" aria-hidden />
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
  onStart,
  onClose,
}: {
  title: string;
  state: NodeState;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative mt-3 w-[min(100%,260px)] rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-2 ring-black/[0.04]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 text-[18px] leading-none text-duo-hare"
        aria-label="닫기"
      >
        ×
      </button>
      <p className="pr-6 text-[16px] font-extrabold text-duo-eel">{title}</p>
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

function ChestNode({ open }: { open: boolean }) {
  return (
    <div
      className={`flex h-[52px] w-[52px] items-center justify-center rounded-[16px] ${
        open ? "bg-[#FFC800] shadow-[0_5px_0_#E29F03]" : "bg-[#E5E5E5] shadow-[0_5px_0_#C9CED4]"
      }`}
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

function PromoteNode({ active, onStart }: { active: boolean; onStart: () => void }) {
  return (
    <div className="flex flex-col items-center">
      {active && <StartTip />}
      <button
        type="button"
        onClick={onStart}
        className="mt-1 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FF9600] shadow-[0_6px_0_#E07E00] transition active:translate-y-[3px] active:shadow-[0_3px_0_#E07E00]"
        aria-label="30급 시작"
      >
        <span className="text-[16px] font-extrabold text-white">30</span>
      </button>
    </div>
  );
}
