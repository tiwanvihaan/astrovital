import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { invalidateProfile } from '@/hooks/useProfile';
import { Loader2, RotateCcw } from 'lucide-react';
import { FONTS, SIZE_PRESETS, DEFAULT_TYPE, resolveTypography, applyTypography } from '@/lib/typography';

export default function TypographyPanel({ profile }) {
  const [draft, setDraft] = useState(() => resolveTypography(profile));
  const [saving, setSaving] = useState(false);

  const persist = async (next) => {
    setDraft(next);
    applyTypography(next);
    if (!profile?.id) return;
    setSaving(true);
    try {
      await base44.entities.AstronautProfile.update(profile.id, {
        font_family: next.font,
        text_size: next.size,
        body_scale: next.body,
        heading_scale: next.heading,
      });
      invalidateProfile();
    } finally {
      setSaving(false);
    }
  };

  const pickFont = (id) => persist({ ...draft, font: id });
  const pickSize = (preset) => persist({ ...draft, size: preset.id, body: preset.scale, heading: preset.scale });

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Font family</p>
          {saving && <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving</span>}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => pickFont(font.id)}
              style={{ fontFamily: font.stack }}
              className={`rounded-xl border px-2.5 py-2 text-left transition-colors ${
                draft.font === font.id
                  ? 'border-brand-cyan/50 bg-brand-cyan/[0.07] text-foreground'
                  : 'border-hairline/70 bg-white/[0.02] text-muted-foreground hover:border-hairline hover:text-foreground'
              }`}
            >
              <span className="block truncate text-[12px] leading-tight">{font.label}</span>
              <span className="mt-0.5 block truncate text-[10px] opacity-70">Aa Bb 123</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Text size</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => pickSize(preset)}
              className={`rounded-full border px-3 py-1 text-[10.5px] transition-colors ${
                draft.size === preset.id
                  ? 'border-brand-cyan/50 bg-brand-cyan/10 text-foreground'
                  : 'border-hairline text-muted-foreground hover:text-foreground'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block rounded-xl border border-hairline/70 bg-white/[0.02] px-3 py-2.5">
          <span className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Body text <span className="text-foreground">{Math.round(draft.body * 100)}%</span>
          </span>
          <input
            type="range"
            min="0.85"
            max="1.35"
            step="0.02"
            value={draft.body}
            onChange={(event) => persist({ ...draft, body: Number(event.target.value) })}
            className="mt-2 w-full accent-[hsl(var(--primary))]"
          />
        </label>

        <label className="block rounded-xl border border-hairline/70 bg-white/[0.02] px-3 py-2.5">
          <span className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Headings <span className="text-foreground">{Math.round(draft.heading * 100)}%</span>
          </span>
          <input
            type="range"
            min="0.85"
            max="1.35"
            step="0.02"
            value={draft.heading}
            onChange={(event) => persist({ ...draft, heading: Number(event.target.value) })}
            className="mt-2 w-full accent-[hsl(var(--primary))]"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-hairline/70 bg-white/[0.02] p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Live preview</p>
        <h3 className="mt-1.5 text-[19px] leading-tight" style={{ fontFamily: FONTS.find((item) => item.id === draft.font)?.stack }}>
          Crew health summary
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Movement held steady across the last 14 days while recovery scores drifted slightly. This preview uses the font
          and reading size you selected, and the whole app follows it.
        </p>
      </div>

      <button
        type="button"
        onClick={() => persist({ ...DEFAULT_TYPE })}
        className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="h-3 w-3" /> Reset to default
      </button>
    </div>
  );
}