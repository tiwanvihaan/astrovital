import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MOBILE_ITEMS } from './navItems';

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
      <div className="no-scrollbar mx-auto flex max-w-2xl items-stretch gap-0.5 overflow-x-auto px-2">
        {MOBILE_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            data-tour={`nav-${to === '/' ? 'dashboard' : to.slice(1).replace('/', '-')}`}
            className={({ isActive }) =>
              cn(
                'relative flex min-w-[62px] flex-1 flex-col items-center gap-1 rounded-xl px-1 pb-2 pt-2.5 text-[9.5px] transition-colors active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute -top-px h-[2px] w-6 rounded-full bg-primary transition-opacity duration-200',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.1 : 1.7} />
                <span className="whitespace-nowrap tracking-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}