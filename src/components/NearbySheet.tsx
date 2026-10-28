import { useEffect, useRef, useState } from 'react';
import type { Category, Place, Weather } from '../types';
import { api } from '../lib/browser';
import { CATEGORIES } from '../lib/slots';
import { Icon } from './ui';

/** 슬롯 카테고리의 근처 후보 5개를 바텀시트로 보여준다. */
export function NearbySheet({ category, near, weather, onPick, onClose }: {
  category: Category;
  near: { lat: number; lng: number };
  weather: Weather;
  onPick: (p: Place) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setPlaces(null);
    setError('');
    const params = new URLSearchParams({ lat: String(near.lat), lng: String(near.lng), category, weather, limit: '5' });
    api<{ places: Place[] }>(`/api/places/nearby?${params}`, { signal: ctrl.signal })
      .then((r) => setPlaces(r.places))
      .catch((e) => !ctrl.signal.aborted && setError((e as Error).message));
    return () => ctrl.abort();
  }, [category, near.lat, near.lng, weather, retry]);

  return (
    <dialog ref={ref} className="sheet" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current.close()}>
      <div className="sheet-body">
        <div className="sheet-head">
          <h2>
            <Icon name={CATEGORIES[category].icon} /> 근처 {CATEGORIES[category].label} 후보예요
          </h2>
          <button className="icon-btn" onClick={() => ref.current?.close()} aria-label="닫기">
            <Icon name="close" />
          </button>
        </div>
        <p className="muted">평점이 아니라 거리 기준이에요. 마음에 드는 곳을 골라주세요.</p>
        {error ? (
          <p className="muted pad">
            {error}{' '}
            <button className="link" onClick={() => setRetry((n) => n + 1)}>
              다시 시도
            </button>
          </p>
        ) : !places ? (
          <p className="muted pad">근처를 둘러보는 중이에요…</p>
        ) : !places.length ? (
          <p className="muted pad">근처에 후보가 없어요. 직접 검색해주께.</p>
        ) : (
          <ul className="results">
            {places.map((p) => (
              <li key={p.id}>
                <button onClick={() => { onPick(p); ref.current?.close(); }}>
                  <b>{p.name}</b>
                  <small>{p.address}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
