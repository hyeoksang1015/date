import { describe, expect, it } from 'vitest';
import type { PlaceInput } from '../types';
import { solveCourse } from './solver';

const p = (id: string, extra: Partial<PlaceInput> = {}): PlaceInput => ({
  id, name: id, lat: 37.5, lng: 127, category: 'custom', stayMin: 60, ...extra,
});

/** 1차원 좌표로 대칭 이동시간 행렬을 만든다. 0번은 출발지(좌표 0). */
const line = (xs: number[]): number[][] => {
  const all = [0, ...xs];
  return all.map((a) => all.map((b) => Math.abs(a - b)));
};

const ids = (r: ReturnType<typeof solveCourse>) => r.stops.map((s) => s.place.id);

describe('solveCourse', () => {
  it('1. 제약 없으면 이동시간 합 최소 순서', () => {
    const r = solveCourse([p('far'), p('near')], line([30, 10]), 600);
    expect(ids(r)).toEqual(['near', 'far']);
    expect(r.totalTravelMin).toBe(30);
    expect(r.feasible).toBe(true);
  });

  it('2. 일찍 닫는 곳은 앞으로', () => {
    const places = [p('a'), p('b'), p('c'), p('early', { closeMin: 600 + 40 + 60 })];
    const r = solveCourse(places, line([5, 10, 15, 40]), 600);
    expect(ids(r)[0]).toBe('early');
    expect(r.feasible).toBe(true);
  });

  it('3. first/last 핀 준수', () => {
    const places = [p('a', { pin: 'last' }), p('b'), p('c', { pin: 'first' })];
    const r = solveCourse(places, line([1, 2, 50]), 600);
    expect(ids(r)).toEqual(['c', 'b', 'a']);
  });

  it('4. 오픈 전 도착하면 WAIT과 대기 반영', () => {
    const r = solveCourse([p('a', { openMin: 720 }), p('b', { openMin: 720 })], line([10, 20]), 600);
    expect(r.stops[0].warnings).toContain('WAIT');
    expect(r.stops[0].startMin).toBe(720);
  });

  it('5. 불가능하면 feasible=false + CLOSED_CONFLICT', () => {
    const r = solveCourse([p('a', { closeMin: 630 }), p('b', { closeMin: 630 })], line([10, 20]), 600);
    expect(r.feasible).toBe(false);
    expect(r.stops.some((s) => s.warnings.includes('CLOSED_CONFLICT'))).toBe(true);
  });

  it('6. 같은 입력이면 같은 결과 (동률은 입력 순서)', () => {
    const places = [p('a'), p('b'), p('c')];
    const t = line([10, 10, 10]);
    expect(ids(solveCourse(places, t, 600))).toEqual(['a', 'b', 'c']);
    expect(solveCourse(places, t, 600)).toEqual(solveCourse(places, t, 600));
  });

  it('7. n=6 최악 케이스 50ms 미만', () => {
    const places = Array.from({ length: 6 }, (_, i) => p(`p${i}`, { openMin: 600 + i * 7, closeMin: 1200 }));
    const t = line([3, 17, 8, 25, 12, 30]);
    const t0 = performance.now();
    solveCourse(places, t, 600);
    expect(performance.now() - t0).toBeLessThan(50);
  });
});
