import type { CourseInput, StoredCourse } from '../../../src/types';
import { buildCourse, validateCourseInput } from '../../../src/lib/course';
import { haversineProvider } from '../../../src/lib/travel';
import { fail, json, type Env } from '../../_shared';

const TTL_SEC = 90 * 24 * 60 * 60;

/** POST /api/courses — 코스를 짜서 KV에 저장하고 {id, result}를 돌려준다. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.COURSES) return fail(500, '저장소가 설정되지 않았어요');
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, '요청 형식이 올바르지 않아요');
  }
  const error = validateCourseInput(body);
  if (error) return fail(400, error);

  const input = body as CourseInput;
  const result = await buildCourse(input, haversineProvider);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const stored: StoredCourse = { input, result, createdAt: new Date().toISOString() };
  await env.COURSES.put(`course:${id}`, JSON.stringify(stored), { expirationTtl: TTL_SEC });
  return json({ id, result }, 201);
};
