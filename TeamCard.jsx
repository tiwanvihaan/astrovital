import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';
import RoleBadge from './RoleBadge';

export default function TeamCard({ team }) {
  return (
    <Link
      to={`/crew/${team.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel transition-colors hover:border-brand-cyan/35"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium leading-snug tracking-tight text-foreground">{team.name}</h3>
          {team.unread > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-2 py-0.5 font-mono text-[9px] tracking-[0.08em] text-brand-cyan">
              <MessageSquare className="h-2.5 w-2.5" /> {team.unread}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {team.description || 'No description yet.'}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline/60 pt-3">
        <RoleBadge role={team.role} />
        <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
          <Users className="h-3 w-3" /> {team.member_count}
        </span>
      </div>
    </Link>
  );
}