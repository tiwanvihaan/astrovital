import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare, Users } from 'lucide-react';
import { teamApi } from '@/lib/teamApi';
import Panel from '@/components/common/Panel';
import TeamCard from '@/components/teams/TeamCard';
import CreateJoinPanels from '@/components/teams/CreateJoinPanels';
import CrewTelemetry from '@/components/crew/CrewTelemetry';
import CrewLeaderboard from '@/components/crew/CrewLeaderboard';

export default function Team() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const result = await teamApi('overview');
    setData(result);
    setError('');
    return result;
  }, []);

  useEffect(() => {
    load().catch((err) => setError(err.message));
    const id = setInterval(() => load().catch(() => {}), 15000);
    return () => clearInterval(id);
  }, [load]);

  const handleCreate = async ({ name, description }) => {
    setBusy(true);
    setError('');
    try {
      const result = await teamApi('create', { name, description });
      navigate(`/crew/${result.team_id}`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (code) => {
    setBusy(true);
    setError('');
    try {
      const result = await teamApi('join', { code });
      navigate(`/crew/${result.team_id}`);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const teams = data?.teams || [];

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Crew collaboration</p>
        <h1 className="mt-2 text-[24px] leading-[1.15] sm:text-[29px]">Crew</h1>
        <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
          Shared chat, roster and announcements. Health metrics stay private unless each member chooses to share them.
        </p>
      </header>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12px] text-destructive">
          {error}
        </div>
      )}

      <CreateJoinPanels onCreate={handleCreate} onJoin={handleJoin} busy={busy} />

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Your crews</p>
            <h2 className="mt-1 text-[15px] font-medium tracking-tight">Active memberships</h2>
          </div>
          {data && (
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {teams.length} team{teams.length === 1 ? '' : 's'}
              {data.dm_unread > 0 ? ` · ${data.dm_unread} new message${data.dm_unread === 1 ? '' : 's'}` : ''}
            </span>
          )}
        </div>

        {!data ? (
          <div className="flex items-center gap-2 rounded-3xl border border-hairline bg-surface/40 px-5 py-8 text-[12px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your teams
          </div>
        ) : teams.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <Panel eyebrow="Nothing yet" title="You are not in a team">
            <div className="flex flex-col items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Create a team above, or join one with an invitation code.
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Chat history is stored in the database and stays after you sign out.
              </span>
            </div>
          </Panel>
        )}
      </section>

      <CrewLeaderboard />

      <CrewTelemetry />
    </div>
  );
}