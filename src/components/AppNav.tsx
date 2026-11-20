import { useEffect, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

const stroke = { stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const TABS: { to: string; label: string; icon: ReactNode }[] = [
  {
    to: "/",
    label: "오늘",
    icon: (
      <>
        <circle cx="12" cy="12" r="7.5" {...stroke} />
        <circle cx="9.5" cy="11" r="1.6" fill="currentColor" />
        <circle cx="14.5" cy="14" r="1.6" fill="currentColor" opacity="0.45" />
      </>
    ),
  },
  {
    to: "/learn",
    label: "개념",
    icon: (
      <>
        <path d="M5 7.5h14M5 12h10M5 16.5h12" {...stroke} />
      </>
    ),
  },
  {
    to: "/path",
    label: "목표",
    icon: <path d="M6 19V6.5h8.5l-1.6 2.8 1.6 2.8H6" {...stroke} />,
  },
];

export function BottomNav() {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--nav-h", "calc(60px + env(safe-area-inset-bottom))");
    return () => {
      root.style.removeProperty("--nav-h");
    };
  }, []);
  return (
    <>
      <div className="h-[calc(60px+env(safe-area-inset-bottom))]" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-toss-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto flex h-[60px] max-w-[520px]">
          {TABS.map((t) => (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                end={t.to === "/"}
                className={({ isActive }) =>
                  `flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition active:scale-95 ${
                    isActive ? "text-toss-ink" : "text-toss-mute"
                  }`
                }
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                  {t.icon}
                </svg>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
