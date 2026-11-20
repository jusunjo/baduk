export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(key: string): string {
  const d = parseDay(key);
  const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${w})`;
}

export function daysUntil(key: string): number {
  const target = parseDay(key).getTime();
  const today = startOfToday().getTime();
  return Math.round((target - today) / 86400000);
}

export function dDayLabel(days: number): string {
  if (days < 0) return "지남";
  if (days === 0) return "D-Day";
  return `D-${days}`;
}
