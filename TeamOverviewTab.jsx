import React, { useMemo } from 'react';
import { Megaphone, Pin, Radio, ShieldCheck, Users } from 'lucide-react';
import Panel from '@/components/common/Panel';
import MemberAvatar from './MemberAvatar';
import RoleBadge from './RoleBadge';
import { formatDate, timeAgo } from '@/lib/health';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-hairline/70 bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="num mt-2 text-[20px] font-medium leading-none">{value}</p>
    </div>
  );
}

export default function TeamOverviewTab({ snapshot }) {
  const { members, messages, announcements, team } = snapshot;
  const pinned = announcements.filter((item) => item.pinned);
  const tracking = members.filter((member) => member.tracking);
  const sharing = members.filter(
    (member) => member.sharing.activity || member.sharing.recovery || member.sharing.mobility,
  );

  const feed = useMemo(() => {
    const events = [
      ...announcements.map((item) => ({
        id: `a-${item.id}`,
        at: item.created_date,
        kind: 'Announcement',
        author: item.author_name,
        text: `${item.title} — ${item.body}`,
      })),
      ...messages.slice(-12).map((item) => ({
        id: `m-${item.id}`,
        at: item.created_date,
        kind: 'Message',
        author: item.author_name,
        text: item.body,
      })),
      ...members.map((member) => ({
        id: `j-${member.user_id}`,
        at: member.joined_at,
        kind: 'Joined',
        author: member.display_name,
        text: 'joined the crew.',
      })),
    ];
    return events.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
  }, [announcements, messages, members]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Users} label="Members" value={members.length} />
        <Stat icon={Radio} label="Tracking now" value={tracking.length} />
        <Stat icon={ShieldCheck} label="Sharing metrics" value={sharing.length} />
        <Stat icon={Megaphone} label="Announcements" value={announcements.length} />
      </div>

      {pinned.length > 0 && (
        <Panel eyebrow="Pinned" title={pinned[0].title} subtitle={`${pinned[0].author_name} · ${timeAgo(pinned[0].created_date)}`}>
          <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-muted-foreground">{pinned[0].body}</p>
        </Panel>
      )}

      <Panel eyebrow="Roster" title="Who is on this crew" subtitle="Tracking status comes from each member's own live session.">
        <div className="grid gap-2 sm:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center gap-3 rounded-2xl border border-hairline/60 bg-white/[0.02] p-3"
            >
              <MemberAvatar name={member.display_name} src={member.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium tracking-tight text-foreground">{member.display_name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <RoleBadge role={member.role} />
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${member.tracking ? 'bg-brand-mint' : 'bg-muted-foreground/50'}`} />
                    {member.tracking ? 'Tracking' : 'Not tracking'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel eyebrow="Shared with the crew" title="Opted-in progress" className="lg:col-span-3" subtitle="Members choose what to share, per team.">
          <div className="space-y-2.5">
            {sharing.length ? (
              sharing.map((member) => (
                <div key={member.user_id} className="rounded-2xl border border-hairline/60 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <MemberAvatar name={member.display_name} src={member.avatar_url} size="sm" />
                    <p className="text-[12px] font-medium tracking-tight text-foreground">{member.display_name}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {member.sharing.activity && (
                      <span className="rounded-full border border-brand-cyan/25 bg-brand-cyan/[0.07] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-brand-cyan">
                        Movement {member.shared.activity ? `${member.shared.activity.minutes} min / 7d` : 'shared'}
                      </span>
                    )}
                    {member.sharing.recovery && (
                      <span className="rounded-full border border-brand-mint/25 bg-brand-mint/[0.07] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-brand-mint">
                        Recovery {typeof member.shared.recovery === 'number' ? `${Math.round(member.shared.recovery)}/100` : 'no check-in'}
                      </span>
                    )}
                    {member.sharing.mobility && (
                      <span className="rounded-full border border-brand-violet/25 bg-brand-violet/[0.07] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-brand-violet">
                        Mobility {typeof member.shared.mobility === 'number' ? `${Math.round(member.shared.mobility)}/100` : 'no assessment'}
                      </span>
                    )}
                  </div>
                  {member.shared.note && (
                    <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">{member.shared.note}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                No one has shared health data with this crew. Private records stay private until each member opts in from the Members tab.
              </p>
            )}
          </div>
        </Panel>

        <Panel eyebrow="Activity" title="Latest crew events" className="lg:col-span-2">
          <div className="space-y-2.5">
            {feed.map((event) => (
              <div key={event.id} className="rounded-xl border border-hairline/60 bg-white/[0.02] p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand-cyan">{event.kind}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{formatDate(event.at, 'MMM D, h:mm A')}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                  <span className="text-foreground">{event.author}</span> {event.text}
                </p>
              </div>
            ))}
            {!feed.length && <p className="text-[12px] text-muted-foreground">No crew events yet.</p>}
          </div>
        </Panel>
      </div>

      {pinned.length > 1 && (
        <Panel eyebrow="Pinned announcements" title="Everything currently pinned">
          <div className="space-y-2">
            {pinned.slice(1).map((item) => (
              <div key={item.id} className="rounded-xl border border-hairline/60 bg-white/[0.02] p-3">
                <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                  <Pin className="h-3 w-3 text-brand-cyan" /> {item.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <p className="px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">
        Team created {formatDate(team.created_date, 'MMM D, YYYY')}
      </p>
    </div>
  );
}