import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Confetti, MissionClearScreen, useCelebrate } from "@/components/Celebrate";
import { ConceptIntroOverlay } from "@/components/concept/ConceptIntroOverlay";
import { MissionPlay, type MissionCompleteStats } from "@/components/MissionPlay";
import { PrimaryButton, Screen } from "@/components/Screen";
import {
  findCourseLesson,
  findRankPart,
  findRankStage,
  getConceptIntroForMission,
  getRankModule,
} from "@/data/path";
import type { Exercise } from "@/data/path/types";
import { useProgress } from "@/lib/progress";
import { sfx, XP_MISSION_BONUS } from "@/lib/sfx";
import { actions, getState } from "@/lib/store";

export function MissionPlayPage() {
  const { missionId = "" } = useParams();
  return <Mission key={missionId} missionId={missionId} />;
}

function Mission({ missionId }: { missionId: string }) {
  const navigate = useNavigate();
  const p = useProgress();
  const [hearts, setHearts] = useState(5);
  const [step, setStep] = useState(0);
  const [total, setTotal] = useState(1);
  const [clear, setClear] = useState<{ title: string; xp: number } | null>(null);
  const { burst, celebrate } = useCelebrate();

  const conceptIntro = getConceptIntroForMission(missionId, p.rank?.id ?? null);
  const [showIntro, setShowIntro] = useState(() => {
    if (!conceptIntro) return false;
    return !getState().introSeen[conceptIntro.id];
  });

  let title = "";
  let subtitle: string | undefined;
  let exercises: Exercise[] | null = null;

  const courseHit = findCourseLesson(missionId);
  if (courseHit) {
    title = courseHit.lesson.title;
    subtitle = courseHit.lesson.subtitle;
    exercises = courseHit.lesson.exercises;
  } else if (p.rank) {
    const mod = getRankModule(p.rank.id);
    if (mod?.intro.id === missionId) {
      title = mod.intro.title;
      subtitle = mod.intro.subtitle;
      exercises = mod.intro.exercises;
    } else {
      const stageHit = findRankStage(p.rank.id, missionId);
      if (stageHit) {
        title = `${stageHit.part.tag} · ${stageHit.stage.title}`;
        subtitle = stageHit.stage.subtitle ?? stageHit.part.subtitle;
        exercises = stageHit.stage.exercises;
      } else {
        const partHit = findRankPart(p.rank.id, missionId);
        if (partHit) {
          title = partHit.part.title;
          subtitle = partHit.part.subtitle;
          exercises = partHit.part.exercises;
        }
      }
    }
  }

  useEffect(() => {
    if (!clear) return;
    celebrate({ confetti: "big" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clear]);

  if (!exercises) {
    return (
      <Screen onBack={() => navigate("/learn")} title="미션">
        <p className="mt-8 text-center text-toss-mute">미션을 찾을 수 없어요.</p>
      </Screen>
    );
  }

  const dismissIntro = () => {
    if (conceptIntro) actions.markIntroSeen(conceptIntro.id);
    setShowIntro(false);
  };

  const goHomeCelebrating = () => {
    navigate("/", { replace: true, state: { celebrateHome: true } });
  };

  if (showIntro && conceptIntro) {
    return (
      <Screen lesson fit onClose={() => navigate("/", { replace: true })}>
        <ConceptIntroOverlay intro={conceptIntro} onContinue={dismissIntro} onSkip={dismissIntro} />
      </Screen>
    );
  }

  if (clear) {
    return (
      <Screen lesson fit progress={1} onClose={goHomeCelebrating}>
        {burst && <Confetti key={burst.id} big={burst.big} originY={38} />}
        <MissionClearScreen
          title={clear.title}
          xp={clear.xp}
          streakDays={p.streakDays}
          onContinue={goHomeCelebrating}
        />
      </Screen>
    );
  }

  if (hearts <= 0) {
    return (
      <Screen lesson fit progress={1} hearts={0} onClose={() => navigate("/", { replace: true })}>
        <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
          <BrokenHeart />
          <p className="duo-t1 mt-4 text-[22px] font-extrabold">하트가 다 닳았어요</p>
          <p className="duo-t2 mt-2 break-keep text-[15px] font-semibold">잠깐 쉬었다가 다시 도전해 봐요.</p>
        </div>
        <div className="pb-[max(12px,env(safe-area-inset-bottom))]">
          <PrimaryButton
            night
            onClick={() => {
              sfx.play("tap");
              navigate("/", { replace: true });
            }}
          >
            홈으로
          </PrimaryButton>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      lesson
      fit
      progress={(step + 1) / Math.max(1, total)}
      hearts={hearts}
      onClose={() => navigate("/", { replace: true })}
    >
      <MissionPlay
        title={title}
        subtitle={subtitle}
        exercises={exercises}
        hearts={hearts}
        onHeartLost={() => setHearts((h) => Math.max(0, h - 1))}
        onStep={(i, t) => {
          setStep(i);
          setTotal(t);
        }}
        onComplete={(stats: MissionCompleteStats) => {
          const first = !getState().completed[missionId];
          actions.completeLesson(missionId);
          const bonus = first ? XP_MISSION_BONUS : 0;
          setClear({ title, xp: stats.xp + bonus });
        }}
      />
    </Screen>
  );
}

function BrokenHeart() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 text-[#FF4B4B]" aria-hidden>
      <path
        fill="currentColor"
        d="M32 54c-.8 0-1.5-.3-2.1-.9C22.4 46.5 16.8 41.6 14.4 37.2 12.4 33.5 12.6 28.8 15.2 25.6 17.8 22.3 22.2 21.3 25.6 23c1.3.7 2.4 1.7 3.2 3 .8-1.3 1.9-2.3 3.2-3 3.4-1.7 7.8-.7 10.4 2.6 2.6 3.2 2.8 7.9.8 11.6-2.4 4.4-8 9.3-15.5 15.9-.6.6-1.3.9-2.1.9Z"
      />
      <path d="M28 22 36 42" stroke="#131F24" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
