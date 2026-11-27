import { useCallback, useLayoutEffect, useState } from "react";

/**
 * 부모 칸의 너비·높이 중 작은 쪽에 맞춘 정사각형 한 변(px).
 * CSS aspect-square + max-height 조합은 iOS Safari에서 판이 아래 보기 버튼을 덮어서,
 * 실제 크기를 재서 정사각형을 직접 정해요.
 */
export function useSquareFit<T extends HTMLElement>(max = 320) {
  const [el, setEl] = useState<T | null>(null);
  const [side, setSide] = useState<number | null>(null);
  const ref = useCallback((node: T | null) => setEl(node), []);

  useLayoutEffect(() => {
    if (!el) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const h = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const next = Math.max(0, Math.floor(Math.min(w, h, max)));
      setSide((prev) => (prev === next ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el, max]);

  return { ref, side };
}
