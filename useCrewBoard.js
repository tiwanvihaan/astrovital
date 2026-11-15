import { useCallback, useEffect, useState } from 'react';
import { teamApi } from '@/lib/teamApi';

/** Crew-wide rings, points source data and challenges for one team. */
export default function useCrewBoard(teamId, pollMs = 0) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!teamId) return;
    const result = await teamApi('board', { team_id: teamId });
    setBoard(result);
    setError('');
  }, [teamId]);

  useEffect(() => {
    if (!teamId) {
      setBoard(null);
      return undefined;
    }
    let alive = true;
    const run = () => {
      load().catch((err) => {
        if (alive) setError(err.message);
      });
    };
    run();
    const id = pollMs ? setInterval(run, pollMs) : null;
    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
  }, [teamId, pollMs, load]);

  return { board, error, reload: load };
}