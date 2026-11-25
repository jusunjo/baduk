import { useState } from "react";
import { useLocation } from "react-router-dom";
import { HansuMascot } from "@/components/HansuMascot";
import { useHansuAsk } from "@/hooks/useHansuAsk";
import { Spinner } from "./Screen";
import { Sheet } from "./Sheet";

/**
 * 바둑판이 없는 화면용 FAB + 시트.
 * 레슨/문제 화면은 BoardBuddy(우하단 플로팅)가 비서 역할을 함.
 */
export function PageAsk() {
  const { pathname } = useLocation();
  const h = useHansuAsk();
  const [draft, setDraft] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  if (h.onBoard) return null;
  /** 홈·온보딩·미션은 FAB 숨김 */
  if (
    pathname === "/" ||
    pathname === "/learn" ||
    pathname === "/welcome" ||
    pathname.startsWith("/mission") ||
    pathname.startsWith("/exam") ||
    pathname.startsWith("/board3d")
  ) {
    return null;
  }

  const hasNav = pathname === "/practice" || pathname === "/path";

  const open = () => {
    setSheetOpen(true);
    h.expand();
  };

  const close = () => {
    setSheetOpen(false);
    setDraft("");
    h.collapse();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="한수에게 묻기"
        className={`fixed right-4 z-40 flex h-12 items-center gap-2 rounded-full bg-[#1a1f27] pl-1 pr-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(25,31,40,0.28)] transition active:scale-95 ${
          hasNav
            ? "bottom-[calc(12px+var(--nav-h,72px))]"
            : "bottom-[calc(88px+env(safe-area-inset-bottom))]"
        }`}
      >
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px]">
          <HansuMascot size={36} bounce={false} />
        </span>
        한수
      </button>

      {sheetOpen && (
        <Sheet title="한수" onClose={close}>
          <div className="pb-2">
            <div className="flex max-h-[42dvh] items-start gap-3 overflow-y-auto rounded-[22px] bg-gradient-to-br from-[#f7efe2] to-toss-soft2 px-3.5 py-3.5">
              <HansuMascot size={52} bounce={!h.loading} />
              <div className="min-w-0 flex-1 pt-0.5">
                {h.loading ? (
                  <p className="flex items-center gap-2 text-[15px] text-toss-mute">
                    <Spinner className="h-4 w-4" />
                    생각 중…
                  </p>
                ) : h.error ? (
                  <p className="break-keep text-[15px] font-medium leading-relaxed text-toss-orange">{h.error}</p>
                ) : h.answer ? (
                  <p className="whitespace-pre-wrap break-keep text-[15px] leading-relaxed text-toss-ink">{h.answer}</p>
                ) : (
                  <p className="break-keep text-[15px] leading-relaxed text-toss-mute">무엇이든 물어보세요</p>
                )}
              </div>
            </div>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void h.ask(draft).then(() => setDraft(""));
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="궁금한 점을 적어 주세요"
                className="h-14 min-w-0 flex-1 rounded-2xl bg-toss-soft2 px-4 text-[15px] text-toss-ink outline-none ring-1 ring-toss-line placeholder:text-toss-mute focus:ring-toss-blue"
                disabled={h.loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={h.loading || !draft.trim()}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-toss-blue text-white transition hover:bg-toss-blue-hover active:scale-95 disabled:bg-toss-blue/40"
                aria-label="묻기"
              >
                {h.loading ? <Spinner className="h-5 w-5" /> : <SendIcon />}
              </button>
            </form>
          </div>
        </Sheet>
      )}
    </>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
