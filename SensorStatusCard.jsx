import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COPY = {
  granted: {
    icon: CheckCircle2,
    tone: 'text-brand-mint',
    title: 'Motion sensor connected',
    body: 'AstroVital is reading acceleration samples from this device to count steps and active movement minutes. Data is written to your own records only.',
  },
  pending: {
    icon: Smartphone,
    tone: 'text-brand-cyan',
    title: 'Waiting for the first motion sample',
    body: 'The sensor is available but has not reported anything yet. Keep this tab open while you move.',
  },
  denied: {
    icon: AlertTriangle,
    tone: 'text-brand-amber',
    title: 'Motion access is blocked',
    body: 'Your browser denied motion access. Re-enable it in the site settings, then reload. Until then, log activity manually below.',
  },
  unsupported: {
    icon: AlertTriangle,
    tone: 'text-brand-amber',
    title: 'No motion sensor on this device',
    body: 'This browser or computer does not expose motion sensors. Nothing is estimated — use manual logging for movement records.',
  },
};

export default function SensorStatusCard({ sensorStatus, supported, busy, onEnable }) {
  const copy = COPY[sensorStatus] || COPY.pending;
  const Icon = copy.icon;
  const canAsk = supported === 'prompt' && sensorStatus !== 'granted';

  return (
    <section className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.04]">
          <Icon className={`h-4 w-4 ${copy.tone}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[13.5px] font-medium tracking-tight text-foreground">{copy.title}</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
              <ShieldCheck className="h-2.5 w-2.5" /> permission
            </span>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{copy.body}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
            Collected: device acceleration samples, active minutes and step events. Kept: your own session, step and activity records.
            Active tracking only runs while AstroVital is open — browsers cannot read motion sensors in the background, and no data is ever invented to fill gaps.
          </p>
          {canAsk && (
            <Button onClick={onEnable} disabled={busy} size="sm" className="mt-3 h-8 rounded-xl text-[11.5px]">
              {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Allow motion access
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}