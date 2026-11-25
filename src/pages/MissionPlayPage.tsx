import { useNavigate, useParams } from "react-router-dom";
import { MissionPlay } from "@/components/MissionPlay";
import { Screen } from "@/components/Screen";
import { findCourseLesson, findRankPart, getRankModule } from "@/data/path";
import type { Exercise } from "@/data/path/types";
import { useProgress } from "@/lib/progress";
import { sfx } from "@/lib/sfx";
import { actions } from "@/lib/store";

export function MissionPlayPage() {
  const { missionId = "" } = useParams();
  return <Mission key={missionId} missionId={missionId} />;
}

function Mission({ missionId }: { missionId: string }) {
  const navigate = useNavigate();
  const p = useProgress();

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
      const partHit = findRankPart(p.rank.id, missionId);
      if (partHit) {
        title = partHit.part.title;
        subtitle = partHit.part.subtitle;
        exercises = partHit.part.exercises;
      }
    }
  }

  if (!exercises) {
    return (
      <Screen onBack={() => navigate("/learn")} title="미션">
        <p className="mt-8 text-center text-toss-mute">미션을 찾을 수 없어요.</p>
      </Screen>
    );
  }

  return (
    <Screen fit onBack={() => navigate("/learn")} title={title}>
      <MissionPlay
        title={title}
        subtitle={subtitle}
        exercises={exercises}
        onComplete={() => {
          actions.completeLesson(missionId);
          sfx.play("xp");
          navigate("/", { replace: true });
        }}
      />
    </Screen>
  );
}
