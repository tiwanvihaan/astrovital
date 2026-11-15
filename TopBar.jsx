import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useProfile from '@/hooks/useProfile';
import useCollection from '@/hooks/useCollection';
import Brand from './Brand';
import MemberAvatar from '@/components/teams/MemberAvatar';
import { resolveDisplayName } from '@/lib/displayName';

export default function TopBar() {
  const profile = useProfile();
  const alerts = useCollection('Alert', { status: 'active' }, { limit: 40 });
  const activeCount = alerts?.length ?? 0;
  const displayName = resolveDisplayName(profile);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline/50 bg-background/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <div className="lg:hidden">
          <Brand compact />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <Link
            to="/alerts"
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-hairline/80 text-muted-foreground transition-colors hover:border-brand-cyan/40 hover:text-foreground"
            aria-label="Alert center"
          >
            <Bell className="h-[17px] w-[17px]" />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-cyan px-1 font-mono text-[9px] font-medium text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2.5 rounded-xl border border-hairline/80 py-1 pl-1 pr-1.5">
            <Link to="/settings" className="flex items-center gap-2.5" aria-label="Profile settings">
              <MemberAvatar name={displayName} src={profile?.avatar_url} size="sm" />
              <span className="hidden pr-1 leading-tight sm:block">
                <span className="block text-[12px] font-medium tracking-tight text-foreground">{displayName}</span>
                <span className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  {profile?.role || 'Crew'}
                </span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => base44.auth.logout('/login')}
              className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}