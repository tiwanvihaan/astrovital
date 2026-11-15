import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import useCollection from '@/hooks/useCollection';
import useProfile from '@/hooks/useProfile';
import Panel from '@/components/common/Panel';
import ChatPanel from '@/components/astroai/ChatPanel';
import InsightList from '@/components/astroai/InsightList';
import TrendSummary from '@/components/astroai/TrendSummary';
import { computeInsights } from '@/lib/astroInsights';

export default function AstroAI() {
  const profile = useProfile();
  const measurements = useCollection('Measurement', {}, { sort: '-recorded_at', limit: 300 });
  const mobility = useCollection('MobilityRecord', {}, { sort: '-date', limit: 20 });
  const sleep = useCollection('SleepRecord', {}, { sort: '-date', limit: 14 });
  const alerts = useCollection('Alert', { status: 'active' }, { sort: '-detected_at', limit: 10 });
  const [seedQuestion, setSeedQuestion] = useState('');

  const insights = useMemo(
    () =>
      computeInsights({
        measurements: measurements || [],
        mobility: mobility || [],
        sleep: sleep || [],
        alerts: alerts || [],
      }),
    [measurements, mobility, sleep, alerts],
  );

  const coverage = [
    { label: 'Measurement readings', value: measurements?.length ?? 0 },
    { label: 'Mobility sessions', value: mobility?.length ?? 0 },
    { label: 'Sleep nights', value: sleep?.length ?? 0 },
    { label: 'Open alerts', value: alerts?.length ?? 0 },
  ];

  const hasData = coverage.slice(0, 3).some((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-brand-violet" /> General-purpose AI
        </p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-tight sm:text-[31px]">AstroAI</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          AstroAI answers anything — everyday questions, writing, maths, coding, sport, news and current events, dates and
          times anywhere in the world — and it also reads what your own sessions recorded, explains changes in plain
          language, and grounds space-biology questions in live NASA OSDR research. It never invents a measurement and
          never diagnoses.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/health?view=analysis" className="rounded-full border border-hairline px-3 py-1 text-[10.5px] text-muted-foreground hover:border-brand-cyan/40 hover:text-foreground">
            Run an AI health analysis
          </Link>
          <Link to="/health?view=research" className="rounded-full border border-hairline px-3 py-1 text-[10.5px] text-muted-foreground hover:border-brand-cyan/40 hover:text-foreground">
            Browse NASA research
          </Link>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ChatPanel profileId={profile?.id} seedQuestion={seedQuestion} onSeeded={() => setSeedQuestion('')} />
          {hasData ? (
            <TrendSummary measurements={measurements || []} sleep={sleep || []} mobility={mobility || []} />
          ) : (
            <Panel eyebrow="No sessions yet" title="AstroAI has nothing to read — but it can still answer">
              <div className="rounded-2xl border border-dashed border-hairline px-5 py-8 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Ask a question above at any time. Without recorded sessions AstroAI will tell you exactly which reading is missing instead of estimating one.
                </p>
                <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
                  Tracking starts automatically when you open the app
                </p>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          {hasData && <InsightList insights={insights} loading={measurements === null} onAsk={(question) => setSeedQuestion(question)} />}

          <Panel eyebrow="Grounded in" title="What AstroAI can read">
            <div className="space-y-2">
              {coverage.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-hairline/60 bg-white/[0.02] px-3 py-2">
                  <span className="text-[11.5px] text-muted-foreground">{item.label}</span>
                  <span className="num text-[12px] text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-mint" />
              AstroAI reads only what your own recorded sessions provide. When a system has no source, it says so instead of estimating a value.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}