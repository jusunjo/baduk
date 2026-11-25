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
  lesson,
  progress,
  hearts = 5,
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
  /** 듀오 레슨 다크 크롬 (진행바·하트) */
  lesson?: boolean;
  progress?: number;
  hearts?: number;
  /** Lock the page to the viewport height; the CTA sits in the flow instead of floating. */
  fit?: boolean;
  children: ReactNode;
}) {
  if (lesson) {
    return (
      <div className={`mx-auto flex w-full max-w-[520px] flex-col px-4 ${fit ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"}`}>
        <div className="duo-night fixed inset-0 -z-10" aria-hidden />
        <header className="sticky top-0 z-50 -mx-4 bg-duo-night/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
          <div className="flex h-12 items-center gap-3">
            {(onClose || onBack) && (
              <button
                type="button"
                onClick={onClose ?? onBack}
                aria-label="닫기"
                className="-ml-1 flex h-10 w-10 items-center justify-center text-duo-night-mute transition active:scale-90"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-duo-night-line">
              <div
                className="h-full rounded-full bg-duo-green transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, (progress ?? 0) * 100))}%` }}
              />
            </div>
            <div className="flex items-center gap-0.5 pl-1" aria-label={`하트 ${hearts}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <HeartIcon key={i} on={i < hearts} />
              ))}
            </div>
          </div>
        </header>
        <main className={`flex flex-1 flex-col pt-3 ${fit ? "min-h-0" : "pb-12"}`}>{children}</main>
        {cta && fit && (
          <div className="shrink-0 border-t border-duo-night-line/60 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
            {cta}
          </div>
        )}
      </div>
    );
  }

  const leading = onBack ? (
    <IconButton label="뒤로" onClick={onBack}>
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IconButton>
  ) : onClose ? (
    <IconButton label="닫기" onClick={onClose}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </IconButton>
  ) : (
    <span className="flex items-center gap-2 font-display text-[17px] font-extrabold tracking-tight text-duo-eel">
      <Logo size={22} />
      한수
    </span>
  );

  return (
    <div className={`mx-auto flex w-full max-w-[520px] flex-col px-5 ${fit ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"}`}>
      <div className={`fixed inset-0 -z-10 ${gray ? "duo-bg" : "bg-white"}`} aria-hidden />
      <header
        className={`sticky top-0 z-50 -mx-5 px-5 pt-[env(safe-area-inset-top)] ${
          gray ? "bg-[#F7F7F7]/95" : "bg-white/95"
        } border-b-2 border-duo-swan backdrop-blur-sm`}
      >
        <div className="relative flex h-14 items-center justify-between">
          {leading}
          {title && (
            <span className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-extrabold tracking-tight text-duo-eel">
              {title}
            </span>
          )}
          {right ?? <span />}
        </div>
      </header>

      <main
        className={`flex flex-1 flex-col pt-2 ${
          fit ? "min-h-0" : cta ? "pb-36" : nav ? "pb-4" : "pb-12"
        }`}
      >
        {children}
      </main>

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

function HeartIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${on ? "text-[#FF4B4B]" : "text-duo-night-line"}`} aria-hidden>
      <path
        fill="currentColor"
        d="M12 20.4c-.4 0-.8-.15-1.1-.45C7.2 16.3 4.5 13.9 3.3 11.7 2.3 9.9 2.4 7.6 3.7 6 5 4.3 7.3 3.8 9 4.7c.7.4 1.3.9 1.7 1.6.4-.7 1-.1.2 1.7 1.6 1.7-.9 4-.5 5.3-1.7C18.7 3.8 21 4.3 22.3 6c1.3 1.6 1.4 3.9.4 5.7-1.2 2.2-3.9 4.6-7.6 8.25-.3.3-.7.45-1.1.45Z"
      />
    </svg>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-duo-eel transition hover:bg-duo-swan/60 active:scale-95"
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
  night,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  night?: boolean;
}) {
  const idle = night
    ? "disabled:bg-duo-night-line disabled:text-duo-night-mute disabled:shadow-none"
    : "disabled:bg-[#AFE581] disabled:shadow-none";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-duo-green text-[17px] font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#46A302] transition active:translate-y-[3px] active:shadow-[0_1px_0_#46A302] disabled:cursor-not-allowed disabled:active:translate-y-0 ${idle}`}
    >
      {loading && <Spinner className="h-5 w-5 text-white" />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  night,
}: {
  children: ReactNode;
  onClick?: () => void;
  night?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[17px] font-extrabold transition active:scale-[0.98] ${
        night
          ? "bg-duo-night-3 text-white ring-2 ring-duo-night-line"
          : "bg-toss-soft text-toss-body hover:bg-toss-line"
      }`}
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

export function Headline({ children, night }: { children: ReactNode; night?: boolean }) {
  return (
    <h1
      className={`whitespace-pre-line break-keep text-[26px] font-extrabold leading-[1.35] tracking-tight ${
        night ? "text-white" : "text-toss-ink"
      }`}
    >
      {children}
    </h1>
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
