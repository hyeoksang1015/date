import { useCallback, useEffect, useState } from 'react';
import type { CourseInput, StoredCourse } from '../types';
import type { Go } from '../App';
import { api } from '../lib/browser';
import { formatDuration, formatHHmm } from '../lib/time';
import { CATEGORIES } from '../lib/slots';
import { MODE, mapUrl, profileBadge, WARNING } from '../labels';
import { track } from '../analytics';
import { Footer, Header, Icon, Toast } from '../components/ui';

export function CoursePage({ id, go, onEdit }: { id: string; go: Go; onEdit: (input: CourseInput) => void }) {
  const [course, setCourse] = useState<StoredCourse | null>(null);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [toast, setToast] = useState('');
  const clearToast = useCallback(() => setToast(''), []);

  useEffect(() => {
    setError(null);
    api<StoredCourse>(`/api/courses/${id}`)
      .then((c) => {
        setCourse(c);
        track('share_view', { referrer: document.referrer ? new URL(document.referrer).host : 'direct' });
      })
      .catch((e) => setError({ status: (e as { status?: number }).status, message: (e as Error).message }));
  }, [id, retry]);

  const url = location.href;
  const copy = async () => {
    track('share_click', { method: 'copy' });
    try {
      await navigator.clipboard.writeText(url);
      setToast('링크를 복사했어요');
    } catch {
      setToast('복사가 안 됐어요. 주소창의 링크를 써주세요');
    }
  };
  const share = async () => {
    if (!navigator.share) return copy();
    track('share_click', { method: 'native' });
    try {
      await navigator.share({ title: '짜주께 데이트 코스', text: '우리 데이트 코스 짜놨어!', url });
    } catch {
      // 사용자가 공유 창을 닫은 경우
    }
  };

  if (error) {
    return (
      <div className="page">
        <Header go={go} />
        <main className="empty">
          <Icon name={error.status === 404 ? 'heart_broken' : 'wifi_off'} />
          <h1>{error.status === 404 ? '코스가 만료됐거나 없어요' : error.message}</h1>
          <p className="muted">{error.status === 404 ? '공유 링크는 90일 동안 열려요.' : '잠깐 뒤에 다시 시도해주세요.'}</p>
          {error.status === 404 ? (
            <button className="btn primary big" onClick={() => go('/')}>
              새로 짜기
            </button>
          ) : (
            <button className="btn primary big" onClick={() => setRetry((n) => n + 1)}>
              다시 시도
            </button>
          )}
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page">
        <Header go={go} />
        <main className="empty">
          <Icon name="auto_awesome" />
          <p className="muted">코스를 불러오는 중이에요…</p>
        </main>
      </div>
    );
  }

  const { input, result } = course;
  const est = result.travelEstimated ? '약 ' : '';
  return (
    <div className="page">
      <Header go={go} back={() => go('/plan')} right={
        <button className="icon-btn" onClick={share} aria-label="공유">
          <Icon name="share" />
        </button>
      } />
      <main>
        {input.profile ? (
          <span className="pill soft">
            <Icon name="favorite" /> {profileBadge(result.profile)}
          </span>
        ) : null}
        <h1 className="title">
          두 사람만을 위한 코스,
          <br />
          <em>{result.feasible ? '예쁘게 싹 다 짰어!' : '조금 빠듯해요'}</em>
        </h1>
        {!result.feasible ? (
          <p className="notice warn">
            <Icon name="error" /> 영업시간 안에 모두 들르기 어려운 순서예요. 표시된 곳의 시간이나 장소를 바꿔보세요.
          </p>
        ) : null}

        <section className="card summary">
          <div>
            <small>총 데이트</small>
            <b>{formatDuration(result.endMin - result.startMin)}</b>
          </div>
          <div>
            <small>순수 이동</small>
            <b>{est}{formatDuration(result.totalTravelMin)}</b>
          </div>
          <div>
            <small>예상 종료</small>
            <b>{formatHHmm(result.endMin)}</b>
          </div>
        </section>

        <h2 className="section-title">
          <span className="dot" /> 오늘의 타임라인
        </h2>
        <ol className="timeline">
          <li className="node origin-node">
            <span className="marker">
              <Icon name="location_on" />
            </span>
            <div className="card flat">
              <small className="time">{input.startTime} 출발</small>
              <b>{input.origin.name}</b>
            </div>
          </li>
          {result.stops.map((s, i) => {
            const link = mapUrl(s.place.id);
            return (
              <li key={s.place.id} className="node">
                <span className="leg">
                  <Icon name={input.mode === 'walk' ? 'directions_walk' : 'directions_car'} /> {MODE[input.mode]} {est}{s.travelFromPrevMin}분
                </span>
                <span className="marker num">{i + 1}</span>
                <div className="card">
                  <div className="row between">
                    <small className="time">
                      {formatHHmm(s.startMin)} ~ {formatHHmm(s.leaveMin)} · {s.place.stayMin}분
                    </small>
                    <span className={`tag c-${s.place.category}`}>{CATEGORIES[s.place.category].label}</span>
                  </div>
                  <h3>{s.place.name}</h3>
                  {s.place.address ? <p className="muted">{s.place.address}</p> : null}
                  {s.place.pin ? <span className="pill soft sm">{s.place.pin === 'first' ? '첫 코스 고정' : '마지막 코스'}</span> : null}
                  {s.warnings.map((w) => (
                    <p key={w} className={w === 'CLOSED_CONFLICT' ? 'notice warn' : 'notice'}>
                      <Icon name={WARNING[w].icon} />
                      {w === 'WAIT' ? `오픈 전에 도착해요. ${s.startMin - s.arriveMin}분 기다려야 해요` : WARNING[w].text}
                    </p>
                  ))}
                  {link ? (
                    <a className="link" href={link} target="_blank" rel="noreferrer" onClick={() => track('map_open')}>
                      <Icon name="map" /> 지도에서 보기
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        {result.travelEstimated ? <p className="muted center">이동시간은 직선거리로 계산한 예상값이에요.</p> : null}

        <div className="actions">
          <div className="row">
            <button className="btn soft grow" onClick={copy}>
              <Icon name="link" /> 링크 복사
            </button>
            <button className="btn soft grow" onClick={share}>
              <Icon name="send" /> 코스 공유
            </button>
          </div>
          <button className="btn primary big" onClick={() => onEdit(input)}>
            <Icon name="shuffle" /> 마음에 안 들어? 다시 짜주께
          </button>
        </div>
      </main>
      <Footer go={go} />
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
