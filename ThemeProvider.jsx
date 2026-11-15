import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  DEFAULT_THEME_ID,
  THEMES,
  applyTheme,
  colorsFor,
  getTheme,
  isThemeId,
  readStoredTheme,
  themeStorageKey,
} from '@/lib/themes';

const ThemeContext = createContext(null);

// Paint the last used palette before React mounts so a reload never flashes another theme.
applyTheme(readStoredTheme());

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [themeId, setThemeId] = useState(readStoredTheme);
  const profileRef = useRef(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const loadProfileTheme = useCallback(async (userId) => {
    const page = await base44.entities.AstronautProfile.filter({ created_by_id: userId }, { limit: 1 });
    const record = page?.items?.[0] || null;
    profileRef.current = record;
    const saved = record?.theme;
    if (isThemeId(saved)) {
      setThemeId(saved);
      try {
        window.localStorage.setItem(themeStorageKey(userId), saved);
      } catch {
        /* storage unavailable */
      }
    }
    return record;
  }, []);

  // Load the theme saved on this account (falls back to the device copy while it loads).
  useEffect(() => {
    let alive = true;
    if (!user?.id) {
      profileRef.current = null;
      setProfileLoaded(false);
      return () => {
        alive = false;
      };
    }

    let local = null;
    try {
      local = window.localStorage.getItem(themeStorageKey(user.id));
    } catch {
      local = null;
    }
    if (isThemeId(local)) setThemeId(local);

    loadProfileTheme(user.id)
      .catch(() => {})
      .finally(() => {
        if (alive) setProfileLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, [user?.id, loadProfileTheme]);

  const setTheme = useCallback(
    async (nextId) => {
      if (!isThemeId(nextId)) return;
      setThemeId(nextId);
      try {
        window.localStorage.setItem(themeStorageKey(user?.id), nextId);
      } catch {
        /* storage unavailable */
      }
      if (!user?.id) return;
      try {
        let record = profileRef.current;
        if (!record) record = await loadProfileTheme(user.id);
        if (!record) {
          record = await base44.entities.AstronautProfile.create({
            full_name: user.full_name || user.email || 'Crew member',
            theme: nextId,
          });
          profileRef.current = record;
          return;
        }
        await base44.entities.AstronautProfile.update(record.id, { theme: nextId });
        profileRef.current = { ...record, theme: nextId };
      } catch {
        /* the choice still applies locally */
      }
    },
    [user?.id, user?.full_name, user?.email, loadProfileTheme],
  );

  const value = useMemo(() => {
    const theme = getTheme(themeId);
    return {
      themeId,
      theme,
      themes: THEMES,
      colors: colorsFor(theme),
      setTheme,
      profileLoaded,
    };
  }, [themeId, setTheme, profileLoaded]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    const theme = getTheme(DEFAULT_THEME_ID);
    return {
      themeId: DEFAULT_THEME_ID,
      theme,
      themes: THEMES,
      colors: colorsFor(theme),
      setTheme: () => {},
      profileLoaded: true,
    };
  }
  return context;
}

/** Chart palette for the active theme, using the legacy key names (cyan/violet/…). */
export function useChartColors() {
  return useTheme().colors;
}