import React from 'react';
import Panel from '@/components/common/Panel';
import Sparkline from '@/components/charts/Sparkline';
import { useChartColors } from '@/components/theme/themeUtils';
import { mean, seriesFrom, sortByDate } from '@/lib/health';

function rowsFor(measurements, metric) {
  return sortByDate((measurements || []).filter((row) => row.metric === metric));
}

function build(series, decimals = 1, unit = '') {
  const recent = series.slice(-7);
  const prior = series.slice(-14, -7);
  const current = mean(recent.map((row) => row.value));
  const previous = mean(prior.map((row) => row.value));
  return {
    current,
    change: current !== null && previous ? ((current - previous) / previous) * 100 : null,
    decimals,
    unit,
  };
}

export default function TrendSummary({ measurements = [], sleep = [], mobility = [] }) {
  const COLORS = useChartColors();
  const sleepSeries = seriesFrom([...(sleep || [])], 'total_hours', 'date');
  const hrSeries = seriesFrom(rowsFor(measurements, 'resting_hr'), 'value', 'recorded_at');
  const mobilitySeries = seriesFrom([...(mobility || [])], 'mobility_score', 'date');

  const items = [
    { label: 'Sleep · 7-day average', ...build(sleepSeries, 1, 'h'), series: sleepSeries, color: COLORS.violet },
    { label: 'Resting HR · 7-day average', ...build(hrSeries, 0, 'bpm'), series: hrSeries, color: COLORS.mint },
    { label: 'Mobility · recent sessions', ...build(mobilitySeries, 0, 'pts'), series: mobilitySeries, color: COLORS.cyan },
  ];

  return (
    <Panel eyebrow="Trend summary" title="What moved this week" subtitle="Rolling seven-day averages against the week before">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-hairline/60 bg-white/[0.02] p-3">
            <p className="text-[11px] leading-tight tracking-tight text-muted-foreground">{item.label}</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="num text-[19px] font-medium leading-none text-foreground">
                {item.current === null ? '—' : item.current.toFixed(item.decimals)}
              </span>
              <span className="text-[10px] text-muted-foreground">{item.unit}</span>
            </div>
            <p className={`num mt-1 font-mono text-[10px] ${item.change === null || item.change >= 0 ? 'text-brand-mint' : 'text-brand-amber'}`}>
              {item.change === null ? 'no prior week' : `${item.change >= 0 ? '+' : '−'}${Math.abs(item.change).toFixed(1)}% vs prior week`}
            </p>
            <div className="mt-1">
              <Sparkline data={item.series} color={item.color} height={34} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}