import { useEffect, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { sfx } from "@/lib/sfx";

const stroke = { stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;

const TABS: { to: string; label: string; icon: (active: boolean) => ReactNode; match?: string[] }[] = [
  {
    to: "/",
    label: "배우기",
    match: ["/", "/learn"],
    icon: (active) => (
      <>
        <path d="M4 19V7l8-3 8 3v12" {...stroke} />
        <path d="M9 19v-6h6v6" {...stroke} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
      </>
    ),
  },
  {
    to: "/practice",
    label: "문제",
    icon: (active) => (
      <>
        <rect x="5" y="5" width="14" height="14" rx="3" {...stroke} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
        <circle cx="9.5" cy="10" r="1.5" fill="currentColor" />
        <circle cx="14.5" cy="14" r="1.5" fill="currentColor" opacity="0.45" />
      </>
    ),
  },
  {
    to: "/play",
    label: "AI",
    match: ["/play"],
    icon: (active) => (
      <>
        <circle cx="12" cy="12" r="7.5" {...stroke} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </>
    ),
  },
  {
    to: "/path",
    label: "급수",
    icon: (active) => (
      <path
        d="M6 19V6.5h8.5l-1.6 2.8 1.6 2.8H6"
        {...stroke}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    ),
  },
];

export function BottomNav() {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--nav-h", "calc(70px + env(safe-area-inset-bottom))");
    return () => {
      root.style.removeProperty("--nav-h");
    };
  }, []);

  return (
    <>
      <div className="h-[calc(70px+env(safe-area-inset-bottom))]" aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
        style={{ backgroundColor: "#131F24", borderTop: "2px solid #37464F" }}
      >
        <ul className="mx-auto flex h-[70px] max-w-[520px] px-2">
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
                  className="flex h-full flex-col items-center justify-center gap-1 transition active:scale-95"
                  style={{ color: active ? "#58CC02" : "#7A8A92" }}
                >
                  <span
                    className="flex h-9 w-12 items-center justify-center rounded-xl"
                    style={active ? { backgroundColor: "rgba(88,204,2,0.16)" } : undefined}
                  >
                    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
                      {t.icon(active)}
                    </svg>
                  </span>
                  <span className="text-[11px] font-extrabold tracking-tight">{t.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
