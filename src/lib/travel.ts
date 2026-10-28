import type { Mode } from '../types';

export interface LatLng {
  lat: number;
  lng: number;
}

/** 이동시간 공급자. 길찾기 API로 바꿀 때 이 인터페이스만 지키면 된다. */
export interface TravelTimeProvider {
  /** 분 단위 (n×n) 행렬. */
  matrix(points: LatLng[], mode: Mode): Promise<number[][]>;
}

/** 두 좌표 사이 직선거리(m). */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 우회계수, 분당 이동거리(m). 차량 25km/h.
const SPEED: Record<Mode, { detour: number; mPerMin: number }> = {
  walk: { detour: 1.3, mPerMin: 80 },
  drive: { detour: 1.4, mPerMin: 25000 / 60 },
};

/** 직선거리 × 우회계수 / 속도. 결과는 "예상" 값이다. */
export const haversineProvider: TravelTimeProvider = {
  async matrix(points, mode) {
    const { detour, mPerMin } = SPEED[mode];
    return points.map((a) => points.map((b) => Math.ceil((haversineMeters(a, b) * detour) / mPerMin)));
  },
};
