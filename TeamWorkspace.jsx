import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { teamApi } from '@/lib/teamApi';
import { Button } from '@/components/ui/button';
import RoleBadge from '@/components/teams/RoleBadge';
import TeamOverviewTab from '@/components/teams/TeamOverviewTab';
import TeamChatTab from '@/components/teams/TeamChatTab';
import TeamMembersTab from '@/components/teams/TeamMembersTab';
import TeamAnnouncementsTab from '@/components/teams/TeamAnnouncementsTab';
import TeamDirectTab from '@/components/teams/TeamDirectTab';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'chat', label: 'Chat' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'members', label: 'Members' },
  { key: 'direct', label: 'Direct' },
];

export default function TeamWorkspace() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [directPeer, setDirectPeer] = useState(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        const data = await teamApi('snapshot', { team_id: teamId });
        setSnapshot(data);
        setError('');
        return data;
      } catch (err) {
        if (!silent) setError(err.message);
        return null;
      }
    },
    [teamId],
  );

  useEffect(() => {
    setSnapshot(null);
    load(false);
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [load]);

  const copyCode = async () => {
    if (!snapshot?.team?.invite_code) return;
    try {
      await navigator.clipboard.writeText(snapshot.team.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const rotateCode = async () => {
    setBusy(true);
    try {
      await teamApi('rotate_code', { team_id: teamId });
      await load(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!window.confirm('Leave this team? Your messages stay for the crew, but you lose access.')) return;
    setBusy(true);
    try {
      await teamApi('leave', { team_id: teamId });
      navigate('/crew');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (error && !snapshot) {
    return (
      <div className="space-y-4">
        <Link to="/crew" className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All teams
        </Link>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[12px] text-destructive">{error}</div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex items-center gap-2 rounded-3xl border border-hairline bg-surface/40 px-5 py-10 text-[12px] text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Opening team
      </div>
    );
  }

  const { team, me, members } = snapshot;
  const isLeader = me.role === 'leader';
  const trackingCount = members.filter((member) => member.tracking).length;

  return (
    <div className="space-y-4">
      <Link to="/crew" className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All teams
      </Link>

      <header className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-medium leading-tight tracking-tight sm:text-[26px]">{team.name}</h1>
              <RoleBadge role={me.role} />
            </div>
            <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-muted-foreground">
              {team.description || 'No description set for this crew.'}
            </p>
            <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
              {members.length} member{members.length === 1 ? '' : 's'} · {trackingCount} tracking now
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isLeader && team.invite_code && (
              <div className="flex items-center gap-1 rounded-xl border border-hairline bg-white/[0.03] py-1 pl-3 pr-1">
                <span className="font-mono text-[11px] tracking-[0.08em] text-brand-cyan">{team.invite_code}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  aria-label="Copy invitation code"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-brand-mint" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={rotateCode}
                  disabled={busy}
                  className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground disabled:opacity-50"
                  aria-label="Generate a new invitation code"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={leave} disabled={busy} className="rounded-xl border-hairline text-[11.5px]">
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Leave
            </Button>
          </div>
        </div>
      </header>

      <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11.5px] transition-colors ${
              tab === item.key
                ? 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan'
                : 'border-hairline text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-[11.5px] text-destructive">{error}</div>
      )}

      {tab === 'overview' && <TeamOverviewTab snapshot={snapshot} />}
      {tab === 'chat' && <TeamChatTab teamId={teamId} snapshot={snapshot} reload={load} />}
      {tab === 'announcements' && <TeamAnnouncementsTab teamId={teamId} snapshot={snapshot} reload={load} />}
      {tab === 'members' && (
        <TeamMembersTab
          teamId={teamId}
          snapshot={snapshot}
          reload={load}
          onOpenDirect={(memberId) => {
            setDirectPeer(memberId);
            setTab('direct');
          }}
        />
      )}
      {tab === 'direct' && <TeamDirectTab snapshot={snapshot} initialPeerId={directPeer} />}
    </div>
  );
}