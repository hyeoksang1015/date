import { useEffect, type ReactNode } from 'react';
import type { Go } from '../App';

export const Icon = ({ name, fill }: { name: string; fill?: boolean }) => (
  <span className={fill ? 'ms fill' : 'ms'} aria-hidden="true">
    {name}
  </span>
);

export function Header({ go, back, right }: { go: Go; back?: () => void; right?: ReactNode }) {
  return (
    <header className="top">
      {back ? (
        <button className="icon-btn" onClick={back} aria-label="뒤로">
          <Icon name="arrow_back_ios_new" />
        </button>
      ) : null}
      <button className="brand" onClick={() => go('/')}>
        <span className="logo">
          <Icon name="favorite" fill />
        </span>
        <span className="brand-text">
          <b>짜주께</b>
          <small>아껴주께 패밀리</small>
        </span>
      </button>
      <span className="spacer" />
      {right}
    </header>
  );
}

export function Footer({ go }: { go: Go }) {
  return (
    <footer className="foot">
      <a href="https://menu-recommand-b9q.pages.dev" target="_blank" rel="noreferrer">
        메뉴 고민엔 골라주께
      </a>
      <span aria-hidden="true">·</span>
      <a href="/privacy" onClick={(e) => { e.preventDefault(); go('/privacy'); }}>
        개인정보처리방침
      </a>
    </footer>
  );
}

export function ChipGroup<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="chip-group">
      <legend>{label}</legend>
      <div className="chips">
        {options.map((o) => (
          <button key={o.value} type="button" className="chip" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
            {o.icon ? <Icon name={o.icon} /> : null}
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** 잠깐 떴다 사라지는 안내. message가 바뀔 때마다 다시 뜬다. */
export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [message, onDone]);
  return (
    <div className="toast" role="status" aria-live="polite" hidden={!message}>
      {message}
    </div>
  );
}
