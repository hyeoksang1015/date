import { fail, json, kakaoSearch, toPlace, type Env } from '../../_shared';

/** GET /api/places/search?q=&lat=&lng= — 키워드 검색, 최대 8개. 좌표가 오면 가까운 순. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = new URL(request.url);
  const q = (u.searchParams.get('q') ?? '').trim();
  if (q.length < 2 || q.length > 50) return fail(400, '두 글자 이상 입력해주세요');
  const params: Record<string, string> = { query: q, size: '8' };
  const lat = Number(u.searchParams.get('lat'));
  const lng = Number(u.searchParams.get('lng'));
  if (lat && lng) Object.assign(params, { y: String(lat), x: String(lng), sort: 'distance' });
  try {
    const places = (await kakaoSearch(env, 'keyword', params)).map(toPlace);
    return json({ places }, 200, { 'cache-control': 'public, max-age=60' });
  } catch (e) {
    console.error(e);
    return fail(502, '검색이 잠깐 안 돼요. 다시 시도해주세요');
  }
};
