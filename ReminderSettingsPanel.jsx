import React from 'react';
import { BellRing, Loader2 } from 'lucide-react';
import { INTERVAL_OPTIONS, SNOOZE_OPTIONS, frequencyLabel, windowLabel } from '@/lib/reminders';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';

const HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function hourLabel(value) {
  const hour = Number(value);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

export default function ReminderSettingsPanel({ settings, onSave, onFire, onRequestNotifications, notificationState }) {
  if (!settings) {
    return (
      <Panel eyebrow="Reminders" title="Loading your reminder settings">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> One moment
        </div>
      </Panel>
    );
  }

  const enabled = Boolean(settings.enabled);

  return (
    <Panel
      eyebrow="Stretch breaks"
      title="Reminder schedule"
      subtitle="Friendly nudges to move and reset. They only fire while AstroVital is open unless you allow browser notifications."
      action={<BellRing className={`h-4 w-4 ${enabled ? 'text-brand-cyan' : 'text-muted-foreground'}`} />}
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSave({ enabled: !enabled })}
          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
            enabled ? 'border-brand-cyan/30 bg-brand-cyan/[0.07]' : 'border-hairline/70 bg-white/[0.02]'
          }`}
        >
          <span>
            <span className="block text-[12px] font-medium tracking-tight text-foreground">
              {enabled ? 'Reminders are on' : 'Reminders are off'}
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {enabled ? `${frequencyLabel(settings.interval_minutes)} between ${windowLabel(settings)}` : 'Turn on to receive stretch nudges'}
            </span>
          </span>
          <span className={`relative h-5 w-9 shrink-0 rounded-full border ${enabled ? 'border-brand-cyan/50 bg-brand-cyan/30' : 'border-hairline bg-white/[0.05]'}`}>
            <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${enabled ? 'left-[18px] bg-brand-cyan' : 'left-0.5 bg-muted-foreground/70'}`} />
          </span>
        </button>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Interval</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {INTERVAL_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSave({ interval_minutes: value })}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  Number(settings.interval_minutes) === value
                    ? 'border-brand-cyan/35 bg-brand-cyan/10 text-brand-cyan'
                    : 'border-hairline text-muted-foreground hover:text-foreground'
                }`}
              >
                {frequencyLabel(value).replace('Every ', '')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Active from</p>
            <select
              value={settings.window_start}
              onChange={(event) => onSave({ window_start: Number(event.target.value) })}
              className="mt-1 h-9 w-full rounded-xl border border-hairline bg-surface px-2 text-[12px] text-foreground"
            >
              {HOURS.map((hour) => (
                <option key={hour} value={hour}>{hourLabel(hour)}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Active until</p>
            <select
              value={settings.window_end}
              onChange={(event) => onSave({ window_end: Number(event.target.value) })}
              className="mt-1 h-9 w-full rounded-xl border border-hairline bg-surface px-2 text-[12px] text-foreground"
            >
              {[...HOURS, 24].map((hour) => (
                <option key={hour} value={hour}>{hour === 24 ? '12 AM' : hourLabel(hour)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Snooze length</p>
          <div className="mt-1.5 flex gap-1.5">
            {SNOOZE_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSave({ snooze_minutes: value })}
                className={`flex-1 rounded-lg border py-1.5 text-[11px] transition-colors ${
                  Number(settings.snooze_minutes) === value
                    ? 'border-brand-violet/40 bg-brand-violet/10 text-brand-violet'
                    : 'border-hairline text-muted-foreground hover:text-foreground'
                }`}
              >
                {value} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-hairline/60 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestNotifications}
            className="rounded-xl border-hairline text-[11.5px]"
          >
            {settings.browser_notifications ? 'Browser alerts allowed' : 'Allow browser alerts'}
          </Button>
          <Button size="sm" onClick={onFire} className="rounded-xl text-[11.5px]">
            Send a reminder now
          </Button>
        </div>
        {notificationState === 'unsupported' && (
          <p className="text-[10.5px] leading-relaxed text-muted-foreground">
            This browser has no notification support, so reminders stay in-app only.
          </p>
        )}
        {notificationState === 'denied' && (
          <p className="text-[10.5px] leading-relaxed text-brand-amber">
            Browser notifications were blocked. In-app reminders still work while the app is open.
          </p>
        )}
      </div>
    </Panel>
  );
}