import React from 'react';
import { Link } from 'react-router-dom';
import TrendBadge from '@/components/common/TrendBadge';
import Sparkline from '@/components/charts/Sparkline';
import { COLORS, formatDate, formatValue, metricDef } from '@/lib/health';

export default function MetricCard({ metricKey, title, series = [], latest, trend, href, invert = false }) {
  const def = metricDef(metricKey);
  const color = COLORS[def.color] || COLORS.cyan;

  return (
    <Link
      to={href || '/health'}
      className="group relative block overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-cyan/35 hover:bg-surface/90"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-medium leading-tight tracking-tight text-muted-foreground">{title || def.label}</p>
        <TrendBadge value={trend} invert={invert} />
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`num text-[24px] font-medium leading-none ${latest ? 'text-foreground' : 'text-muted-foreground/45'}`}>
          {latest ? formatValue(metricKey, latest.value) : '—'}
        </span>
        {def.unit && <span className="text-[11px] text-muted-foreground">{def.unit}</span>}
      </div>

      <div className="mt-2.5">
        {latest ? (
          <Sparkline data={series} color={color} height={42} />
        ) : (
          <div className="h-[42px] rounded-lg border border-dashed border-hairline/50" aria-hidden="true" />
        )}
      </div>

      <p className="mt-1.5 truncate font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground/70">
        {latest ? `${formatDate(latest.recorded_at)} · ${latest.source || 'imported'}` : 'Not tracking'}
      </p>
    </Link>
  );
}