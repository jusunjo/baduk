import { useSyncExternalStore } from "react";

export type AiChatState = {
  answer: string | null;
  error: string | null;
  loading: boolean;
  /** 입력창 펼침 */
  expanded: boolean;
  /** 마지막에 판 피드백을 붙였는지 */
  showedBoard: boolean;
};

let state: AiChatState = {
  answer: null,
  error: null,
  loading: false,
  expanded: false,
  showedBoard: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function set(partial: Partial<AiChatState>) {
  state = { ...state, ...partial };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAiChat(): AiChatState {
  return useSyncExternalStore(subscribe, () => state);
}

export const aiChat = {
  set,
  expand() {
    set({ expanded: true, error: null });
  },
  collapse() {
    set({ expanded: false });
  },
  toggle() {
    set({ expanded: !state.expanded });
  },
  clear() {
    set({ answer: null, error: null, loading: false, showedBoard: false, expanded: false });
  },
};
