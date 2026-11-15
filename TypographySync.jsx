import { useEffect } from 'react';
import useProfile from '@/hooks/useProfile';
import { applyTypography, resolveTypography } from '@/lib/typography';

export default function TypographySync() {
  const profile = useProfile();
  const settings = resolveTypography(profile);

  useEffect(() => {
    applyTypography(settings);
  }, [settings.font, settings.body, settings.heading]);

  return null;
}