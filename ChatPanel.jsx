import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ImagePlus, Loader2, Plus, RotateCcw, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

const PROMPTS = [
  'How are you?',
  'Explain photosynthesis',
  'How is my mobility trending this week?',
  'What does NASA research say about bone loss?',
];

const GREETING = {
  role: 'assistant',
  content:
    'AstroAI online. Ask me anything at all — everyday questions, writing, maths, coding, news and current events — plus your own health trends, spaceflight science and NASA research. What would you like to know?',
  sources: [],
};

export default function ChatPanel({ seedQuestion, onSeeded }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [useHealth, setUseHealth] = useState(true);
  const [lastAsk, setLastAsk] = useState(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);
  const seededRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, busy]);

  const ask = async ({ text, attachments }) => {
    const question = (text || '').trim();
    if (!question || busy) return;
    setError('');
    setInput('');
    setImages([]);
    setLastAsk({ text: question, attachments });
    const next = [...messages, { role: 'user', content: question, images: attachments.map((item) => item.url) }];
    setMessages(next);
    setBusy(true);
    try {
      const response = await base44.functions.invoke('astroAI', {
        message: question,
        history: next.slice(-10).map(({ role, content }) => ({ role, content })),
        image_urls: attachments.map((item) => item.url),
        include_health: useHealth,
        client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      });
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      if (!data.reply) throw new Error('AstroAI did not return an answer.');
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, sources: data.sources || [] }]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'AstroAI is unavailable right now.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (seedQuestion && seedQuestion !== seededRef.current) {
      seededRef.current = seedQuestion;
      ask({ text: seedQuestion, attachments: [] });
      onSeeded?.();
    }
  }, [seedQuestion]);

  const resetChat = () => {
    setMessages([GREETING]);
    setInput('');
    setImages([]);
    setError('');
    setLastAsk(null);
    setBusy(false);
  };

  const addFiles = async (event) => {
    const picked = Array.from(event.target.files || []).slice(0, 3 - images.length);
    event.target.value = '';
    if (!picked.length) return;
    setUploading(true);
    setError('');
    try {
      const uploaded = [];
      for (const file of picked) {
        if (file.size > 7 * 1024 * 1024) throw new Error(`${file.name} is larger than 7 MB.`);
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
        uploaded.push({ uri: file_uri, url: signed_url, name: file.name });
      }
      setImages((prev) => [...prev, ...uploaded].slice(0, 3));
    } catch (err) {
      setError(err.message || 'That image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="flex h-[min(74vh,660px)] flex-col overflow-hidden rounded-3xl border border-hairline bg-surface/70 shadow-panel backdrop-blur-xl">
      <header className="flex items-center justify-between gap-3 border-b border-hairline/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-cyan/25 to-brand-violet/30">
            <Sparkles className="h-4 w-4 text-brand-cyan" />
          </div>
          <div>
            <p className="text-[13px] font-medium tracking-tight text-foreground">AstroAI</p>
            <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" /> General purpose · live web · NASA OSDR
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
            <input
              type="checkbox"
              checked={useHealth}
              onChange={(event) => setUseHealth(event.target.checked)}
              className="h-2.5 w-2.5 rounded border-hairline bg-transparent"
            />
            My records
          </label>
          <button
            type="button"
            onClick={resetChat}
            className="inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-brand-cyan/40 hover:text-foreground"
          >
            <Plus className="h-2.5 w-2.5" /> New chat
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((message, index) => (
          <div key={index} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[88%]', message.role === 'user' ? 'text-right' : '')}>
              {message.images?.length > 0 && (
                <div className="mb-1.5 flex justify-end gap-1.5">
                  {message.images.map((url, imageIndex) => (
                    <img key={imageIndex} src={url} alt="Attachment" className="h-14 w-14 rounded-lg border border-hairline object-cover" />
                  ))}
                </div>
              )}
              <div
                className={cn(
                  'whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-left text-[12.5px] leading-relaxed',
                  message.role === 'user'
                    ? 'bg-brand-cyan/15 text-foreground'
                    : 'border border-hairline/70 bg-white/[0.03] text-muted-foreground',
                )}
              >
                {message.content}
              </div>
              {message.sources?.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground/70">NASA OSDR sources</p>
                  {message.sources.map((source) => (
                    <a
                      key={source.accession}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-left text-[10px] leading-snug text-muted-foreground hover:text-brand-cyan"
                    >
                      {source.accession} — {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2">
            <p className="text-[11px] text-brand-rose">{error}</p>
            {lastAsk && (
              <button
                type="button"
                onClick={() => ask(lastAsk)}
                className="inline-flex shrink-0 items-center gap-1 text-[10px] text-brand-rose hover:underline"
              >
                <RotateCcw className="h-3 w-3" /> Retry
              </button>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2 sm:px-5">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => ask({ text: prompt, attachments: [] })}
              className="rounded-full border border-hairline px-2.5 py-1 text-[10.5px] text-muted-foreground transition-colors hover:border-brand-cyan/40 hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask({ text: input, attachments: images });
        }}
        className="border-t border-hairline/60 p-3 sm:p-4"
      >
        {images.length > 0 && (
          <div className="mb-2 flex gap-1.5">
            {images.map((image) => (
              <div key={image.uri} className="relative h-12 w-12 overflow-hidden rounded-lg border border-hairline">
                <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((item) => item.uri !== image.uri))}
                  className="absolute right-0 top-0 grid h-3.5 w-3.5 place-items-center rounded-full bg-background/85"
                  aria-label="Remove"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface/70 px-3 py-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || images.length >= 3}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            aria-label="Attach an image"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addFiles} />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything…"
            className="flex-1 bg-transparent py-1.5 text-[12.5px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="submit"
            disabled={busy || (!input.trim() && !images.length)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-cyan text-primary-foreground transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </section>
  );
}