import React from 'react';
import Panel from '@/components/common/Panel';
import { mean } from '@/lib/health';

export default function SleepWeekly({ records = [] }) {
  const rows = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
  const thisWeek = rows.slice(0, 7);
  const lastWeek = rows.slice(7, 14);

  const compare = (key, decimals = 1, suffix = '') => {
    const current = mean(thisWeek.map((row) => row[key]));
    const previous = mean(lastWeek.map((row) => row[key]));
    const change = current !== null && previous ? ((current - previous) / previous) * 100 : null;
    return {
      current: current === null ? '—' : `${current.toFixed(decimals)}${suffix}`,
      previous: previous === null ? '—' : `${previous.toFixed(decimals)}${suffix}`,
      change,
    };
  };

  const items = [
    { label: 'Sleep duration', ...compare('total_hours', 1, ' h') },
    { label: 'Sleep efficiency', ...compare('efficiency', 0, '%') },
    { label: 'Schedule consistency', ...compare('consistency', 0, '%') },
    { label: 'Overnight recovery', ...compare('recovery', 0) },
  ];

  const beds = rows.slice(0, 7).map((row) => row.bedtime).filter(Boolean);

  return (
    <Panel
      eyebrow="Weekly comparison"
      title="This week against last week"
      subtitle={rows.length ? `${rows.length} nights recorded · latest ${rows[0].date}` : 'No sleep records imported'}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-hairline/60 bg-white/[0.02] p-3.5">
            <p className="text-[11px] leading-tight tracking-tight text-muted-foreground">{item.label}</p>
            <p className="num mt-2 text-[20px] font-medium leading-none text-foreground">{item.current}</p>
            <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
              last week {item.previous}
            </p>
            <p className={`num mt-1 font-mono text-[10px] ${item.change === null || item.change >= 0 ? 'text-brand-mint' : 'text-brand-amber'}`}>
              {item.change === null ? '—' : `${item.change >= 0 ? '+' : '−'}${Math.abs(item.change).toFixed(1)}%`}
            </p>
          </div>
        ))}
      </div>
      {beds.length > 0 && (
        <p className="mt-4 border-t border-hairline/60 pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Lights-out this week: {beds.join(' · ')}. A bedtime drifting later than your usual window usually shows up as lower sleep efficiency before it shows up as
          shorter sleep.
        </p>
      )}
    </Panel>
  );
}