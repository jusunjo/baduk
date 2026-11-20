import type { ReactNode } from "react";
import { Reveal } from "./Screen";

export function Chevron({ className = "text-toss-mute" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${className}`} fill="none" aria-hidden>
      <path d="m8 5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Card({
  title,
  sub,
  action,
  order = 0,
  children,
}: {
  title?: string;
  sub?: string;
  action?: { label: string; onClick: () => void };
  order?: number;
  children: ReactNode;
}) {
  return (
    <Reveal order={order} className="mt-3">
      <section className="rounded-3xl bg-white p-5">
        {title && (
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold tracking-tight text-toss-ink">{title}</h2>
              {sub && <p className="mt-0.5 text-[13px] text-toss-mute">{sub}</p>}
            </div>
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                className="-mr-2 flex shrink-0 items-center gap-0.5 rounded-pill px-2 py-1 text-[14px] font-medium text-toss-mute transition hover:bg-toss-soft hover:text-toss-body"
              >
                {action.label}
                <Chevron />
              </button>
            )}
          </div>
        )}
        {children}
      </section>
    </Reveal>
  );
}

export function Row({
  leading,
  title,
  sub,
  right,
  onClick,
  disabled,
}: {
  leading: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-toss-soft2 active:scale-[0.99] active:bg-toss-soft2 disabled:opacity-40 disabled:active:scale-100"
      >
        {leading}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-toss-ink">{title}</span>
          {sub && <span className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-toss-mute">{sub}</span>}
        </span>
        {right ?? <Chevron />}
      </button>
    </li>
  );
}

export function Stat({ label, value, unit, tone = "text-toss-ink" }: { label: string; value: ReactNode; unit?: string; tone?: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-toss-soft2 px-3 py-2.5">
      <span className="block text-[12px] text-toss-mute">{label}</span>
      <span className={`mt-0.5 block text-[19px] font-bold tabular-nums tracking-tight ${tone}`}>
        {value}
        {unit && <span className="ml-0.5 text-[14px] font-semibold">{unit}</span>}
      </span>
    </div>
  );
}

export function ProgressBar({ value, tone = "bg-toss-blue", className = "h-2" }: { value: number; tone?: string; className?: string }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-toss-soft ${className}`}>
      <div
        className={`h-full origin-left animate-grow-x rounded-full ${tone} transition-[width] duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

export function Pill({ children, tone = "bg-toss-soft text-toss-body" }: { children: ReactNode; tone?: string }) {
  return <span className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[12px] font-semibold ${tone}`}>{children}</span>;
}
