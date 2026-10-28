export const DAY_MIN = 24 * 60;

/**
 * "HH:mm"을 자정 기준 분으로 바꾼다.
 * @returns 형식이 틀리면 null
 */
export function parseHHmm(s: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

/** 자정 기준 분을 "HH:mm"으로 바꾼다. */
export function formatHHmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** 분을 "4시간 45분" 형태로 바꾼다. */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

export const round5 = (n: number): number => Math.round(n / 5) * 5;
export const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
