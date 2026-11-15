import React from 'react';
import useTheme from '@/components/theme/ThemeProvider';
import ThemeCard from '@/components/settings/ThemeCard';

export default function ThemeGrid() {
  const { themes, themeId, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {themes.map((theme) => (
        <ThemeCard key={theme.id} theme={theme} active={theme.id === themeId} onSelect={setTheme} />
      ))}
    </div>
  );
}