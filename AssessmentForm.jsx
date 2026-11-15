import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MOBILITY_AREAS, MOBILITY_SCALE, localDate } from '@/lib/tracking';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AssessmentForm({ onSaved }) {
  const [area, setArea] = useState('shoulder');
  const [score, setScore] = useState(3);
  const [pain, setPain] = useState(0);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const selected = MOBILITY_AREAS.find((item) => item.key === area);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const now = new Date();
      await base44.entities.MobilityAssessment.create({
        date: localDate(now),
        assessed_at: now.toISOString(),
        area,
        score,
        pain,
        notes: notes.trim(),
        source: 'self_assessment',
      });
      setNotes('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      if (onSaved) await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      eyebrow="Self assessment"
      title="Check one joint or test"
      subtitle="Rate the range you actually reached. This is a self-report, not a clinical measurement."
    >
      <form onSubmit={submit} className="space-y-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Area</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MOBILITY_AREAS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setArea(item.key)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  area === item.key
                    ? 'border-brand-violet/40 bg-brand-violet/10 text-brand-violet'
                    : 'border-hairline text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {selected && <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{selected.cue}</p>}
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Range reached</p>
          <div className="mt-1.5 grid grid-cols-5 gap-1.5">
            {MOBILITY_SCALE.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setScore(item.value)}
                className={`rounded-xl border px-1 py-2 text-center transition-colors ${
                  score === item.value
                    ? 'border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan'
                    : 'border-hairline text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="num block text-[13px] font-medium leading-none">{item.value}</span>
                <span className="mt-1 block text-[9px] leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Pain during the test</p>
          <div className="mt-1.5 flex gap-1.5">
            {[0, 1, 2, 3].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPain(value)}
                className={`flex-1 rounded-xl border py-1.5 text-[11px] transition-colors ${
                  pain === value
                    ? 'border-brand-amber/40 bg-brand-amber/10 text-brand-amber'
                    : 'border-hairline text-muted-foreground hover:text-foreground'
                }`}
              >
                {value === 0 ? 'None' : value}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={2}
          maxLength={300}
          placeholder="What limited you? (optional)"
          className="rounded-xl border-hairline bg-white/[0.03] text-[12px]"
        />

        {error && <p className="text-[11px] text-destructive">{error}</p>}
        {saved && <p className="text-[11px] text-brand-mint">Assessment saved.</p>}

        <Button type="submit" disabled={busy} className="h-9 w-full rounded-xl text-[12px]">
          {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          Save assessment
        </Button>
      </form>
    </Panel>
  );
}