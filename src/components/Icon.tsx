import type { ReactNode } from "react";

export type IconName = "book" | "stone" | "flag" | "calendar" | "trophy" | "spark" | "board" | "check";
export type IconTone = "blue" | "orange" | "green" | "red" | "purple" | "gray";

const TONE: Record<IconTone, { fg: string; bg: string }> = {
  blue: { fg: "text-toss-blue", bg: "bg-toss-blue/10" },
  orange: { fg: "text-toss-orange", bg: "bg-toss-orange/10" },
  green: { fg: "text-toss-green", bg: "bg-toss-green/10" },
  red: { fg: "text-toss-red", bg: "bg-toss-red/10" },
  purple: { fg: "text-toss-purple", bg: "bg-toss-purple/10" },
  gray: { fg: "text-toss-mute", bg: "bg-toss-soft" },
};

const white = { stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const GLYPHS: Record<IconName, ReactNode> = {
  book: (
    <>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v18H5.5A2.5 2.5 0 0 1 3 18.5v-13Z" fill="currentColor" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z" fill="currentColor" opacity="0.55" />
    </>
  ),
  stone: (
    <>
      <circle cx="9" cy="11" r="5.2" fill="currentColor" />
      <circle cx="16" cy="14" r="5" fill="currentColor" opacity="0.45" />
    </>
  ),
  flag: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor" />
      <path d="M8 6.5v11M8 7.5h7.5l-1.8 2.6 1.8 2.6H8" {...white} strokeWidth={1.9} />
    </>
  ),
  calendar: (
    <>
      <rect x="2.5" y="4" width="19" height="17.5" rx="4.5" fill="currentColor" />
      <rect x="6.5" y="2" width="2.4" height="5" rx="1.2" fill="currentColor" />
      <rect x="15.1" y="2" width="2.4" height="5" rx="1.2" fill="currentColor" />
      <path d="M2.5 9.5h19" stroke="#fff" strokeWidth="1.6" />
      <rect x="13.5" y="13" width="4" height="4" rx="1.2" fill="#fff" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0V3.5Z" fill="currentColor" />
      <path d="M7 5.5H4.5v1.5A3 3 0 0 0 7.5 10M17 5.5h2.5v1.5a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="10.5" y="13" width="3" height="4" fill="currentColor" />
      <rect x="7" y="17" width="10" height="3.5" rx="1.5" fill="currentColor" />
    </>
  ),
  spark: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor" />
      <path d="M12 6.5v3M12 14.5v3M6.5 12h3M14.5 12h3M8.2 8.2l2.1 2.1M13.7 13.7l2.1 2.1M15.8 8.2l-2.1 2.1M10.3 13.7l-2.1 2.1" {...white} strokeWidth={1.8} />
    </>
  ),
  board: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor" />
      <path d="M7 7.5h10M7 12h10M7 16.5h10M7.5 7v9.5M12 7v9.5M16.5 7v9.5" {...white} strokeWidth={1.5} />
    </>
  ),
  check: (
    <>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="currentColor" />
      <path d="m7 12 3.2 3.2L17 8.5" {...white} strokeWidth={2.2} />
    </>
  ),
};

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {GLYPHS[name]}
    </svg>
  );
}

const TILE = {
  sm: { box: "h-8 w-8 rounded-xl", icon: "h-[18px] w-[18px]" },
  md: { box: "h-11 w-11 rounded-2xl", icon: "h-6 w-6" },
  lg: { box: "h-16 w-16 rounded-[22px]", icon: "h-9 w-9" },
};

export function IconTile({
  name,
  tone = "blue",
  size = "md",
  className = "",
}: {
  name: IconName;
  tone?: IconTone;
  size?: keyof typeof TILE;
  className?: string;
}) {
  const t = TONE[tone];
  const s = TILE[size];
  return (
    <span className={`flex shrink-0 items-center justify-center ${s.box} ${t.bg} ${t.fg} ${className}`} aria-hidden>
      <Icon name={name} className={s.icon} />
    </span>
  );
}
