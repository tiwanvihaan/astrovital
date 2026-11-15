import React, { useState } from 'react';
import moment from 'moment';
import useStretchReminders from '@/hooks/useStretchReminders';
import ReminderSettingsPanel from '@/components/reminders/ReminderSettingsPanel';
import ReminderHistory from '@/components/reminders/ReminderHistory';

export default function Stretch() {
  const { settings, logs, save, fire, requestBrowserNotifications, nextAt } = useStretchReminders({ watch: false });
  const [notificationState, setNotificationState] = useState(null);

  const handleNotifications = async () => {
    const result = await requestBrowserNotifications();
    setNotificationState(result);
  };

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Stretch reminders</p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-tight sm:text-[31px]">Reset breaks</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Long sessions in a fixed posture stiffen joints. AstroVital nudges you with a stretch break at the interval you choose,
          and records whether you completed or snoozed each one.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <ReminderSettingsPanel
            settings={settings}
            onSave={save}
            onFire={fire}
            onRequestNotifications={handleNotifications}
            notificationState={notificationState}
          />
          <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/80">
            Next reminder:{' '}
            {settings?.enabled && nextAt ? moment(nextAt).format('ddd, h:mm A') : 'not scheduled'}.
            Reminders respect your active window and never fire outside it. Browsers cannot deliver notifications when the app is
            fully closed, so in-app reminders appear while AstroVital is open.
          </p>
        </div>
        <div className="lg:col-span-2">
          <ReminderHistory logs={logs} />
        </div>
      </div>
    </div>
  );
}