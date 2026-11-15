import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import useCollection from '@/hooks/useCollection';
import AlertCard from '@/components/alerts/AlertCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warnings' },
  { key: 'info', label: 'Information' },
];

export default function Alerts() {
  const alerts = useCollection('Alert', {}, { sort: '-detected_at', limit: 50 });
  const [filter, setFilter] = useState('all');
  const [acknowledged, setAcknowledged] = useState([]);

  const rows = useMemo(() => {
    const list = (alerts || []).map((alert) =>
      acknowledged.includes(alert.id) ? { ...alert, status: 'acknowledged' } : alert,
    );
    const filtered = filter === 'all' ? list : list.filter((alert) => alert.severity === filter);
    const order = { critical: 0, warning: 1, info: 2 };
    return filtered.sort((a, b) => order[a.severity] - order[b.severity] || new Date(b.detected_at) - new Date(a.detected_at));
  }, [alerts, filter, acknowledged]);

  const counts = useMemo(() => {
    const list = alerts || [];
    return {
      critical: list.filter((alert) => alert.severity === 'critical' && alert.status === 'active').length,
      warning: list.filter((alert) => alert.severity === 'warning' && alert.status === 'active').length,
      info: list.filter((alert) => alert.severity === 'info' && alert.status === 'active').length,
    };
  }, [alerts]);

  const acknowledge = async (alert) => {
    setAcknowledged((prev) => [...prev, alert.id]);
    await base44.entities.Alert.update(alert.id, { status: 'acknowledged' });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Notification center</p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-tight sm:text-[31px]">Alerts</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Every alert explains what changed, when it changed and why it matters, so it can be handed straight to the crew medical officer.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Critical', value: counts.critical, tone: 'text-brand-rose', border: 'border-brand-rose/25' },
          { label: 'Warnings', value: counts.warning, tone: 'text-brand-amber', border: 'border-brand-amber/25' },
          { label: 'Information', value: counts.info, tone: 'text-brand-cyan', border: 'border-brand-cyan/25' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border ${item.border} bg-surface/60 p-4`}>
            <p className="eyebrow">{item.label}</p>
            <p className={`num mt-2 text-[26px] font-medium leading-none ${item.tone}`}>{item.value}</p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">active signals</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] transition-colors ${
              filter === item.key
                ? 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan'
                : 'border-hairline text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledge} />
        ))}
        {alerts === null && <div className="h-32 animate-pulse rounded-2xl border border-hairline bg-surface/40" />}
        {alerts && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-hairline p-8 text-center text-[12.5px] text-muted-foreground">
            {alerts.length === 0 ? 'No alerts. Nothing has been recorded yet.' : 'Nothing in this category.'}
          </div>
        )}
      </div>
    </div>
  );
}