import React from 'react';
import { Database, Radio } from 'lucide-react';
import Panel from '@/components/common/Panel';
import TrendChart from '@/components/charts/TrendChart';
import TrendBadge from '@/components/common/TrendBadge';
import { useChartColors } from '@/components/theme/themeUtils';
import { METRICS, formatDate, formatValue, seriesFrom, trendOf } from '@/lib/health';

export default function SystemPanel({ system, byMetric }) {
  const COLORS = useChartColors();
  const ACCENT = {
    cyan: COLORS.cyan,
    violet: COLORS.violet,
    mint: COLORS.mint,
    amber: COLORS.amber,
  };
  const color = ACCENT[system.accent] || COLORS.cyan;

  return (
    <div className="space-y-5">
      <Panel eyebrow={system.label} title={system.blurb} className="border-hairline/80">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <Database className="h-3 w-3" /> Available data sources
            </p>
            <ul className="mt-2 space-y-1.5">
              {system.sources.length === 0 && (
                <li className="text-[12px] leading-relaxed text-muted-foreground">No source connected</li>
              )}
              {system.sources.map((source) => (
                <li key={source} className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                  {source}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-hairline/70 bg-white/[0.02] p-3.5">
            <p className="eyebrow flex items-center gap-1.5">
              <Radio className="h-3 w-3" /> Measurement limits
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{system.limitation}</p>
          </div>
        </div>
      </Panel>

      {system.metrics.map((key) => {
        const def = METRICS[key];
        const rows = byMetric[key] || [];
        const latest = rows[0];
        const series = seriesFrom(rows.slice(0, 16));
        const trend = trendOf(rows);
        const invert = key === 'resting_hr' || key === 'radiation_dose';

        return (
          <Panel key={key} title={def?.label || key} subtitle={latest ? `Last reading ${formatDate(latest.recorded_at)} · ${latest.source || 'imported'}` : 'No readings recorded'}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="num text-[30px] font-medium leading-none text-foreground">
                  {latest ? formatValue(key, latest.value) : '—'}
                </span>
                {def?.unit && <span className="text-[12px] text-muted-foreground">{def.unit}</span>}
              </div>
              <TrendBadge value={trend} invert={invert} />
            </div>

            <div className="mt-4">
              <TrendChart data={series} keys={[{ key: 'value', color }]} unit={def?.unit} height={170} />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-hairline/60">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Reading</th>
                    <th className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Date</th>
                    <th className="px-3 py-2 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row) => (
                    <tr key={row.id} className="border-t border-hairline/50">
                      <td className="num px-3 py-2 text-[12px] text-foreground">
                        {formatValue(key, row.value)} <span className="text-[10px] text-muted-foreground">{def?.unit}</span>
                      </td>
                      <td className="px-3 py-2 text-[11.5px] text-muted-foreground">{formatDate(row.recorded_at, 'MMM D, HH:mm')}</td>
                      <td className="px-3 py-2 text-right text-[10.5px] text-muted-foreground/80">{row.source || '—'}</td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-[11.5px] text-muted-foreground">
                        No recorded history for this system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        );
      })}
    </div>
  );
}