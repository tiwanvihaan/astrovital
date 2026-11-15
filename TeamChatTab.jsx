import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import moment from 'moment';
import { teamApi } from '@/lib/teamApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MemberAvatar from './MemberAvatar';

export default function TeamChatTab({ teamId, snapshot, reload }) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const messages = snapshot?.messages || [];
  const members = snapshot?.members || [];
  const myId = snapshot?.me?.user_id;

  useEffect(() => {
    teamApi('mark_read', { team_id: teamId }).catch(() => {});
  }, [teamId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      await teamApi('send_message', { team_id: teamId, body: text });
      setBody('');
      await reload(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-surface/70 shadow-panel">
      <div className="flex items-center justify-between border-b border-hairline/60 px-4 py-2.5">
        <div>
          <p className="eyebrow">Team chat</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {messages.length ? `${messages.length} stored message${messages.length === 1 ? '' : 's'}` : 'No messages yet'} · updates automatically
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-mint">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-mint" /> Live
        </span>
      </div>

      <div className="h-[420px] space-y-2.5 overflow-y-auto px-4 py-4">
        {messages.map((message) => {
          const mine = message.author_id === myId;
          const member = members.find((item) => item.user_id === message.author_id);
          return (
            <div key={message.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
              <MemberAvatar name={message.author_name} src={member?.avatar_url} size="sm" />
              <div className={`max-w-[78%] ${mine ? 'text-right' : ''}`}>
                <div className={`flex items-baseline gap-1.5 ${mine ? 'justify-end' : ''}`}>
                  <span className="text-[11px] font-medium tracking-tight text-foreground">
                    {mine ? 'You' : message.author_name}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {moment(message.created_date).format('MMM D, h:mm A')}
                  </span>
                </div>
                <p
                  className={`mt-1 whitespace-pre-line rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                    mine
                      ? 'border border-brand-cyan/25 bg-brand-cyan/[0.09] text-foreground'
                      : 'border border-hairline/70 bg-white/[0.03] text-muted-foreground'
                  }`}
                >
                  {message.body}
                </p>
              </div>
            </div>
          );
        })}
        {!messages.length && (
          <div className="grid h-full place-items-center">
            <p className="max-w-xs text-center text-[12px] leading-relaxed text-muted-foreground">
              No messages yet. Say hello to your crew — everything you send is saved to the database.
            </p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="border-t border-hairline/60 p-3">
        {error && <p className="mb-2 text-[11px] text-destructive">{error}</p>}
        <div className="flex items-end gap-2">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send(event);
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder="Message your crew…"
            className="min-h-[46px] flex-1 resize-none rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
          />
          <Button type="submit" disabled={sending || !body.trim()} className="h-[46px] rounded-xl px-4 text-[12.5px]">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}