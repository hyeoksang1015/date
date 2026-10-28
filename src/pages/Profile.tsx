import { useEffect, useState } from 'react';
import type { DateProfile, Occasion, Slot, Vibe, Weather } from '../types';
import type { Go, PlanState } from '../App';
import { buildSlots, DEFAULT_PROFILE, isSpecial } from '../lib/profile';
import { load, save, uid } from '../lib/browser';
import { track } from '../analytics';
import { ChipGroup, Footer, Header, Icon } from '../components/ui';

const LAST_KEY = 'jj_last_profile';

const OCCASIONS: { value: Occasion; label: string; icon: string }[] = [
  { value: 'none', label: '평범한 날', icon: 'sentiment_satisfied' },
  { value: 'birthday', label: '생일', icon: 'cake' },
  { value: 'anniversary', label: '기념일(100일 등)', icon: 'favorite' },
];
const WEATHERS: { value: Weather; label: string; icon: string }[] = [
  { value: 'clear', label: '맑음', icon: 'sunny' },
  { value: 'rain', label: '비', icon: 'rainy' },
  { value: 'hot', label: '더움', icon: 'thermostat' },
  { value: 'cold', label: '추움', icon: 'ac_unit' },
];
const VIBES: { value: Vibe; label: string; icon: string }[] = [
  { value: 'calm', label: '느긋하게', icon: 'self_improvement' },
  { value: 'balanced', label: '적당히', icon: 'directions_walk' },
  { value: 'active', label: '활기차게', icon: 'directions_run' },
];

/**
 * 새 템플릿에 이미 채운 장소를 같은 카테고리끼리 옮겨 담는다. 남는 장소는 뒤에 붙이고,
 * 6칸을 넘으면 빈 슬롯부터 뺀다.
 */
export function mergeSlots(fresh: Slot[], old: Slot[]): Slot[] {
  const pool = old.filter((s) => s.place);
  const merged = fresh.map((s) => {
    const k = pool.findIndex((o) => o.category === s.category);
    if (k < 0) return { ...s, id: uid() };
    const [o] = pool.splice(k, 1);
    return { ...s, id: uid(), place: o.place, stayMin: o.stayMin, openTime: o.openTime, closeTime: o.closeTime };
  });
  const all = [...merged, ...pool];
  for (let i = all.length - 1; all.length > 6 && i >= 0; i--) if (!all[i].place) all.splice(i, 1);
  return all;
}

export function ProfilePage({ plan, setPlan, go }: { plan: PlanState; setPlan: (p: PlanState) => void; go: Go }) {
  const last = load(() => localStorage, LAST_KEY, { profile: plan.profile, startTime: plan.startTime });
  const [profile, setProfile] = useState<DateProfile>(last.profile);
  const [startTime, setStartTime] = useState(last.startTime);
  const [timeTouched, setTimeTouched] = useState(false);

  useEffect(() => track('profile_step_view'), []);

  const pick = (patch: Partial<DateProfile>) => {
    const next = { ...profile, ...patch };
    // 기념일이면 저녁 식사로 끝나도록 16시 시작을 권한다. 직접 고른 시간은 건드리지 않는다.
    if (!timeTouched && patch.occasion) setStartTime(isSpecial(next) ? '16:00' : '14:00');
    setProfile(next);
  };

  const finish = (p: DateProfile, skipped: boolean) => {
    track(skipped ? 'profile_skipped' : 'profile_completed', skipped ? {} : { ...p });
    save(() => localStorage, LAST_KEY, { profile: p, startTime });
    setPlan({ ...plan, profile: p, skipped, startTime, slots: mergeSlots(buildSlots(p), plan.slots) });
    go('/plan');
  };

  return (
    <div className="page">
      <Header go={go} />
      <main>
        <section className="hero">
          <p className="eyebrow">
            <Icon name="auto_awesome" /> 10초면 끝나요
          </p>
          <h1>
            오늘은 <em>어떤 데이트</em>예요?
          </h1>
          <p className="sub">고르면 코스 구성부터 동선·시간표까지 짜주께.</p>
        </section>

        <div className="card stack">
          <ChipGroup label="오늘은" options={OCCASIONS} value={profile.occasion} onChange={(occasion) => pick({ occasion })} />
          <ChipGroup label="날씨는" options={WEATHERS} value={profile.weather} onChange={(weather) => pick({ weather })} />
          <ChipGroup label="분위기는" options={VIBES} value={profile.vibe} onChange={(vibe) => pick({ vibe })} />
          <label className="field">
            <span className="field-label">
              <Icon name="schedule" /> 시작 시간
            </span>
            <input
              type="time"
              step={600}
              value={startTime}
              onChange={(e) => {
                setTimeTouched(true);
                if (e.target.value) setStartTime(e.target.value.slice(0, 5));
              }}
            />
          </label>
        </div>

        <div className="actions">
          <button className="btn primary big" onClick={() => finish(profile, false)}>
            다음 <Icon name="arrow_forward" />
          </button>
          <button className="btn ghost" onClick={() => finish(DEFAULT_PROFILE, true)}>
            건너뛰기
          </button>
        </div>
      </main>
      <Footer go={go} />
    </div>
  );
}
