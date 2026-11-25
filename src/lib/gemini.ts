import type { Point, StoneColor } from "@/data/curriculum";
import type { AiBoardFeedback, AiBoardSession } from "@/lib/aiBoard";
import { formatBoardForPrompt } from "@/lib/aiBoard";

const MODEL = "gemini-3.8-flash";

type GeminiPart = { text?: string; thought?: boolean };
type GeminiCandidate = {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
};

export type AiReply = {
  text: string;
  board: AiBoardFeedback | null;
};

function clampPoint(p: Point, size: number): Point | null {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
  const x = Math.round(p.x);
  const y = Math.round(p.y);
  if (x < 0 || y < 0 || x >= size || y >= size) return null;
  return { x, y };
}

function parseBoardFeedback(raw: unknown, size: number): AiBoardFeedback | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const highlights: Point[] = [];
  const ghosts: { color: StoneColor; at: Point }[] = [];

  if (Array.isArray(o.highlights)) {
    for (const h of o.highlights) {
      if (!h || typeof h !== "object") continue;
      const pt = clampPoint(h as Point, size);
      if (pt) highlights.push(pt);
    }
  }
  if (Array.isArray(o.ghosts)) {
    for (const g of o.ghosts) {
      if (!g || typeof g !== "object") continue;
      const gg = g as { color?: string; at?: Point; x?: number; y?: number };
      const color = gg.color === "W" ? "W" : gg.color === "B" ? "B" : null;
      const at = gg.at
        ? clampPoint(gg.at, size)
        : gg.x != null && gg.y != null
          ? clampPoint({ x: gg.x, y: gg.y }, size)
          : null;
      if (color && at) ghosts.push({ color, at });
    }
  }
  const caption = typeof o.caption === "string" ? o.caption.trim() : undefined;
  if (!highlights.length && !ghosts.length && !caption) return null;
  return {
    highlights: highlights.length ? highlights.slice(0, 16) : undefined,
    ghosts: ghosts.length ? ghosts.slice(0, 8) : undefined,
    caption,
  };
}

function parseReply(raw: string, size: number | null): AiReply {
  const trimmed = raw.trim();
  // JSON 블록 또는 순수 JSON
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      const obj = JSON.parse(candidate.slice(start, end + 1)) as {
        text?: string;
        board?: unknown;
      };
      const text = (obj.text ?? "").trim() || trimmed;
      const board = size != null ? parseBoardFeedback(obj.board, size) : null;
      return { text, board };
    } catch {
      /* fall through */
    }
  }
  return { text: trimmed, board: null };
}

export async function askGemini(opts: {
  question: string;
  pageContext: string;
  pageTitle: string;
  boardSession?: AiBoardSession | null;
}): Promise<AiReply> {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("아직 연결이 안 됐어요. 잠시 뒤 다시 물어봐 주세요.");
  }

  const hasBoard = !!opts.boardSession;
  const size = opts.boardSession?.size ?? null;

  const system = [
    "당신은 ‘한수 AI’입니다. 바둑을 쉽게 가르치는 수읽기 비서예요.",
    "말투: 짧고 따뜻한 구어체. 바둑 친구처럼. ‘~예요/할게요’. 장황한 서론·면책·이모지 금지.",
    "역할: 지금 보고 있는 화면·레슨 맥락으로 개념을 풀어 주고, 두려움을 덜어 줍니다. 바둑은 어렵지 않다는 감각을 유지하세요.",
    "근거: [현재 판 정보]에 있는 내용만 사용. 없는 수순·정석은 지어내지 마세요.",
    "관련 없는 질문(날씨, 코딩, 잡담 등): 한 문장으로 이 화면과 관련 없다고 하고, 궁금한 걸 다시 물어보게 유도하세요.",
    "답변 길이: text는 2~4문장. 문장이 중간에 끊기지 않게 완성하세요.",
    hasBoard
      ? [
          "반드시 JSON만 출력하세요. 형식:",
          '{"text":"설명 문장","board":null 또는 {"highlights":[{"x":0,"y":0}],"ghosts":[{"color":"B","at":{"x":0,"y":0}}],"caption":"짧은 캡션"}}',
          "board 사용 조건: 사용자가 어디에 둘지·어느 점이 중요한지·숨구멍·따내기 자리 등 판 위 위치를 가리키는 답일 때만.",
          "단순 개념 설명·잡담이면 board는 null.",
          `좌표는 0~${(size ?? 7) - 1} 정수. 이미 돌이 있는 자리엔 ghost를 두지 마세요.`,
          "highlights는 강조할 빈 교차점, ghosts는 제안 수(반투명 돌).",
        ].join("\n")
      : "일반 텍스트로만 답하세요. JSON·마크다운 코드블록 금지.",
  ].join("\n");

  const boardBlock = opts.boardSession
    ? `\n\n[바둑판 스냅샷]\n${formatBoardForPrompt(opts.boardSession)}`
    : "";

  const user = `[현재 판: ${opts.pageTitle}]\n${opts.pageContext}${boardBlock}\n\n[질문]\n${opts.question}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
        ...(hasBoard ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 400 || res.status === 403) {
      throw new Error("지금 수를 못 읽겠어요. 잠시 뒤 다시 물어봐 주세요.");
    }
    throw new Error(body.slice(0, 180) || "잠시 뒤 다시 물어봐 주세요.");
  }

  const data = (await res.json()) as { candidates?: GeminiCandidate[] };
  const candidate = data.candidates?.[0];
  let text = (candidate?.content?.parts ?? [])
    .filter((p) => p.text && !p.thought)
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("대답이 비었어요. 한 번만 더 물어봐 주세요.");

  if (candidate?.finishReason === "MAX_TOKENS") {
    text = text.replace(/[^.!?…。요다까네]+$/u, "").trim() || text;
  }

  return parseReply(text, size);
}
