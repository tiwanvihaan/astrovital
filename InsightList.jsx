import React from 'react';
import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Panel from '@/components/common/Panel';

const CHIPS = {
  critical: 'border-brand-rose/30 bg-brand-rose/10 text-brand-rose',
  warning: 'border-brand-amber/30 bg-brand-amber/10 text-brand-amber',
  info: 'border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan',
};

export default function InsightList({ insights = [], loading = false, onAsk }) {
  return (
    <Panel
      eyebrow="Signal watch"
      title="Insights from your data"
      action={<Sparkles className="h-4 w-4 text-brand-violet" />}
    >
      {loading && (
        <div className="flex items-center gap-2 py-6 text-[12px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading your records…
        </div>
      )}

      {!loading && !insights.length && (
        <p className="py-4 text-[12.5px] leading-relaxed text-muted-foreground">
          No meaningful deviation from your personal baselines in the current window. Insights only appear when recorded data moves.
        </p>
      )}

      <div className="space-y-3">
        {insights.map((insight) => (
          <button
            key={insight.id}
            type="button"
            onClick={() => onAsk?.(`Explain this in simple terms: ${insight.title}`)}
            className="w-full rounded-2xl border border-hairline/70 bg-white/[0.02] p-3.5 text-left transition-colors hover:border-brand-cyan/30 hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]',
                  CHIPS[insight.severity],
                )}
              >
                {insight.system}
              </span>
            </div>
            <p className="mt-2 text-[12.5px] font-medium leading-snug tracking-tight text-foreground">{insight.title}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{insight.detail}</p>
          </button>
        ))}
      </div>

      {insights.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/70">
          <RotateCcw className="h-2.5 w-2.5" /> Recomputed on every new reading
        </p>
      )}
    </Panel>
  );
}