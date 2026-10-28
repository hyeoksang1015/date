import { fail, type Env } from '../../_shared';

/** GET /api/courses/:id — 저장된 코스. 없거나 만료되면 404. */
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id);
  if (!/^[a-f0-9]{12}$/.test(id)) return fail(404, '코스를 찾을 수 없어요');
  const stored = await env.COURSES?.get(`course:${id}`);
  if (!stored) return fail(404, '코스를 찾을 수 없어요');
  return new Response(stored, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
};
