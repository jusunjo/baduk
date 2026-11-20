import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function Sheet({
  title,
  description,
  onClose,
  footer,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal aria-label={title}>
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 animate-fade-in bg-black/40" />
      <div className="relative flex max-h-[88dvh] w-full max-w-[520px] animate-sheet-up flex-col rounded-t-[28px] bg-white px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-10 shrink-0 rounded-full bg-toss-line" aria-hidden />
        <h2 className="text-[20px] font-bold tracking-tight text-toss-ink">{title}</h2>
        {description && <p className="mt-1.5 whitespace-pre-line break-keep text-[14px] text-toss-mute">{description}</p>}
        {children && <div className="-mx-6 mt-5 min-h-0 overflow-y-auto px-6 py-1">{children}</div>}
        {footer && <div className="mt-6 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
