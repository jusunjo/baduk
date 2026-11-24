const MODEL = "gemini-3.8-flash";

type GeminiPart = { text?: string; thought?: boolean };
type GeminiCandidate = {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
};

export async function askGemini(opts: {
  question: string;
  pageContext: string;
  pageTitle: string;
}): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("아직 연결이 안 됐어요. 잠시 뒤 다시 물어봐 주세요.");
  }

  const system = [
    "당신은 ‘한수 AI’입니다. 바둑을 쉽게 가르치는 수읽기 비서예요.",
    "말투: 짧고 따뜻한 구어체. 바둑 친구처럼. ‘~예요/할게요’. 장황한 서론·면책·이모지 금지.",
    "역할: 지금 보고 있는 화면·레슨 맥락으로 개념을 풀어 주고, 두려움을 덜어 줍니다. 바둑은 어렵지 않다는 감각을 유지하세요.",
    "근거: [현재 판 정보]에 있는 내용만 사용. 없는 수순·정석은 지어내지 마세요.",
    "관련 없는 질문(날씨, 코딩, 잡담 등): 한 문장으로 이 화면과 관련 없다고 하고, 궁금한 걸 다시 물어보게 유도하세요.",
    "답변 길이: 2~4문장으로 끝맺으세요. 문장이 중간에 끊기지 않게 완성하세요.",
  ].join("\n");

  const user = `[현재 판: ${opts.pageTitle}]\n${opts.pageContext}\n\n[질문]\n${opts.question}`;

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
        // 생각 토큰이 답변을 잘라먹지 않도록
        thinkingConfig: { thinkingBudget: 0 },
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
  const text = (candidate?.content?.parts ?? [])
    .filter((p) => p.text && !p.thought)
    .map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("대답이 비었어요. 한 번만 더 물어봐 주세요.");

  // 혹시 토큰 한도로 잘리면 문장 끝까지만 보이게 정리
  if (candidate?.finishReason === "MAX_TOKENS") {
    const clipped = text.replace(/[^.!?…。요다까네]+$/u, "").trim();
    return clipped || text;
  }

  return text;
}
