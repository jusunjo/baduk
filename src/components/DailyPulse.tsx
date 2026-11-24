export function DailyPulse({
  streak,
  missionDone,
  onMissionClick,
}: {
  streak: number;
  missionDone: boolean;
  onMissionClick?: () => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-toss-soft2 px-3.5 py-2.5">
        <StreakMark active={streak > 0} />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-toss-mute">연속 학습</p>
          <p className="text-[15px] font-bold tabular-nums tracking-tight text-toss-ink">
            {streak > 0 ? `${streak}일째` : "오늘부터 OK"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onMissionClick}
        disabled={missionDone || !onMissionClick}
        className={`flex flex-1 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left transition active:scale-[0.99] disabled:active:scale-100 ${
          missionDone ? "bg-toss-green/10 ring-1 ring-toss-green/20" : "bg-toss-blue/10 ring-1 ring-toss-blue/20"
        }`}
      >
        <MissionMark done={missionDone} />
        <div className="min-w-0">
          <p className={`text-[12px] font-semibold ${missionDone ? "text-toss-green" : "text-toss-blue"}`}>오늘 미션</p>
          <p className="truncate text-[15px] font-bold tracking-tight text-toss-ink">
            {missionDone ? "오늘도 해냈어요" : "가볍게 한 판"}
          </p>
        </div>
      </button>
    </div>
  );
}

function StreakMark({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        active ? "bg-[#FFEDD5] text-[#EA580C]" : "bg-white text-toss-mute"
      }`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 3c1.2 2.4-.2 4.2-1.4 5.5C9.2 10 8 11.4 8 14a4 4 0 0 0 8 0c0-2.2-1-3.8-2-5.2-.8-1.2-1.4-2.2-1.2-3.8.6 1 .8 1.8 1.6 2.8C16.2 9.8 18 11.6 18 14.2A6 6 0 0 1 6 14c0-3.2 2.2-5.2 3.8-6.8C11 5.8 11.4 4.6 12 3Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function MissionMark({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        done ? "bg-toss-green text-white" : "bg-toss-blue text-white"
      }`}
      aria-hidden
    >
      {done ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="m6.5 12.2 3.6 3.6L17.5 8.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="9.5" cy="11" r="4" fill="#191F28" />
          <circle cx="15" cy="14.5" r="4" fill="#fff" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      )}
    </span>
  );
}
