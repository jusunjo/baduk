import type { TrackId } from "@/lib/ranks";
import { TRACKS } from "@/lib/ranks";

export type CompanionMood = "intro" | "mission" | "done" | "streak" | "clear";

const LINES: Record<CompanionMood, (ctx: { streak: number; track: string }) => string> = {
  intro: () => "어렵지 않아요. 같이 두어 볼까요?",
  mission: () => "오늘도 가볍게 한 판만요",
  done: () => "봤죠? 생각보다 할 만해요",
  streak: ({ streak }) => `${streak}일째, 점점 익숙해지고 있어요`,
  clear: ({ track }) => `${track} 구간, 생각보다 잘 해냈어요`,
};

export function companionMood(opts: {
  intro: boolean;
  missionDone: boolean;
  streak: number;
  trackClear: boolean;
}): CompanionMood {
  if (opts.intro) return "intro";
  if (opts.trackClear) return "clear";
  if (opts.missionDone && opts.streak >= 3) return "streak";
  if (opts.missionDone) return "done";
  return "mission";
}

export function CompanionCard({
  track,
  progress,
  mood,
  streak,
}: {
  track: TrackId;
  /** 0~1 within current track */
  progress: number;
  mood: CompanionMood;
  streak: number;
}) {
  const meta = TRACKS[track];
  const line = LINES[mood]({ streak, track: meta.label });
  const stage: 0 | 1 | 2 = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2;

  return (
    <div className="flex items-center gap-3.5 rounded-[28px] bg-gradient-to-br from-[#f7efe2] via-[#f4f7f2] to-[#eef3f8] px-4 py-3.5 ring-1 ring-black/[0.04]">
      <div className="relative shrink-0">
        <CompanionArt track={track} stage={stage} mood={mood} />
        {mood === "done" || mood === "streak" ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-toss-green text-[10px] font-bold text-white shadow-sm">
            ✓
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-[#8a6a3d]">
          {meta.label} 친구 · {meta.boardSize}줄
        </p>
        <p key={line} className="mt-0.5 animate-rise-in break-keep text-[15px] font-bold leading-snug tracking-tight text-toss-ink">
          {line}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-black/[0.04]">
          <div
            className="h-full rounded-full bg-[#6f9b5a] transition-[width] duration-700 ease-out"
            style={{ width: `${Math.round(Math.min(1, Math.max(0.08, progress)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function CompanionArt({
  track,
  stage = 1,
  mood = "mission",
  size = 64,
}: {
  track: TrackId;
  stage?: 0 | 1 | 2;
  mood?: CompanionMood;
  size?: number;
}) {
  const bounce = mood === "intro" || mood === "mission";
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={bounce ? "animate-companion-bob" : "animate-pop"}
      aria-hidden
    >
      <ellipse cx="32" cy="56" rx="16" ry="3.5" fill="rgba(25,31,40,0.08)" />
      {track === "seed" && <Seed stage={stage} />}
      {track === "sprout" && <Sprout stage={stage} />}
      {track === "leaf" && <Leaf stage={stage} />}
      {track === "tree" && <Tree stage={stage} />}
      {track === "forest" && <Forest stage={stage} />}
    </svg>
  );
}

function Face({ cx, cy, smile = true }: { cx: number; cy: number; smile?: boolean }) {
  return (
    <g>
      <circle cx={cx - 3.2} cy={cy} r="1.35" fill="#1a1f27" />
      <circle cx={cx + 3.2} cy={cy} r="1.35" fill="#1a1f27" />
      <path
        d={smile ? `M${cx - 3.5} ${cy + 4.2} Q${cx} ${cy + 7.2} ${cx + 3.5} ${cy + 4.2}` : `M${cx - 3.2} ${cy + 5.2} Q${cx} ${cy + 3.6} ${cx + 3.2} ${cy + 5.2}`}
        stroke="#1a1f27"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function Seed({ stage }: { stage: 0 | 1 | 2 }) {
  const y = 38 - stage * 2;
  return (
    <g>
      <ellipse cx="32" cy="50" rx="14" ry="5" fill="#c4a574" />
      <ellipse cx="32" cy="48" rx="12" ry="3.5" fill="#b89560" opacity="0.55" />
      <ellipse cx="32" cy={y} rx={11 + stage} ry={13 + stage} fill="#6b4a2a" />
      <ellipse cx="28" cy={y - 3} rx="4" ry="5.5" fill="#8a6340" opacity="0.35" />
      <Face cx={32} cy={y - 1} />
      {stage > 0 && <path d={`M32 ${y - 14} C32 ${y - 20} 28 ${y - 22} 26 ${y - 24}`} stroke="#5f8f45" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {stage > 1 && (
        <>
          <path d="M26 16 C22 14 20 16 19 19" stroke="#5f8f45" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <ellipse cx="18.5" cy="20" rx="3.5" ry="2.2" fill="#7cb35a" transform="rotate(-35 18.5 20)" />
        </>
      )}
    </g>
  );
}

function Sprout({ stage }: { stage: 0 | 1 | 2 }) {
  const h = 22 + stage * 4;
  return (
    <g>
      <ellipse cx="32" cy="50" rx="14" ry="5" fill="#c4a574" />
      <path d={`M32 48 V${48 - h}`} stroke="#5a8a3d" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx={24 - stage} cy={36 - stage * 2} rx={7 + stage} ry={4 + stage * 0.5} fill="#7cb35a" transform={`rotate(-40 ${24 - stage} ${36 - stage * 2})`} />
      <ellipse cx={40 + stage} cy={34 - stage * 2} rx={7 + stage} ry={4 + stage * 0.5} fill="#6f9b5a" transform={`rotate(40 ${40 + stage} ${34 - stage * 2})`} />
      {stage > 0 && <ellipse cx="32" cy={28 - stage} rx="5" ry="3" fill="#8fc96a" />}
      <g transform={`translate(0 ${-stage})`}>
        <circle cx="32" cy="22" r="9" fill="#f4e7c8" />
        <Face cx={32} cy={22} />
      </g>
    </g>
  );
}

function Leaf({ stage }: { stage: 0 | 1 | 2 }) {
  return (
    <g>
      <ellipse cx="32" cy="52" rx="15" ry="4.5" fill="#c4a574" />
      <path d="M32 50 V28" stroke="#4f7a35" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="22" cy={34 - stage} rx={9 + stage} ry="5" fill="#7cb35a" transform={`rotate(-50 22 ${34 - stage})`} />
      <ellipse cx="42" cy={32 - stage} rx={9 + stage} ry="5" fill="#6f9b5a" transform={`rotate(48 42 ${32 - stage})`} />
      <ellipse cx="32" cy={24 - stage} rx={8 + stage} ry="5" fill="#8fc96a" />
      {stage > 1 && <ellipse cx="26" cy="20" rx="5" ry="3" fill="#9fd67a" transform="rotate(-20 26 20)" />}
      <circle cx="32" cy="18" r="9.5" fill="#f4e7c8" />
      <Face cx={32} cy={18} />
    </g>
  );
}

function Tree({ stage }: { stage: 0 | 1 | 2 }) {
  const crown = 14 + stage * 2;
  return (
    <g>
      <ellipse cx="32" cy="54" rx="15" ry="4" fill="#c4a574" />
      <rect x="28.5" y="34" width="7" height="18" rx="2" fill="#8a6340" />
      <circle cx="32" cy={28 - stage} r={crown} fill="#5f8f45" />
      <circle cx={24} cy={30 - stage} r={crown - 4} fill="#7cb35a" />
      <circle cx={40} cy={29 - stage} r={crown - 4} fill="#6f9b5a" />
      {stage > 0 && <circle cx="32" cy={20 - stage} r="7" fill="#8fc96a" />}
      <circle cx="32" cy="16" r="9" fill="#f4e7c8" />
      <Face cx={32} cy={16} />
    </g>
  );
}

function Forest({ stage }: { stage: 0 | 1 | 2 }) {
  return (
    <g>
      <ellipse cx="32" cy="54" rx="18" ry="4" fill="#c4a574" />
      <g opacity="0.85">
        <rect x="14" y="38" width="5" height="12" rx="1.5" fill="#8a6340" />
        <circle cx="16.5" cy="34" r="7" fill="#5f8f45" />
        <rect x="45" y="40" width="5" height="10" rx="1.5" fill="#8a6340" />
        <circle cx="47.5" cy="36" r="6.5" fill="#6f9b5a" />
      </g>
      <rect x="28.5" y="32" width="7" height="18" rx="2" fill="#7a5635" />
      <circle cx="32" cy={26 - stage} r={15 + stage} fill="#4f7a35" />
      <circle cx="23" cy={28 - stage} r="9" fill="#7cb35a" />
      <circle cx="41" cy={27 - stage} r="9" fill="#6f9b5a" />
      {stage > 1 && <circle cx="32" cy="18" r="8" fill="#8fc96a" />}
      <circle cx="32" cy="14" r="9.5" fill="#f4e7c8" />
      <Face cx={32} cy={14} smile />
    </g>
  );
}
