import type { Place } from '../src/types';
import { categoryFromKakao } from '../src/lib/slots';

export interface Env {
  KAKAO_REST_KEY?: string;
  COURSES?: KVNamespace;
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...headers } });

export const fail = (status: number, error: string): Response => json({ error }, status);

interface KakaoDoc {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance?: string;
}

export interface KakaoPlace extends Place {
  /** 세부 카테고리(category_name 마지막 단계), 다양성 정렬용 */
  sub: string;
  distance: number;
}

/**
 * 카카오 로컬 검색(keyword|category)을 호출해 Place로 바꾼다.
 * @throws 키가 없거나 카카오가 실패하면 Error
 */
export async function kakaoSearch(env: Env, kind: 'keyword' | 'category', params: Record<string, string>): Promise<KakaoPlace[]> {
  if (!env.KAKAO_REST_KEY) throw new Error('KAKAO_REST_KEY 미설정');
  const url = `https://dapi.kakao.com/v2/local/search/${kind}.json?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${env.KAKAO_REST_KEY}` } });
  if (!res.ok) throw new Error(`kakao ${res.status}`);
  const body = (await res.json()) as { documents: KakaoDoc[] };
  return body.documents.map((d) => ({
    id: `kakao:${d.id}`,
    name: d.place_name,
    address: d.road_address_name || d.address_name,
    category: categoryFromKakao(d.category_group_code),
    lat: Number(d.y),
    lng: Number(d.x),
    url: d.place_url,
    sub: d.category_name.split('>').at(-1)!.trim(),
    distance: Number(d.distance ?? 0),
  }));
}

/** sub/distance를 빼고 응답용 Place만 남긴다. */
export const toPlace = ({ sub: _s, distance: _d, ...p }: KakaoPlace): Place => p;
