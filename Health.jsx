import React, { useMemo, useState } from 'react';
import useCollection from '@/hooks/useCollection';
import SystemPanel from '@/components/health/SystemPanel';
import HealthAnalysisPanel from '@/components/analysis/HealthAnalysisPanel';
import NasaResearchPanel from '@/components/research/NasaResearchPanel';
import { SYSTEMS, groupByMetric } from '@/lib/health';

const VIEWS = [
  { key: 'systems', label: 'Systems' },
  { key: 'analysis', label: 'AI Health Analysis' },
  { key: 'research', label: 'NASA Research' },
];

const COPY = {
  systems: 'Each system shows only what a connected source actually reported, with the data sources and measurement limits stated up front.',
  analysis: 'Describe what changed, dictate it, or attach a report — AstroVital AI reads it alongside your own records and grounds the findings in real NASA OSDR research.',
  research: 'Live NASA Open Science Data Repository records across bone, muscle, cardiovascular, sleep, radiation, microgravity, mobility and immune research.',
};

export default function Health() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedView = urlParams.get('view');
  const requestedSystem = urlParams.get('system');
  const [view, setView] = useState(VIEWS.some((item) => item.key === requestedView) ? requestedView : 'systems');
  const [active, setActive] = useState(SYSTEMS.some((system) => system.key === requestedSystem) ? requestedSystem : 'cardiovascular');
  const measurements = useCollection('Measurement', {}, { sort: '-recorded_at', limit: 300 });
  const sleep = useCollection('SleepRecord', {}, { sort: '-date', limit: 20 });

  const byMetric = useMemo(() => groupByMetric(measurements || []), [measurements]);
  const system = SYSTEMS.find((item) => item.key === active) || SYSTEMS[0];

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Whole-body review</p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-tight sm:text-[31px]">Health systems</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">{COPY[view]}</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1.5 rounded-full border border-hairline bg-surface/50 p-1">
          {VIEWS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${
                view === item.key ? 'bg-white/[0.07] text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'analysis' && <HealthAnalysisPanel />}

      {view === 'research' && <NasaResearchPanel />}

      {view === 'systems' && (
        <>
          <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
            <div className="flex w-max gap-1.5 rounded-full border border-hairline bg-surface/50 p-1">
              {SYSTEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActive(item.key)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${
                    active === item.key ? 'bg-white/[0.07] text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {measurements === null ? (
            <div className="h-64 animate-pulse rounded-3xl border border-hairline bg-surface/40" />
          ) : (
            <SystemPanel system={system} byMetric={byMetric} />
          )}
        </>
      )}
    </div>
  );
}