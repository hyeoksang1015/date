import { useEffect, useState } from 'react';
import type { CourseInput, DateProfile, Mode, Place, Slot } from './types';
import { DEFAULT_PROFILE } from './lib/profile';
import { load, save } from './lib/browser';
import { mapUrl } from './labels';
import { ProfilePage } from './pages/Profile';
import { PlanPage } from './pages/Plan';
import { CoursePage } from './pages/Course';
import { PrivacyPage } from './pages/Privacy';

export interface PlanState {
  profile: DateProfile;
  skipped: boolean;
  startTime: string;
  origin?: Place;
  mode: Mode;
  slots: Slot[];
}

export type Go = (to: string) => void;

const PLAN_KEY = 'jj_plan';
const initial: PlanState = { profile: DEFAULT_PROFILE, skipped: false, startTime: '14:00', mode: 'walk', slots: [] };

/** 저장된 코스 입력을 다시 편집 가능한 상태로 되돌린다("다시 짜기"). */
export function stateFromInput(input: CourseInput): PlanState {
  return {
    profile: input.profile ?? DEFAULT_PROFILE,
    skipped: !input.profile,
    startTime: input.startTime,
    mode: input.mode,
    origin: { id: 'origin', name: input.origin.name, address: '', category: 'custom', lat: input.origin.lat, lng: input.origin.lng, url: '' },
    slots: input.places.map((p) => ({
      id: p.id,
      category: p.category ?? 'custom',
      defaultStayMin: p.stayMin,
      pin: p.pin ?? undefined,
      place: { id: p.id, name: p.name, address: p.address ?? '', category: p.category ?? 'custom', lat: p.lat, lng: p.lng, url: mapUrl(p.id) ?? '' },
      stayMin: p.stayMin,
      openTime: p.openTime,
      closeTime: p.closeTime,
    })),
  };
}

export function App() {
  const [path, setPath] = useState(location.pathname);
  const [plan, setPlanRaw] = useState<PlanState>(() => load(() => sessionStorage, PLAN_KEY, initial));

  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, []);

  const setPlan = (next: PlanState) => {
    setPlanRaw(next);
    save(() => sessionStorage, PLAN_KEY, next);
  };
  const go: Go = (to) => {
    history.pushState(null, '', to);
    setPath(to);
    scrollTo(0, 0);
  };

  const courseId = /^\/c\/([^/]+)\/?$/.exec(path)?.[1];
  if (courseId) return <CoursePage id={courseId} go={go} onEdit={(input) => { setPlan(stateFromInput(input)); go('/plan'); }} />;
  if (path === '/plan') return <PlanPage plan={plan} setPlan={setPlan} go={go} />;
  if (path === '/privacy') return <PrivacyPage go={go} />;
  return <ProfilePage plan={plan} setPlan={setPlan} go={go} />;
}
