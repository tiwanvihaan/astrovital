import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { defaultReminderSettings, isReminderDue, nextReminderAt } from '@/lib/reminders';

const POLL_MS = 20000;

let settingsPromise = null;

/** One settings row per user, created at most once even when several views mount together. */
async function loadSettingsRow() {
  if (!settingsPromise) {
    settingsPromise = (async () => {
      const page = await base44.entities.ReminderSettings.filter({}, { sort: '-created_date', limit: 20 });
      const rows = page?.items || [];
      if (rows.length > 1) {
        const extra = rows.slice(1);
        await base44.entities.ReminderSettings.deleteMany({ id: { $in: extra.map((row) => row.id) } }).catch(() => {});
      }
      if (rows.length) return rows[0];
      return base44.entities.ReminderSettings.create(defaultReminderSettings());
    })().finally(() => {
      settingsPromise = null;
    });
  }
  return settingsPromise;
}

export default function useStretchReminders({ watch = true } = {}) {
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const firing = useRef(false);
  const settingsRef = useRef(null);
  settingsRef.current = settings;

  const loadLogs = useCallback(async () => {
    const page = await base44.entities.ReminderLog.filter({}, { sort: '-fired_at', limit: 20 });
    setLogs(page?.items || []);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const row = await loadSettingsRow();
      if (!alive) return;
      setSettings(row);
      await loadLogs();
      if (alive) setLoading(false);
    })().catch(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [loadLogs]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const row = await loadSettingsRow();
        if (row) setSettings((current) => (current && current.updated_date === row.updated_date ? current : row));
        await loadLogs();
      } catch {
        /* transient */
      }
    }, 60000);
    return () => clearInterval(id);
  }, [loadLogs]);

  const fire = useCallback(async () => {
    const current = settingsRef.current;
    if (!current || firing.current) return;
    firing.current = true;
    try {
      const now = new Date();
      const log = await base44.entities.ReminderLog.create({
        fired_at: now.toISOString(),
        status: 'pending',
        interval_minutes: current.interval_minutes || 60,
      });
      const updated = await base44.entities.ReminderSettings.update(current.id, { last_fired_at: now.toISOString() });
      setSettings(updated);
      setActive(log);
      await loadLogs();
      if (current.browser_notifications && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Stretch break', {
          body: 'Time for a stretch break! Take a few minutes to gently move and reset.',
        });
      }
    } finally {
      firing.current = false;
    }
  }, [loadLogs]);

  useEffect(() => {
    if (!watch) return;
    const tick = () => {
      if (!active && isReminderDue(settingsRef.current)) fire();
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [watch, active, fire]);

  const save = useCallback(async (patch) => {
    const current = settingsRef.current;
    if (!current) return null;
    const updated = await base44.entities.ReminderSettings.update(current.id, patch);
    setSettings(updated);
    return updated;
  }, []);

  const complete = useCallback(async () => {
    if (!active) return;
    await base44.entities.ReminderLog.update(active.id, {
      status: 'completed',
      resolved_at: new Date().toISOString(),
    });
    setActive(null);
    await loadLogs();
  }, [active, loadLogs]);

  const snooze = useCallback(async () => {
    const current = settingsRef.current;
    if (!active || !current) return;
    const until = new Date(Date.now() + Number(current.snooze_minutes || 10) * 60000).toISOString();
    await base44.entities.ReminderLog.update(active.id, {
      status: 'snoozed',
      resolved_at: new Date().toISOString(),
    });
    const updated = await base44.entities.ReminderSettings.update(current.id, { snooze_until: until });
    setSettings(updated);
    setActive(null);
    await loadLogs();
  }, [active, loadLogs]);

  const requestBrowserNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    await save({ browser_notifications: result === 'granted' });
    return result;
  }, [save]);

  return {
    settings,
    logs,
    active,
    loading,
    save,
    fire,
    complete,
    snooze,
    requestBrowserNotifications,
    nextAt: nextReminderAt(settings),
    refreshLogs: loadLogs,
  };
}