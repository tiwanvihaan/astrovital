import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Panel from '@/components/common/Panel';
import TrendChart from '@/components/charts/TrendChart';
import Provenance from '@/components/common/Provenance';
import { COLORS } from '@/lib/health';

export default function MovementSection({ summary, sensorStatus }) {
  const chart = summary.byDay.map((day) => ({ label: day.label, value: day.minutes }));
  const source = summary.todaySources.includes('device_motion') ? 'device_motion' : 'manual';

  return (
    <Panel
      eyebrow="Movement"
      title="How much you have moved"
      subtitle={summary.todayPeriods ? `${summary.todayPeriods} period(s) recorded today` : 'No periods recorded today'}
      action={
        <Link to="/movement" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
          Detail <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Active today</p>
          <p className="num mt-1 text-[19px] font-medium leading-none">{summary.todayMinutes}<span className="ml-1 text-[10px] font-normal text-muted-foreground">min</span></p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Steps · est.</p>
          <p className="num mt-1 text-[19px] font-medium leading-none">{summary.todaySteps || 0}</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Sessions</p>
          <p className="num mt-1 text-[19px] font-medium leading-none">{summary.todaySessions || 0}</p>
        </div>
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Last 7 days</p>
          <p className="num mt-1 text-[19px] font-medium leading-none">{summary.weekMinutes}<span className="ml-1 text-[10px] font-normal text-muted-foreground">min</span></p>
        </div>
      </div>

      <div className="mt-3">
        {summary.weekPeriods ? (
          <TrendChart data={chart} keys={[{ key: 'value', color: COLORS.cyan }]} height={150} />
        ) : (
          <div className="grid h-[150px] place-items-center rounded-2xl border border-dashed border-hairline/70">
            <p className="max-w-[220px] text-center text-[11px] leading-relaxed text-muted-foreground">
              {sensorStatus === 'granted'
                ? 'Move for a minute and the first period will appear here.'
                : 'No sensor data yet — log a period on the Movement page.'}
            </p>
          </div>
        )}
      </div>

      <Provenance source={source} updatedAt={summary.lastUpdated} className="mt-2 border-t border-hairline/60 pt-2" />
    </Panel>
  );
}