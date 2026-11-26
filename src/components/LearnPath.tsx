import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRankModule, type PathItem, type RankModule, type RankStageKind } from "@/data/path";
import { RANK_CATALOG } from "@/data/path/rankUnits";
import { buildPartStages } from "@/data/path/stages";
import { RANKS } from "@/lib/ranks";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";

type NodeState = "done" | "current" | "locked";

type PathNode = {
  key: string;
  title: string;
  kind: "mission" | "drill" | "situation" | "test" | "exam" | "chest" | "promote";
  item?: PathItem;
  unitDone?: boolean;
};

function stageNodeKind(kind: RankStageKind): PathNode["kind"] {
  if (kind === "learn") return "mission";
  return kind;
}

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

  /** 듀오식 S커브 — transform 없이 margin으로 이동 (sticky 스택 꼬임 방지) */
  let zigIndex = 0;

  return (
    <div className="relative z-0 space-y-8 pb-[max(7rem,calc(var(--nav-h,72px)+3rem))] pt-1">
      {sections.map((sec) => {
        const playable = sec.nodes.filter((n) => n.kind === "mission" || n.kind === "exam");
        const anyCurrent = playable.some((n) => stateOf(n.key) === "current");
        const allDone = playable.every((n) => stateOf(n.key) === "done");
        const sectionStart = zigIndex;
        const xs = sec.nodes.map((_, i) => zigX(sectionStart + i));
        zigIndex += sec.nodes.length;

        return (
          <section key={sec.id}>
            <UnitBanner title={sec.title} tone={sec.tone} active={anyCurrent} done={allDone} />
            <ul className="relative mt-4 flex flex-col items-center gap-7">
              <PathTrail xs={xs} />
              {sec.nodes.map((node, ni) => {
                const x = xs[ni]!;
                if (node.kind === "chest") {
                  return (
                    <li key={node.key} className="relative z-[1] flex w-full justify-center">
                      <div style={{ marginLeft: x }}>
                        <ChestNode open={!!node.unitDone} />
                      </div>
                    </li>
                  );
                }
                if (node.kind === "promote") {
                  return (
                    <li key={node.key} className="relative z-[1] flex w-full justify-center">
                      <div style={{ marginLeft: x }}>
                        <PromoteNode
                          active={!!node.unitDone}
                          onStart={() => {
                            sfx.play("start");
                            actions.setCurrentRank("g30");
                          }}
                        />
                      </div>
                    </li>
                  );
                }
                const st = stateOf(node.key);
                const isOpen = open === node.key;
                return (
                  <li
                    key={node.key}
                    ref={st === "current" ? currentRef : undefined}
                    className={`relative flex w-full justify-center ${isOpen ? "z-30" : "z-[1]"}`}
                    style={{ scrollMarginTop: "140px" }}
                  >
                    <div className="relative flex flex-col items-center" style={{ marginLeft: x }}>
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
                    </div>
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

/** 듀오 패스: 가운데 → 왼쪽 → 가운데 → 오른쪽 … */
const ZIG_STEPS = [0, -1, 0, 1, 0, -1, 0, 1] as const;
const ZIG_AMP = 58;

function zigX(i: number): number {
  return ZIG_STEPS[i % ZIG_STEPS.length]! * ZIG_AMP;
}

function PathTrail({ xs }: { xs: number[] }) {
  if (xs.length < 2) return null;
  const h = Math.max(1, (xs.length - 1) * 100);
  const mid = 50;
  const pts = xs
    .map((x, i) => {
      const px = mid + (x / ZIG_AMP) * 18;
      const py = xs.length === 1 ? 0 : (i / (xs.length - 1)) * h;
      return `${px.toFixed(2)},${py.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-2 z-0 h-[calc(100%-16px)] w-full opacity-55"
      viewBox={`0 0 100 ${h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={pts}
        fill="none"
        stroke="#37464F"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="0 11"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function buildSections(p: ReturnType<typeof useProgress>): PathSection[] {
  const sections: PathSection[] = [];
  const tones: PathSection["tone"][] = ["blue", "green", "orange", "purple"];

  // 규칙 입문 코스 = 30급 세션의 앞부분
  const onG30Track = !p.rank || p.rank.id === "beginner" || p.rank.id === "g30";

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
      title: onG30Track ? `30급 · ${unit.title}` : unit.title,
      tone: tones[ui % tones.length]!,
      nodes,
    });
  });

  // 현재 급수 본편 — 같은 급 대단원은 한 섹션에 묶고, 급수끼리만 분리
  const currentMod = onG30Track ? getRankModule("g30") : p.module;
  if (currentMod) {
    sections.push(...rankModuleSections(currentMod, "green", p.completed));
  }

  // 현재보다 높은 급수 미리보기 (급수 단위로 묶음)
  const myLevel = p.rank?.id === "beginner" ? 1 : (p.rank?.level ?? 0);
  const upcoming = RANKS.filter((r) => r.level > myLevel && r.id !== "beginner");
  upcoming.forEach((rank, i) => {
    const tone = tones[(sections.length + i) % tones.length]!;
    const mod = getRankModule(rank.id);
    if (mod) {
      for (const sec of rankModuleSections(mod, tone, p.completed)) {
        sections.push({
          ...sec,
          id: `soon-${rank.id}-${sec.id}`,
          nodes: sec.nodes.map((n) => ({ ...n, key: `soon:${rank.id}:${n.key}` })),
        });
      }
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

/**
 * 급수 모듈 → 대단원별 섹션.
 * 각 섹션: (첫 파트에 intro) + 학습·반복·실전·테스트 + (마지막에 승급 시험)
 */
function rankModuleSections(
  mod: RankModule,
  tone: PathSection["tone"],
  completed: Record<string, number>,
): PathSection[] {
  const cat = RANK_CATALOG[mod.rankId];
  const parts = mod.parts;
  if (!parts.length) {
    return [
      {
        id: `rank-${mod.rankId}`,
        title: mod.title,
        tone,
        nodes: [
          {
            key: mod.intro.id,
            title: mod.intro.title,
            kind: "mission",
            item: { kind: "rank-intro", module: mod },
          },
        ],
      },
    ];
  }

  return parts.map((part, i) => {
    const label = cat?.units[i]?.tag ?? part.tag;
    const stages = part.stages?.length ? part.stages : buildPartStages(part);
    const nodes: PathNode[] = [];

    if (i === 0) {
      nodes.push({
        key: mod.intro.id,
        title: "소개",
        kind: "mission",
        item: { kind: "rank-intro", module: mod },
      });
    }

    for (const stage of stages) {
      nodes.push({
        key: stage.id,
        title: stage.title,
        kind: stageNodeKind(stage.kind),
        item: { kind: "rank-stage", module: mod, part, stage },
      });
    }

    if (i === parts.length - 1 && mod.exam) {
      nodes.push({
        key: `exam:${mod.rankId}`,
        title: "승급 시험",
        kind: "exam",
        item: { kind: "rank-exam", module: mod },
      });
    }

    const playable = nodes.filter((n) => n.kind !== "chest" && n.kind !== "promote");
    const unitDone = playable.every((n) => completed[n.key]);
    nodes.push({ key: `chest:${mod.rankId}:${part.id}`, title: "상자", kind: "chest", unitDone });

    return {
      id: `rank-${mod.rankId}-${part.id}`,
      title: `${mod.title} · ${label}`,
      tone,
      nodes,
    };
  });
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
          <span className="shrink-0 rounded-xl bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#3C3C3C]">
            지금
          </span>
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
    : kind === "exam" || kind === "test"
      ? "bg-[#FFC800] shadow-[0_6px_0_#E29F03] active:translate-y-[3px] active:shadow-[0_3px_0_#E29F03]"
      : kind === "situation"
        ? "bg-[#1CB0F6] shadow-[0_6px_0_#1899D6] active:translate-y-[3px] active:shadow-[0_3px_0_#1899D6]"
        : kind === "drill"
          ? "bg-[#CE82FF] shadow-[0_6px_0_#A568D0] active:translate-y-[3px] active:shadow-[0_3px_0_#A568D0]"
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
  if (kind === "exam" || kind === "test") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5Z" fill="#fff" />
        <rect x="10.5" y="13" width="3" height="4" fill="#fff" />
        <rect x="7" y="17" width="10" height="3.5" rx="1.5" fill="#fff" />
      </svg>
    );
  }
  if (kind === "drill") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <path d="M7 7h10v10H7z" fill="none" stroke="#fff" strokeWidth="2.2" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7M9 17v1.5a3 3 0 0 0 6 0V17" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "situation") {
    return (
      <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden>
        <circle cx="8" cy="9" r="3.2" fill="#191F28" />
        <circle cx="16" cy="11" r="3.2" fill="#fff" />
        <circle cx="11" cy="16.5" r="2.6" fill="#191F28" />
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
    <>
      {/* 바깥 탭하면 닫힘 — 레이아웃은 밀지 않음 */}
      <button
        type="button"
        className="fixed inset-0 z-20 cursor-default"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="absolute left-1/2 top-[calc(100%+14px)] z-30 w-[260px] rounded-[20px] p-4"
        style={{
          marginLeft: -130,
          backgroundColor: "#1A2C33",
          border: "2px solid #37464F",
          boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
        }}
        role="dialog"
        aria-label={title}
      >
        <span
          className="absolute -top-2 left-1/2 h-3.5 w-3.5 -ml-[7px] rotate-45"
          style={{ backgroundColor: "#1A2C33", borderLeft: "2px solid #37464F", borderTop: "2px solid #37464F" }}
          aria-hidden
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-[20px] font-bold leading-none text-[#AEB8BE]"
          aria-label="닫기"
        >
          ×
        </button>
        <p className="duo-t1 pr-6 text-[17px] font-extrabold">{title}</p>
        <button
          type="button"
          onClick={onStart}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl text-[16px] font-extrabold text-white transition active:translate-y-[3px]"
          style={{ backgroundColor: "#58CC02", boxShadow: "0 4px 0 #46A302" }}
        >
          {state === "done" ? "다시" : "시작"}
        </button>
      </div>
    </>
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
