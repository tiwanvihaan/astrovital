import React, { useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import AnalysisForm from '@/components/analysis/AnalysisForm';
import AnalysisReport from '@/components/analysis/AnalysisReport';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';

export default function HealthAnalysisPanel() {
  const [report, setReport] = useState(null);
  const [activeId, setActiveId] = useState('');
  const [busy, setBusy] = useState(false);

  const openSaved = (record) => {
    try {
      setReport(JSON.parse(record.report_json || '{}'));
      setActiveId(record.id);
    } catch {
      setReport(null);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <AnalysisForm
          onStarted={() => {
            setBusy(true);
            setReport(null);
            setActiveId('');
          }}
          onReport={(next, id) => {
            setBusy(false);
            setReport(next);
            setActiveId(id || '');
          }}
          onFailed={() => setBusy(false)}
        />

        {busy && (
          <div className="flex items-center gap-2 rounded-3xl border border-hairline bg-surface/60 px-5 py-6 text-[11.5px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            AstroVital AI is reading your records and retrieving NASA OSDR research…
          </div>
        )}

        {report && <AnalysisReport report={report} />}
      </div>

      <div className="space-y-4">
        <AnalysisHistory activeId={activeId} onOpen={openSaved} />
        <div className="rounded-3xl border border-hairline bg-surface/60 p-4">
          <p className="flex items-center gap-2 text-[11.5px] font-medium text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-mint" /> How your data is used
          </p>
          <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-muted-foreground">
            <li>Only your own records are sent, and only when you tick the access box.</li>
            <li>Images are stored privately (stored privately) and are only read to build your report.</li>
            <li>Nothing you submit is used to train AI models.</li>
            <li>Delete any analysis to remove it from your timeline and this app's records.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}