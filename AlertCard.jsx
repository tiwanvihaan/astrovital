import React from 'react';
import { AlertTriangle, Check, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/health';

const SEVERITY = {
  critical: {
    label: 'Critical',
    Icon: ShieldAlert,
    text: 'text-brand-rose',
    chip: 'bg-brand-rose/10 text-brand-rose border-brand-rose/25',
    bar: 'bg-brand-rose',
  },
  warning: {
    label: 'Warning',
    Icon: AlertTriangle,
    text: 'text-brand-amber',
    chip: 'bg-brand-amber/10 text-brand-amber border-brand-amber/25',
    bar: 'bg-brand-amber',
  },
  info: {
    label: 'Information',
    Icon: Info,
    text: 'text-brand-cyan',
    chip: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/25',
    bar: 'bg-brand-cyan',
  },
};

export default function AlertCard({ alert, onAcknowledge, compact = false }) {
  const tone = SEVERITY[alert.severity] || SEVERITY.info;
  const Icon = tone.Icon;

  if (compact) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-hairline/70 bg-white/[0.02] p-3">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone.text)} />
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-medium tracking-tight text-foreground">{alert.title}</p>
          <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
            {tone.label} · {timeAgo(alert.detected_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-4 sm:p-5">
      <span className={cn('absolute inset-y-0 left-0 w-[2px]', tone.bar)} />
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]', tone.chip)}>
          <Icon className="h-3 w-3" /> {tone.label}
        </span>
        {alert.category && (
          <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
            {alert.category}
          </span>
        )}
        <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
          {timeAgo(alert.detected_at)}
        </span>
      </div>

      <h3 className="mt-3 text-[14.5px] font-medium leading-snug tracking-tight text-foreground">{alert.title}</h3>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="eyebrow">What changed</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{alert.what_changed}</p>
        </div>
        <div>
          <p className="eyebrow">Why it matters</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{alert.why_it_matters}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline/60 pt-3">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground/70">
          Recorded signal
        </p>
        {onAcknowledge && alert.status === 'active' ? (
          <button
            type="button"
            onClick={() => onAcknowledge(alert)}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-brand-mint/40 hover:text-brand-mint"
          >
            <Check className="h-3 w-3" /> Acknowledge
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-mint/80">
            <Check className="h-3 w-3" /> Acknowledged
          </span>
        )}
      </div>
    </article>
  );
}