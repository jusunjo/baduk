import { findLesson, previewStep } from "@/data/curriculum";
import type { Rank } from "./ranks";

export type PageAskProgress = {
  rank: Rank | null;
  done: number;
  total: number;
  streakDays: number;
  missionDoneToday: boolean;
  nextTitle?: string | null;
  curriculumTitle?: string | null;
};

export function pageMeta(pathname: string): { id: string; title: string } {
  if (pathname === "/welcome") return { id: "welcome", title: "시작 화면" };
  if (pathname === "/") return { id: "home", title: "오늘" };
  if (pathname === "/learn") return { id: "learn", title: "개념 목록" };
  if (pathname.startsWith("/learn/")) return { id: "lesson", title: "레슨" };
  if (pathname.startsWith("/mission/")) return { id: "mission", title: "미션" };
  if (pathname.startsWith("/exam/")) return { id: "exam", title: "승급 시험" };
  if (pathname === "/practice") return { id: "practice", title: "문제 풀이" };
  if (pathname.startsWith("/practice/")) return { id: "practice-play", title: "문제" };
  if (pathname === "/path") return { id: "path", title: "나의 급수" };
  return { id: "other", title: "한수" };
}

export function buildPageContext(pathname: string, progress: PageAskProgress): string {
  const meta = pageMeta(pathname);
  const lines: string[] = [
    `앱: 한수`,
    `현재 화면: ${meta.title} (${pathname})`,
    `톤: 바둑은 생각보다 어렵지 않다. 급수가 올라가는 게 핵심 보상.`,
  ];

  if (progress.rank) {
    lines.push(
      `현재 급수: ${progress.rank.label}`,
      `의미: ${progress.rank.meaning}`,
      `판 크기: ${progress.rank.boardSize}줄`,
      `진도: ${progress.done}/${progress.total}`,
      `연속: ${progress.streakDays}일 · 오늘 미션 ${progress.missionDoneToday ? "완료" : "미완료"}`,
    );
    if (progress.curriculumTitle) lines.push(`학습 구간: ${progress.curriculumTitle}`);
    if (progress.nextTitle) lines.push(`다음 레슨: ${progress.nextTitle}`);
  }

  if (pathname === "/welcome") {
    lines.push("구성: 7줄 판 미리보기, 시작 → 급수 선택 → 입장 → 첫 레슨. 모르면 ‘처음이에요’.");
  } else if (pathname === "/") {
    lines.push("구성: 나의 급수, 연속 학습, 오늘 미션, 돌 동료, 다음 레슨 CTA. 미션은 레슨 1개 완료.");
  } else if (pathname === "/learn") {
    lines.push("구성: Course 유닛 + 급수 파트 사다리. 완료/현재/잠김. 앞 미션 후 다음 개방. 승급 시험 CTA.");
  } else if (pathname.startsWith("/mission/")) {
    lines.push("구성: PlayGo식 짧은 미션(read/choice/move). 판 위에서 규칙·감각 연습.");
  } else if (pathname.startsWith("/exam/")) {
    lines.push("구성: 승급 시험 10문제, 8개 이상 통과 시 다음 급수.");
  } else if (pathname.startsWith("/learn/")) {
    const lessonId = pathname.split("/")[2] ?? "";
    lines.push(`레슨 ID: ${lessonId}`);
    if (progress.rank) {
      const found = findLesson(progress.rank.track, lessonId);
      if (found) {
        const { chapter, lesson } = found;
        lines.push(
          `챕터: ${chapter.title} — ${chapter.blurb}`,
          `레슨: ${lesson.title} — ${lesson.subtitle}`,
          `판: ${lesson.boardSize}줄 · ${lesson.minutes}분 · ${lesson.vibe}`,
        );
        if (lesson.session) {
          lines.push(
            "세션: 개념 → 예시 → 문제 → (틀린 것만) 오답 복습.",
            `개념 ${lesson.session.concept.length} / 예시 ${lesson.session.example.length} / 문제 ${lesson.session.problems.length}`,
            "문제는 맞출 때까지. 한 번 틀리면 오답 큐.",
          );
          lines.push(`개념 요약: ${lesson.session.concept.map((s) => s.text).slice(0, 4).join(" / ")}`);
        } else {
          lines.push(`스텝 수: ${lesson.steps.length}`);
          const first = previewStep(lesson);
          if (first) lines.push(`첫 단계: ${first.text}`);
        }
      }
    }
  } else if (pathname === "/practice" || pathname.startsWith("/practice/")) {
    lines.push("구성: 개념과 분리된 문제 풀이. 해금된 레슨의 문제만 모아서 품.");
  } else if (pathname === "/path") {
    lines.push("구성: 지금 급수, 목표 급수, 급수 사다리(처음이에요→1급). 목표는 선택.");
  }

  return lines.join("\n");
}
