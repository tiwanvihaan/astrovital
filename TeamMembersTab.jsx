import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { teamApi } from '@/lib/teamApi';
import { TEAM_ROLES } from '@/lib/teamApi';
import Panel from '@/components/common/Panel';
import MemberAvatar from './MemberAvatar';
import RoleBadge from './RoleBadge';
import MySharingPanel from './MySharingPanel';
import { formatDate } from '@/lib/health';

export default function TeamMembersTab({ teamId, snapshot, reload, onOpenDirect }) {
  const { members, me } = snapshot;
  const [busyId, setBusyId] = useState(null);
  const isLeader = me.role === 'leader';

  const changeRole = async (memberId, role) => {
    setBusyId(memberId);
    try {
      await teamApi('set_role', { team_id: teamId, member_id: memberId, role });
      await reload(true);
      toast({ title: 'Role updated', description: 'The crew roster now reflects the new role.' });
    } catch (err) {
      toast({ title: 'Could not update role', description: err.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel eyebrow="Roster" title="Members and roles" className="lg:col-span-3" subtitle="Leaders can assign roles; everyone can message a teammate directly.">
        <div className="space-y-2">
          {members.map((member) => {
            const isMe = member.user_id === me.user_id;
            return (
              <div key={member.user_id} className="rounded-2xl border border-hairline/60 bg-white/[0.02] p-3">
                <div className="flex items-start gap-3">
                  <MemberAvatar name={member.display_name} src={member.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[12.5px] font-medium tracking-tight text-foreground">
                        {member.display_name} {isMe && <span className="text-muted-foreground">(you)</span>}
                      </p>
                      <RoleBadge role={member.role} />
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        <span className={`h-1.5 w-1.5 rounded-full ${member.tracking ? 'bg-brand-mint' : 'bg-muted-foreground/50'}`} />
                        {member.tracking ? 'Tracking now' : 'Not tracking'}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/80">
                      Joined {member.joined_at ? formatDate(member.joined_at, 'MMM D, YYYY') : '—'}
                    </p>
                    {member.bio && <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{member.bio}</p>}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {isLeader && !isMe ? (
                      <select
                        value={member.role}
                        disabled={busyId === member.user_id}
                        onChange={(event) => changeRole(member.user_id, event.target.value)}
                        className="rounded-lg border border-hairline bg-surface px-2 py-1 text-[10.5px] text-foreground disabled:opacity-50"
                        aria-label={`Role for ${member.display_name}`}
                      >
                        {TEAM_ROLES.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => onOpenDirect(member.user_id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-hairline px-2 py-1 text-[10.5px] text-muted-foreground transition-colors hover:border-brand-cyan/40 hover:text-foreground"
                      >
                        <MessageSquare className="h-3 w-3" /> Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="space-y-4 lg:col-span-2">
        <MySharingPanel teamId={teamId} sharing={me.sharing} onSaved={() => reload(true)} />
        <Panel eyebrow="How sharing works" title="Privacy by default">
          <ul className="space-y-2 text-[11.5px] leading-relaxed text-muted-foreground">
            <li>Your own health records are readable only by you.</li>
            <li>Teammates only see the switches you turn on above, plus your optional note.</li>
            <li>Turning a switch off removes that metric from the crew view immediately.</li>
            <li>Team chat, roster and announcements are visible to members only.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}