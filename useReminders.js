import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { isDue, scheduledAt } from '@/lib/reminderSchedule';

const POLL_MS = 30000;

/** One browser notification per occurrence, even when several views mount this hook. */
const notified = new Set();

function currentPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export default function useReminders({ watch = false } = {}) {
  const [reminders, setReminders] = useState(null);
  const [logs, setLogs] = useState([]);
  const [permission, setPermission] = useState(currentPermission);
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);

  const loadLogs = useCallback(async () => {
    const page = await base44.entities.ReminderLog.filter({}, { sort: '-fired_at', limit: 120 });
    setLogs(page?.items || []);
  }, []);

  const loadReminders = useCallback(async () => {
    const page = await base44.entities.Reminder.filter({}, { sort: 'time_of_day', limit: 100 });
    setReminders(page?.items || []);
  }, []);

  useEffect(() => {
    loadReminders().catch(() => setReminders([]));
    loadLogs().catch(() => {});
    const unsubscribe = base44.entities.Reminder.subscribe(() => {
      loadReminders().catch(() => {});
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [loadReminders, loadLogs]);

  useEffect(() => {
    if (!watch) return undefined;
    const id = setInterval(() => setNow(new Date()), POLL_MS);
    return () => clearInterval(id);
  }, [watch]);

  const due = (reminders || []).filter((reminder) => isDue(reminder, now));

  useEffect(() => {
    if (!watch || !reminders || permission !== 'granted') return;
    due.forEach((reminder) => {
      if (!reminder.notification) return;
      const key = `${reminder.id}:${scheduledAt(reminder, now).getTime()}`;
      if (notified.has(key)) return;
      notified.add(key);
      new Notification(reminder.title, {
        body: reminder.description || 'AstroVital reminder',
        tag: key,
      });
    });
  }, [watch, reminders, permission, now]);

  const save = useCallback(
    async (values, id) => {
      setSaving(true);
      try {
        if (id) await base44.entities.Reminder.update(id, values);
        else await base44.entities.Reminder.create(values);
        await loadReminders();
      } finally {
        setSaving(false);
      }
    },
    [loadReminders],
  );

  const toggle = useCallback(
    async (reminder) => {
      await base44.entities.Reminder.update(reminder.id, { enabled: !reminder.enabled });
      await loadReminders();
    },
    [loadReminders],
  );

  const remove = useCallback(
    async (reminder) => {
      await base44.entities.Reminder.delete(reminder.id);
      await loadReminders();
    },
    [loadReminders],
  );

  const complete = useCallback(
    async (reminder) => {
      const stamp = new Date().toISOString();
      await base44.entities.ReminderLog.create({
        reminder_id: reminder.id,
        reminder_title: reminder.title,
        fired_at: stamp,
        status: 'completed',
        resolved_at: stamp,
      });
      await base44.entities.Reminder.update(reminder.id, { last_completed_at: stamp, snooze_until: '' });
      await Promise.all([loadReminders(), loadLogs()]);
    },
    [loadReminders, loadLogs],
  );

  const snooze = useCallback(
    async (reminder, minutes = 10) => {
      const until = new Date(Date.now() + minutes * 60000).toISOString();
      await base44.entities.ReminderLog.create({
        reminder_id: reminder.id,
        reminder_title: reminder.title,
        fired_at: new Date().toISOString(),
        status: 'snoozed',
        resolved_at: until,
      });
      await base44.entities.Reminder.update(reminder.id, { snooze_until: until });
      await Promise.all([loadReminders(), loadLogs()]);
    },
    [loadReminders, loadLogs],
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    reminders,
    logs,
    permission,
    now,
    saving,
    due,
    save,
    toggle,
    remove,
    complete,
    snooze,
    requestPermission,
    reload: loadReminders,
  };
}