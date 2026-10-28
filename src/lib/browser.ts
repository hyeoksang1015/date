/** 브라우저 저장소 읽기. 막혀 있거나 비어 있으면 fallback. */
export function load<T>(storage: () => Storage, key: string, fallback: T): T {
  try {
    const v = storage().getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(storage: () => Storage, key: string, value: unknown): void {
  try {
    storage().setItem(key, JSON.stringify(value));
  } catch {
    // 저장소가 막혀 있어도 앱은 그대로 동작한다.
  }
}

/** JSON API 호출. 실패하면 서버가 준 문구로 Error를 던진다. */
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw Object.assign(new Error(body.error ?? '잠깐 문제가 생겼어요. 다시 시도해주세요'), { status: res.status });
  return body as T;
}

let seq = 0;
export const uid = (): string => `u${Date.now().toString(36)}${seq++}`;
