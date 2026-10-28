import type { Category } from '../../../src/types';
import { CATEGORIES } from '../../../src/lib/slots';
import { fail, json, kakaoSearch, toPlace, type Env, type KakaoPlace } from '../../_shared';

const NEARBY: Category[] = ['meal', 'cafe', 'culture', 'walk', 'activity'];
const RADIUS = '3000';

/**
 * GET /api/places/nearby?lat=&lng=&category=&weather=&limit=5
 * 거리순 + 같은 세부 카테고리 연속 2개 초과 금지. 날씨가 나쁘면 walk는 실내(culture)로 조회.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = new URL(request.url);
  const lat = Number(u.searchParams.get('lat'));
  const lng = Number(u.searchParams.get('lng'));
  let category = u.searchParams.get('category') as Category;
  const weather = u.searchParams.get('weather') ?? 'clear';
  const limit = Math.min(10, Math.max(1, Number(u.searchParams.get('limit')) || 5));
  if (!lat || !lng || !NEARBY.includes(category)) return fail(400, '요청 값을 확인해주세요');
  if (category === 'walk' && weather !== 'clear') category = 'culture';

  const { kakaoCode, keywords = [] } = CATEGORIES[category];
  const at = { x: String(lng), y: String(lat), radius: RADIUS, sort: 'distance', size: '15' };
  try {
    const lists = await Promise.all([
      ...(kakaoCode ? [kakaoSearch(env, 'category', { ...at, category_group_code: kakaoCode })] : []),
      ...keywords.map((query) => kakaoSearch(env, 'keyword', { ...at, query })),
    ]);
    const seen = new Set<string>();
    const all = lists.flat().filter((p) => !seen.has(p.id) && seen.add(p.id)).sort((a, b) => a.distance - b.distance);
    const places = diversify(all, limit).map((p) => ({ ...toPlace(p), category }));
    return json({ places }, 200, { 'cache-control': 'public, max-age=300' });
  } catch (e) {
    console.error(e);
    return fail(502, '후보를 못 불러왔어요. 다시 시도해주세요');
  }
};

/** 거리순을 유지하되 같은 세부 카테고리가 3번 연속 오지 않게 고른다. 부족하면 남은 것으로 채운다. */
function diversify(sorted: KakaoPlace[], limit: number): KakaoPlace[] {
  const picked: KakaoPlace[] = [];
  const rest: KakaoPlace[] = [];
  for (const p of sorted) {
    if (picked.length >= limit) break;
    const [a, b] = picked.slice(-2);
    if (a && b && a.sub === p.sub && b.sub === p.sub) rest.push(p);
    else picked.push(p);
  }
  return [...picked, ...rest].slice(0, limit);
}
