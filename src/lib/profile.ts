import type { Category, DateProfile, Mode, Slot, Stop, Vibe, Weather } from '../types';
import { clamp, round5 } from './time';
import { CATEGORIES } from './slots';

// 모든 수치는 초기값, 튜닝 대상 (설계서 9.4~9.5).

export const DEFAULT_PROFILE: DateProfile = { occasion: 'none', weather: 'clear', vibe: 'balanced' };

const STAY_MULT: Record<Vibe, number> = { calm: 1.25, balanced: 1, active: 0.8 };
export const RECOMMENDED_COUNT: Record<Vibe, number> = { calm: 3, balanced: 4, active: 5 };
const WALK_LIMIT: Record<Weather, number> = { clear: 20, hot: 10, cold: 10, rain: 7 };
const SPECIAL_MEAL_STAY = 90;

type Template = [Category, number][];
const TEMPLATES: Record<Vibe, { none: Template; special: Template }> = {
  calm: {
    none: [['cafe', 60], ['meal', 70], ['walk', 40]],
    special: [['cafe', 60], ['culture', 60], ['meal', 90]],
  },
  balanced: {
    none: [['meal', 70], ['cafe', 60], ['culture', 60]],
    special: [['activity', 60], ['cafe', 50], ['meal', 90]],
  },
  active: {
    none: [['activity', 90], ['meal', 70], ['cafe', 50], ['walk', 40]],
    special: [['activity', 90], ['cafe', 40], ['walk', 40], ['meal', 90]],
  },
};

/** 활동성 배율을 적용한 체류시간(5분 단위, 10~240). */
export function adjustStay(baseMin: number, vibe: Vibe): number {
  return clamp(round5(baseMin * STAY_MULT[vibe]), 10, 240);
}

export const isSpecial = (p: DateProfile): boolean => p.occasion !== 'none';

/**
 * 성향으로 슬롯 템플릿을 만든다. 순서는 표시용 힌트이고 실제 순서는 솔버가 정한다.
 * 날씨가 맑지 않으면 walk → culture(이미 있으면 cafe). 기념일이면 마지막 식사를 90분 고정 + pin last.
 */
export function buildSlots(profile: DateProfile): Slot[] {
  const special = isSpecial(profile);
  const tpl = TEMPLATES[profile.vibe][special ? 'special' : 'none'];
  const cats = tpl.map(([c]) => c);
  return tpl.map(([category, base], i): Slot => {
    let cat = category;
    if (cat === 'walk' && profile.weather !== 'clear') cat = cats.includes('culture') ? 'cafe' : 'culture';
    const last = special && i === tpl.length - 1;
    // 기념일 식사는 설계서 15.2-3대로 배율 없이 90분.
    return { id: `s${i}`, category: cat, defaultStayMin: last ? SPECIAL_MEAL_STAY : adjustStay(base, profile.vibe), ...(last && { pin: 'last' as const }) };
  });
}

/** 성향 기반 경고를 붙인 새 stops를 돌려준다. */
export function buildWarnings(stops: Stop[], profile: DateProfile, mode: Mode): Stop[] {
  return stops.map((s, i) => {
    const w = [...s.warnings];
    if (mode === 'walk' && s.travelFromPrevMin > WALK_LIMIT[profile.weather]) w.push('LONG_WALK_BAD_WEATHER');
    if (profile.weather !== 'clear' && CATEGORIES[s.place.category].outdoor) w.push('OUTDOOR_BAD_WEATHER');
    if (isSpecial(profile) && i === stops.length - 1 && s.place.category === 'meal') w.push('RESERVE_RECOMMENDED');
    if (s.travelFromPrevMin > 60) w.push('LONG_TRAVEL');
    return { ...s, warnings: w };
  });
}
