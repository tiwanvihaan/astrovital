import { useCallback, useEffect, useRef, useState } from 'react';
import { pointsApi } from '@/lib/astroPoints';

// The sync re-derives every award from the user's records, so it costs several reads.
// Sharing one result between pages keeps navigating around the app from repeating it.
const CACHE_MS = 60000;
let cache = { key: '', data: null, at: 0 };

/**
 * Loads the astronaut's own AstroPoints state. With sync enabled the server
 * re-derives every award from their tracked records and returns what is new.
 */
export default function useAstroPoints({ sync = true } = {}) {
  const [data, setData] = useState(null);
  const [awards, setAwards] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const first = useRef(true);

  const refresh = useCallback(
    async ({ celebrate = false } = {}) => {
      const result = await pointsApi(sync ? 'sync' : 'summary');
      cache = { key: sync ? 'sync' : 'summary', data: result, at: Date.now() };
      setData(result);
      setError('');
      if (celebrate && Array.isArray(result.awarded) && result.awarded.length) {
        setAwards(result.awarded);
      }
      return result;
    },
    [sync],
  );

  useEffect(() => {
    if (!first.current) return undefined;
    first.current = false;
    const key = sync ? 'sync' : 'summary';
    if (cache.data && cache.key === key && Date.now() - cache.at < CACHE_MS) {
      setData(cache.data);
      setBusy(false);
      return undefined;
    }
    let alive = true;
    refresh({ celebrate: true })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [refresh]);

  const clearAwards = useCallback(() => setAwards([]), []);

  return {
    data,
    awards,
    error,
    busy,
    refresh,
    clearAwards,
    errorMessage: error,
    setError,
  };
}