/** 한수 브랜드 마크 — 파란 배경 + 흰·검 겹원 */
export function Logo({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="9" fill="#3182F6" />
      <circle cx="12.2" cy="16" r="7.2" fill="#FFFFFF" />
      <circle cx="19.8" cy="16" r="7.2" fill="#191F28" />
    </svg>
  );
}
