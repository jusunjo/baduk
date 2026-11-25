import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

const stroke = { stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const TABS: { to: string; label: string; icon: ReactNode; match?: string[] }[] = [
  {
    to: "/",
    label: "배우기",
    match: ["/", "/learn"],
    icon: (
      <>
        <circle cx="12" cy="12" r="7.5" {...stroke} />
        <circle cx="9.5" cy="11" r="1.6" fill="currentColor" />
        <circle cx="14.5" cy="14" r="1.6" fill="currentColor" opacity="0.45" />
      </>
    ),
  },
  {
    to: "/practice",
    label: "문제",
    icon: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="2.5" {...stroke} />
        <circle cx="9.5" cy="10" r="1.5" fill="currentColor" />
        <circle cx="14.5" cy="14" r="1.5" fill="currentColor" opacity="0.45" />
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
          {TABS.map((t) => {
            const active = t.match
              ? t.match.some((m) => (m === "/" ? pathname === "/" || pathname === "/learn" : pathname.startsWith(m)))
              : pathname === t.to || pathname.startsWith(`${t.to}/`);
            return (
              <li key={t.to} className="flex-1">
                <NavLink
                  to={t.to}
                  end={t.to === "/"}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition active:scale-95 ${
                    active ? "text-toss-ink" : "text-toss-mute"
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
