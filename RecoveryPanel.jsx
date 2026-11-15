import React, { useEffect, useState } from 'react';
import { Info, Loader2, Save } from 'lucide-react';
import moment from 'moment';
import { base44 } from '@/api/base44Client';
import { localDate, recoveryBreakdown } from '@/lib/tracking';
import Panel from '@/components/common/Panel';
import Provenance from '@/components/common/Provenance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SCALE = [1, 2, 3, 4, 5];

export default function RecoveryPanel({ checkins, onSaved }) {
  const today = localDate();
  const rows = checkins || [];
  const todayRow = rows.find((row) => row.date === today) || null;
  const latest = todayRow || rows[0] || null;
  const breakdown = recoveryBreakdown(latest);

  const [fatigue, setFatigue] = useState(null);
  const [soreness, setSoreness] = useState(null);
  const [sleepHours, setSleepHours] = useState('');
  const [restMinutes, setRestMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFatigue(todayRow?.fatigue ?? null);
    setSoreness(todayRow?.soreness ?? null);
    setSleepHours(todayRow?.sleep_hours != null ? String(todayRow.sleep_hours) : '');
    setRestMinutes(todayRow?.rest_minutes != null ? String(todayRow.rest_minutes) : '');
    setNotes(todayRow?.notes || '');
  }, [todayRow?.id]);

  const save = async (event) => {
    event.preventDefault();
    if (fatigue === null && soreness === null && !sleepHours && !restMinutes) {
      setError('Add at least one value — the score uses only what you provide.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = {
        date: today,
        checked_at: new Date().toISOString(),
        fatigue: fatigue === null ? undefined : fatigue,
        soreness: soreness === null ? undefined : soreness,
        sleep_hours: sleepHours ? Number(sleepHours) : undefined,
        rest_minutes: restMinutes ? Number(restMinutes) : undefined,
        notes: notes.trim(),
      };
      if (todayRow) {
        await base44.entities.RecoveryCheckin.update(todayRow.id, payload);
      } else {
        await base44.entities.RecoveryCheckin.create(payload);
      }
      if (onSaved) await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      eyebrow="Recovery"
      title="Daily recovery check-in"
      subtitle="Self-reported. The score is the average of the inputs you supply — nothing is invented."
      action={<Info className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="num text-[30px] font-medium leading-none">{breakdown.score === null ? '—' : breakdown.score}</span>
            <span className="text-[11px] text-muted-foreground">
              / 100 {breakdown.score === null ? '· no inputs yet' : `· from ${breakdown.components.filter((item) => item.available).length} input(s)`}
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            {breakdown.components.map((component) => (
              <div key={component.key}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] ${component.available ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                    {component.label}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    {component.available ? `${Math.round(component.value)}/100` : 'missing'}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className={`h-full rounded-full ${component.available ? 'bg-brand-mint' : 'bg-white/10'}`}
                    style={{ width: `${component.available ? component.value : 0}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground/80">{component.detail}</p>
              </div>
            ))}
          </div>
          <Provenance source="self_assessment" updatedAt={breakdown.lastUpdated} className="mt-3" />
          {latest?.notes && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{latest.notes}</p>}
          {rows.length > 1 && (
            <div className="mt-3 border-t border-hairline/60 pt-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Earlier check-ins</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {rows.slice(0, 6).map((row) => (
                  <span key={row.id} className="rounded-lg border border-hairline/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {moment(row.date).format('MMM D')} · {recoveryBreakdown(row).score ?? '—'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={save} className="space-y-2.5">
          {[
            { label: 'Fatigue today', value: fatigue, set: setFatigue },
            { label: 'Soreness today', value: soreness, set: setSoreness },
          ].map((field) => (
            <div key={field.label}>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{field.label}</p>
              <div className="mt-1 flex gap-1.5">
                {SCALE.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.set(field.value === value ? null : value)}
                    className={`h-7 flex-1 rounded-lg border text-[11px] transition-colors ${
                      field.value === value
                        ? 'border-brand-mint/40 bg-brand-mint/10 text-brand-mint'
                        : 'border-hairline text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="sleep" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Sleep (hours)
              </label>
              <Input
                id="sleep"
                type="number"
                step="0.1"
                min="0"
                max="16"
                value={sleepHours}
                onChange={(event) => setSleepHours(event.target.value)}
                placeholder="—"
                className="mt-1 h-9 rounded-xl border-hairline bg-white/[0.03] text-[12px]"
              />
            </div>
            <div>
              <label htmlFor="rest" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Rest (minutes)
              </label>
              <Input
                id="rest"
                type="number"
                min="0"
                max="600"
                value={restMinutes}
                onChange={(event) => setRestMinutes(event.target.value)}
                placeholder="—"
                className="mt-1 h-9 rounded-xl border-hairline bg-white/[0.03] text-[12px]"
              />
            </div>
          </div>

          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Anything worth remembering? (optional)"
            className="rounded-xl border-hairline bg-white/[0.03] text-[12px]"
          />

          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="h-9 w-full rounded-xl text-[12px]">
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            {todayRow ? "Update today's check-in" : 'Save check-in'}
          </Button>
          <p className="text-[10px] leading-relaxed text-muted-foreground/70">
            {todayRow
              ? `Last saved ${moment(todayRow.checked_at || todayRow.updated_date).fromNow()}.`
              : 'One check-in per day — saving again updates it.'}
          </p>
        </form>
      </div>
    </Panel>
  );
}