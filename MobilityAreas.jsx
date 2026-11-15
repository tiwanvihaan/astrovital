import React from 'react';
import moment from 'moment';

export default function MobilityAreas({ areas }) {
  return (
    <div className="space-y-2">
      {areas.map((area) => {
        const percent = typeof area.score === 'number' ? ((area.score - 1) / 4) * 100 : 0;
        return (
          <div key={area.key} className="rounded-xl border border-hairline/60 bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11.5px] font-medium tracking-tight text-foreground">{area.label}</p>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
                {typeof area.score === 'number' ? `${area.score}/5` : 'Not assessed'}
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-brand-violet"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
                {typeof area.pain === 'number' && area.pain > 0 ? `pain ${area.pain}/3` : 'no pain reported'}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
                {area.assessed_at ? moment(area.assessed_at).fromNow() : '—'}
              </span>
            </div>
            {area.notes && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{area.notes}</p>}
          </div>
        );
      })}
    </div>
  );
}