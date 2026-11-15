import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DISPLAY_NAME_STORAGE_KEY, resolveDisplayName, suggestDisplayName } from '@/lib/displayName';

const PROFILE_EVENT = 'astro-profile-changed';

let cache = { userId: null, profile: null };
let inflight = null;

export function invalidateProfile() {
  cache = { userId: null, profile: null };
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(PROFILE_EVENT));
}

function pendingSuggestedName() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || '';
}

async function loadProfile(force = false) {
  const user = await base44.auth.me();
  if (!user) return null;
  if (!force && cache.userId === user.id) return cache.profile;
  if (inflight && inflight.userId === user.id) return inflight.promise;

  const promise = (async () => {
    const page = await base44.entities.AstronautProfile.filter(
      { created_by_id: user.id },
      { sort: '-created_date', limit: 1 },
    );
    let record = page?.items?.[0] || null;

    if (!record) {
      const name = pendingSuggestedName() || suggestDisplayName(user.email) || user.full_name || user.email;
      record = await base44.entities.AstronautProfile.create({
        full_name: user.full_name || name,
        display_name: name,
        role: 'Crew member',
        environment: 'microgravity',
        status: 'nominal',
        status_label: 'Not tracking',
      });
      if (typeof window !== 'undefined') window.localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY);
    } else if (!record.display_name) {
      const name = resolveDisplayName(record, user.email);
      record = await base44.entities.AstronautProfile.update(record.id, { display_name: name });
    }

    cache = { userId: user.id, profile: record };
    return record;
  })();

  inflight = { userId: user.id, promise };
  try {
    return await promise;
  } finally {
    if (inflight?.promise === promise) inflight = null;
  }
}

export default function useProfile() {
  const [profile, setProfile] = useState(cache.profile);

  useEffect(() => {
    let active = true;

    const run = (force) => {
      loadProfile(force)
        .then((record) => {
          if (active) setProfile(record);
        })
        .catch(() => {
          if (active) setProfile(null);
        });
    };

    run(false);
    const handler = () => run(true);
    window.addEventListener(PROFILE_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(PROFILE_EVENT, handler);
    };
  }, []);

  return profile;
}