import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createMotionEngine } from '@/lib/motionEngine';
import {
  ACTIVITY_GAP_MS,
  GRANT_STORAGE_KEY,
  MIN_PERIOD_MS,
  localDate,
  readTrackingPrefs,
  requestMotionAccess,
  sensorSupport,
  writeTrackingPrefs,
} from '@/lib/tracking';

const PERSIST_MS = 60000;
const RESUME_WINDOW_MS = 18 * 3600 * 1000;
const INACTIVITY_EPISODE_MS = 10 * 60 * 1000;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Automatic movement tracking from the device's own sensors.
 * It starts by itself whenever the app opens, resumes the day's session, and writes
 * only measurements the hardware actually produced. Browsers report motion only while
 * the tab is open — that limit is surfaced in the UI, never papered over.
 */
export default function useAutoTracking(profileId) {
  const initialPrefs = useRef(readTrackingPrefs());

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sensorStatus, setSensorStatus] = useState('pending');
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState(0);
  const [activeMs, setActiveMs] = useState(0);
  const [stationaryMs, setStationaryMs] = useState(0);
  const [inactivityPeriods, setInactivityPeriods] = useState(0);
  const [samples, setSamples] = useState(0);
  const [activityState, setActivityState] = useState('stationary');
  const [cadence, setCadence] = useState(0);
  const [stability, setStability] = useState(null);
  const [paused, setPaused] = useState(initialPrefs.current.paused);
  const [sensors, setSensors] = useState(initialPrefs.current.sensors);

  const support = useRef(sensorSupport());
  const engine = useRef(createMotionEngine(initialPrefs.current.sensors));
  const accum = useRef({
    movedMs: 0,
    stationaryMs: 0,
    steps: 0,
    samples: 0,
    lastMotionAt: 0,
    lastSampleAt: 0,
    burstStart: 0,
    burstSteps: 0,
    burstMoved: 0,
    burstCadenceSum: 0,
    burstCadenceCount: 0,
    burstStabilitySum: 0,
    burstStabilityCount: 0,
    burstState: 'light',
    inactivityEpisodes: 0,
    stationarySince: 0,
    inactivityCounted: false,
  });
  const sessionRef = useRef(null);
  const lastSaved = useRef('');
  const statusRef = useRef('pending');
  const activityStateRef = useRef('stationary');
  const pausedRef = useRef(initialPrefs.current.paused);
  const uiTick = useRef(0);
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;

  const persist = useCallback(async (close = false) => {
    const row = sessionRef.current;
    if (!row) return;
    const state = accum.current;
    const payload = {
      movement_minutes: Math.round((state.movedMs / 60000) * 10) / 10,
      stationary_minutes: Math.round((state.stationaryMs / 60000) * 10) / 10,
      inactivity_periods: state.inactivityEpisodes,
      steps: Math.round(state.steps),
      motion_samples: state.samples,
      duration_minutes: Math.round((Date.now() - new Date(row.started_at).getTime()) / 60000),
      activity_state: pausedRef.current ? 'paused' : activityStateRef.current,
      last_sync_at: new Date().toISOString(),
      sensor_status: statusRef.current === 'prompt' ? 'pending' : statusRef.current,
    };
    if (close) {
      payload.status = 'stopped';
      payload.ended_at = new Date().toISOString();
    }
    // Skip writes that would only restamp the sync time — no new measurement, no request.
    const signature = JSON.stringify({ ...payload, last_sync_at: '' });
    if (!close && signature === lastSaved.current) return;
    lastSaved.current = signature;
    await base44.entities.TrackingSession.update(row.id, payload).catch(() => {});
  }, []);

  const flushPeriod = useCallback(async () => {
    const state = accum.current;
    if (!state.burstStart || !state.lastMotionAt) return;
    const minutes = Math.round(((state.movedMs - state.burstMoved) / 60000) * 10) / 10;
    const stepDelta = Math.max(0, Math.round(state.steps - state.burstSteps));
    const lasted = state.lastMotionAt - state.burstStart;
    const cadenceAvg = state.burstCadenceCount ? state.burstCadenceSum / state.burstCadenceCount : 0;
    state.burstStart = 0;

    if (lasted < MIN_PERIOD_MS) return;
    if (minutes <= 0 && stepDelta === 0) return;

    await base44.entities.ActivityLog.create({
      date: localDate(new Date(state.lastMotionAt)),
      started_at: new Date(state.lastMotionAt - lasted).toISOString(),
      ended_at: new Date(state.lastMotionAt).toISOString(),
      minutes,
      steps: stepDelta,
      avg_cadence: stepDelta > 0 ? Math.round(cadenceAvg) : 0,
      stability: state.burstStabilityCount ? Math.round(state.burstStabilitySum / state.burstStabilityCount) : null,
      activity_state: state.burstState,
      estimated: true,
      kind: 'movement',
      source: 'device_motion',
      device: 'Device motion sensor',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      const storedGrant = typeof window !== 'undefined' && window.localStorage.getItem(GRANT_STORAGE_KEY) === '1';
      let initialStatus = 'pending';
      if (support.current === 'unsupported') initialStatus = 'unsupported';
      else if (storedGrant) initialStatus = 'granted';
      statusRef.current = initialStatus;

      const page = await base44.entities.TrackingSession.filter({ status: 'active' }, { sort: '-started_at', limit: 5 });
      const rows = page?.items || [];
      const now = Date.now();
      const keep = rows.find((row) => row.started_at && now - new Date(row.started_at).getTime() < RESUME_WINDOW_MS) || null;
      const stale = rows.filter((row) => row.id !== keep?.id);
      if (stale.length) {
        await base44.entities.TrackingSession.bulkUpdate(
          stale.map((row) => ({ id: row.id, status: 'stopped', ended_at: row.ended_at || new Date().toISOString() })),
        ).catch(() => {});
      }

      let row = keep;
      if (!row) {
        row = await base44.entities.TrackingSession.create({
          profile_id: profileIdRef.current || '',
          status: 'active',
          started_at: new Date().toISOString(),
          source: support.current === 'unsupported' ? 'Manual logging' : 'Device motion sensor',
          sensor_status: initialStatus === 'granted' ? 'granted' : initialStatus === 'unsupported' ? 'unsupported' : 'pending',
          movement_minutes: 0,
          stationary_minutes: 0,
          inactivity_periods: 0,
          motion_samples: 0,
          steps: 0,
          duration_minutes: 0,
          activity_state: pausedRef.current ? 'paused' : 'stationary',
          last_sync_at: new Date().toISOString(),
        });
      }

      if (!alive) return;
      accum.current.movedMs = (row.movement_minutes || 0) * 60000;
      accum.current.stationaryMs = (row.stationary_minutes || 0) * 60000;
      accum.current.steps = row.steps || 0;
      accum.current.samples = row.motion_samples || 0;
      accum.current.inactivityEpisodes = row.inactivity_periods || 0;
      sessionRef.current = row;
      setSession(row);
      setSteps(accum.current.steps);
      setActiveMs(accum.current.movedMs);
      setStationaryMs(accum.current.stationaryMs);
      setInactivityPeriods(accum.current.inactivityEpisodes);
      setSamples(accum.current.samples);
      setSensorStatus(initialStatus);
      setLoading(false);

      // A device that exposes motion events reports samples within seconds even at rest.
      // Silence means there is no usable sensor — never guess a step count instead.
      if (initialStatus === 'pending' && support.current === 'available') {
        setTimeout(() => {
          if (!alive) return;
          if (accum.current.samples === 0) {
            statusRef.current = 'unsupported';
            setSensorStatus('unsupported');
            persist();
          }
        }, 9000);
      }
    })().catch(() => {
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [persist]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const result = await requestMotionAccess();
      if (result === 'granted') {
        if (typeof window !== 'undefined') window.localStorage.setItem(GRANT_STORAGE_KEY, '1');
        statusRef.current = 'granted';
        setSensorStatus('granted');
      } else {
        statusRef.current = result === 'denied' ? 'denied' : 'unsupported';
        setSensorStatus(statusRef.current);
      }
      await persist();
    } finally {
      setBusy(false);
    }
  }, [persist]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setPaused(true);
    writeTrackingPrefs({ paused: true });
    flushPeriod();
    persist();
  }, [flushPeriod, persist]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
    writeTrackingPrefs({ paused: false });
    persist();
  }, [persist]);

  const setSensor = useCallback((name, on) => {
    setSensors((prev) => {
      const next = { ...prev, [name]: on };
      engine.current.setSensors(next);
      writeTrackingPrefs({ sensors: next });
      return next;
    });
  }, []);

  const clearData = useCallback(async () => {
    await base44.entities.ActivityLog.deleteMany({ source: 'device_motion' }).catch(() => {});
    const state = accum.current;
    state.movedMs = 0;
    state.stationaryMs = 0;
    state.steps = 0;
    state.samples = 0;
    state.burstStart = 0;
    state.inactivityEpisodes = 0;
    engine.current.reset();
    setSteps(0);
    setActiveMs(0);
    setStationaryMs(0);
    setInactivityPeriods(0);
    setSamples(0);
    await persist();
  }, [persist]);

  useEffect(() => {
    if (!session || paused || (support.current === 'prompt' && sensorStatus !== 'granted')) return;

    const handler = (event) => {
      const now = Date.now();
      const result = engine.current.feed(event, now);
      if (!result.sample) return;

      const state = accum.current;
      const dt = state.lastSampleAt ? clamp(now - state.lastSampleAt, 0, 1000) : 0;
      state.lastSampleAt = now;
      state.samples += 1;

      if (result.movedMs) state.movedMs += result.movedMs;
      if (result.step) state.steps += 1;

      if (result.moving) {
        state.stationarySince = 0;
        if (!state.burstStart) {
          state.burstStart = now;
          state.burstSteps = state.steps;
          state.burstMoved = state.movedMs;
          state.burstCadenceSum = 0;
          state.burstCadenceCount = 0;
          state.burstStabilitySum = 0;
          state.burstStabilityCount = 0;
          state.burstState = result.activityState;
        }
        state.lastMotionAt = now;
        if (result.cadence) state.burstCadenceSum += result.cadence;
        if (result.cadence) state.burstCadenceCount += 1;
        if (result.activityState === 'walking' || result.activityState === 'running') state.burstState = result.activityState;
        if (typeof result.stability === 'number') {
          state.burstStabilitySum += result.stability;
          state.burstStabilityCount += 1;
        }
        if (statusRef.current !== 'granted') {
          statusRef.current = 'granted';
          setSensorStatus('granted');
          if (typeof window !== 'undefined') window.localStorage.setItem(GRANT_STORAGE_KEY, '1');
        }
      } else if (result.accelerometer) {
        if (dt) state.stationaryMs += dt;
        // An inactivity episode is only counted once the still run passes ten minutes.
        if (!state.stationarySince && dt) state.stationarySince = now;
        const stillFor = state.stationarySince ? now - state.stationarySince : 0;
        if (stillFor > INACTIVITY_EPISODE_MS && !state.inactivityCounted) {
          state.inactivityEpisodes += 1;
          state.inactivityCounted = true;
        }
        if (state.burstStart && now - state.lastMotionAt > ACTIVITY_GAP_MS) {
          flushPeriod();
        }
      }
      if (result.moving && state.inactivityCounted) {
        state.inactivityCounted = false;
        state.stationarySince = 0;
      }

      if (now - uiTick.current > 900) {
        uiTick.current = now;
        setSteps(Math.round(state.steps));
        setActiveMs(state.movedMs);
        setStationaryMs(state.stationaryMs);
        setInactivityPeriods(state.inactivityEpisodes);
        setSamples(state.samples);
        activityStateRef.current = result.activityState;
        setActivityState(result.activityState);
        setCadence(result.cadence);
        setStability(result.stability);
      }
    };

    window.addEventListener('devicemotion', handler);

    return () => {
      window.removeEventListener('devicemotion', handler);
    };
  }, [session, sensorStatus, paused, persist, flushPeriod]);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => persist(), PERSIST_MS);
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        flushPeriod();
        persist();
      }
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      flushPeriod();
      persist();
    };
  }, [session, persist, flushPeriod]);

  return {
    session,
    loading,
    busy,
    sensorStatus,
    supported: support.current,
    steps,
    activeMinutes: Math.round((activeMs / 60000) * 10) / 10,
    stationaryMinutes: Math.round((stationaryMs / 60000) * 10) / 10,
    inactivityPeriods,
    samples,
    activityState: paused ? 'paused' : activityState,
    cadence,
    stability,
    paused,
    sensors,
    enable,
    pause,
    resume,
    setSensor,
    clearData,
  };
}