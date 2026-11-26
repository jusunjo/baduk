/** 출구가 하나씩 막히면 방 안 친구가 나가지 못하는 일상 비유 애니 */
export function CaptureDoorsAnim({ playing = true }: { playing?: boolean }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]" aria-hidden>
      <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="cap-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A3A42" />
            <stop offset="100%" stopColor="#1A262C" />
          </linearGradient>
        </defs>

        {/* 방 */}
        <rect x="40" y="40" width="120" height="120" rx="14" fill="url(#cap-floor)" stroke="#37464F" strokeWidth="3" />

        {/* 네 출구 — 위·오른·아래·왼 순으로 막힘 */}
        <g className={playing ? "cap-door cap-door-1" : "cap-door-done"}>
          <rect x="82" y="34" width="36" height="14" rx="4" fill="#4CC3FF" />
        </g>
        <g className={playing ? "cap-door cap-door-2" : "cap-door-done"}>
          <rect x="152" y="82" width="14" height="36" rx="4" fill="#4CC3FF" />
        </g>
        <g className={playing ? "cap-door cap-door-3" : "cap-door-done"}>
          <rect x="82" y="152" width="36" height="14" rx="4" fill="#4CC3FF" />
        </g>
        <g className={playing ? "cap-door cap-door-4" : "cap-door-done"}>
          <rect x="34" y="82" width="14" height="36" rx="4" fill="#4CC3FF" />
        </g>

        {/* 막힌 문 (회색 블록) */}
        <g className={playing ? "cap-block cap-block-1" : "opacity-100"}>
          <rect x="82" y="34" width="36" height="14" rx="4" fill="#FF6B6B" />
        </g>
        <g className={playing ? "cap-block cap-block-2" : "opacity-100"}>
          <rect x="152" y="82" width="14" height="36" rx="4" fill="#FF6B6B" />
        </g>
        <g className={playing ? "cap-block cap-block-3" : "opacity-100"}>
          <rect x="82" y="152" width="36" height="14" rx="4" fill="#FF6B6B" />
        </g>
        <g className={playing ? "cap-block cap-block-4" : "opacity-100"}>
          <rect x="34" y="82" width="14" height="36" rx="4" fill="#FF6B6B" />
        </g>

        {/* 방 안 친구 (흰 돌 느낌) */}
        <g className={playing ? "cap-friend" : "cap-friend-gone"}>
          <circle cx="100" cy="100" r="22" fill="#F7F8FA" stroke="#D1D5DB" strokeWidth="2" />
          <circle cx="93" cy="96" r="3.2" fill="#1A1F27" />
          <circle cx="107" cy="96" r="3.2" fill="#1A1F27" />
          <path d="M93 108c4 5 10 5 14 0" fill="none" stroke="#1A1F27" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* 들어내기 이펙트 */}
        <g className={playing ? "cap-poof" : "opacity-0"}>
          <circle cx="100" cy="100" r="8" fill="#FFB020" opacity="0.85" />
          <circle cx="88" cy="90" r="4" fill="#FFB020" opacity="0.7" />
          <circle cx="114" cy="92" r="5" fill="#FFB020" opacity="0.7" />
          <circle cx="96" cy="114" r="3.5" fill="#FFB020" opacity="0.65" />
        </g>
      </svg>
    </div>
  );
}
