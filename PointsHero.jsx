import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { cn } from '@/lib/utils';

function Tile({ label, value, unit, tone }) {
  return (
    <div className="rounded-2xl border border-hairline/70 bg-foreground/[0.02] px-3 py-2.5">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={cn('num mt-1 text-[19px] leading-none', tone || 'text-foreground')}>
        {value}
        {unit ? <span className="ml-1 text-[10px] font-normal text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function PointsHero({ data, onRefresh, busy }) {
  const streak = data?.streak || { current: 0, longest: 0 };

  return (
    <Panel
      eyebrow="AstroPoints"
      title="Mission balance"
      subtitle="Every point is validated against your own tracked activity — nothing is simulated and nothing pays twice."
      action={
        <button
          type="button"
          onClick={onRefresh}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
        >
          <Sparkles className={cn('h-3 w-3', busy && 'animate-pulse')} /> {busy ? 'Checking' : 'Live'}
        </button>
      }
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.p
            key={data?.total_points ?? 'loading'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="num text-[42px] leading-none text-foreground sm:text-[52px]"
          >
            {data ? data.total_points : '—'}
          </motion.p>
          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            total astro points
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-amber/35 bg-brand-amber/10 px-2.5 py-1 text-[11.5px] text-brand-amber">
            <Flame className="h-3 w-3" /> {streak.current} day streak
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-foreground/[0.03] px-2.5 py-1 text-[11.5px] text-muted-foreground">
            <TrendingUp className="h-3 w-3" /> best {streak.longest}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Today" value={data ? data.today_points : '—'} unit="pts" tone="text-brand-cyan" />
        <Tile label="This week" value={data ? data.week_points : '—'} unit="pts" />
        <Tile label="This month" value={data ? data.month_points : '—'} unit="pts" />
        <Tile label="Minutes today" value={data ? data.today.minutes : '—'} unit="min" tone="text-brand-mint" />
      </div>

      {data?.today && data.today.minutes > 240 && (
        <p className="mt-3 rounded-xl border border-brand-amber/30 bg-brand-amber/10 px-3 py-2 text-[11px] leading-relaxed text-brand-amber">
          No movement points for a day above 240 minutes — AstroPoints rewards consistency, not overtraining.
        </p>
      )}
    </Panel>
  );
}