import React, { useEffect, useState } from 'react';
import { Loader2, Save, Share2 } from 'lucide-react';
import { teamApi } from '@/lib/teamApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Panel from '@/components/common/Panel';

const FIELDS = [
  { key: 'share_activity', label: 'Movement totals', hint: 'Active minutes and steps from the last 7 days' },
  { key: 'share_recovery', label: 'Recovery score', hint: 'Your latest self-reported recovery score' },
  { key: 'share_mobility', label: 'Mobility score', hint: 'Your latest mobility self-assessment score' },
];

export default function MySharingPanel({ teamId, sharing, onSaved }) {
  const [draft, setDraft] = useState(sharing);
  const [note, setNote] = useState(sharing.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDraft(sharing);
    setNote(sharing.note || '');
  }, [sharing]);

  const toggle = (key) => setDraft((current) => ({ ...current, [key]: !current[key] }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await teamApi('set_sharing', {
        team_id: teamId,
        share_activity: draft.share_activity,
        share_recovery: draft.share_recovery,
        share_mobility: draft.share_mobility,
        share_note: note,
      });
      if (onSaved) await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel
      eyebrow="Privacy"
      title="What you share with this crew"
      subtitle="Off by default. Only the switches you turn on are visible to teammates."
      action={<Share2 className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="space-y-2">
        {FIELDS.map((field) => {
          const enabled = Boolean(draft?.[field.key]);
          return (
            <button
              key={field.key}
              type="button"
              onClick={() => toggle(field.key)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                enabled ? 'border-brand-cyan/30 bg-brand-cyan/[0.07]' : 'border-hairline/70 bg-white/[0.02]'
              }`}
            >
              <span>
                <span className="block text-[12px] font-medium tracking-tight text-foreground">{field.label}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{field.hint}</span>
              </span>
              <span
                className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
                  enabled ? 'border-brand-cyan/50 bg-brand-cyan/30' : 'border-hairline bg-white/[0.05]'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
                    enabled ? 'left-[18px] bg-brand-cyan' : 'left-0.5 bg-muted-foreground/70'
                  }`}
                />
              </span>
            </button>
          );
        })}
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          maxLength={240}
          placeholder="Optional note for the crew (e.g. cleared for EVA, shoulder tight today)"
          className="rounded-xl border-hairline bg-white/[0.03] text-[12px]"
        />
        {error && <p className="text-[11px] text-destructive">{error}</p>}
        <Button onClick={save} disabled={saving} className="h-9 w-full rounded-xl text-[12px]">
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          Save sharing settings
        </Button>
      </div>
    </Panel>
  );
}