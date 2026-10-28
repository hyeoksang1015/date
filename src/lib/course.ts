import type { Category, CourseInput, CourseResult, PlaceInput } from '../types';
import { buildWarnings, DEFAULT_PROFILE } from './profile';
import { solveCourse } from './solver';
import { parseHHmm } from './time';
import { CATEGORIES } from './slots';
import type { TravelTimeProvider } from './travel';

const OCCASIONS = ['none', 'birthday', 'anniversary'];
const WEATHERS = ['clear', 'rain', 'hot', 'cold'];
const VIBES = ['calm', 'balanced', 'active'];

const isStr = (v: unknown, max: number): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
// 카카오 로컬 데이터 범위(한국) 기준.
const inKorea = (lat: unknown, lng: unknown): boolean =>
  typeof lat === 'number' && typeof lng === 'number' && lat >= 32 && lat <= 39.5 && lng >= 124 && lng <= 132;
const optTime = (v: unknown): boolean => v === undefined || v === null || v === '' || (typeof v === 'string' && parseHHmm(v) !== null);

/**
 * POST /api/courses 본문을 검증한다.
 * @returns 올바르면 null, 아니면 사용자에게 보여줄 에러 문구
 */
export function validateCourseInput(b: unknown): string | null {
  if (!b || typeof b !== 'object') return '요청 형식이 올바르지 않아요';
  const x = b as Record<string, any>;
  if (x.profile !== undefined) {
    const p = x.profile;
    if (!p || !OCCASIONS.includes(p.occasion) || !WEATHERS.includes(p.weather) || !VIBES.includes(p.vibe)) return '성향 값이 올바르지 않아요';
  }
  if (!x.origin || !isStr(x.origin.name, 100) || !inKorea(x.origin.lat, x.origin.lng)) return '출발지를 확인해주세요';
  if (typeof x.startTime !== 'string' || parseHHmm(x.startTime) === null) return '시작 시간을 확인해주세요';
  if (x.mode !== 'walk' && x.mode !== 'drive') return '이동수단을 확인해주세요';
  if (!Array.isArray(x.places) || x.places.length < 2 || x.places.length > 6) return '장소는 2~6곳이어야 해요';
  const ids = new Set<string>();
  let firsts = 0;
  let lasts = 0;
  for (const p of x.places) {
    if (!p || !isStr(p.id, 64) || !isStr(p.name, 100) || !inKorea(p.lat, p.lng)) return '장소 정보가 올바르지 않아요';
    if (p.address !== undefined && (typeof p.address !== 'string' || p.address.length > 200)) return '장소 정보가 올바르지 않아요';
    if (ids.has(p.id)) return '같은 장소가 두 번 들어있어요';
    ids.add(p.id);
    if (p.category !== undefined && !(p.category in CATEGORIES)) return '카테고리가 올바르지 않아요';
    if (!Number.isInteger(p.stayMin) || p.stayMin < 10 || p.stayMin > 240) return '머무는 시간은 10~240분이어야 해요';
    if (!optTime(p.openTime) || !optTime(p.closeTime)) return '영업시간 형식을 확인해주세요';
    if (p.openTime && p.closeTime && parseHHmm(p.closeTime)! <= parseHHmm(p.openTime)!) return '마감 시각은 오픈보다 늦어야 해요 (자정 넘김은 아직 지원 안 해요)';
    if (p.pin !== undefined && p.pin !== null && p.pin !== 'first' && p.pin !== 'last') return '고정 값이 올바르지 않아요';
    if (p.pin === 'first') firsts++;
    if (p.pin === 'last') lasts++;
  }
  if (firsts > 1 || lasts > 1) return '첫 코스/마지막 코스 고정은 한 곳씩만 할 수 있어요';
  return null;
}

/** 검증된 입력으로 코스를 짠다. */
export async function buildCourse(input: CourseInput, provider: TravelTimeProvider): Promise<CourseResult> {
  const profile = input.profile ?? DEFAULT_PROFILE;
  const startMin = parseHHmm(input.startTime)!;
  const places: PlaceInput[] = input.places.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    category: (p.category ?? 'custom') as Category,
    stayMin: p.stayMin,
    openMin: p.openTime ? parseHHmm(p.openTime)! : undefined,
    closeMin: p.closeTime ? parseHHmm(p.closeTime)! : undefined,
    pin: p.pin ?? undefined,
  }));
  const t = await provider.matrix([input.origin, ...places], input.mode);
  const solved = solveCourse(places, t, startMin);
  return {
    ...solved,
    profile,
    startMin,
    stops: buildWarnings(solved.stops, profile, input.mode),
    travelEstimated: true,
  };
}
