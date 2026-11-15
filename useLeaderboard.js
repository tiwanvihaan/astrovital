import { useCallback, useEffect, useState } from 'react';
import { pointsApi } from '@/lib/astroPoints';

/** Global or crew board for one period, refreshed on an interval so rankings move on their own. */
export default function useLeaderboard({ scope = 'global', period = 'all', teamId = '', pollMs = 120000 }) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (scope === 'crew' && !teamId) {
      setBoard(null);
      setLoading(false);
      return;
    }
    const payload = { scope, period };
    if (scope === 'crew') payload.team_id = teamId;
    const result = await pointsApi('leaderboard', payload);
    setBoard(result);
    setError('');
    setLoading(false);
  }, [scope, period, teamId]);

  useEffect(() => {
    let alive = true;
    load().catch((err) => {
      if (!alive) return;
      setError(err.message);
      setLoading(false);
    });
    if (!pollMs) return () => { alive = false; };
    const id = setInterval(() => {
      load().catch(() => {});
    }, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [load, pollMs]);

  return { board, error, loading, reload: load };
}