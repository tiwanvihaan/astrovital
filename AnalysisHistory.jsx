import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import useCollection from '@/hooks/useCollection';
import { History, Trash2 } from 'lucide-react';
import moment from 'moment';

const MODE_LABEL = { text: 'Text', voice: 'Voice', images: 'Images', mixed: 'Text + images' };

export default function AnalysisHistory({ activeId, onOpen }) {
  const items = useCollection('HealthAnalysis', {}, { sort: '-created_date', limit: 25 });
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const remove = async (record) => {
    setBusyId(record.id);
    setError('');
    try {
      await base44.entities.HealthAnalysis.delete(record.id);
    } catch (err) {
      setError(err.message || 'That analysis could not be deleted.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel">
      <div className="flex items-center gap-2">
        <History className="h-3.5 w-3.5 text-brand-cyan" />
        <h2 className="text-[12px] uppercase tracking-[0.12em]">Health timeline</h2>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        Every analysis you run is saved here. Open one to revisit it, or delete it permanently.
      </p>

      {error && <p className="mt-2 rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2 text-[11px] text-brand-rose">{error}</p>}

      <div className="mt-3 space-y-1.5">
        {items === null && <div className="h-16 animate-pulse rounded-xl border border-hairline bg-white/[0.02]" />}
        {items?.length === 0 && (
          <p className="rounded-xl border border-dashed border-hairline px-3 py-4 text-center text-[11px] text-muted-foreground">
            No analyses yet.
          </p>
        )}
        {items?.map((record) => (
          <div
            key={record.id}
            className={`group rounded-xl border px-3 py-2 transition-colors ${
              record.id === activeId ? 'border-brand-cyan/45 bg-brand-cyan/[0.06]' : 'border-hairline/60 bg-white/[0.02] hover:border-hairline'
            }`}
          >
            <button type="button" onClick={() => onOpen(record)} className="w-full text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-medium text-foreground">{record.title || moment(record.created_date).format('MMM D')}</span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">
                  {MODE_LABEL[record.input_mode] || 'Text'}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-muted-foreground">{record.summary}</p>
              <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
                {moment(record.created_date).format('MMM D, HH:mm')} · {record.research_count || 0} NASA studies
              </p>
            </button>
            <button
              type="button"
              onClick={() => remove(record)}
              disabled={busyId === record.id}
              className="mt-1 inline-flex items-center gap-1 text-[9.5px] text-muted-foreground/70 hover:text-brand-rose disabled:opacity-50"
            >
              <Trash2 className="h-2.5 w-2.5" /> {busyId === record.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}