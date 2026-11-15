import React from 'react';
import Panel from '@/components/common/Panel';
import { CATEGORY_META } from '@/lib/astroPoints';
import { cn } from '@/lib/utils';

export default function BreakdownCard({ breakdown = [] }) {
  const max = breakdown.reduce((top, row) => Math.max(top, row.points), 0) || 1;

  return (
    <Panel
      eyebrow="Where points came from"
      title="Earned breakdown"
      subtitle="Lifetime points grouped by the activity that earned them."
    >
      {!breakdown.length ? (
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">
          No points yet. Log movement, a mobility session or a recovery check-in and the engine will credit you on the
          next check.
        </p>
      ) : (
        <div className="space-y-2.5">
          {breakdown.map((row) => {
            const meta = CATEGORY_META[row.key] || CATEGORY_META.movement;
            const Icon = meta.icon;
            return (
              <div key={row.key}>
                <div className="flex items-center gap-2">
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-lg border', meta.chip)}>
                    <Icon className={cn('h-3 w-3', meta.tone)} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground">{meta.label}</span>
                  <span className="num shrink-0 text-[11.5px] text-foreground">{row.points}</span>
                </div>
                <div className="ml-8 mt-1.5 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                  <span
                    className={cn('block h-full rounded-full transition-all duration-500', meta.bar)}
                    style={{ width: `${Math.round((row.points / max) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 border-t border-hairline/60 pt-3 text-[10.5px] leading-relaxed text-muted-foreground/80">
        Medical measurements and body characteristics are never scored or compared.
      </p>
    </Panel>
  );
}