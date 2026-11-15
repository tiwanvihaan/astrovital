import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, Flame, Sparkles } from 'lucide-react';
import Panel from '@/components/common/Panel';
import useAstroStats from '@/hooks/useAstroStats';
import useAstroPoints from '@/hooks/useAstroPoints';
import PointsCelebration from '@/components/points/PointsCelebration';
import { cn } from '@/lib/utils';

function Stat({ label, value, unit, tone }) {
  return (
    <div className="rounded-2xl border border-hairline/70 bg-white/[0.02] px-3 py-2.5">
      <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={cn('num mt-1 text-[20px] leading-none', tone || 'text-foreground')}>
        {value}
        {unit ? <span className="ml-1 text-[10px] font-normal text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function AstroPointsPanel({ stats }) {
  const local = useAstroStats();
  const server = useAstroPoints();
  const data = stats || local;
  const earned = (data.achievements || []).filter((item) => item.earned);
  const totalPoints = server.data ? server.data.total_points : data.ready ? data.totalPoints : '—';
  const streakDays = server.data ? server.data.streak.current : data.ready ? data.streak : 0;

  return (
    <div data-tour="points">
      <PointsCelebration awards={server.awards} onDone={server.clearAwards} />
      <Panel
        eyebrow="AstroPoints"
        title="Your mission balance"
        subtitle="Points come from ring progress, with a daily bonus when all three close. Streaks and achievements add to the total."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-primary">
            <Sparkles className="h-3 w-3" /> Live
          </span>
        }
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="num text-[38px] leading-none text-foreground">{totalPoints}</p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">total points</p>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-amber/35 bg-brand-amber/10 px-2.5 py-1 text-[11px] text-brand-amber">
              <Flame className="h-3 w-3" /> {streakDays} day streak
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Today" value={data.ready ? data.todayPoints : '—'} unit="pts" />
          <Stat label="This week" value={data.ready ? data.weekPoints : '—'} unit="pts" />
          <Stat label="Perfect days" value={data.ready ? data.allRingDays : '—'} />
          <Stat
            label="Achievements"
            value={data.ready ? `${earned.length}/${(data.achievements || []).length}` : '—'}
            tone="text-brand-mint"
          />
        </div>

        <div className="mt-4 space-y-1.5">
          {(data.achievements || []).slice(0, 4).map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-[11.5px]">
              <Award className={cn('h-3.5 w-3.5 shrink-0', item.earned ? 'text-brand-mint' : 'text-muted-foreground/50')} />
              <span className={item.earned ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
              <span className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">{item.detail}</span>
            </div>
          ))}
        </div>

        <Link
          to="/astropoints"
          className="mt-4 inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-primary"
        >
          Open AstroPoints &amp; leaderboards <ChevronRight className="h-3 w-3" />
        </Link>
      </Panel>
    </div>
  );
}