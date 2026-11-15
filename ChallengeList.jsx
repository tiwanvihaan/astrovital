import React from 'react';
import { Check, Sparkles, Trophy } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { cn } from '@/lib/utils';

function ChallengeRow({ challenge }) {
  const pct = challenge.target ? Math.min(100, Math.round((challenge.progress / challenge.target) * 100)) : 0;
  return (
    <div className="rounded-xl border border-hairline/70 bg-foreground/[0.02] px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-medium leading-snug tracking-tight text-foreground">{challenge.label}</p>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{challenge.detail}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em]',
            challenge.done
              ? 'border-brand-mint/45 bg-brand-mint/10 text-brand-mint'
              : 'border-hairline text-muted-foreground',
          )}
        >
          {challenge.done ? (
            <span className="inline-flex items-center gap-1">
              <Check className="h-2.5 w-2.5" /> +{challenge.points}
            </span>
          ) : (
            `+${challenge.points}`
          )}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
        <span
          className={cn('block h-full rounded-full transition-all duration-500', challenge.done ? 'bg-brand-mint' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="num mt-1.5 text-[10px] text-muted-foreground">
        {challenge.progress} / {challenge.target}
      </p>
    </div>
  );
}

export default function ChallengeList({ challenges }) {
  const daily = challenges?.daily || [];
  const weekly = challenges?.weekly || [];

  return (
    <Panel
      eyebrow="Challenges"
      title="Today and this week"
      subtitle="Rewards land automatically the moment a challenge is met — the engine re-checks your records every time AstroVital opens."
      action={<Sparkles className="h-4 w-4 text-brand-rose" />}
    >
      <div className="space-y-2">
        {daily.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-hairline/60 pt-3">
        <Trophy className="h-3 w-3 text-primary" />
        <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">Weekly</p>
        {challenges?.week_key && (
          <span className="ml-auto font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
            {challenges.week_key}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-2">
        {weekly.map((challenge) => (
          <ChallengeRow key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </Panel>
  );
}