import React, { useState } from 'react';
import { ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { explainStudy } from '@/lib/research';

const Row = ({ label, value }) =>
  value ? (
    <div className="flex justify-between gap-3 border-b border-hairline/40 py-1.5 last:border-0">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
      <span className="max-w-[62%] text-right text-[11.5px] leading-snug text-foreground">{value}</span>
    </div>
  ) : null;

export default function StudyDialog({ study, onClose }) {
  const [explanation, setExplanation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const explain = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await explainStudy(study.accession);
      setExplanation(data.explanation || '');
    } catch (err) {
      setError(err.message || 'AstroAI could not explain this study right now.');
    } finally {
      setBusy(false);
    }
  };

  const close = (open) => {
    if (!open) {
      setExplanation('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={Boolean(study)} onOpenChange={close}>
      <DialogContent className="max-h-[86vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-brand-cyan">NASA OSDR · {study?.accession}</p>
          <DialogTitle className="mt-1 text-[14px] leading-snug">{study?.title}</DialogTitle>
          <DialogDescription className="text-[11px]">
            Live record from osdr.nasa.gov. Study metadata is NASA's; the interpretation below is AI-generated and clearly labelled.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Row label="Mission" value={[study?.mission, study?.mission_start, study?.mission_end].filter(Boolean).join(' · ')} />
          <Row label="Project" value={study?.project} />
          <Row label="Material" value={study?.material} />
          <Row label="Assay" value={study?.assay} />
          <Row label="Organisms" value={(study?.organisms || []).join(', ')} />
          <Row label="Publication" value={study?.publication} />
          <Row label="Released" value={study?.released} />
        </div>

        {study?.description && (
          <div className="mt-3 rounded-2xl border border-hairline/60 bg-white/[0.02] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Abstract</p>
            <p className="mt-1.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-muted-foreground">
              {study.description.length > 700 ? `${study.description}…` : study.description}
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={explain} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {busy ? 'Reading the record…' : 'Explain in plain language'}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={study?.url} target="_blank" rel="noreferrer">
              Open on NASA OSDR <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        {error && <p className="mt-3 rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2 text-[11px] text-brand-rose">{error}</p>}

        {explanation && (
          <div className="mt-3 rounded-2xl border border-brand-violet/25 bg-brand-violet/[0.06] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand-violet">AstroAI explanation · AI-generated</p>
            <p className="mt-1.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-foreground/90">{explanation}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}