import {
  Activity,
  BellRing,
  Footprints,
  HeartPulse,
  LayoutDashboard,
  Moon,
  Settings as SettingsIcon,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/astropoints', label: 'AstroPoints', icon: Trophy },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/movement', label: 'Movement', icon: Activity },
  { to: '/mobility', label: 'Mobility', icon: Footprints },
  { to: '/recovery', label: 'Recovery', icon: Moon },
  { to: '/reminders', label: 'Reminders', icon: BellRing },
  { to: '/crew', label: 'Crew', icon: Users },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export const ASTRO_AI_ITEM = { to: '/astroai', label: 'AstroAI', icon: Sparkles };

export const MOBILE_ITEMS = [...NAV_ITEMS, ASTRO_AI_ITEM];

export const PRIMARY_NAV = NAV_ITEMS.filter((item) =>
  ['/', '/astropoints', '/movement', '/mobility', '/crew'].includes(item.to),
);