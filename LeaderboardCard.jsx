import React, { useEffect, useState } from 'react';
import { Loader2, Trophy, Users } from 'lucide-react';
import Panel from '@/components/common/Panel';
import useLeaderboard from '@/hooks/useLeaderboard';
import useTeamOverview from '@/hooks/useTeamOverview';
import LeaderRow from './LeaderRow';
import { PERIOD_LABEL } from '@/lib/astroPoints';
import { cn } from '@/lib/utils';

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-hairline bg-foreground/[0.03] p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors',
            value === option.value ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function LeaderboardCard() {
  const overview = useTeamOverview();
  const teams = overview?.teams || [];
  const [scope, setScope] = useState('global');
  const [period, setPeriod] = useState('all');
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (!teamId && teams.length) setTeamId(teams[0].id);
  }, [teams, teamId]);

  const { board, error, loading } = useLeaderboard({ scope, period, teamId });
  const rows = board?.rows || [];
  const me = board?.me;
  const needsCrew = scope === 'crew' && !teams.length;

  return (
    <Panel
      eyebrow="Leaderboard"
      title="Standings"
      subtitle="Display names, avatars, points and streaks only. Private health measurements never appear here."
      action={<Trophy className="h-4 w-4 text-brand-amber" />}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: 'global', label: 'Global' },
            { value: 'crew', label: 'Crew' },
          ]}
        />
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'all', label: 'All time' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
        {scope === 'crew' && teams.length > 1 && (
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="h-7 rounded-lg border border-hairline bg-surface/70 px-2 text-[11px] text-foreground outline-none"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id} className="bg-card">
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="mt-3 text-[11.5px] text-destructive">{error}</p>}

      {needsCrew ? (
        <p className="mt-4 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Join or create a crew to see crew rankings. Global rankings are always available.
        </p>
      ) : loading && !board ? (
        <p className="mt-4 flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading standings
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-1">
            {rows.map((row) => (
              <LeaderRow key={row.user_id} row={row} compact />
            ))}
            {!rows.length && (
              <li className="text-[11.5px] leading-relaxed text-muted-foreground">
                No ranked astronauts yet in this period.
              </li>
            )}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline/60 pt-2.5">
            <p className="text-[11px] text-muted-foreground">
              {me?.rank ? (
                <>
                  You are <span className="text-foreground">#{me.rank}</span> of {board?.total_ranked || 0} with{' '}
                  <span className="text-foreground">{me.points}</span> points
                  {board?.team ? ` in ${board.team.name}` : ' this period'}.
                </>
              ) : (
                'Ranking appears once you earn your first points.'
              )}
            </p>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
              {PERIOD_LABEL[period]} · auto-updating
            </span>
          </div>

          {me?.hidden && (
            <p className="mt-2 text-[10.5px] leading-relaxed text-brand-amber/90">
              Your ranking is hidden from other astronauts. You can change that in Settings → Recent Placings.
            </p>
          )}
        </>
      )}
    </Panel>
  );
}