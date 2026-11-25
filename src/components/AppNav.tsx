import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { sfx } from "@/lib/sfx";

const stroke = { stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const TABS: { to: string; label: string; icon: ReactNode; match?: string[] }[] = [
  {
    to: "/",
    label: "배우기",
    match: ["/", "/learn"],
    icon: (
      <>
        <path d="M4 19V7l8-3 8 3v12" {...stroke} />
        <path d="M9 19v-6h6v6" {...stroke} />
      </>
    ),
  },
  {
    to: "/practice",
    label: "문제",
    icon: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="3" {...stroke} />
        <circle cx="9.5" cy="10" r="1.4" fill="currentColor" />
        <circle cx="14.5" cy="14" r="1.4" fill="currentColor" opacity="0.45" />
      </>
    ),
  },
  {
    to: "/path",
    label: "급수",
    icon: <path d="M6 19V6.5h8.5l-1.6 2.8 1.6 2.8H6" {...stroke} />,
  },
];

export function BottomNav() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--nav-h", "calc(64px + env(safe-area-inset-bottom))");
    return () => {
      root.style.removeProperty("--nav-h");
    };
  }, []);

  return (
    <>
      <div className="h-[calc(64px+env(safe-area-inset-bottom))]" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-duo-swan bg-white pb-[env(safe-area-inset-bottom)]">
        <ul className="mx-auto flex h-[64px] max-w-[520px]">
          {TABS.map((t) => {
            const active = t.match
              ? t.match.some((m) => (m === "/" ? pathname === "/" || pathname === "/learn" : pathname.startsWith(m)))
              : pathname === t.to || pathname.startsWith(`${t.to}/`);
            return (
              <li key={t.to} className="flex-1">
                <NavLink
                  to={t.to}
                  end={t.to === "/"}
                  onClick={() => sfx.play("tap")}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold transition active:scale-95 ${
                    active ? "text-duo-green" : "text-duo-hare"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                    {t.icon}
                  </svg>
                  {t.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
