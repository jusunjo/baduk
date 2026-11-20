import type { StoneColor } from "@/data/curriculum";

type Cell = { x: number; y: number; c: StoneColor };

const STEPS: { title: string; desc: string; stones: Cell[]; wash?: { x: number; y: number }[]; ring?: { x: number; y: number } }[] = [
  {
    title: "돌 따먹기",
    desc: "숨구멍을 막아 상대 돌을 잡아요",
    stones: [
      { x: 1, y: 1, c: "B" },
      { x: 0, y: 1, c: "W" },
      { x: 1, y: 0, c: "W" },
      { x: 2, y: 1, c: "W" },
    ],
    ring: { x: 1, y: 2 },
  },
  {
    title: "잇기",
    desc: "내 돌을 이어서 잡히지 않게 지켜요",
    stones: [
      { x: 0, y: 1, c: "B" },
      { x: 1, y: 1, c: "B" },
      { x: 2, y: 1, c: "B" },
      { x: 1, y: 0, c: "W" },
    ],
  },
  {
    title: "집 짓기",
    desc: "첫 판에서 해 본 땅 차지하기",
    stones: [
      { x: 2, y: 0, c: "B" },
      { x: 2, y: 1, c: "B" },
      { x: 0, y: 2, c: "B" },
      { x: 1, y: 2, c: "B" },
    ],
    wash: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
];

export function LearningRoadmap() {
  return (
    <div className="rounded-[28px] bg-toss-soft2 p-4">
      <ol className="relative">
        <span className="absolute bottom-10 left-[28px] top-10 w-[2px] rounded-full bg-toss-line" aria-hidden />
        {STEPS.map((s, i) => {
          const now = i === 0;
          return (
            <li
              key={s.title}
              className={`relative flex animate-step-in items-center gap-4 rounded-2xl p-2.5 ${now ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]" : ""}`}
              style={{ animationDelay: `${120 + i * 140}ms` }}
            >
              <Pattern {...s} dim={!now} />
              <div className="min-w-0 flex-1">
                <p className={`text-[16px] font-bold ${now ? "text-toss-ink" : "text-toss-mute"}`}>
                  {i + 1}. {s.title}
                </p>
                <p className="mt-0.5 break-keep text-[13px] leading-snug text-toss-mute">{s.desc}</p>
              </div>
              {now && (
                <span className="shrink-0 rounded-pill bg-toss-blue/10 px-2.5 py-1 text-[12px] font-semibold text-toss-blue">지금</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Pattern({ stones, wash = [], ring, dim }: (typeof STEPS)[number] & { dim: boolean }) {
  const at = (v: number) => 6 + v * 12;
  return (
    <svg
      viewBox="0 0 36 36"
      className={`relative h-[38px] w-[38px] shrink-0 rounded-xl ${dim ? "opacity-60" : ""}`}
      style={{ background: "linear-gradient(160deg, #f0d4a0, #d4a66a)" }}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={at(0)} y1={at(i)} x2={at(2)} y2={at(i)} stroke="#5c3d1e" strokeWidth="0.6" opacity="0.6" />
          <line x1={at(i)} y1={at(0)} x2={at(i)} y2={at(2)} stroke="#5c3d1e" strokeWidth="0.6" opacity="0.6" />
        </g>
      ))}
      {wash.map((p) => (
        <rect key={`w${p.x}${p.y}`} x={at(p.x) - 4.5} y={at(p.y) - 4.5} width="9" height="9" rx="2" fill="rgba(25,31,40,0.28)" />
      ))}
      {stones.map((s) => (
        <circle
          key={`s${s.x}${s.y}`}
          cx={at(s.x)}
          cy={at(s.y)}
          r="5"
          fill={s.c === "B" ? "#1a1f27" : "#f7f8fa"}
          stroke={s.c === "W" ? "#d1d5db" : "none"}
          strokeWidth="0.5"
        />
      ))}
      {ring && (
        <circle cx={at(ring.x)} cy={at(ring.y)} r="4.6" fill="none" stroke="#3182F6" strokeWidth="1" strokeDasharray="2 1.5" />
      )}
    </svg>
  );
}
