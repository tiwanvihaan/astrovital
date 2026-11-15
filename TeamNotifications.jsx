import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MessageSquare, Megaphone } from 'lucide-react';

export default function TeamNotifications({ data }) {
  const teams = data?.teams || [];
  const unreadMessages = teams.reduce((total, team) => total + (team.unread || 0), 0);
  const direct = data?.dm_unread || 0;

  if (!unreadMessages && !direct) return null;

  return (
    <Link
      to="/crew"
      className="group flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-primary/25 bg-primary/[0.06] px-3.5 py-2.5 transition-colors hover:border-primary/45 hover:bg-primary/[0.09]"
    >
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-primary">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
        Team
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-foreground">
        {unreadMessages > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-3 w-3 text-primary" />
            {unreadMessages} new crew message{unreadMessages === 1 ? '' : 's'}
          </span>
        )}
        {direct > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Megaphone className="h-3 w-3 text-brand-violet" />
            {direct} direct message{direct === 1 ? '' : 's'} unread
          </span>
        )}
      </span>
      <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors group-hover:text-primary">
        Open <ArrowUpRight className="h-3 w-3" />
      </span>
    </Link>
  );
}