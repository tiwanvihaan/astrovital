import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Realtime events arrive one per changed record, often in bursts (a tracking session
// touches several records a minute). Coalescing them into a single refetch keeps a
// busy page well inside the API's per-minute list allowance.
const COALESCE_MS = 4000;
const RETRY_MS = 8000;

export default function useCollection(entityName, query = {}, options = {}) {
  const [items, setItems] = useState(null);
  const queryKey = JSON.stringify(query);
  const optionsKey = JSON.stringify(options);

  const busy = useRef(false);
  const dirty = useRef(false);
  const timer = useRef(null);
  const retry = useRef(null);
  const mounted = useRef(true);
  const runRef = useRef(null);

  const run = useCallback(async () => {
    if (busy.current) {
      dirty.current = true;
      return;
    }
    busy.current = true;
    try {
      const res = await base44.entities[entityName].filter(JSON.parse(queryKey), JSON.parse(optionsKey));
      if (mounted.current) setItems(res?.items ?? (Array.isArray(res) ? res : []));
    } catch {
      // Usually the per-minute list allowance. Keep the rows already on screen and
      // try once more shortly instead of breaking the page.
      if (!retry.current) {
        retry.current = setTimeout(() => {
          retry.current = null;
          if (mounted.current) runRef.current();
        }, RETRY_MS);
      }
    } finally {
      busy.current = false;
      if (dirty.current) {
        dirty.current = false;
        runRef.current();
      }
    }
  }, [entityName, queryKey, optionsKey]);

  runRef.current = run;

  const schedule = useCallback(() => {
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      // Nothing needs refreshing while the tab is in the background.
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      runRef.current();
    }, COALESCE_MS);
  }, []);

  useEffect(() => {
    mounted.current = true;
    run();
    const unsubscribe = base44.entities[entityName].subscribe(schedule);
    const onVisible = () => {
      if (document.visibilityState === 'visible') schedule();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      mounted.current = false;
      if (typeof unsubscribe === 'function') unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
      clearTimeout(timer.current);
      timer.current = null;
      clearTimeout(retry.current);
      retry.current = null;
    };
  }, [entityName, run, schedule]);

  return items;
}