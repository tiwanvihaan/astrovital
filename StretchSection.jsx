import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BellRing } from 'lucide-react';
import moment from 'moment';
import Panel from '@/components/common/Panel';
import { frequencyLabel, windowLabel } from '@/lib/reminders';

export default function StretchSection({ settings, logs, nextAt }) {
  const completed = (logs || []).filter((log) => log.status === 'completed').length;
  const last = (logs || [])[0] || null;

  return (
    <Panel
      eyebrow="Stretch reminders"
      title={settings?.enabled ? 'Breaks are scheduled' : 'Breaks are paused'}
      subtitle={settings?.enabled ? `${frequencyLabel(settings.interval_minutes)} · ${windowLabel(settings)}` : 'Turn reminders back on any time'}
      action={
        <Link to="/stretch" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
          Settings <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
    >
      <div className="flex items-start gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03]">
          <BellRing className="h-3.5 w-3.5 text-brand-cyan" />
        </div>
        <div>
          <p className="text-[12px] font-medium tracking-tight text-foreground">
            {settings?.enabled && nextAt ? `Next: ${moment(nextAt).format('ddd, h:mm A')}` : 'No reminder scheduled'}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {last
              ? `Last reminder ${moment(last.fired_at).fromNow()} · ${last.status}. ${completed} completed in your history.`
              : 'Your reminder history will appear here once the first nudge fires.'}
          </p>
        </div>
      </div>
      <p className="mt-3 border-t border-hairline/60 pt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/70">
        in-app alerts · fires only while the app is open
      </p>
    </Panel>
  );
}