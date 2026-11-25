import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, Screen } from "@/components/Screen";
import { isUnlocked, useProgress } from "@/lib/progress";
import { actions } from "@/lib/store";

type NodeState = "done" | "current" | "locked";

export function LearnPage() {
  const navigate = useNavigate();
  const p = useProgress();
  const [open, setOpen] = useState<string | null>(p.nextId);

  if (!p.rank || !p.course) return null;

  const stateOf = (key: string): NodeState => {
    if (p.completed[key]) return "done";
    if (key === p.nextId) return "current";
    return isUnlocked(p.completed, p.queue, key) ? "done" : "locked";
  };

  return (
    <Screen nav gray>
      <div className="px-1 pt-1">
        <p className="text-[13px] font-semibold text-toss-mute">
          {p.rank.label} · Course + 급수
        </p>
        <p className="mt-1 text-[22px] font-bold tracking-tight text-toss-ink">
          {p.done}/{p.total} 미션 완료
        </p>
        <p className="mt-1 break-keep text-[14px] text-toss-mute">
          규칙 Course를 먼저, 그다음 급수 파트를 따라가요.
        </p>
      </div>

      <div className="mt-5 space-y-6 pb-10">
        {p.course.units.map((unit, ui) => {
          const keys = unit.lessons.map((l) => l.id);
          const states = keys.map(stateOf);
          const unitDone = states.every((s) => s === "done");
          const unitNow = states.includes("current");
          return (
            <section key={unit.id}>
              <SectionHead
                eyebrow={`Course · 유닛 ${ui + 1}`}
                title={unit.title}
                blurb={unit.blurb}
                active={unitNow}
                done={unitDone}
              />
              <div className="mt-3 space-y-2">
                {unit.lessons.map((lesson) => (
                  <MissionRow
                    key={lesson.id}
                    title={lesson.title}
                    subtitle={lesson.subtitle ?? (lesson.review ? "복습" : `${lesson.exercises.length}문제`)}
                    state={stateOf(lesson.id)}
                    open={open === lesson.id}
                    onToggle={() => setOpen(open === lesson.id ? null : lesson.id)}
                    onStart={() => navigate(`/mission/${lesson.id}`)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {p.rank.id === "beginner" && p.courseComplete && (
          <section className="rounded-[22px] bg-toss-blue p-5 text-white">
            <p className="text-[12px] font-semibold text-white/75">다음 단계</p>
            <p className="mt-1 text-[18px] font-bold">30급 사다리로</p>
            <p className="mt-1 break-keep text-[13px] text-white/85">
              규칙을 익혔어요. 30급 파트를 열고 승급 시험까지 가 볼까요?
            </p>
            <button
              type="button"
              onClick={() => actions.setCurrentRank("g30")}
              className="mt-4 h-11 w-full rounded-xl bg-white text-[15px] font-semibold text-toss-blue active:scale-[0.98]"
            >
              30급 시작하기
            </button>
          </section>
        )}

        {(() => {
          const mod = p.module;
          if (!mod) return null;
          return (
            <section>
              <SectionHead
                eyebrow={`${mod.title} 사다리`}
                title={mod.title}
                blurb={mod.blurb}
                active={!p.moduleComplete && p.courseComplete}
                done={p.moduleComplete}
              />
              <div className="mt-3 space-y-2">
                <MissionRow
                  title={mod.intro.title}
                  subtitle={mod.intro.subtitle ?? "소개"}
                  state={stateOf(mod.intro.id)}
                  open={open === mod.intro.id}
                  onToggle={() => setOpen(open === mod.intro.id ? null : mod.intro.id)}
                  onStart={() => navigate(`/mission/${mod.intro.id}`)}
                />
                {mod.parts.map((part) => (
                  <MissionRow
                    key={part.id}
                    title={part.title}
                    subtitle={`${part.tag} · ${part.exercises.length}문제`}
                    state={stateOf(part.id)}
                    open={open === part.id}
                    onToggle={() => setOpen(open === part.id ? null : part.id)}
                    onStart={() => navigate(`/mission/${part.id}`)}
                  />
                ))}
              </div>

              {mod.exam && (
                <div className="mt-4 rounded-[22px] bg-white p-5 ring-1 ring-toss-line">
                  <p className="text-[12px] font-semibold text-toss-mute">승급 시험</p>
                  <p className="mt-1 text-[17px] font-bold text-toss-ink">10문제 · 8개 이상 통과</p>
                  <p className="mt-1 break-keep text-[13px] text-toss-mute">
                    {p.canTakeExam
                      ? "파트를 모두 끝냈어요. 시험에 도전해 보세요."
                      : p.examPassed
                        ? "이 급수 시험은 통과했어요."
                        : "파트를 모두 마치면 열려요."}
                  </p>
                  {p.canTakeExam && (
                    <div className="mt-4">
                      <PrimaryButton onClick={() => navigate(`/exam/${mod.rankId}`)}>시험 보기</PrimaryButton>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })()}

        {!p.module && p.rank.id !== "beginner" && (
          <p className="px-1 text-[14px] text-toss-mute">이 급수 파트가 곧 추가돼요. Course를 복습해 보세요.</p>
        )}
      </div>
    </Screen>
  );
}

function SectionHead({
  eyebrow,
  title,
  blurb,
  active,
  done,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`rounded-[22px] px-5 py-4 ${
        active ? "bg-toss-blue text-white" : done ? "bg-white text-toss-ink" : "bg-white/60 text-toss-mute"
      }`}
    >
      <p className={`text-[12px] font-semibold ${active ? "text-white/75" : "text-toss-mute"}`}>
        {eyebrow}
        {done && " · 완료"}
      </p>
      <p className="mt-0.5 text-[18px] font-bold tracking-tight">{title}</p>
      <p className={`mt-0.5 break-keep text-[13px] ${active ? "text-white/80" : "text-toss-mute"}`}>{blurb}</p>
    </div>
  );
}

function MissionRow({
  title,
  subtitle,
  state,
  open,
  onToggle,
  onStart,
}: {
  title: string;
  subtitle: string;
  state: NodeState;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  const locked = state === "locked";
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-toss-line">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            state === "done"
              ? "bg-toss-blue text-white"
              : state === "current"
                ? "bg-toss-blue/15 text-toss-blue ring-2 ring-toss-blue/30"
                : "bg-[#E5E8EB] text-toss-mute"
          }`}
        >
          {state === "done" ? "✓" : state === "locked" ? "·" : "▶"}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[15px] font-bold ${locked ? "text-toss-mute" : "text-toss-ink"}`}>{title}</span>
          <span className="block text-[12px] text-toss-mute">{subtitle}</span>
        </span>
        {state === "current" && (
          <span className="shrink-0 rounded-pill bg-toss-blue/10 px-2 py-0.5 text-[11px] font-semibold text-toss-blue">
            지금
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-toss-line px-4 py-3">
          <p className="break-keep text-[13px] text-toss-mute">
            {locked ? "앞 미션을 마치면 열려요" : "짧은 미션을 판 위에서 풀어요"}
          </p>
          {!locked && (
            <button
              type="button"
              onClick={onStart}
              className="mt-3 h-11 w-full rounded-xl bg-toss-blue text-[15px] font-semibold text-white active:scale-[0.98]"
            >
              {state === "done" ? "다시 하기" : "시작하기"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
