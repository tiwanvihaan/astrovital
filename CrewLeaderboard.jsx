import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame, Loader2, Users } from 'lucide-react';
import Panel from '@/components/common/Panel';
import useLeaderboard from '@/hooks/useLeaderboard';
import useTeamOverview from '@/hooks/useTeamOverview';
import { initialsOf } from '@/lib/astroPoints';
import { cn } from '@/lib/utils';

const PODIUM = {
  1: 'border-brand-amber/45 bg-brand-amber/[0.08]',
  2: 'border-foreground/25 bg-foreground/[0.05]',
  3: 'border-brand-violet/35 bg-brand-violet/[0.07]',
};

function CrewRow({ row }) {
  return (
    <motion.li
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border px-2.5 py-2',
        PODIUM[row.rank] || 'border-transparent bg-foreground/[0.02]',
        row.is_me && 'ring-1 ring-primary/40',
      )}
    >
      <span className="w-4 shrink-0 font-mono text-[10px] text-muted-foreground">{row.rank}</span>
      {row.avatar_url ? (
        <img src={row.avatar_url} alt="" className="h-7 w-7 shrink-0 rounded-full border border-hairline object-cover" />
      ) : (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-foreground/[0.04] font-heading text-[8px] text-foreground">
          {initialsOf(row.display_name)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] text-foreground">
          {row.display_name}
          {row.is_me && <span className="ml-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-primary">you</span>}
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-brand-amber/80">
          <Flame className="h-2.5 w-2.5" /> {row.streak}d
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="num block text-[12px] text-foreground">{row.points}</span>
        <span className="num block font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
          {row.week} this wk
        </span>
      </span>
    </motion.li>
  );
}

function useCrewBoard(teamId) {
  const all = useLeaderboard({ scope: 'crew', period: 'all', teamId, pollMs: 120000 });
  const week = useLeaderboard({ scope: 'crew', period: 'week', teamId, pollMs: 120000 });

  const weekById = new Map((week.board?.rows || []).map((row) => [row.user_id, row.points]));
  const rows = (all.board?.rows || []).map((row) => ({ ...row, week: weekById.get(row.user_id) || 0 }));
  const sorted = [...rows].sort((a, b) => b.points - a.points).map((row, index) => ({ ...row, rank: index + 1 }));

  return { rows: sorted, me: all.board?.me, team: all.board?.team, loading: all.loading || week.loading, error: all.error };
}

export default function CrewLeaderboard() {
  const overview = useTeamOverview();
  const teams = overview?.teams || [];
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (!teamId && teams.length) setTeamId(teams[0].id);
  }, [teams, teamId]);

  const { rows, me, loading, error } = useCrewBoard(teamId);

  if (!teams.length) return null;

  return (
    <Panel
      eyebrow="Crew leaderboard"
      title="Astronauts in this crew"
      subtitle="Ranked by AstroPoints, with this week's progress. Members who hide their ranking are left out."
      action={<Users className="h-4 w-4 text-primary" />}
    >
      {teams.length > 1 && (
        <div className="mb-3">
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="h-8 rounded-lg border border-hairline bg-surface/70 px-2 text-[11.5px] text-foreground outline-none"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id} className="bg-card">
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="text-[11.5px] text-destructive">{error}</p>}

      {loading && !rows.length ? (
        <p className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading crew standings
        </p>
      ) : (
        <ol className="space-y-1">
          {rows.map((row) => (
            <CrewRow key={row.user_id} row={row} />
          ))}
          {!rows.length && (
            <li className="text-[11.5px] leading-relaxed text-muted-foreground">
              No ranked crew members yet — points appear as soon as anyone logs movement, mobility or a check-in.
            </li>
          )}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline/60 pt-2.5">
        <p className="text-[11px] text-muted-foreground">
          {me?.rank ? (
            <>
              You are <span className="text-foreground">#{me.rank}</span> in this crew with{' '}
              <span className="text-foreground">{me.points}</span> points.
            </>
          ) : (
            'Your crew rank appears once you earn points.'
          )}
        </p>
        <span className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-brand-amber/80">
          <Crown className="h-3 w-3" /> top three highlighted
        </span>
      </div>
    </Panel>
  );
}