import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { cn } from '@/lib/utils';
import { formatDay } from '@/lib/astroPoints';

const MILESTONES = [3, 7, 14, 30, 60, 100];

export default function StreakCard({ streak }) {
  const current = streak?.current || 0;
  const longest = streak?.longest || 0;
  const next = MILESTONES.find((value) => value > current) || null;

  return (
    <Panel
      eyebrow="Win streak"
      title="Consecutive active days"
      subtitle="Any movement, mobility, recovery or sleep log keeps it alive. One quiet day is forgiven so a mission schedule never wipes it."
      action={<Flame className="h-4 w-4 text-brand-amber" />}
    >
      <div className="flex items-end gap-5">
        <div>
          <p className="num text-[34px] leading-none text-brand-amber">{current}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">current</p>
        </div>
        <div>
          <p className="num text-[22px] leading-none text-foreground">{longest}</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">longest</p>
        </div>
        {streak?.last_active_day && (
          <p className="ml-auto text-right text-[10.5px] leading-relaxed text-muted-foreground">
            last active
            <span className="block text-foreground">{formatDay(streak.last_active_day)}</span>
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        {MILESTONES.map((value) => {
          const reached = longest >= value;
          return (
            <span
              key={value}
              className={cn(
                'flex-1 rounded-full border px-1.5 py-1 text-center font-mono text-[8.5px] uppercase tracking-[0.06em]',
                reached
                  ? 'border-brand-amber/45 bg-brand-amber/10 text-brand-amber'
                  : 'border-hairline text-muted-foreground/60',
              )}
            >
              {value}d
            </span>
          );
        })}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand-mint/80" />
        {next
          ? `${next - current} more day${next - current === 1 ? '' : 's'} to the ${next}-day milestone.`
          : 'Every milestone reached — the streak keeps paying a daily bonus.'}
      </p>
    </Panel>
  );
}