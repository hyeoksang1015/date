import { useEffect, useState } from 'react';
import type { Place } from '../types';
import { api } from '../lib/browser';
import { Icon } from './ui';

type State = { status: 'idle' | 'loading' | 'done' } | { status: 'error'; message: string };

/** 카카오 키워드 검색. near가 있으면 가까운 순. */
export function PlaceSearch({ placeholder, near, onPick, autoFocus }: {
  placeholder: string;
  near?: { lat: number; lng: number };
  onPick: (p: Place) => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [state, setState] = useState<State>({ status: 'idle' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setPlaces([]);
      setState({ status: 'idle' });
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setState({ status: 'loading' });
      const params = new URLSearchParams({ q: query, ...(near && { lat: String(near.lat), lng: String(near.lng) }) });
      try {
        const res = await api<{ places: Place[] }>(`/api/places/search?${params}`, { signal: ctrl.signal });
        setPlaces(res.places);
        setState({ status: 'done' });
      } catch (e) {
        if (!ctrl.signal.aborted) setState({ status: 'error', message: (e as Error).message });
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, near?.lat, near?.lng, retry]);

  return (
    <div className="search">
      <label className="search-box">
        <Icon name="search" />
        <input
          type="search"
          value={q}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus={autoFocus}
          enterKeyHint="search"
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      {state.status === 'loading' ? <p className="muted pad">찾는 중이에요…</p> : null}
      {state.status === 'error' ? (
        <p className="muted pad">
          {state.message}{' '}
          <button className="link" onClick={() => setRetry((n) => n + 1)}>
            다시 시도
          </button>
        </p>
      ) : null}
      {state.status === 'done' && !places.length ? <p className="muted pad">결과가 없어요. 다른 이름으로 찾아봐주께.</p> : null}
      {places.length ? (
        <ul className="results">
          {places.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onPick(p);
                  setQ('');
                }}
              >
                <b>{p.name}</b>
                <small>{p.address}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
