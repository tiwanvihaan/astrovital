import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Panel from '@/components/common/Panel';
import Provenance from '@/components/common/Provenance';

export default function MobilitySection({ breakdown }) {
  return (
    <Panel
      eyebrow="Mobility"
      title="Range-of-motion check-ins"
      subtitle={breakdown.assessedCount ? `${breakdown.assessedCount} of 6 areas assessed` : 'Not assessed yet'}
      action={
        <Link to="/mobility" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
          Assess <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex items-baseline gap-2">
        <span className="num text-[26px] font-medium leading-none">{breakdown.score === null ? '—' : breakdown.score}</span>
        <span className="text-[11px] text-muted-foreground">/ 100 self-assessed range</span>
      </div>

      <div className="mt-3 space-y-1.5">
        {breakdown.areas.map((area) => (
          <div key={area.key} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10.5px] text-muted-foreground">{area.label}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <span
                className="block h-full rounded-full bg-brand-violet"
                style={{ width: `${typeof area.score === 'number' ? ((area.score - 1) / 4) * 100 : 0}%` }}
              />
            </span>
            <span className="w-9 shrink-0 text-right font-mono text-[9px] text-muted-foreground">
              {typeof area.score === 'number' ? `${area.score}/5` : '—'}
            </span>
          </div>
        ))}
      </div>

      <Provenance source="self_assessment" updatedAt={breakdown.lastUpdated} className="mt-2 border-t border-hairline/60 pt-2" />
    </Panel>
  );
}