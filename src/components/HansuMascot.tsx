import { Logo } from "@/components/Logo";

/** 한수 비서 — 브랜드 로고 */
export function HansuMascot({
  size = 56,
  bounce = true,
  className = "",
}: {
  size?: number;
  bounce?: boolean;
  className?: string;
}) {
  return (
    <Logo
      size={size}
      className={`select-none ${bounce ? "animate-companion-bob" : ""} ${className}`}
    />
  );
}
