import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import moment from 'moment';
import { teamApi } from '@/lib/teamApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MemberAvatar from './MemberAvatar';

export default function TeamDirectTab({ snapshot, initialPeerId }) {  const members = snapshot?.members || [];
  const myId = snapshot?.me?.user_id;
  const teammates = members.filter((member) => member.user_id !== myId);

  const [conversations, setConversations] = useState([]);
  const [peer, setPeer] = useState(null);
  const [thread, setThread] = useState(null);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const loadConversations = useCallback(async () => {
    const result = await teamApi('dm_conversations');
    setConversations(result.conversations || []);
  }, []);

  useEffect(() => {
    loadConversations().catch(() => {});
    const id = setInterval(() => loadConversations().catch(() => {}), 8000);
    return () => clearInterval(id);
  }, [loadConversations]);

  const openThread = useCallback(async (candidate) => {
    setPeer(candidate);
    setThread(null);
    setError('');
    try {
      const result = await teamApi('dm_thread', { peer_id: candidate.user_id });
      setThread(result);
      loadConversations().catch(() => {});
    } catch (err) {
      setError(err.message);
    }
  }, [loadConversations]);

  useEffect(() => {
    if (!initialPeerId) return;
    const candidate = teammates.find((member) => member.user_id === initialPeerId);
    if (candidate && peer?.user_id !== candidate.user_id) openThread(candidate);
  }, [initialPeerId]);

  useEffect(() => {
    if (!peer) return;
    const id = setInterval(async () => {      try {
        const result = await teamApi('dm_thread', { peer_id: peer.user_id });
        setThread(result);
      } catch {
        /* transient */
      }
    }, 6000);
    return () => clearInterval(id);
  }, [peer]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages?.length]);

  const send = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !peer || sending) return;
    setSending(true);
    setError('');
    try {
      await teamApi('send_dm', { peer_id: peer.user_id, body: text });
      setBody('');
      const result = await teamApi('dm_thread', { peer_id: peer.user_id });
      setThread(result);
      loadConversations().catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const conversationFor = (userId) => conversations.find((item) => item.peer_id === userId);

  return (
    <div className="grid gap-3 lg:grid-cols-[252px_1fr]">
      <div className="rounded-3xl border border-hairline bg-surface/70 p-3 shadow-panel">
        <p className="eyebrow px-1">Crew members</p>
        <div className="mt-2 space-y-1.5">
          {teammates.map((member) => {
            const conversation = conversationFor(member.user_id);
            const active = peer?.user_id === member.user_id;
            return (
              <button
                key={member.user_id}
                type="button"
                onClick={() => openThread(member)}
                className={`flex w-full items-center gap-2.5 rounded-2xl border px-2.5 py-2 text-left transition-colors ${
                  active ? 'border-brand-cyan/35 bg-brand-cyan/[0.08]' : 'border-transparent hover:bg-white/[0.04]'
                }`}
              >
                <MemberAvatar name={member.display_name} src={member.avatar_url} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium tracking-tight text-foreground">
                    {member.display_name}
                  </span>
                  <span className="block truncate text-[10.5px] text-muted-foreground">
                    {conversation?.last_body || 'No messages yet'}
                  </span>
                </span>
                {conversation?.unread > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand-cyan px-1 font-mono text-[9px] text-primary-foreground">
                    {conversation.unread}
                  </span>
                )}
              </button>
            );
          })}
          {!teammates.length && (
            <p className="px-1 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
              Invite crew members with the team code to start a direct conversation.
            </p>
          )}
        </div>
      </div>

      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-hairline bg-surface/70 shadow-panel">
        {!peer ? (
          <div className="grid flex-1 place-items-center p-6">
            <p className="max-w-xs text-center text-[12px] leading-relaxed text-muted-foreground">
              Pick a crew member to open a private conversation. Direct messages are stored and readable only by the two of you.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 border-b border-hairline/60 px-4 py-2.5">
              <MemberAvatar name={peer.display_name} src={peer.avatar_url} size="sm" />
              <div>
                <p className="text-[12.5px] font-medium tracking-tight text-foreground">{peer.display_name}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Direct message</p>
              </div>
            </div>

            <div className="h-[300px] space-y-2 overflow-y-auto px-4 py-3">
              {(thread?.messages || []).map((message) => (
                <div key={message.id} className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.mine ? 'text-right' : ''}`}>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {moment(message.created_date).format('MMM D, h:mm A')}
                    </span>
                    <p
                      className={`mt-1 whitespace-pre-line rounded-2xl px-3 py-2 text-[12px] leading-relaxed ${
                        message.mine
                          ? 'border border-brand-cyan/25 bg-brand-cyan/[0.09] text-foreground'
                          : 'border border-hairline/70 bg-white/[0.03] text-muted-foreground'
                      }`}
                    >
                      {message.body}
                    </p>
                  </div>
                </div>
              ))}
              {thread && !thread.messages.length && (
                <p className="py-6 text-center text-[11.5px] text-muted-foreground">No messages in this conversation yet.</p>
              )}
              {!thread && <p className="py-6 text-center text-[11.5px] text-muted-foreground">Loading conversation…</p>}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="mt-auto border-t border-hairline/60 p-3">
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
                  placeholder={`Message ${peer.display_name}…`}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
                />
                <Button type="submit" disabled={sending || !body.trim()} className="h-[44px] rounded-xl px-4">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}