import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

export default function StudyCard({ study, onOpen, compact = false }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-hairline/70 bg-white/[0.02] p-4 transition-colors hover:border-brand-cyan/35">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-brand-cyan">
          {study.accession}
        </span>
        {study.source && <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{study.source}</span>}
      </div>

      <button type="button" onClick={() => onOpen?.(study)} className="mt-2 text-left">
        <h3 className="text-[12.5px] font-medium leading-snug tracking-tight text-foreground group-hover:text-brand-cyan">
          {study.title}
        </h3>
      </button>

      {!compact && study.description && (
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">{study.description}</p>
      )}

      <div className="mt-auto pt-3 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
        {[study.mission, study.material, (study.organisms || [])[0]].filter(Boolean).join(' · ') || 'NASA OSDR record'}
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onOpen?.(study)}
          className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground hover:text-foreground"
        >
          Read record <ArrowUpRight className="h-3 w-3" />
        </button>
        <a
          href={study.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[10.5px] text-muted-foreground hover:text-brand-cyan"
        >
          osdr.nasa.gov <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}