export const XP_PER_DAILY = 15;
export const XP_PER_SIDE = 25;
export const XP_PENALTY_PER_MISSED_DAILY = 5;

export function xpForLevel(level: number): number {
  return Math.round(50 * Math.pow(level, 1.6));
}

export function totalXpToReachLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
}

export function levelFromTotalXp(totalXp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpForLevel(level) };
}

export function rankFromLevel(level: number): 'E' | 'D' | 'C' | 'B' | 'A' | 'S' {
  if (level >= 60) return 'S';
  if (level >= 45) return 'A';
  if (level >= 30) return 'B';
  if (level >= 18) return 'C';
  if (level >= 8) return 'D';
  return 'E';
}

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const ad = new Date(a + 'T00:00:00');
  const bd = new Date(b + 'T00:00:00');
  return Math.round((bd.getTime() - ad.getTime()) / 86_400_000);
}
