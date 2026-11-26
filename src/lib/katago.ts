import type { StoneColor } from "@/data/curriculum";

export type KataMove =
  | { color: StoneColor; gtp: string; pass?: false }
  | { color: StoneColor; pass: true; gtp?: undefined };

export type KataMoveResponse = {
  move: string;
  winrate: number | null;
  scoreLead: number | null;
  visits: number | null;
  usageVisits?: number | null;
};

const base = () => (import.meta.env.VITE_KATAGO_URL?.trim() || "http://localhost:8787").replace(/\/$/, "");

export async function fetchKataHealth(): Promise<{ ok: boolean; hasKey: boolean }> {
  const res = await fetch(`${base()}/api/katago/health`);
  if (!res.ok) throw new Error(`katago health ${res.status}`);
  return res.json() as Promise<{ ok: boolean; hasKey: boolean }>;
}

export async function fetchKataMove(opts: {
  size: number;
  moves: KataMove[];
  maxVisits?: number;
}): Promise<KataMoveResponse> {
  const res = await fetch(`${base()}/api/katago/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      size: opts.size,
      moves: opts.moves,
      maxVisits: opts.maxVisits ?? 50,
    }),
  });
  const data = (await res.json()) as KataMoveResponse & { error?: string };
  if (!res.ok) throw new Error(data.error || `katago ${res.status}`);
  return data;
}
