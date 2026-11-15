import React from 'react';
import { motion } from 'framer-motion';
import { useChartColors, gradientKey } from '@/components/theme/themeUtils';

export default function Ring({ value = 0, goal = 100, color, label, caption, size = 158, stroke = 11, delay = 0 }) {
  const colors = useChartColors();
  const resolved = (color && colors[color]) || color || colors.primary;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.max(0, Math.min(100, (value / goal) * 100)) : 0;
  const gradientId = `ring-${gradientKey(resolved)}-${Math.round(size)}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={resolved} />
              <stop offset="100%" stopColor={resolved} stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={colors.grid} strokeOpacity="0.55" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (circumference * pct) / 100 }}
            transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 7px ${resolved}55)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`num font-medium leading-none text-foreground ${size < 80 ? 'text-[10px]' : size < 120 ? 'text-[19px]' : 'text-[27px]'}`}>
            {Math.round(pct)}
            {size >= 80 && <span className={`ml-0.5 text-muted-foreground ${size < 120 ? 'text-[11px]' : 'text-[13px]'}`}>%</span>}
          </span>
          {label && size >= 120 && <span className="eyebrow mt-2">{label}</span>}
        </div>
      </div>
      {caption && <p className="num mt-3 text-[11.5px] text-muted-foreground">{caption}</p>}
    </div>
  );
}