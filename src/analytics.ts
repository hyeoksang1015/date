import { load, save } from './lib/browser';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** 이벤트 기록(설계서 12장). GA가 붙어 있으면 gtag로, 아니면 개발 중 콘솔로. 개인정보는 넣지 않는다. */
export function track(name: string, props: Record<string, unknown> = {}): void {
  if (window.gtag) window.gtag('event', name, props);
  else if (import.meta.env.DEV) console.debug('[track]', name, props);
}

/** 14일 안에 다시 왔으면 return_visit. 익명 로컬 기록만 쓴다. */
export function trackReturnVisit(): void {
  const last = load<number>(() => localStorage, 'jj_last_visit', 0);
  const now = Date.now();
  if (last && now - last > 6 * 60 * 60 * 1000 && now - last < 14 * 24 * 60 * 60 * 1000) track('return_visit');
  save(() => localStorage, 'jj_last_visit', now);
}
