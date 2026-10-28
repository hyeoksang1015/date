import { useCallback, useState } from 'react';
import type { Category, CourseInput, Pin, Place, Slot } from '../types';
import type { Go, PlanState } from '../App';
import { CATEGORIES } from '../lib/slots';
import { RECOMMENDED_COUNT } from '../lib/profile';
import { api, uid } from '../lib/browser';
import { profileBadge } from '../labels';
import { track } from '../analytics';
import { Footer, Header, Icon, Toast } from '../components/ui';
import { PlaceSearch } from '../components/PlaceSearch';
import { NearbySheet } from '../components/NearbySheet';

const MAX_PLACES = 6;
const PIN_LABEL: Record<Pin, string> = { first: '첫 코스 고정', last: '마지막 코스 고정' };
const ADDABLE = (Object.keys(CATEGORIES) as Category[]);

export function PlanPage({ plan, setPlan, go }: { plan: PlanState; setPlan: (p: PlanState) => void; go: Go }) {
  const [sheet, setSheet] = useState<string | null>(null);
  const [searching, setSearching] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const clearToast = useCallback(() => setToast(''), []);

  const { slots, origin } = plan;
  const filled = slots.filter((s) => s.place);
  const setSlots = (next: Slot[]) => setPlan({ ...plan, slots: next });
  const patch = (id: string, p: Partial<Slot>) => setSlots(slots.map((s) => (s.id === id ? { ...s, ...p } : s)));

  /** 슬롯 기준 좌표: 바로 앞에 채운 장소, 없으면 출발지. */
  const anchor = (i: number) => slots.slice(0, i).reverse().find((s) => s.place)?.place ?? origin;

  const fill = (slot: Slot, place: Place, source: 'nearby' | 'search') => {
    if (slots.some((s) => s.id !== slot.id && s.place?.id === place.id)) return setToast('이미 담은 장소예요');
    track('slot_filled', { source, category: slot.category });
    patch(slot.id, { place, stayMin: slot.stayMin ?? slot.defaultStayMin });
    setSearching(null);
  };

  const setPin = (slot: Slot, pin: Pin | undefined) =>
    // 첫/마지막 고정은 한 곳씩만.
    setSlots(slots.map((s) => (s.id === slot.id ? { ...s, pin } : pin && s.pin === pin ? { ...s, pin: undefined } : s)));

  const addSlot = (category: Category) => {
    track('place_added', { category });
    const id = uid();
    setSlots([...slots, { id, category, defaultStayMin: CATEGORIES[category].defaultStayMin }]);
    setAdding(false);
    setSearching(category === 'custom' ? id : null);
  };

  const create = async () => {
    if (!origin) return setToast('출발지를 먼저 정해주세요');
    track('course_create_click', { count: filled.length });
    const input: CourseInput = {
      ...(!plan.skipped && { profile: plan.profile }),
      origin: { name: origin.name, lat: origin.lat, lng: origin.lng },
      startTime: plan.startTime,
      mode: plan.mode,
      places: filled.map((s) => ({
        id: s.place!.id,
        name: s.place!.name,
        address: s.place!.address,
        lat: s.place!.lat,
        lng: s.place!.lng,
        category: s.category === 'custom' ? s.place!.category : s.category,
        stayMin: s.stayMin ?? s.defaultStayMin,
        ...(s.openTime && { openTime: s.openTime }),
        ...(s.closeTime && { closeTime: s.closeTime }),
        ...(s.pin && { pin: s.pin }),
      })),
    };
    setBusy(true);
    try {
      const { id, result } = await api<{ id: string; result: { feasible: boolean } }>('/api/courses', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      });
      track('course_created', { count: filled.length, mode: plan.mode, feasible: result.feasible, ...plan.profile, profile_skipped: plan.skipped });
      go(`/c/${id}`);
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sheetSlot = slots.find((s) => s.id === sheet);
  const sheetIndex = slots.findIndex((s) => s.id === sheet);
  const sheetNear = sheetIndex >= 0 ? anchor(sheetIndex) : undefined;

  return (
    <div className="page has-cta">
      <Header go={go} back={() => go('/')} />
      <main>
        <button className="badge-row" onClick={() => go('/')}>
          <span className="pill soft">
            <Icon name="tune" /> {plan.skipped ? '성향 고르기' : profileBadge(plan.profile)}
          </span>
          <span className="muted">탭해서 바꾸기</span>
        </button>

        <h1 className="title">
          가고 싶은 곳만 담아봐,
          <br />
          <em>동선</em>은 내가 짜주께!
        </h1>

        <section className="card stack">
          <h2 className="section-title">
            <Icon name="route" /> 동선 기본 세팅
          </h2>
          {origin ? (
            <div className="origin">
              <Icon name="my_location" />
              <div>
                <small className="muted">출발 장소</small>
                <b>{origin.name}</b>
              </div>
              <button className="btn soft sm" onClick={() => setPlan({ ...plan, origin: undefined })}>
                바꾸기
              </button>
            </div>
          ) : (
            <PlaceSearch placeholder="출발지 검색 (예: 성수역)" onPick={(p) => setPlan({ ...plan, origin: p })} />
          )}
          <div className="row">
            <label className="field grow">
              <span className="field-label">
                <Icon name="schedule" /> 출발 시간
              </span>
              <input type="time" step={600} value={plan.startTime} onChange={(e) => e.target.value && setPlan({ ...plan, startTime: e.target.value.slice(0, 5) })} />
            </label>
          </div>
          <div className="segmented" role="group" aria-label="이동 방법">
            <button aria-pressed={plan.mode === 'walk'} onClick={() => setPlan({ ...plan, mode: 'walk' })}>
              <Icon name="directions_walk" /> 뚜벅이
            </button>
            <button aria-pressed={plan.mode === 'drive'} onClick={() => setPlan({ ...plan, mode: 'drive' })}>
              <Icon name="directions_car" /> 드라이브
            </button>
          </div>
        </section>

        <div className="list-head">
          <h2 className="section-title">
            <Icon name="favorite" /> 담은 데이트 스팟
          </h2>
          <span className="muted">
            {filled.length}곳 담김 · 권장 {RECOMMENDED_COUNT[plan.profile.vibe]}곳
          </span>
        </div>

        {slots.map((slot, i) => {
          const cat = CATEGORIES[slot.category];
          const stay = slot.stayMin ?? slot.defaultStayMin;
          return (
            <article key={slot.id} className={slot.place ? 'card slot filled' : 'card slot'}>
              <div className="slot-head">
                <span className={`cat-icon c-${slot.category}`}>
                  <Icon name={cat.icon} />
                </span>
                <div className="grow">
                  {slot.place ? (
                    <>
                      <b className="place-name">{slot.place.name}</b>
                      <small className="muted">{slot.place.address}</small>
                    </>
                  ) : (
                    <>
                      <b>{cat.label}</b>
                      <small className="muted">권장 {slot.defaultStayMin}분 · 비어 있어요</small>
                    </>
                  )}
                </div>
                <button className="icon-btn" aria-label="슬롯 삭제" onClick={() => setSlots(slots.filter((s) => s.id !== slot.id))}>
                  <Icon name="close" />
                </button>
              </div>

              {slot.place ? (
                <div className="slot-body">
                  <div className="row between">
                    <span className="field-label">머물 시간</span>
                    <div className="stepper">
                      <button aria-label="10분 줄이기" disabled={stay <= 10} onClick={() => patch(slot.id, { stayMin: stay - 10 })}>
                        <Icon name="remove" />
                      </button>
                      <b>{stay}분</b>
                      <button aria-label="10분 늘리기" disabled={stay >= 240} onClick={() => patch(slot.id, { stayMin: stay + 10 })}>
                        <Icon name="add" />
                      </button>
                    </div>
                  </div>
                  <div className="row wrap">
                    {(['first', 'last'] as Pin[]).map((pin) => (
                      <button key={pin} className="chip sm" aria-pressed={slot.pin === pin} onClick={() => setPin(slot, slot.pin === pin ? undefined : pin)}>
                        <Icon name={pin === 'first' ? 'push_pin' : 'flag'} /> {PIN_LABEL[pin]}
                      </button>
                    ))}
                  </div>
                  <details className="hours">
                    <summary>영업시간 입력 (선택)</summary>
                    <div className="row">
                      <label className="field grow">
                        <span className="field-label">오픈</span>
                        <input type="time" value={slot.openTime ?? ''} onChange={(e) => patch(slot.id, { openTime: e.target.value.slice(0, 5) || undefined })} />
                      </label>
                      <label className="field grow">
                        <span className="field-label">마감</span>
                        <input type="time" value={slot.closeTime ?? ''} onChange={(e) => patch(slot.id, { closeTime: e.target.value.slice(0, 5) || undefined })} />
                      </label>
                    </div>
                  </details>
                  <button className="link" onClick={() => patch(slot.id, { place: undefined })}>
                    다른 곳으로 교체
                  </button>
                </div>
              ) : (
                <div className="slot-body">
                  <div className="row">
                    {slot.category !== 'custom' ? (
                      <button
                        className="btn soft grow"
                        onClick={() => {
                          if (!anchor(i)) return setToast('출발지를 먼저 정해주세요');
                          track('slot_nearby_click', { category: slot.category });
                          setSheet(slot.id);
                        }}
                      >
                        <Icon name="near_me" /> 근처 후보 보기
                      </button>
                    ) : null}
                    <button className="btn ghost grow" onClick={() => setSearching(searching === slot.id ? null : slot.id)}>
                      <Icon name="search" /> 직접 검색
                    </button>
                  </div>
                  {searching === slot.id ? (
                    <PlaceSearch placeholder={`${cat.label} 장소 검색`} near={anchor(i)} autoFocus onPick={(p) => fill(slot, p, 'search')} />
                  ) : null}
                </div>
              )}
            </article>
          );
        })}

        {!slots.length ? <p className="muted center pad">담은 곳이 없어요. 아래에서 장소를 추가해주께.</p> : null}

        {slots.length < MAX_PLACES ? (
          adding ? (
            <div className="card stack">
              <span className="field-label">어떤 곳을 추가할까요?</span>
              <div className="chips">
                {ADDABLE.map((c) => (
                  <button key={c} className="chip" onClick={() => addSlot(c)}>
                    <Icon name={CATEGORIES[c].icon} /> {CATEGORIES[c].label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button className="add-slot" onClick={() => setAdding(true)}>
              <Icon name="add" /> 장소 더 추가하기 <small>최대 {MAX_PLACES}곳</small>
            </button>
          )
        ) : null}

        <p className="muted center">권장 장소 수는 힌트일 뿐이에요. 순서는 짤 때 알아서 정해주께.</p>
      </main>
      <Footer go={go} />

      <div className="cta-bar">
        <button className="btn primary big" disabled={filled.length < 2 || busy} onClick={create}>
          <Icon name="auto_awesome" /> {busy ? '짜는 중…' : filled.length < 2 ? '두 곳 이상 담아주세요' : '황금 동선으로 짜줘!'}
        </button>
      </div>

      {sheetSlot && sheetNear ? (
        <NearbySheet
          category={sheetSlot.category}
          near={sheetNear}
          weather={plan.profile.weather}
          onPick={(p) => fill(sheetSlot, p, 'nearby')}
          onClose={() => setSheet(null)}
        />
      ) : null}
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
