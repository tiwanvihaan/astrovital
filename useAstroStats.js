import { useMemo } from 'react';
import useCollection from '@/hooks/useCollection';
import { buildDays, summariseDays, achievementsFor } from '@/lib/astroScore';

export default function useAstroStats() {
  const logs = useCollection('ActivityLog', {}, { sort: '-date', limit: 200 });
  const assessments = useCollection('MobilityAssessment', {}, { sort: '-assessed_at', limit: 200 });
  const checkins = useCollection('RecoveryCheckin', {}, { sort: '-date', limit: 60 });

  const ready = Boolean(logs && assessments && checkins);

  return useMemo(() => {
    if (!ready) return { ready: false };
    const days = buildDays({ logs, assessments, checkins });
    const stats = summariseDays(days);
    return { ...stats, achievements: achievementsFor(stats), ready: true };
  }, [ready, logs, assessments, checkins]);
}