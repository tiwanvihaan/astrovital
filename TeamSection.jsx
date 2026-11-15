import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageSquare } from 'lucide-react';
import useTeamOverview from '@/hooks/useTeamOverview';
import Panel from '@/components/common/Panel';
import RoleBadge from '@/components/teams/RoleBadge';

export default function TeamSection() {
  const data = useTeamOverview();
  const teams = data?.teams || [];

  return (
    <Panel
      eyebrow="Team activity"
      title="Your crews"
      subtitle={teams.length ? `${data.dm_unread || 0} unread direct message(s)` : 'No teams joined yet'}
      action={
        <Link to="/crew" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
          Open <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="space-y-2">
        {teams.slice(0, 4).map((team) => (
          <Link
            key={team.id}
            to={`/crew/${team.id}`}
            className="flex items-center justify-between gap-2 rounded-xl border border-hairline/60 bg-foreground/[0.02] px-2.5 py-2 transition-colors hover:border-brand-cyan/35"
          >
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium tracking-tight text-foreground">{team.name}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                {team.member_count} member{team.member_count === 1 ? '' : 's'}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              {team.unread > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-1.5 py-0.5 font-mono text-[9px] text-brand-cyan">
                  <MessageSquare className="h-2.5 w-2.5" /> {team.unread}
                </span>
              )}
              <RoleBadge role={team.role} />
            </span>
          </Link>
        ))}
        {!teams.length && (
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Create or join a crew to share chat, announcements and opted-in progress.
          </p>
        )}
      </div>
    </Panel>
  );
}