import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { ArrowUpRight, BellRing } from 'lucide-react';
import useReminders from '@/hooks/useReminders';
import { nextOccurrence, scheduleLabel } from '@/lib/reminderSchedule';

export default function UpcomingReminders() {
  const { reminders, logs, due } = useReminders();

  const upcoming = (reminders || [])
    .map((reminder) => ({ reminder, at: nextOccurrence(reminder) }))
    .filter((entry) => entry.at && entry.reminder.enabled)
    .sort((a, b) => a.at - b.at)
    .slice(0, 4);

  return (
    <section className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Scheduled</p>
          <h2 className="mt-1.5 text-[14px] font-medium tracking-tight text-foreground">Upcoming reminders</h2>
        </div>
        <BellRing className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-4 space-y-1.5">
        {reminders === null ? (
          <div className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />
        ) : upcoming.length ? (
          upcoming.map(({ reminder, at }) => (
            <div key={reminder.id} className="flex items-center justify-between gap-2 rounded-xl border border-hairline/60 bg-white/[0.02] px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-foreground">{reminder.title}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{scheduleLabel(reminder)}</span>
              </span>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] ${due.some((item) => item.id === reminder.id) ? 'text-brand-cyan' : 'text-muted-foreground/80'}`}>
                {moment(at).format('h:mm A')}
              </span>
            </div>
          ))
        ) : (
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            No reminders scheduled. Add medication, stretch or movement-break reminders to see them here.
          </p>
        )}
      </div>

      <Link to="/reminders" className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
        Open reminders <ArrowUpRight className="h-3 w-3" />
      </Link>
      {logs.length > 0 && (
        <p className="mt-2 border-t border-hairline/60 pt-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
          {logs.filter((log) => log.status === 'completed').length} completed recently
        </p>
      )}
    </section>
  );
}