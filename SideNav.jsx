import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASTRO_AI_ITEM, NAV_ITEMS } from './navItems';
import Brand from './Brand';

export default function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-hairline/70 bg-background/70 px-4 py-6 backdrop-blur-2xl lg:flex">
      <div className="px-2">
        <Brand />
      </div>

      <nav className="mt-9 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) =>
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          data-tour={`nav-${to === '/' ? 'dashboard' : to.slice(1).replace('/', '-')}`}
          className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12.5px] transition-all duration-200',
            isActive ?
            'bg-primary/10 text-foreground' :
            'text-muted-foreground hover:translate-x-0.5 hover:bg-foreground/[0.04] hover:text-foreground'
          )
          }>
          
            {({ isActive }) =>
          <>
                <span
              className={cn(
                'absolute left-0 h-5 w-[2px] rounded-full bg-brand-cyan transition-all duration-300',
                isActive ? 'opacity-100' : 'opacity-0'
              )} />
            
                <Icon className={cn('h-[17px] w-[17px] transition-colors', isActive ? 'text-brand-cyan' : 'text-muted-foreground group-hover:text-foreground')} />
                <span className="tracking-tight">{label}</span>
              </>
          }
          </NavLink>
        )}
      </nav>

      <Link
        to={ASTRO_AI_ITEM.to}
        className="mt-auto flex items-center gap-2 rounded-2xl border border-hairline/70 bg-white/[0.03] px-3 py-2.5 text-[12px] tracking-tight text-foreground transition-colors hover:border-brand-cyan/40">
        
        <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
        Ask AstroAI
      </Link>

      <div className="mt-3 rounded-2xl border border-hairline/70 bg-surface/60 p-3.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand-mint" />
          <p className="eyebrow text-brand-mint/90">Feeds Accurate</p>
        </div>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
          Prototype data. Measures only what connected sources report.
        </p>
      </div>
    </aside>);

}