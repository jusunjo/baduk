import type { CSSProperties, ReactNode } from "react";
import { BottomNav } from "./AppNav";
import { Logo } from "./Logo";

export function Screen({
  onBack,
  onClose,
  title,
  right,
  cta,
  nav,
  gray,
  fit,
  children,
}: {
  onBack?: () => void;
  onClose?: () => void;
  title?: ReactNode;
  right?: ReactNode;
  cta?: ReactNode;
  nav?: boolean;
  gray?: boolean;
  /** Lock the page to the viewport height; the CTA sits in the flow instead of floating. */
  fit?: boolean;
  children: ReactNode;
}) {
  const leading = onBack ? (
    <IconButton label="뒤로" onClick={onBack}>
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconButton>
  ) : onClose ? (
    <IconButton label="닫기" onClick={onClose}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconButton>
  ) : (
    <span className="flex items-center gap-2 font-display text-[17px] font-semibold tracking-tight text-toss-ink">
      <Logo size={22} />
      한수
    </span>
  );

  return (
    <div className={`mx-auto flex w-full max-w-[520px] flex-col px-5 ${fit ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"}`}>
      {gray && <div className="fixed inset-0 -z-10 bg-toss-soft" aria-hidden />}
      <header
        className={`sticky top-0 z-20 -mx-5 px-5 pt-[env(safe-area-inset-top)] ${gray ? "bg-toss-soft/90" : "bg-white/90"} backdrop-blur`}
      >
        <div className="relative flex h-14 items-center justify-between">
          {leading}
          {title && (
            <span className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-semibold tracking-tight text-toss-ink">
              {title}
            </span>
          )}
          {right ?? <span />}
        </div>
      </header>

      <main className={`flex flex-1 flex-col pt-2 ${fit ? "min-h-0" : cta ? "pb-36" : "pb-12"}`}>{children}</main>

      {nav && <BottomNav />}

      {cta && fit && (
        <div className="shrink-0 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">{cta}</div>
      )}

      {cta && !fit && (
        <div
          className={`fixed inset-x-0 z-30 bg-gradient-to-t from-white via-white to-white/0 pt-6 ${
            nav ? "bottom-[var(--nav-h,0px)]" : "bottom-0"
          }`}
        >
          <div className="mx-auto w-full max-w-[520px] px-5 pb-[max(20px,env(safe-area-inset-bottom))]">{cta}</div>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-toss-ink transition hover:bg-toss-soft active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-toss-blue text-[17px] font-semibold text-white transition hover:bg-toss-blue-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-toss-blue/40 disabled:active:scale-100"
    >
      {loading && <Spinner className="h-5 w-5 text-white" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-toss-soft text-[17px] font-semibold text-toss-body transition hover:bg-toss-line active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

export function Reveal({ order = 0, className = "", children }: { order?: number; className?: string; children: ReactNode }) {
  const style: CSSProperties = { animationDelay: `${order * 80}ms` };
  return (
    <div className={`animate-step-in ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Headline({ children }: { children: ReactNode }) {
  return (
    <h1 className="whitespace-pre-line break-keep text-[26px] font-bold leading-[1.4] tracking-tight text-toss-ink">{children}</h1>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
