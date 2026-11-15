import React from 'react';
import TrendBadge from '@/components/common/TrendBadge';
import Sparkline from '@/components/charts/Sparkline';
import { COLORS } from '@/lib/health';

export default function GaitCard({ label, value, unit, decimals = 2, trend, series, color = COLORS.cyan, note }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-medium leading-tight tracking-tight text-muted-foreground">{label}</p>
        <TrendBadge value={trend} />
      </div>
      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="num text-[23px] font-medium leading-none text-foreground">
          {value === null || value === undefined ? '—' : Number(value).toFixed(decimals)}
        </span>
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2">
        <Sparkline data={series} color={color} height={40} />
      </div>
      {note && <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">{note}</p>}
    </div>
  );
}