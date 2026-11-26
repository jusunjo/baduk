import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { aiBoard, useAiBoard } from "@/lib/aiBoard";
import { aiChat, useAiChat } from "@/lib/aiChat";
import { askGemini } from "@/lib/gemini";
import { buildPageContext, pageMeta } from "@/lib/pageContext";
import { useProgress } from "@/lib/progress";

export function useHansuAsk() {
  const { pathname } = useLocation();
  const p = useProgress();
  const { session, feedback } = useAiBoard();
  const chat = useAiChat();
  const meta = pageMeta(pathname);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const onBoard =
    pathname.startsWith("/learn/") ||
    pathname.startsWith("/practice/") ||
    pathname.startsWith("/mission/") ||
    pathname.startsWith("/exam/");
  const canBoardFeedback = onBoard && !!session;

  // 페이지가 바뀌면 이전 질문·답변·판 표시 전부 초기화
  useEffect(() => {
    aiChat.clear();
    aiBoard.clearFeedback();
  }, [pathname]);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || chat.loading) return;
      const askedOn = pathname;
      aiChat.set({ loading: true, error: null, answer: null, showedBoard: false, expanded: true });
      aiBoard.clearFeedback();
      try {
        const reply = await askGemini({
          question: trimmed,
          pageContext: buildPageContext(pathname, {
            rank: p.rank,
            done: p.done,
            total: p.total,
            streakDays: p.streakDays,
            missionDoneToday: p.missionDoneToday,
            nextTitle: p.nextTitle,
            curriculumTitle: p.course?.title ?? null,
          }),
          pageTitle: meta.title,
          boardSession: canBoardFeedback ? session : null,
        });
        if (pathRef.current !== askedOn) return;
        if (reply.board) aiBoard.setFeedback(reply.board);
        aiChat.set({
          answer: reply.text,
          loading: false,
          showedBoard: !!reply.board,
          expanded: false,
        });
      } catch (e) {
        if (pathRef.current !== askedOn) return;
        aiChat.set({
          loading: false,
          error: e instanceof Error ? e.message : "잠시 후 다시 두어 볼까요?",
          expanded: true,
        });
      }
    },
    [
      canBoardFeedback,
      chat.loading,
      meta.title,
      p.course?.title,
      p.done,
      p.missionDoneToday,
      p.nextTitle,
      p.rank,
      p.streakDays,
      p.total,
      pathname,
      session,
    ],
  );

  /** NPC bark — loading/error/answer일 때만. 없으면 캐릭터만 */
  const bubbleText = chat.loading
    ? "…"
    : chat.error
      ? chat.error
      : chat.answer
        ? chat.answer
        : null;

  return {
    ...chat,
    feedback,
    onBoard,
    canBoardFeedback,
    bubbleText,
    track: p.rank?.track ?? "seed",
    ask,
    expand: aiChat.expand,
    collapse: aiChat.collapse,
    toggle: aiChat.toggle,
    clear: () => {
      aiChat.clear();
      aiBoard.clearFeedback();
    },
  };
}
