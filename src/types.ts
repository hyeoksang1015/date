export type Mode = 'walk' | 'drive';
export type Occasion = 'none' | 'birthday' | 'anniversary';
export type Weather = 'clear' | 'rain' | 'hot' | 'cold';
export type Vibe = 'calm' | 'balanced' | 'active';
export type Category = 'meal' | 'cafe' | 'culture' | 'walk' | 'activity' | 'custom';
export type Pin = 'first' | 'last';

export interface DateProfile {
  occasion: Occasion;
  weather: Weather;
  vibe: Vibe;
}

/** 검색/후보 API가 돌려주는 장소. */
export interface Place {
  id: string;
  name: string;
  address: string;
  category: Category;
  lat: number;
  lng: number;
  url: string;
}

/** 솔버 입력. 시간은 자정 기준 분. */
export interface PlaceInput {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  category: Category;
  stayMin: number;
  openMin?: number;
  closeMin?: number;
  pin?: Pin;
}

/** 코스 구성 화면의 슬롯. place가 비어 있으면 솔버 입력에서 제외된다. */
export interface Slot {
  id: string;
  category: Category;
  defaultStayMin: number;
  pin?: Pin;
  place?: Place;
  stayMin?: number;
  openTime?: string;
  closeTime?: string;
}

export type WarningCode =
  | 'WAIT'
  | 'CLOSED_CONFLICT'
  | 'LONG_WALK_BAD_WEATHER'
  | 'OUTDOOR_BAD_WEATHER'
  | 'RESERVE_RECOMMENDED'
  | 'LONG_TRAVEL';

export interface Stop {
  place: PlaceInput;
  arriveMin: number;
  startMin: number;
  leaveMin: number;
  travelFromPrevMin: number;
  warnings: WarningCode[];
}

export interface CourseResult {
  profile: DateProfile;
  stops: Stop[];
  startMin: number;
  totalTravelMin: number;
  endMin: number;
  travelEstimated: boolean;
  feasible: boolean;
}

/** POST /api/courses 본문. */
export interface CourseInput {
  profile?: DateProfile;
  origin: { name: string; lat: number; lng: number };
  startTime: string;
  mode: Mode;
  places: {
    id: string;
    name: string;
    address?: string;
    lat: number;
    lng: number;
    category?: Category;
    stayMin: number;
    openTime?: string;
    closeTime?: string;
    pin?: Pin | null;
  }[];
}

export interface StoredCourse {
  input: CourseInput;
  result: CourseResult;
  createdAt: string;
}
