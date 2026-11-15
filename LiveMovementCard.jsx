import React from 'react';
import { Footprints, Radio } from 'lucide-react';
import moment from 'moment';
import Provenance from '@/components/common/Provenance';
import { ACTIVITY_STATES } from '@/lib/motionEngine';

function Cell({ label, value, unit, tag }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {tag ? <span className="ml-1 text-muted-foreground/60">· {tag}</span> : null}
      </p>
      <p className="num mt-1 text-[17px] font-medium leading-none text-foreground">
        {value}
        {unit ? <span className="ml-1 text-[10px] font-normal text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  );
}

export default function LiveMovementCard({ tracking }) {
  const { sensorStatus, steps, activeMinutes, stationaryMinutes, samples, session, loading, activityState, cadence, stability, paused } = tracking;
  const sensorLive = sensorStatus === 'granted' && !paused;
  const state = ACTIVITY_STATES[activityState] || ACTIVITY_STATES.stationary;

  return (
    <section className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Live session</p>
          <h3 className="mt-1 text-[14px] font-medium tracking-tight">
            {loading ? 'Starting tracker…' : paused ? 'Tracking paused' : sensorLive ? 'Device sensors running' : 'Session running without a sensor'}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
            sensorLive ? 'border-brand-mint/30 bg-brand-mint/[0.08] text-brand-mint' : 'border-hairline text-muted-foreground'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${sensorLive ? 'animate-pulse-soft bg-brand-mint' : 'bg-muted-foreground/60'}`} />
          {sensorLive ? state.label : paused ? 'Paused' : 'No sensor data'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Cell label="Steps" value={sensorLive ? steps : '—'} tag="est." />
        <Cell label="Active" value={sensorLive ? activeMinutes.toFixed(1) : '—'} unit={sensorLive ? 'min' : ''} />
        <Cell label="Cadence" value={sensorLive && cadence ? cadence : '—'} unit={sensorLive && cadence ? 'spm' : ''} tag="est." />
        <Cell label="Stability" value={sensorLive && stability !== null ? stability : '—'} unit={sensorLive && stability !== null ? '/100' : ''} tag="gyro" />
        <Cell label="Still time" value={sensorLive ? stationaryMinutes.toFixed(0) : '—'} unit={sensorLive ? 'min' : ''} />
        <Cell label="Motion samples" value={samples} />
        <Cell label="Session" value={session?.started_at ? moment(session.started_at).format('h:mm A') : '—'} />
        <Cell label="Inactive spells" value={sensorLive ? tracking.inactivityPeriods : '—'} unit={sensorLive ? '>10 min' : ''} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline/60 pt-3">
        <Provenance source={sensorLive ? 'device_motion' : 'manual'} updatedAt={session?.last_sync_at || session?.started_at} />
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/80">
          {sensorLive ? <Radio className="h-3 w-3" /> : <Footprints className="h-3 w-3" />}
          {sensorLive ? 'Counted from real samples' : 'Log activity manually'}
        </span>
      </div>
    </section>
  );
}