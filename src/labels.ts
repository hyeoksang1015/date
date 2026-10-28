import type { DateProfile, Mode, Occasion, Vibe, WarningCode, Weather } from './types';

export const OCCASION: Record<Occasion, string> = { none: '평범한 날', birthday: '생일', anniversary: '기념일' };
export const WEATHER: Record<Weather, string> = { clear: '맑음', rain: '비', hot: '더움', cold: '추움' };
export const VIBE: Record<Vibe, string> = { calm: '느긋하게', balanced: '적당히', active: '활기차게' };
export const MODE: Record<Mode, string> = { walk: '도보', drive: '차' };

export const profileBadge = (p: DateProfile): string =>
  [VIBE[p.vibe], WEATHER[p.weather], p.occasion !== 'none' && OCCASION[p.occasion]].filter(Boolean).join(' · ');

export const WARNING: Record<WarningCode, { icon: string; text: string }> = {
  WAIT: { icon: 'hourglass_top', text: '오픈 전에 도착해요. 잠깐 기다려야 해요' },
  CLOSED_CONFLICT: { icon: 'block', text: '마감 전에 다 둘러보기 어려워요' },
  LONG_WALK_BAD_WEATHER: { icon: 'directions_walk', text: '오늘 날씨에 걷기엔 조금 긴 구간이에요' },
  OUTDOOR_BAD_WEATHER: { icon: 'umbrella', text: '야외 장소예요. 날씨 한 번 더 확인해주께' },
  RESERVE_RECOMMENDED: { icon: 'event_available', text: '특별한 날 식사예요. 예약해두면 마음 편해요' },
  LONG_TRAVEL: { icon: 'schedule', text: '이동이 1시간 넘게 걸려요' },
};

/** 카카오 장소 id면 카카오맵 상세 링크. */
export const mapUrl = (id: string): string | null =>
  id.startsWith('kakao:') ? `https://place.map.kakao.com/${id.slice(6)}` : null;
