'use client';

import { useEffect, useState } from 'react';

/**
 * Home page card thumbnail for the Instant Access case study — the same four-step
 * signup sequence the case study opens on, reduced to a row of chips that light up
 * one at a time. The last chip is the payoff (the account exists before review), so
 * it holds longer, matching the hero.
 */
const STEPS = ['Account Type', 'Workplace', 'Create Account', "You're in"] as const;
const HOLD_MS = 1500;
const ACCENT = '#006efe';
const SUCCESS = '#2a8a50';

export function InstantAccessThumbnail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const hold = active === STEPS.length - 1 ? HOLD_MS * 2 : HOLD_MS;
    const t = window.setTimeout(() => setActive(i => (i + 1) % STEPS.length), hold);
    return () => window.clearTimeout(t);
  }, [active]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4%',
        padding: '0 6%',
      }}
    >
      {STEPS.map((label, i) => {
        const on = i === active;
        const done = i === STEPS.length - 1;
        return (
          <div
            key={label}
            style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '6%',
              padding: '6% 5%',
              borderRadius: '8px',
              background: '#fff',
              border: `1px solid ${on ? (done ? SUCCESS : ACCENT) : '#e6ecf4'}`,
              boxShadow: on ? '0 4px 14px rgba(0,110,254,0.18)' : 'none',
              opacity: on ? 1 : 0.5,
              transform: on ? 'translateY(-4%)' : 'none',
              transition: 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.45s ease, border-color 0.45s ease',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 'clamp(5px, 1.1vw, 8px)',
                fontWeight: 600,
                lineHeight: 1.2,
                color: on ? '#1a1a1a' : '#8a97a8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
            </span>
            {[0, 1].map(row => (
              <span
                key={row}
                style={{
                  height: '3px',
                  borderRadius: '2px',
                  width: row === 0 ? '100%' : '62%',
                  background: on && row === 0 ? (done ? SUCCESS : ACCENT) : '#dfe7f1',
                  transition: 'background 0.45s ease',
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
