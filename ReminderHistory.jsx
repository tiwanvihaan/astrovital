import React from 'react';
import moment from 'moment';
import Panel from '@/components/common/Panel';

const STATUS_TONE = {
  completed: 'border-brand-mint/30 bg-brand-mint/[0.08] text-brand-mint',
  snoozed: 'border-brand-amber/30 bg-brand-amber/[0.08] text-brand-amber',
  pending: 'border-brand-cyan/30 bg-brand-cyan/[0.08] text-brand-cyan',
  skipped: 'border-hairline text-muted-foreground',
};

export default function ReminderHistory({ logs }) {
  return (
    <Panel eyebrow="History" title="Past reminders" subtitle="Every reminder that fired, and what you did with it.">
      <div className="space-y-2">
        {(logs || []).map((log) => (
          <div key={log.id} className="flex items-center justify-between gap-2 rounded-xl border border-hairline/60 bg-white/[0.02] px-2.5 py-2">
            <div>
              <p className="text-[11.5px] font-medium tracking-tight text-foreground">
                {moment(log.fired_at).format('ddd, MMM D · h:mm A')}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                every {log.interval_minutes || '—'} min
              </p>
            </div>
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
                STATUS_TONE[log.status] || STATUS_TONE.skipped
              }`}
            >
              {log.status}
            </span>
          </div>
        ))}
        {!(logs || []).length && (
          <p className="py-2 text-[12px] leading-relaxed text-muted-foreground">
            No reminders yet. Once one fires it is stored here with its outcome.
          </p>
        )}
      </div>
    </Panel>
  );
}