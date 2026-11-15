import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { localDate } from '@/lib/tracking';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const KINDS = [
  { value: 'movement', label: 'Movement' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'other', label: 'Other' },
];

export default function ManualActivityForm({ onLogged }) {
  const [minutes, setMinutes] = useState('');
  const [steps, setSteps] = useState('');
  const [kind, setKind] = useState('movement');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const value = Number(minutes);
    if (!value || value <= 0) {
      setError('Enter how many minutes you moved.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const now = new Date();
      await base44.entities.ActivityLog.create({
        date: localDate(now),
        started_at: new Date(now.getTime() - value * 60000).toISOString(),
        ended_at: now.toISOString(),
        minutes: Math.round(value * 10) / 10,
        steps: steps ? Math.round(Number(steps)) : 0,
        kind,
        source: 'manual',
        notes: notes.trim(),
      });
      setMinutes('');
      setSteps('');
      setNotes('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (onLogged) await onLogged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      eyebrow="Manual entry"
      title="Log a movement period"
      subtitle="Use this when no sensor is available, or to record activity the device could not see."
    >
      <form onSubmit={submit} className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="minutes" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Minutes
            </label>
            <Input
              id="minutes"
              type="number"
              min="1"
              max="600"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder="30"
              className="mt-1 h-10 rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
            />
          </div>
          <div>
            <label htmlFor="steps" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
              Steps (optional)
            </label>
            <Input
              id="steps"
              type="number"
              min="0"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder="—"
              className="mt-1 h-10 rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setKind(item.value)}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                kind === item.value
                  ? 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan'
                  : 'border-hairline text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={300}
          placeholder="What did you do? (optional)"
          className="rounded-xl border-hairline bg-white/[0.03] text-[12px]"
        />

        {error && <p className="text-[11px] text-destructive">{error}</p>}
        {saved && <p className="text-[11px] text-brand-mint">Saved to your activity history.</p>}

        <Button type="submit" disabled={busy} className="h-9 w-full rounded-xl text-[12px]">
          {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-1.5 h-3.5 w-3.5" />}
          Add activity record
        </Button>
      </form>
    </Panel>
  );
}