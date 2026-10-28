import { describe, expect, it } from 'vitest';
import type { DateProfile, Stop, Vibe } from '../types';
import { adjustStay, buildSlots, buildWarnings, DEFAULT_PROFILE } from './profile';
import { validateCourseInput } from './course';

const prof = (o: Partial<DateProfile>): DateProfile => ({ ...DEFAULT_PROFILE, ...o });
const cats = (p: DateProfile) => buildSlots(p).map((s) => s.category);
const stop = (category: Stop['place']['category'], travel: number): Stop => ({
  place: { id: category + travel, name: 'x', lat: 37.5, lng: 127, category, stayMin: 60 },
  arriveMin: 0, startMin: 0, leaveMin: 0, travelFromPrevMin: travel, warnings: [],
});

describe('buildSlots', () => {
  it('1. 3×2 조합이 9.5 표와 일치', () => {
    const table: Record<Vibe, [string[], string[]]> = {
      calm: [['cafe', 'meal', 'walk'], ['cafe', 'culture', 'meal']],
      balanced: [['meal', 'cafe', 'culture'], ['activity', 'cafe', 'meal']],
      active: [['activity', 'meal', 'cafe', 'walk'], ['activity', 'cafe', 'walk', 'meal']],
    };
    for (const vibe of Object.keys(table) as Vibe[]) {
      expect(cats(prof({ vibe }))).toEqual(table[vibe][0]);
      expect(cats(prof({ vibe, occasion: 'birthday' }))).toEqual(table[vibe][1]);
    }
    expect(buildSlots(prof({ vibe: 'calm' })).map((s) => s.defaultStayMin)).toEqual([75, 90, 50]);
  });

  it('2. 비 오면 walk→culture, 중복 culture는 cafe', () => {
    expect(cats(prof({ vibe: 'calm', weather: 'rain' }))).toEqual(['cafe', 'meal', 'culture']);
    expect(cats(prof({ vibe: 'active', occasion: 'anniversary', weather: 'rain' }))).toEqual(['activity', 'cafe', 'culture', 'meal']);
  });

  it('3. 기념일 → 마지막 meal + pin last + 90분', () => {
    for (const vibe of ['calm', 'balanced', 'active'] as Vibe[]) {
      const last = buildSlots(prof({ vibe, occasion: 'anniversary' })).at(-1)!;
      expect(last).toMatchObject({ category: 'meal', pin: 'last', defaultStayMin: 90 });
    }
  });

  it('4. 배율 후 5분 반올림, 10~240 clamp', () => {
    expect(adjustStay(50, 'active')).toBe(40);
    expect(adjustStay(70, 'calm')).toBe(90); // 87.5 → 90
    expect(adjustStay(5, 'balanced')).toBe(10);
    expect(adjustStay(220, 'calm')).toBe(240);
  });
});

describe('buildWarnings', () => {
  it('5. 비 + 도보 8분 → 경고, 맑음 + 15분 → 없음', () => {
    expect(buildWarnings([stop('cafe', 8)], prof({ weather: 'rain' }), 'walk')[0].warnings).toContain('LONG_WALK_BAD_WEATHER');
    expect(buildWarnings([stop('cafe', 15)], prof({}), 'walk')[0].warnings).toEqual([]);
    expect(buildWarnings([stop('cafe', 8)], prof({ weather: 'rain' }), 'drive')[0].warnings).toEqual([]);
  });

  it('6. 맑지 않은데 야외 장소 → OUTDOOR_BAD_WEATHER', () => {
    expect(buildWarnings([stop('walk', 1)], prof({ weather: 'cold' }), 'walk')[0].warnings).toEqual(['OUTDOOR_BAD_WEATHER']);
  });

  it('7. 기념일 마지막 meal → RESERVE_RECOMMENDED', () => {
    const r = buildWarnings([stop('cafe', 1), stop('meal', 1)], prof({ occasion: 'birthday' }), 'walk');
    expect(r[1].warnings).toEqual(['RESERVE_RECOMMENDED']);
    expect(r[0].warnings).toEqual([]);
  });

  it('8. 기본 성향이면 경고 없음', () => {
    expect(buildWarnings([stop('walk', 5), stop('meal', 5)], DEFAULT_PROFILE, 'walk').flatMap((s) => s.warnings)).toEqual([]);
  });
});

describe('validateCourseInput', () => {
  const base = {
    origin: { name: '강남역', lat: 37.498, lng: 127.027 },
    startTime: '14:00',
    mode: 'walk',
    places: [
      { id: 'a', name: 'A', lat: 37.5, lng: 127.03, stayMin: 60 },
      { id: 'b', name: 'B', lat: 37.51, lng: 127.03, stayMin: 60, closeTime: '21:00' },
    ],
  };
  it('정상 입력은 통과, 잘못된 입력은 문구', () => {
    expect(validateCourseInput(base)).toBeNull();
    expect(validateCourseInput({ ...base, places: base.places.slice(0, 1) })).not.toBeNull();
    expect(validateCourseInput({ ...base, mode: 'bus' })).not.toBeNull();
    expect(validateCourseInput({ ...base, places: [base.places[0], base.places[0]] })).not.toBeNull();
    expect(validateCourseInput({ ...base, places: [base.places[0], { ...base.places[1], openTime: '22:00' }] })).not.toBeNull();
    expect(validateCourseInput({ ...base, places: [{ ...base.places[0], stayMin: 5 }, base.places[1]] })).not.toBeNull();
  });
});
