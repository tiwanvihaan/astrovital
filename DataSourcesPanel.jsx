import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Database, HeartPulse, Smartphone, Watch } from 'lucide-react';
import { sensorSupport } from '@/lib/tracking';

function row(status) {
  if (status === 'active') return { label: 'Connected', tone: 'text-brand-mint' };
  if (status === 'permission') return { label: 'Needs permission', tone: 'text-brand-amber' };
  if (status === 'planned') return { label: 'Not connected', tone: 'text-muted-foreground' };
  return { label: 'Unavailable here', tone: 'text-muted-foreground/70' };
}

export default function DataSourcesPanel() {
  const support = sensorSupport();
  const motionStatus = support === 'unsupported' ? 'unavailable' : support === 'prompt' ? 'permission' : 'active';

  const sources = [
    {
      key: 'motion',
      icon: Smartphone,
      name: 'Device motion sensor',
      detail: 'Accelerometer and gyroscope: steps, active minutes, sessions and still time while AstroVital is open.',
      status: motionStatus,
      to: '/movement',
    },
    {
      key: 'manual',
      icon: Activity,
      name: 'Manual records',
      detail: 'Movement periods, mobility assessments and recovery check-ins you enter yourself.',
      status: 'active',
      to: '/movement',
    },
    {
      key: 'apple',
      icon: Watch,
      name: 'Apple HealthKit',
      detail: 'Optional. Needs a native iOS build — a browser cannot read HealthKit. Choose what you would share on the Movement page.',
      status: 'planned',
      to: '/movement',
    },
    {
      key: 'health_connect',
      icon: HeartPulse,
      name: 'Android Health Connect',
      detail: 'Optional. Needs a native Android build — a browser cannot read Health Connect.',
      status: 'planned',
      to: '/movement',
    },
    {
      key: 'device',
      icon: Database,
      name: 'Physiological device feed',
      detail: 'Heart rate, HRV, blood oxygen or sleep from a sensor only when a real integration exists.',
      status: 'planned',
      to: '/health',
    },
  ];

  return (
    <div className="space-y-2">
      {sources.map((source) => {
        const Icon = source.icon;
        const badge = row(source.status);
        const body = (
          <>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-foreground">{source.name}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{source.detail}</p>
              </div>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] ${badge.tone}`}>{badge.label}</span>
            </div>
          </>
        );
        return source.to ? (
          <Link
            key={source.key}
            to={source.to}
            className="block rounded-xl border border-hairline/60 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-primary/35"
          >
            {body}
          </Link>
        ) : (
          <div key={source.key} className="rounded-xl border border-hairline/60 bg-white/[0.02] px-3 py-2.5">
            {body}
          </div>
        );
      })}
      <p className="pt-1 text-[10.5px] leading-relaxed text-muted-foreground/80">
        Nothing here is simulated. A source only appears as connected when the browser or a real integration is actually delivering data.
      </p>
    </div>
  );
}