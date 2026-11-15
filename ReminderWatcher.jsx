import React from 'react';
import { Link } from 'react-router-dom';
import { BellRing, Check, Clock } from 'lucide-react';
import useStretchReminders from '@/hooks/useStretchReminders';
import { Button } from '@/components/ui/button';

export default function ReminderWatcher() {
  const { active, complete, snooze, settings } = useStretchReminders();

  if (!active) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-sm rounded-2xl border border-brand-cyan/30 bg-card/95 p-4 shadow-glow backdrop-blur-xl lg:inset-x-auto lg:right-6 lg:bottom-6">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-cyan/30 bg-brand-cyan/10">
          <BellRing className="h-4 w-4 text-brand-cyan" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium tracking-tight text-foreground">Time for a stretch break</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Take a few minutes to gently move and reset.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Button size="sm" onClick={complete} className="h-7 rounded-lg px-2.5 text-[11px]">
              <Check className="mr-1 h-3 w-3" /> Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={snooze}
              className="h-7 rounded-lg border-hairline px-2.5 text-[11px]"
            >
              <Clock className="mr-1 h-3 w-3" /> Snooze {settings?.snooze_minutes || 10}m
            </Button>
            <Link to="/reminders" className="self-center text-[10.5px] text-muted-foreground hover:text-foreground">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}