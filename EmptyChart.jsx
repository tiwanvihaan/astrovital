import React from 'react';

export default function EmptyChart({ height = 176, note = 'Awaiting your first session' }) {
  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 320 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        {[16, 36, 56, 76, 96].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="320"
            y2={y}
            stroke="hsl(217 27% 23% / 0.55)"
            strokeWidth="0.7"
            strokeDasharray="2 7"
          />
        ))}
        <path
          d="M0 74 L40 66 L80 70 L120 56 L160 62 L200 48 L240 54 L280 42 L320 48"
          fill="none"
          stroke="hsl(191 100% 67% / 0.16)"
          strokeWidth="1.6"
          strokeDasharray="4 6"
        />
      </svg>
      <p className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
        {note}
      </p>
    </div>
  );
}