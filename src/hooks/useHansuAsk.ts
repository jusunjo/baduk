import { useCallback } from "react";
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
  const onBoard = pathname.startsWith("/learn/") || pathname.startsWith("/practice/");
  const canBoardFeedback = onBoard && !!session;

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || chat.loading) return;
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
            nextTitle: p.next?.title ?? null,
            curriculumTitle: p.curriculum?.title ?? null,
          }),
          pageTitle: meta.title,
          boardSession: canBoardFeedback ? session : null,
        });
        if (reply.board) aiBoard.setFeedback(reply.board);
        aiChat.set({
          answer: reply.text,
          loading: false,
          showedBoard: !!reply.board,
          expanded: false,
        });
      } catch (e) {
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
      p.curriculum?.title,
      p.done,
      p.missionDoneToday,
      p.next?.title,
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
