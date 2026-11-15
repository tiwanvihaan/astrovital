import { useEffect, useState } from 'react';
import { teamApi } from '@/lib/teamApi';

const POLL_MS = 20000;

let cache = { data: null, at: 0 };
let inflight = null;
let timer = null;
const listeners = new Set();

function publish() {
  listeners.forEach((listener) => listener(cache.data));
}

function refresh() {
  if (inflight) return inflight;
  inflight = teamApi('overview')
    .then((result) => {
      cache = { data: result, at: Date.now() };
      publish();
      return result;
    })
    .catch(() => cache.data)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** One shared poll of the team overview, so several cards never duplicate the request. */
export default function useTeamOverview() {
  const [data, setData] = useState(cache.data);

  useEffect(() => {
    listeners.add(setData);
    if (!cache.data || Date.now() - cache.at > POLL_MS) refresh();
    if (!timer) timer = setInterval(() => refresh(), POLL_MS);
    return () => {
      listeners.delete(setData);
      if (!listeners.size && timer) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return data;
}