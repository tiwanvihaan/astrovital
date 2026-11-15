import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, Mic, MicOff, Sparkles, X } from 'lucide-react';

const MAX_IMAGES = 4;

export default function AnalysisForm({ onStarted, onReport, onFailed }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [usedVoice, setUsedVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [includeHistory, setIncludeHistory] = useState(true);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);

  const toggleVoice = () => {
    const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
    if (!Recognition) {
      setError('This browser cannot transcribe speech. Chrome or Edge supports it — you can always type instead.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) {
        setText((prev) => `${prev}${prev ? ' ' : ''}${transcript.trim()}`);
        setUsedVoice(true);
      }
    };
    recognition.onerror = (event) => {
      setError(
        event?.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings, or type your notes.'
          : 'Voice transcription stopped. You can type or try the microphone again.',
      );
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setError('');
    setListening(true);
  };

  const addFiles = async (event) => {
    const picked = Array.from(event.target.files || []).slice(0, MAX_IMAGES - images.length);
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
      setImages((prev) => [...prev, ...uploaded].slice(0, MAX_IMAGES));
    } catch (err) {
      setError(err.message || 'That file could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!text.trim() && !images.length) {
      setError('Describe what you are feeling, or add an image to analyse.');
      return;
    }
    setBusy(true);
    setError('');
    onStarted?.();
    try {
      const mode = images.length && text.trim() ? 'mixed' : images.length ? 'images' : usedVoice ? 'voice' : 'text';
      const response = await base44.functions.invoke('healthAnalysis', {
        text: text.trim(),
        image_urls: images.map((image) => image.url),
        mode,
        include_history: includeHistory,
      });
      if (response?.data?.error) throw new Error(response.data.error);
      onReport?.(response.data.report, response.data.id);
      setText('');
      setImages([]);
      setUsedVoice(false);
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'The analysis failed.';
      setError(message);
      onFailed?.(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel sm:p-6">
      <p className="eyebrow">New analysis</p>
      <h2 className="mt-1 text-[15px]">Tell AstroAI what changed</h2>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        Type or dictate what you are noticing — symptoms, sleep, movement, mobility, recovery — and attach health reports,
        fitness summaries or charts. Every input goes through the same analysis.
      </p>

      <div className="mt-3 rounded-2xl border border-hairline bg-white/[0.03] p-2">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          maxLength={4000}
          placeholder="For example: Since Tuesday my lower back feels stiff after exercise, and I only slept about five hours for two nights…"
          className="w-full resize-y bg-transparent px-2 py-1.5 text-[12.5px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline/60 px-1 pt-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleVoice}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] transition-colors ${
                listening ? 'border-brand-rose/50 bg-brand-rose/10 text-brand-rose' : 'border-hairline text-muted-foreground hover:text-foreground'
              }`}
            >
              {listening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              {listening ? 'Stop dictation' : 'Dictate'}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || images.length >= MAX_IMAGES}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1 text-[10.5px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImagePlus className="h-3 w-3" />}
              {uploading ? 'Uploading' : 'Add images'}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple hidden onChange={addFiles} />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
            {text.length}/4000 · {images.length}/{MAX_IMAGES} images
          </span>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((image) => (
            <div key={image.uri} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-hairline">
              <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((item) => item.uri !== image.uri))}
                className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-background/80 text-foreground"
                aria-label={`Remove ${image.name}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="mt-3 flex items-center gap-2 text-[10.5px] text-muted-foreground">
        <input
          type="checkbox"
          checked={includeHistory}
          onChange={(event) => setIncludeHistory(event.target.checked)}
          className="h-3 w-3 rounded border-hairline bg-transparent"
        />
        Include my recorded AstroVital data in this analysis
      </label>

      {error && <p className="mt-3 rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2 text-[11px] text-brand-rose">{error}</p>}

      <Button onClick={submit} disabled={busy} className="mt-3 w-full">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {busy ? 'Analysing your records and NASA research…' : 'Run AI health analysis'}
      </Button>
      <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        Images are stored privately · AI-generated, not a diagnosis
      </p>
    </div>
  );
}