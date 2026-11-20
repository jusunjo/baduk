export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#3182F6" />
      <circle cx="12" cy="13" r="4.2" fill="#191F28" />
      <circle cx="20.5" cy="18.5" r="4.2" fill="#fff" stroke="#E5E8EB" strokeWidth="0.6" />
    </svg>
  );
}
