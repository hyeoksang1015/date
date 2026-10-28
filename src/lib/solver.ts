import type { PlaceInput, Stop } from '../types';
import { DAY_MIN } from './time';

export interface SolveResult {
  stops: Stop[];
  totalTravelMin: number;
  endMin: number;
  feasible: boolean;
}

/**
 * 방문 순서를 최적화한다(가장 이른 종료 시각, 동률이면 이동시간 합, 그다음 입력 순서).
 * 일찍 도착하면 오픈까지 기다릴 수 있으므로 상태별 가장 이른 완료 시각만 유지해도 최적이다.
 * O(n²·2ⁿ). 핀(first/last)은 강제한다. 어떤 순서로도 불가능하면 시간창을 무시한 순서로
 * 시간표를 만들고 feasible=false, 위반 지점에 CLOSED_CONFLICT를 단다.
 * @param places 방문할 장소 (1~10곳)
 * @param t (n+1)×(n+1) 이동시간 행렬(분). 0번은 출발지
 * @param startMin 출발 시각(자정 기준 분)
 */
export function solveCourse(places: PlaceInput[], t: number[][], startMin: number): SolveResult {
  const order = bestOrder(places, t, startMin, true) ?? bestOrder(places, t, startMin, false);
  if (!order) throw new Error('핀 조건을 만족하는 순서가 없어요');
  const r = simulate(places, t, startMin, order);
  return { ...r, feasible: r.stops.every((s) => !s.warnings.includes('CLOSED_CONFLICT')) };
}

function bestOrder(places: PlaceInput[], t: number[][], startMin: number, windows: boolean): number[] | null {
  const n = places.length;
  const full = (1 << n) - 1;
  const size = 1 << n;
  const time = Array.from({ length: size }, () => new Array<number>(n).fill(Infinity));
  const trav = Array.from({ length: size }, () => new Array<number>(n).fill(Infinity));
  const parent = Array.from({ length: size }, () => new Array<number>(n).fill(-1));

  const finish = (j: number, arrive: number): number => {
    const p = places[j];
    const begin = windows ? Math.max(arrive, p.openMin ?? 0) : arrive;
    const end = begin + p.stayMin;
    return windows && end > (p.closeMin ?? DAY_MIN) ? Infinity : end;
  };

  for (let i = 0; i < n; i++) {
    if (places[i].pin === 'last' && n > 1) continue;
    time[1 << i][i] = finish(i, startMin + t[0][i + 1]);
    trav[1 << i][i] = t[0][i + 1];
  }

  const path = (mask: number, i: number): number[] => {
    const order: number[] = [];
    while (i >= 0) {
      order.unshift(i);
      const p = parent[mask][i];
      mask ^= 1 << i;
      i = p;
    }
    return order;
  };
  // 시간 → 이동시간 → 입력 순서(사전순) 순으로 더 나은지.
  const better = (end: number, tr: number, order: () => number[], mask: number, j: number): boolean =>
    end < time[mask][j] ||
    (end === time[mask][j] && (tr < trav[mask][j] || (tr === trav[mask][j] && lexLess(order(), path(mask, j)))));

  for (let mask = 1; mask <= full; mask++) {
    for (let i = 0; i < n; i++) {
      if (time[mask][i] === Infinity) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j) || places[j].pin === 'first') continue;
        const next = mask | (1 << j);
        if (places[j].pin === 'last' && next !== full) continue;
        const end = finish(j, time[mask][i] + t[i + 1][j + 1]);
        const tr = trav[mask][i] + t[i + 1][j + 1];
        if (end !== Infinity && better(end, tr, () => [...path(mask, i), j], next, j)) {
          time[next][j] = end;
          trav[next][j] = tr;
          parent[next][j] = i;
        }
      }
    }
  }

  let last = -1;
  for (let i = 0; i < n; i++) {
    if (time[full][i] === Infinity) continue;
    if (last < 0 || better(time[full][i], trav[full][i], () => path(full, i), full, last)) last = i;
  }
  return last < 0 ? null : path(full, last);
}

const lexLess = (a: number[], b: number[]): boolean => {
  for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) return a[k] < b[k];
  return false;
};

function simulate(places: PlaceInput[], t: number[][], startMin: number, order: number[]): Omit<SolveResult, 'feasible'> {
  let clock = startMin;
  let prev = 0;
  let totalTravelMin = 0;
  const stops = order.map((i): Stop => {
    const place = places[i];
    const travelFromPrevMin = t[prev][i + 1];
    const arriveMin = clock + travelFromPrevMin;
    const startAt = Math.max(arriveMin, place.openMin ?? 0);
    const leaveMin = startAt + place.stayMin;
    const warnings: Stop['warnings'] = [];
    if (startAt > arriveMin) warnings.push('WAIT');
    if (leaveMin > (place.closeMin ?? DAY_MIN)) warnings.push('CLOSED_CONFLICT');
    totalTravelMin += travelFromPrevMin;
    clock = leaveMin;
    prev = i + 1;
    return { place, arriveMin, startMin: startAt, leaveMin, travelFromPrevMin, warnings };
  });
  return { stops, totalTravelMin, endMin: clock };
}
