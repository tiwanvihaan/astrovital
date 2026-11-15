import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Eye, EyeOff, Loader2, Trophy } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { pointsApi, formatDay, PERIOD_LABEL } from '@/lib/astroPoints';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function Delta({ latest, previous }) {
  if (!previous) {
    return <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">first capture</span>;
  }
  const change = previous.rank - latest.rank;
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        <ArrowRight className="h-3 w-3" /> unchanged
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em]',
        up ? 'text-brand-mint' : 'text-brand-rose',
      )}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? '+' : ''}
      {change}
    </span>
  );
}

export default function RecentPlacings() {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    pointsApi('placements')
      .then((result) => alive && setState(result))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, []);

  const toggleVisibility = async (next) => {
    setSaving(true);
    setError('');
    try {
      const result = await pointsApi('set_visibility', { show_in_leaderboards: next });
      setState((prev) => ({ ...(prev || { placements: [] }), visibility: result.show_in_leaderboards }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const placements = state?.placements || [];
  const global = placements.filter((row) => row.scope === 'global');
  const crew = placements.filter((row) => row.scope === 'crew');

  return (
    <Panel
      eyebrow="Recent placings"
      title="Leaderboard history"
      subtitle="A snapshot is saved once a day, so you can see how your ranking moves instead of only where it is now."
      action={<Trophy className="h-4 w-4 text-brand-amber" />}
    >
      <div className="flex items-start justify-between gap-3 rounded-xl border border-hairline/70 bg-foreground/[0.02] px-3 py-2.5">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[12px] text-foreground">
            {state?.visibility === false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            Rankings are {state?.visibility === false ? 'private' : 'public'}
          </p>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">
            {state?.visibility === false
              ? 'You are left out of the global and crew leaderboards. Your points still count for you.'
              : 'Other astronauts see your name, avatar, points and streak — never your measurements.'}
          </p>
        </div>
        <Switch
          checked={state?.visibility !== false}
          disabled={!state || saving}
          onCheckedChange={toggleVisibility}
          aria-label="Show my ranking on leaderboards"
        />
      </div>

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}

      {!state && !error ? (
        <p className="mt-3 flex items-center gap-2 text-[11.5px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading placements
        </p>
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {placements.map((row) => (
            <div key={row.key} className="rounded-xl border border-hairline/70 bg-foreground/[0.02] px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {row.scope === 'crew' ? row.team_name || 'Crew' : 'Global'} · {PERIOD_LABEL[row.period] || row.period}
                </p>
                <Delta latest={row.latest} previous={row.previous} />
              </div>
              <p className="num mt-1.5 text-[22px] leading-none text-foreground">
                #{row.latest.rank}
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                  of {row.latest.of_total || '—'}
                </span>
              </p>
              <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/80">
                {formatDay(row.latest.captured_on)} · {row.latest.points} pts
                {row.previous ? ` · was #${row.previous.rank}` : ''}
              </p>
            </div>
          ))}
          {!placements.length && (
            <p className="text-[11.5px] leading-relaxed text-muted-foreground sm:col-span-2">
              No placements recorded yet. The first snapshot is saved the next time you open AstroVital.
            </p>
          )}
        </div>
      )}

      <p className="mt-3 border-t border-hairline/60 pt-2.5 text-[10.5px] leading-relaxed text-muted-foreground/80">
        Placements are stored as history — a new day never overwrites the previous ranking.
      </p>
    </Panel>
  );
}