import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { BellOff, BellRing, Check, Clock, Plus, ShieldAlert } from 'lucide-react';
import useReminders from '@/hooks/useReminders';
import { missedOccurrences, nextOccurrence, scheduleLabel } from '@/lib/reminderSchedule';
import Panel from '@/components/common/Panel';
import ReminderCard from '@/components/reminders/ReminderCard';
import ReminderForm from '@/components/reminders/ReminderForm';
import { Button } from '@/components/ui/button';

export default function Reminders() {
  const { reminders, logs, permission, saving, due, save, toggle, remove, complete, snooze, requestPermission } = useReminders({ watch: true });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');

  const list = reminders || [];

  const upcoming = useMemo(
    () =>
      list
        .map((reminder) => ({ reminder, at: nextOccurrence(reminder) }))
        .filter((entry) => entry.at)
        .sort((a, b) => a.at - b.at)
        .slice(0, 5),
    [list],
  );

  const missed = useMemo(
    () =>
      list
        .flatMap((reminder) => missedOccurrences(reminder, logs).map((entry) => ({ reminder, at: entry.at })))
        .sort((a, b) => b.at - a.at)
        .slice(0, 6),
    [list, logs],
  );

  const completed = useMemo(
    () => logs.filter((log) => log.status === 'completed' || log.status === 'snoozed').slice(0, 8),
    [logs],
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const submit = async (values) => {
    await save(values, editing?.id);
    setFormOpen(false);
    setEditing(null);
  };

  const askPermission = async () => {
    const result = await requestPermission();
    setNotice(
      result === 'granted'
        ? 'Browser notifications are on for this device.'
        : result === 'denied'
          ? 'Notifications are blocked in your browser settings — in-app reminders still work.'
          : 'This browser does not support notifications.',
    );
  };

  const active = list.filter((reminder) => reminder.enabled);
  const paused = list.filter((reminder) => !reminder.enabled);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Scheduled routines</p>
          <h1 className="mt-2 text-[24px] leading-[1.15] sm:text-[29px]">Reminders</h1>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
            Medication, stretch, mobility and movement-break reminders you schedule yourself. AstroVital never suggests a dose or
            changes a schedule on its own.
          </p>
        </div>
        <Button onClick={openNew} className="h-9 rounded-xl text-[12px]">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New reminder
        </Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface/60 px-4 py-3">
        <div className="flex items-center gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
          {permission === 'granted' ? (
            <BellRing className="h-3.5 w-3.5 text-brand-mint" />
          ) : (
            <BellOff className="h-3.5 w-3.5 text-brand-amber" />
          )}
          {permission === 'granted'
            ? 'Browser notifications are enabled for this device.'
            : permission === 'denied'
              ? 'Notifications are blocked in the browser — reminders still appear inside AstroVital.'
              : permission === 'unsupported'
                ? 'This browser cannot show notifications. In-app reminders still work.'
                : 'Allow notifications so reminders reach you outside this tab.'}
        </div>
        {permission !== 'granted' && permission !== 'unsupported' && (
          <Button size="sm" variant="outline" onClick={askPermission} className="h-8 rounded-xl border-hairline text-[11.5px]">
            Enable notifications
          </Button>
        )}
      </div>
      {notice && <p className="px-1 text-[11px] text-muted-foreground">{notice}</p>}

      {due.length > 0 && (
        <div className="rounded-2xl border border-brand-cyan/40 bg-brand-cyan/[0.06] px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-cyan">
            <Clock className="h-3.5 w-3.5" /> Due now
          </p>
          <div className="mt-2 space-y-1.5">
            {due.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12.5px] text-foreground">
                  {reminder.title} <span className="text-muted-foreground">· {scheduleLabel(reminder)}</span>
                </span>
                <span className="flex gap-1.5">
                  <Button size="sm" onClick={() => complete(reminder)} className="h-7 rounded-lg px-2.5 text-[11px]">
                    <Check className="mr-1 h-3 w-3" /> Done
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => snooze(reminder, 10)} className="h-7 rounded-lg border-hairline px-2.5 text-[11px]">
                    Snooze
                  </Button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {formOpen && (
        <Panel eyebrow={editing ? 'Editing' : 'New'} title={editing ? editing.title : 'Create a reminder'}>
          <ReminderForm
            initial={editing}
            saving={saving}
            onSave={submit}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-end justify-between gap-2 px-1">
            <h2 className="text-[13px] font-medium tracking-tight text-foreground">Your reminders</h2>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {active.length} active{paused.length ? ` · ${paused.length} paused` : ''}
            </span>
          </div>

          {reminders === null ? (
            <div className="h-32 animate-pulse rounded-2xl border border-hairline bg-surface/40" />
          ) : list.length === 0 ? (
            <Panel eyebrow="Nothing scheduled" title="No reminders yet">
              <div className="rounded-2xl border border-dashed border-hairline px-5 py-10 text-center">
                <p className="text-[12.5px] text-muted-foreground">
                  Add a medication, stretch or movement-break reminder and it will appear here with its next scheduled time.
                </p>
                <Button onClick={openNew} size="sm" className="mt-3 h-8 rounded-xl text-[11.5px]">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create the first one
                </Button>
              </div>
            </Panel>
          ) : (
            <div className="space-y-2">
              {[...active, ...paused].map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  nextAt={nextOccurrence(reminder)}
                  onComplete={complete}
                  onSnooze={snooze}
                  onToggle={toggle}
                  onEdit={(item) => {
                    setEditing(item);
                    setFormOpen(true);
                  }}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Panel eyebrow="Next up" title="Upcoming">
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.map(({ reminder, at }) => (
                  <li key={reminder.id} className="rounded-xl border border-hairline/60 bg-white/[0.02] px-3 py-2">
                    <p className="truncate text-[12px] text-foreground">{reminder.title}</p>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
                      {moment(at).format('ddd h:mm A')} · {moment(at).fromNow()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">Nothing scheduled. Paused reminders do not fire.</p>
            )}
          </Panel>

          <Panel eyebrow="Last 7 days" title="Missed" action={<ShieldAlert className="h-4 w-4 text-brand-amber" />}>
            {missed.length ? (
              <ul className="space-y-1.5">
                {missed.map(({ reminder, at }) => (
                  <li key={`${reminder.id}-${at.toISOString()}`} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="truncate text-muted-foreground">{reminder.title}</span>
                    <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-brand-amber/80">
                      {moment(at).format('ddd h:mm A')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">No missed reminders in the last week.</p>
            )}
          </Panel>

          <Panel eyebrow="Log" title="Completed & snoozed">
            {completed.length ? (
              <ul className="space-y-1.5">
                {completed.map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="truncate text-muted-foreground">
                      {log.reminder_title || 'Stretch break'}
                      <span className="ml-1 text-muted-foreground/60">{log.status === 'completed' ? 'done' : 'snoozed'}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
                      {moment(log.fired_at).format('MMM D h:mm A')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11.5px] leading-relaxed text-muted-foreground">Nothing marked yet.</p>
            )}
          </Panel>
        </div>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/80">
        Reminders are stored on your own account and visible only to you. Notifications are delivered by the browser while AstroVital is
        open or installed; no reminder is ever shared with your crew.
      </p>
    </div>
  );
}