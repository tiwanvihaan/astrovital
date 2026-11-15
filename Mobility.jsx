import React, { useCallback } from 'react';
import moment from 'moment';
import useCollection from '@/hooks/useCollection';
import { mobilityBreakdown, MOBILITY_GOAL, summariseMovement } from '@/lib/tracking';
import SensorMobilityCard from '@/components/mobility/SensorMobilityCard';
import Panel from '@/components/common/Panel';
import Ring from '@/components/charts/Ring';
import TrendChart from '@/components/charts/TrendChart';
import { useChartColors } from '@/components/theme/themeUtils';
import Provenance from '@/components/common/Provenance';
import AssessmentForm from '@/components/mobility/AssessmentForm';
import MobilityAreas from '@/components/mobility/MobilityAreas';

export default function Mobility() {
  const COLORS = useChartColors();
  const assessments = useCollection('MobilityAssessment', {}, { sort: '-assessed_at', limit: 200 });
  const movementLogs = useCollection('ActivityLog', {}, { sort: '-created_date', limit: 200 });
  const movementSummary = summariseMovement(movementLogs || []);
  const breakdown = mobilityBreakdown(assessments || []);
  const history = breakdown.history.map((row) => ({ label: moment(row.stamp).format('MMM D'), value: row.value }));
  const reload = useCallback(async () => {}, []);

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Mobility · how well you move</p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-tight sm:text-[31px]">Mobility</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Range-of-motion and joint check-ins you record yourself. Mobility is never derived from step counts —
          it only reflects assessments you actually saved.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel eyebrow="Composite" title="Mobility score" className="lg:col-span-2">
          <div className="flex flex-col items-center py-1">
            <Ring
              value={breakdown.score ?? 0}
              goal={MOBILITY_GOAL}
              color={COLORS.violet}
              size={170}
              stroke={12}
              label={breakdown.score === null ? 'no assessments' : 'average range'}
            />
            <p className="mt-3 text-center text-[11.5px] leading-relaxed text-muted-foreground">
              {breakdown.assessedCount} of 6 areas assessed
            </p>
            <Provenance source="self_assessment" updatedAt={breakdown.lastUpdated} className="mt-2 justify-center" />
          </div>
          {breakdown.missingAreas.length > 0 && (
            <p className="mt-3 rounded-xl border border-hairline/60 bg-white/[0.02] p-2.5 text-[11px] leading-relaxed text-muted-foreground">
              Still missing: {breakdown.missingAreas.join(', ')}. The score averages only the areas you have assessed.
            </p>
          )}
        </Panel>

        <Panel
          eyebrow="Check-in"
          title="Record an assessment"
          className="lg:col-span-3"
          subtitle="Six areas, each rated from very limited to full range."
        >
          <AssessmentForm onSaved={reload} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel eyebrow="Areas" title="Latest range by joint" className="lg:col-span-3">
          <MobilityAreas areas={breakdown.areas} />
        </Panel>

        <Panel eyebrow="History" title="Mobility score over time" className="lg:col-span-2">
          {history.length ? (
            <TrendChart data={history} keys={[{ key: 'value', color: COLORS.violet }]} yDomain={[0, 100]} height={210} />
          ) : (
            <div className="grid h-[210px] place-items-center rounded-2xl border border-dashed border-hairline/70">
              <p className="max-w-[220px] text-center text-[11.5px] leading-relaxed text-muted-foreground">
                Each saved assessment adds a point here so you can see range change over weeks.
              </p>
            </div>
          )}
          <p className="mt-2 border-t border-hairline/60 pt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">
            scale normalized to 100 = full range in every area
          </p>
        </Panel>
      </div>

      <SensorMobilityCard summary={movementSummary} />

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/80">
        Assessments are self-reported and are not medical measurements. AstroVital does not estimate joint range from motion sensors,
        and mobility is deliberately kept separate from movement volume.
      </p>
    </div>
  );
}