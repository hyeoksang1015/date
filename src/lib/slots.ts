import type { Category } from '../types';

export interface CategoryConfig {
  label: string;
  /** Material Symbols 아이콘 이름 */
  icon: string;
  outdoor: boolean;
  defaultStayMin: number;
  /** 카카오 category_group_code 검색 */
  kakaoCode?: string;
  /** 카카오 키워드 검색 (튜닝은 여기서) */
  keywords?: string[];
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  meal: { label: '식사', icon: 'restaurant', outdoor: false, defaultStayMin: 70, kakaoCode: 'FD6' },
  cafe: { label: '카페', icon: 'local_cafe', outdoor: false, defaultStayMin: 60, kakaoCode: 'CE7' },
  culture: { label: '문화', icon: 'palette', outdoor: false, defaultStayMin: 60, kakaoCode: 'CT1', keywords: ['서점', '전시'] },
  walk: { label: '산책', icon: 'park', outdoor: true, defaultStayMin: 40, kakaoCode: 'AT4', keywords: ['공원'] },
  activity: { label: '활동', icon: 'sports_esports', outdoor: false, defaultStayMin: 60, keywords: ['방탈출', '보드게임카페', '볼링장', '공방'] },
  custom: { label: '기타', icon: 'place', outdoor: false, defaultStayMin: 60 },
};

/** 카카오 category_group_code → 우리 카테고리. */
export function categoryFromKakao(code: string): Category {
  const hit = (Object.keys(CATEGORIES) as Category[]).find((c) => CATEGORIES[c].kakaoCode === code);
  return hit ?? 'custom';
}
