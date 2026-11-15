import React from 'react';
import moment from 'moment';
import Panel from '@/components/common/Panel';
import TrendChart from '@/components/charts/TrendChart';
import { useChartColors } from '@/components/theme/themeUtils';
import { SOURCE_LABELS } from '@/components/common/Provenance';

export default function MovementHistory({ logs, summary }) {
  const COLORS = useChartColors();
  const chart = (summary?.byDay || []).map((day) => ({ label: day.label, value: day.minutes }));
  const recent = (logs || []).slice(0, 12);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Panel
        eyebrow="Last 7 days"
        title="Active movement minutes"
        subtitle={summary?.weekPeriods ? `${summary.weekPeriods} recorded periods` : 'No periods recorded yet'}
        className="lg:col-span-3"
      >
        {summary?.weekPeriods ? (
          <TrendChart data={chart} keys={[{ key: 'value', color: COLORS.cyan }]} height={200} />
        ) : (
          <div className="grid h-[200px] place-items-center rounded-2xl border border-dashed border-hairline/70">
            <p className="max-w-[240px] text-center text-[11.5px] leading-relaxed text-muted-foreground">
              Nothing recorded this week. Movement appears here as soon as a period is logged — from the sensor or by hand.
            </p>
          </div>
        )}
      </Panel>

      <Panel eyebrow="Records" title="Recent movement periods" className="lg:col-span-2">
        <div className="space-y-2">
          {recent.map((log) => (
            <div key={log.id} className="rounded-xl border border-hairline/60 bg-white/[0.02] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11.5px] font-medium tracking-tight text-foreground">
                  {moment(log.started_at || log.created_date).format('MMM D, h:mm A')}
                </p>
                <span className="num font-mono text-[10px] text-brand-cyan">{log.minutes || 0} min</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                  {SOURCE_LABELS[log.source] || log.source}
                  {log.steps ? ` · ${log.steps} steps est.` : ''}
                  {log.activity_state ? ` · ${log.activity_state}` : ''}
                  {log.avg_cadence ? ` · ${log.avg_cadence} spm` : ''}
                  {typeof log.stability === 'number' ? ` · stability ${log.stability}` : ''}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">{log.kind}</span>
              </div>
              {log.notes && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{log.notes}</p>}
            </div>
          ))}
          {!recent.length && <p className="py-2 text-[12px] text-muted-foreground">No movement records yet.</p>}
        </div>
      </Panel>
    </div>
  );
}