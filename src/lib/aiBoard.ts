import { useSyncExternalStore } from "react";
import type { Point, StoneColor } from "@/data/curriculum";
import type { Grid } from "@/lib/board";

/** 레슨 판이 AI에게 넘기는 현재 스냅샷 */
export type AiBoardSession = {
  lessonId: string;
  size: number;
  /** 돌 목록 (빈 판이면 []) */
  stones: { color: StoneColor; at: Point }[];
  /** 지금 단계 한 줄 설명 */
  prompt?: string;
  /** 유저가 둬야 하는 색 */
  playAs?: StoneColor;
};

/** AI가 바둑판에 그릴 수 있는 피드백 */
export type AiBoardFeedback = {
  /** 교차점 강조 (힌트 링) */
  highlights?: Point[];
  /** 반투명 제안 돌 */
  ghosts?: { color: StoneColor; at: Point }[];
  /** 판 아래 짧은 캡션 */
  caption?: string;
};

type AiBoardState = {
  session: AiBoardSession | null;
  feedback: AiBoardFeedback | null;
};

let state: AiBoardState = { session: null, feedback: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function set(next: AiBoardState) {
  state = next;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAiBoard(): AiBoardState {
  return useSyncExternalStore(subscribe, () => state);
}

export function getAiBoard(): AiBoardState {
  return state;
}

export const aiBoard = {
  /** 레슨 플레이가 판이 바뀔 때마다 등록. 언마운트 시 clearSession */
  setSession(session: AiBoardSession | null) {
    set({ session, feedback: session ? state.feedback : null });
  },
  setFeedback(feedback: AiBoardFeedback | null) {
    set({ ...state, feedback });
  },
  clearFeedback() {
    set({ ...state, feedback: null });
  },
  clearSession() {
    set({ session: null, feedback: null });
  },
};

export function gridToStones(board: Grid): { color: StoneColor; at: Point }[] {
  const out: { color: StoneColor; at: Point }[] = [];
  board.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell) out.push({ color: cell, at: { x, y } });
    }),
  );
  return out;
}

export function formatBoardForPrompt(session: AiBoardSession): string {
  const lines = [
    `바둑판 크기: ${session.size}줄 (좌표 0~${session.size - 1}, 왼쪽 위가 0,0)`,
    session.prompt ? `지금 단계: ${session.prompt}` : "",
    session.playAs ? `둘 색: ${session.playAs === "B" ? "흑" : "백"}` : "",
  ].filter(Boolean);

  if (!session.stones.length) {
    lines.push("돌: 없음 (빈 판)");
  } else {
    const b = session.stones.filter((s) => s.color === "B").map((s) => `(${s.at.x},${s.at.y})`);
    const w = session.stones.filter((s) => s.color === "W").map((s) => `(${s.at.x},${s.at.y})`);
    if (b.length) lines.push(`흑: ${b.join(" ")}`);
    if (w.length) lines.push(`백: ${w.join(" ")}`);
  }
  return lines.join("\n");
}
