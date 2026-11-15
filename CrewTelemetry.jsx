import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Trophy } from 'lucide-react';
import Panel from '@/components/common/Panel';
import useTeamOverview from '@/hooks/useTeamOverview';
import useCrewBoard from '@/hooks/useCrewBoard';
import { summariseCrew, crewAchievements, memberAchievements, initialsOf } from '@/lib/crewBoard';
import ChallengeBoard from '@/components/crew/ChallengeBoard';
import { cn } from '@/lib/utils';

/** Crew telemetry on the phone: standings and challenges without leaving the personal dashboard. */
export default function CrewTelemetry() {
  const overview = useTeamOverview();
  const teams = overview?.teams || [];
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (!teamId && teams.length) setTeamId(teams[0].id);
  }, [teams, teamId]);

  const { board, reload } = useCrewBoard(teamId, 30000);
  const crew = useMemo(() => summariseCrew(board?.members || []), [board]);
  const achievements = useMemo(() => crewAchievements(crew.rows), [crew.rows]);
  const myId = board?.me?.user_id;
  const myRow = crew.rows.find((row) => row.user_id === myId);
  const myRank = crew.byTotal.findIndex((row) => row.user_id === myId) + 1;

  if (!teams.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <h2 className="text-[13px] font-medium tracking-tight text-foreground">Crew telemetry</h2>
        {teams.length > 1 && (
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="h-8 rounded-lg border border-hairline bg-surface/70 px-2 text-[11px] text-foreground outline-none"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id} className="bg-card">
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          eyebrow="Leaderboard"
          title="Crew standings"
          subtitle="AstroPoints, weekly points and streak — private measurements stay out of it."
          action={<Trophy className="h-4 w-4 text-brand-amber" />}
        >
          <ol className="space-y-1.5">
            {crew.byTotal.slice(0, 6).map((row, index) => (
              <li
                key={row.user_id}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-2 py-1.5',
                  row.user_id === myId ? 'bg-primary/10 ring-1 ring-primary/25' : 'bg-white/[0.02]',
                )}
              >
                <span className="w-3.5 shrink-0 font-mono text-[10px] text-muted-foreground">{index + 1}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-white/[0.04] font-heading text-[8px] text-foreground">
                  {initialsOf(row.display_name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-foreground">{row.display_name}</span>
                <span className="num shrink-0 text-[12px] text-foreground">{row.totalPoints}</span>
                <span className="w-12 shrink-0 text-right font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {row.streak}d
                </span>
              </li>
            ))}
            {!crew.rows.length && <li className="text-[11.5px] text-muted-foreground">No crew data yet.</li>}
          </ol>

          {myRow && myRank > 0 && (
            <p className="mt-3 border-t border-hairline/60 pt-2.5 text-[11px] text-muted-foreground">
              You are <span className="text-foreground">#{myRank}</span> with {myRow.weekPoints} points this week.
            </p>
          )}

          <div className="mt-3 space-y-1.5 border-t border-hairline/60 pt-2.5">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">Public achievements</p>
            {crew.rows.map((row) => {
              const badges = memberAchievements(row);
              return (
                <div key={row.user_id} className="flex items-start gap-2 text-[11px]">
                  <span className="w-24 shrink-0 truncate text-foreground">{row.display_name}</span>
                  <span className="flex-1 leading-relaxed text-muted-foreground">
                    {badges.length ? badges.join(' · ') : 'No badges yet'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link to="/crew" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
              <Trophy className="h-3 w-3" /> Open crew workspace <ChevronRight className="h-3 w-3" />
            </Link>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
              {crew.totals.closedToday}/{crew.rows.length} rings closed today
            </span>
          </div>
        </Panel>

        <Panel eyebrow="Challenges" title="Shared mission progress" subtitle="Progress is calculated from every crew member’s rings.">
          <ChallengeBoard
            teamId={teamId}
            challenges={board?.challenges || []}
            rows={crew.rows}
            canManage={board?.me?.role === 'leader'}
            onChanged={reload}
          />
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-hairline/60 pt-3">
            {achievements.map((item) => (
              <span
                key={item.key}
                title={item.detail}
                className={cn(
                  'rounded-full border px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.1em]',
                  item.earned ? 'border-brand-mint/40 bg-brand-mint/10 text-brand-mint' : 'border-hairline text-muted-foreground/60',
                )}
              >
                {item.label}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}