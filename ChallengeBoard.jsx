import React, { useState } from 'react';
import { Flag, Loader2, Plus, X } from 'lucide-react';
import moment from 'moment';
import { teamApi } from '@/lib/teamApi';
import { challengeProgress } from '@/lib/crewBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const METRICS = [
  { value: 'crew_points', label: 'Crew points', hint: 'AstroPoints earned together' },
  { value: 'ring_days', label: 'Perfect days', hint: 'Member-days with all three rings closed' },
  { value: 'checkins', label: 'Wellness check-ins', hint: 'Check-ins logged by the crew' },
];

export default function ChallengeBoard({ teamId, challenges = [], rows = [], canManage, onChanged }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', metric: 'crew_points', target: '500', ends_at: '' });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await teamApi('create_challenge', {
        team_id: teamId,
        title: form.title,
        metric: form.metric,
        target: Number(form.target),
        ends_at: form.ends_at || '',
      });
      setForm({ title: '', metric: 'crew_points', target: '500', ends_at: '' });
      setOpen(false);
      if (onChanged) await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (challengeId) => {
    await teamApi('delete_challenge', { team_id: teamId, challenge_id: challengeId });
    if (onChanged) await onChanged();
  };

  return (
    <div className="space-y-2.5">
      {challenges.map((challenge) => {
        const progress = challengeProgress(challenge, rows);
        const metric = METRICS.find((item) => item.value === challenge.metric) || METRICS[0];
        return (
          <div key={challenge.id} className="rounded-xl border border-hairline/70 bg-white/[0.02] px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium tracking-tight text-foreground">{challenge.title}</p>
                <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {metric.label}
                  {challenge.ends_at ? ` · ends ${moment(challenge.ends_at).format('D MMM')}` : ''}
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => remove(challenge.id)}
                  aria-label={`End ${challenge.title}`}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.06] hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${progress.pct}%` }} />
            </div>
            <p className="mt-1.5 num text-[10px] text-muted-foreground">
              {progress.value} / {progress.target} · {progress.pct}%
            </p>
          </div>
        );
      })}

      {!challenges.length && <p className="text-[11.5px] leading-relaxed text-muted-foreground">No crew challenge running.</p>}

      {canManage && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> Start a crew challenge
        </button>
      )}

      {open && (
        <form onSubmit={submit} className="space-y-2 rounded-xl border border-hairline/70 bg-white/[0.02] p-3">
          <Input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="Challenge title"
            className="h-9 rounded-lg border-hairline bg-background/40 text-[12px]"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.metric}
              onChange={(event) => setForm({ ...form, metric: event.target.value })}
              className="h-9 rounded-lg border border-hairline bg-surface/70 px-2 text-[11.5px] text-foreground outline-none"
            >
              {METRICS.map((metric) => (
                <option key={metric.value} value={metric.value} className="bg-card">
                  {metric.label}
                </option>
              ))}
            </select>
            <Input
              type="number"
              min="1"
              value={form.target}
              onChange={(event) => setForm({ ...form, target: event.target.value })}
              placeholder="Target"
              className="h-9 rounded-lg border-hairline bg-background/40 text-[12px]"
              required
            />
          </div>
          <Input
            type="date"
            value={form.ends_at}
            onChange={(event) => setForm({ ...form, ends_at: event.target.value })}
            className="h-9 rounded-lg border-hairline bg-background/40 text-[12px]"
          />
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={busy} className="h-8 rounded-lg px-3 text-[11.5px]">
              {busy ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Flag className="mr-1.5 h-3 w-3" />}
              Start
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn('text-[11px] text-muted-foreground hover:text-foreground')}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}