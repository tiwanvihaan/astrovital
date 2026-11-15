import React, { useMemo } from 'react';
import moment from 'moment';
import useCollection from '@/hooks/useCollection';
import { recoveryBreakdown } from '@/lib/tracking';
import Panel from '@/components/common/Panel';
import Ring from '@/components/charts/Ring';
import TrendChart from '@/components/charts/TrendChart';
import RecoveryPanel from '@/components/recovery/RecoveryPanel';
import { useChartColors } from '@/components/theme/themeUtils';

function average(rows, key) {
  const values = rows.map((row) => Number(row[key])).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function Stat({ label, value, unit, hint }) {
  return (
    <div className="rounded-2xl border border-hairline/70 bg-surface/60 p-3.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="num mt-1.5 text-[20px] font-medium leading-none text-foreground">
        {value}
        {unit ? <span className="ml-1 text-[10px] font-normal text-muted-foreground">{unit}</span> : null}
      </p>
      {hint && <p className="mt-1 text-[10.5px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Observations({ checkins, nights }) {
  const notes = [];

  const recent = checkins.slice(0, 3);
  const earlier = checkins.slice(3, 7);
  const fatigueRecent = average(recent, 'fatigue');
  const fatigueEarlier = average(earlier, 'fatigue');
  if (fatigueRecent !== null && fatigueEarlier !== null) {
    const delta = fatigueRecent - fatigueEarlier;
    notes.push(
      `Fatigue averaged ${fatigueRecent.toFixed(1)}/5 across your last three check-ins, ${delta > 0.3 ? 'up from' : delta < -0.3 ? 'down from' : 'level with'} ${fatigueEarlier.toFixed(1)}/5 in the four before that.`,
    );
  }

  const sorenessRecent = average(recent, 'soreness');
  const sorenessEarlier = average(earlier, 'soreness');
  if (sorenessRecent !== null && sorenessEarlier !== null) {
    const delta = sorenessRecent - sorenessEarlier;
    notes.push(
      `Soreness averaged ${sorenessRecent.toFixed(1)}/5 recently, ${delta > 0.3 ? 'higher than' : delta < -0.3 ? 'lower than' : 'close to'} ${sorenessEarlier.toFixed(1)}/5 earlier.`,
    );
  }

  const sleptRecent = average(nights.slice(0, 7), 'total_hours');
  const sleptBefore = average(nights.slice(7, 14), 'total_hours');
  if (sleptRecent !== null) {
    notes.push(
      sleptBefore === null
        ? `Recorded sleep averages ${sleptRecent.toFixed(1)} hours a night over the last week.`
        : `Recorded sleep averages ${sleptRecent.toFixed(1)} hours a night this week versus ${sleptBefore.toFixed(1)} the week before.`,
    );
  }

  if (!notes.length) {
    return (
      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        Observations appear once you have logged a few recovery check-ins or sleep records. Nothing is estimated in the meantime.
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-[11.5px] leading-relaxed text-muted-foreground">
      {notes.map((note) => (
        <li key={note} className="flex gap-2">
          <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-brand-mint" />
          {note}
        </li>
      ))}
    </ul>
  );
}

export default function Recovery() {
  const COLORS = useChartColors();
  const checkins = useCollection('RecoveryCheckin', {}, { sort: '-date', limit: 30 });
  const sleep = useCollection('SleepRecord', {}, { sort: '-date', limit: 30 });

  const rows = checkins || [];
  const nights = sleep || [];
  const breakdown = recoveryBreakdown(rows[0] || null);

  const scoreHistory = useMemo(
    () =>
      rows
        .slice(0, 14)
        .slice()
        .reverse()
        .map((row) => ({ label: moment(row.date).format('MMM D'), value: recoveryBreakdown(row).score }))
        .filter((row) => typeof row.value === 'number'),
    [rows],
  );

  const sleepHistory = useMemo(
    () =>
      nights
        .slice(0, 14)
        .slice()
        .reverse()
        .map((night) => ({ label: moment(night.date).format('MMM D'), value: Number(night.total_hours || 0) })),
    [nights],
  );

  const restHistory = useMemo(
    () =>
      rows
        .filter((row) => typeof row.rest_minutes === 'number')
        .slice(0, 14)
        .slice()
        .reverse()
        .map((row) => ({ label: moment(row.date).format('MMM D'), value: Number(row.rest_minutes) })),
    [rows],
  );

  const avgSleep = average(nights.slice(0, 7), 'total_hours');
  const lastNight = nights[0] || null;
  const avgRest = average(rows.slice(0, 7), 'rest_minutes');

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Recovery · sleep, rest and load</p>
        <h1 className="mt-2 text-[24px] leading-[1.15] sm:text-[29px]">Recovery</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Sleep history, rest periods and how your own check-ins compare with the week before. These are self-reported inputs, not
          medical measurements, and nothing here is estimated.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Recovery score" value={breakdown.score === null ? '—' : breakdown.score} unit={breakdown.score === null ? '' : '/100'} hint={breakdown.score === null ? 'no check-in yet' : 'from your latest check-in'} />
        <Stat label="Sleep last night" value={lastNight ? Number(lastNight.total_hours || 0).toFixed(1) : '—'} unit={lastNight ? 'h' : ''} hint={lastNight ? moment(lastNight.date).format('ddd, MMM D') : 'no record'} />
        <Stat label="7-night average" value={avgSleep === null ? '—' : avgSleep.toFixed(1)} unit={avgSleep === null ? '' : 'h'} hint={`${nights.length} night${nights.length === 1 ? '' : 's'} recorded`} />
        <Stat label="Rest per day" value={avgRest === null ? '—' : Math.round(avgRest)} unit={avgRest === null ? '' : 'min'} hint="7-day average of your check-ins" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecoveryPanel checkins={rows} />
        </div>

        <Panel eyebrow="Sleep" title="Last 14 nights" className="lg:col-span-2" action={<Ring value={breakdown.score ?? 0} goal={100} color={COLORS.mint} size={86} stroke={7} label="score" />}>
          {sleepHistory.length ? (
            <TrendChart data={sleepHistory} keys={[{ key: 'value', color: COLORS.cyan }]} yDomain={[0, 12]} height={170} />
          ) : (
            <div className="grid h-[170px] place-items-center rounded-2xl border border-dashed border-hairline/70">
              <p className="max-w-[210px] text-center text-[11.5px] leading-relaxed text-muted-foreground">
                No sleep records yet. Sleep is shown only when a source or a check-in provides it.
              </p>
            </div>
          )}
          {lastNight && (lastNight.efficiency || lastNight.deep_minutes || lastNight.rem_minutes) ? (
            <p className="mt-2 border-t border-hairline/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground">
              Last night
              {lastNight.efficiency ? ` · ${Math.round(lastNight.efficiency)}% efficiency` : ''}
              {lastNight.deep_minutes ? ` · ${lastNight.deep_minutes} min deep` : ''}
              {lastNight.rem_minutes ? ` · ${lastNight.rem_minutes} min REM` : ''}
            </p>
          ) : null}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel eyebrow="Trend" title="Recovery score over time">
          {scoreHistory.length ? (
            <TrendChart data={scoreHistory} keys={[{ key: 'value', color: COLORS.mint }]} yDomain={[0, 100]} height={200} />
          ) : (
            <div className="grid h-[200px] place-items-center rounded-2xl border border-dashed border-hairline/70">
              <p className="max-w-[230px] text-center text-[11.5px] leading-relaxed text-muted-foreground">
                Each saved check-in adds a point so you can see recovery across weeks.
              </p>
            </div>
          )}
        </Panel>

        <Panel eyebrow="Rest" title="Rest minutes logged">
          {restHistory.length ? (
            <TrendChart data={restHistory} keys={[{ key: 'value', color: COLORS.violet }]} height={200} />
          ) : (
            <div className="grid h-[200px] place-items-center rounded-2xl border border-dashed border-hairline/70">
              <p className="max-w-[230px] text-center text-[11.5px] leading-relaxed text-muted-foreground">
                Rest minutes come from the check-ins where you entered them. No rest period is assumed.
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Panel eyebrow="Observations" title="What your records show">
        <Observations checkins={rows} nights={nights} />
        <p className="mt-3 border-t border-hairline/60 pt-2 text-[10.5px] leading-relaxed text-muted-foreground/80">
          Observations compare only values you recorded. They are not a diagnosis and never suggest changing a medication or treatment.
        </p>
      </Panel>
    </div>
  );
}