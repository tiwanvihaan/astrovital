import React, { useState } from 'react';
import { Loader2, Megaphone, Pin } from 'lucide-react';
import { teamApi } from '@/lib/teamApi';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { timeAgo } from '@/lib/health';

export default function TeamAnnouncementsTab({ teamId, snapshot, reload }) {
  const { announcements, me } = snapshot;
  const isLeader = me.role === 'leader';
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const post = async (event) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setError('');
    try {
      await teamApi('announce', { team_id: teamId, title, body, pinned });
      setTitle('');
      setBody('');
      setPinned(false);
      await reload(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const togglePin = async (announcement) => {
    try {
      await teamApi('toggle_pin', { team_id: teamId, announcement_id: announcement.id });
      await reload(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        {announcements.map((item) => (
          <article key={item.id} className="rounded-3xl border border-hairline bg-surface/70 p-4 shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  {item.pinned && <Pin className="h-3 w-3 text-brand-cyan" />}
                  <h3 className="text-[13.5px] font-medium tracking-tight text-foreground">{item.title}</h3>
                </div>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  {item.author_name} · {timeAgo(item.created_date)}
                </p>
              </div>
              {isLeader && (
                <button
                  type="button"
                  onClick={() => togglePin(item)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] transition-colors ${
                    item.pinned
                      ? 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan'
                      : 'border-hairline text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Pin className="h-3 w-3" /> {item.pinned ? 'Pinned' : 'Pin'}
                </button>
              )}
            </div>
            <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-muted-foreground">{item.body}</p>
          </article>
        ))}
        {!announcements.length && (
          <Panel eyebrow="Nothing posted" title="No announcements yet">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {isLeader
                ? 'Use the form to brief your crew. Pinned announcements stay at the top of the list.'
                : 'Only team leaders can post announcements. Yours will appear here.'}
            </p>
          </Panel>
        )}
      </div>

      <div className="lg:col-span-2">
        {isLeader ? (
          <Panel eyebrow="Leader tool" title="Post an announcement" subtitle="Briefing the crew is limited to leaders.">
            <form onSubmit={post} className="space-y-2.5">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Title"
                className="h-10 rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
              />
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="What does the crew need to know?"
                className="rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
              />
              <button
                type="button"
                onClick={() => setPinned((value) => !value)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${
                  pinned ? 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan' : 'border-hairline text-muted-foreground'
                }`}
              >
                <Pin className="h-3 w-3" /> {pinned ? 'Will be pinned' : 'Pin to top'}
              </button>
              {error && <p className="text-[11px] text-destructive">{error}</p>}
              <Button type="submit" disabled={busy || !title.trim() || !body.trim()} className="h-9 w-full rounded-xl text-[12.5px]">
                {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Megaphone className="mr-1.5 h-3.5 w-3.5" />}
                Post announcement
              </Button>
            </form>
          </Panel>
        ) : (
          <Panel eyebrow="Permissions" title="Leader-only posting">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Announcements are written by the team leader. Ask them if something needs to be shared with the whole crew.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}