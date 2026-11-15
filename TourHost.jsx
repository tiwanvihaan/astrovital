import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import useProfile, { invalidateProfile } from '@/hooks/useProfile';
import { PHONE_TOUR } from '@/lib/tourSteps';
import TourOverlay from './TourOverlay';

export const TOUR_REPLAY_EVENT = 'astro:tour-replay';

/** Shows the guided walkthrough only when this account has not finished it — or when Settings replays it. */
export default function TourHost() {
  const profile = useProfile();
  const [replay, setReplay] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = () => {
      setReplay(true);
      setDismissed(false);
    };
    window.addEventListener(TOUR_REPLAY_EVENT, handler);
    return () => window.removeEventListener(TOUR_REPLAY_EVENT, handler);
  }, []);

  if (dismissed || !profile) return null;
  const firstTime = profile.onboarding_completed !== true;
  if (!firstTime && !replay) return null;

  const finish = async () => {
    setDismissed(true);
    setReplay(false);
    if (firstTime) {
      await base44.entities.AstronautProfile.update(profile.id, { onboarding_completed: true });
      invalidateProfile();
    }
  };

  return <TourOverlay steps={PHONE_TOUR} onDone={finish} />;
}