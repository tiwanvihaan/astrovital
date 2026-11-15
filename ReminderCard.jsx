import React, { useState } from 'react';
import moment from 'moment';
import { Check, Clock, Pause, Pencil, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { categoryLabel, scheduleLabel } from '@/lib/reminderSchedule';

export default function ReminderCard({ reminder, nextAt, onComplete, onSnooze, onToggle, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const due = nextAt && nextAt.getTime() <= Date.now();

  return (
    <article
      className={cn(
        'rounded-2xl border bg-surface/60 p-3.5 transition-colors',
        reminder.enabled ? 'border-hairline/70' : 'border-hairline/40 opacity-70',
        due && reminder.enabled && 'border-brand-cyan/40 bg-brand-cyan/[0.05]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-hairline/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              {categoryLabel(reminder.category)}
            </span>
            {!reminder.enabled && (
              <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">paused</span>
            )}
            {reminder.enabled && due && (
              <span className="rounded-md bg-brand-cyan/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-brand-cyan">due now</span>
            )}
          </div>
          <h3 className="mt-1.5 truncate text-[13px] font-medium tracking-tight text-foreground">{reminder.title}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{scheduleLabel(reminder)}</p>
          {reminder.description && <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{reminder.description}</p>}
          {reminder.notes && <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground/70">Private: {reminder.notes}</p>}
          <p className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
            {!reminder.enabled
              ? 'not scheduled'
              : nextAt
                ? `next ${due ? 'due ' : ''}${moment(nextAt).fromNow()}`
                : 'no upcoming slot'}
            {reminder.last_completed_at ? ` · done ${moment(reminder.last_completed_at).fromNow()}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={() => onComplete(reminder)}
            disabled={!reminder.enabled}
            title="Mark done"
            className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:border-brand-mint/40 hover:text-brand-mint disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSnooze(reminder, 10)}
            disabled={!reminder.enabled}
            title="Snooze 10 minutes"
            className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:border-brand-amber/40 hover:text-brand-amber disabled:opacity-40"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggle(reminder)}
            title={reminder.enabled ? 'Pause' : 'Resume'}
            className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:text-foreground"
          >
            {reminder.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onEdit(reminder)}
            title="Edit"
            className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {confirming ? (
            <button
              type="button"
              onClick={() => onDelete(reminder)}
              title="Confirm delete"
              className="grid h-7 w-7 place-items-center rounded-lg border border-brand-rose/50 bg-brand-rose/10 text-brand-rose"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              title="Delete"
              className="grid h-7 w-7 place-items-center rounded-lg border border-hairline text-muted-foreground transition-colors hover:border-brand-rose/40 hover:text-brand-rose"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      {confirming && (
        <p className="mt-2 flex items-center gap-2 text-[10.5px] text-brand-rose">
          Tap delete again to remove it.
          <button type="button" onClick={() => setConfirming(false)} className="text-muted-foreground underline">
            cancel
          </button>
        </p>
      )}
    </article>
  );
}