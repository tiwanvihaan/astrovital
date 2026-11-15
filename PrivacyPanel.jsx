import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowUpRight, Eye, Lock, ShieldCheck } from 'lucide-react';
import Panel from '@/components/common/Panel';

const RULES = [
  'Health records (movement, mobility, recovery) are readable only by you.',
  'Team chat, roster and announcements: members of that team only.',
  'Crew rings, AstroPoints and streaks are visible to your crew as completion only — never raw measurements.',
  'Detailed metrics inside a team: only the switches you enable for that team.',
  'Nothing is ever sent to a third party; sensors are read on this device only.',
];

export default function PrivacyPanel() {
  return (
    <Panel
      eyebrow="Privacy & data"
      title="Who can see what"
      subtitle="Your records stay yours. Sharing is opt-in, per team, and reversible at any time."
      action={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
    >
      <ul className="space-y-2 text-[11.5px] leading-relaxed text-muted-foreground">
        {RULES.map((rule) => (
          <li key={rule} className="flex gap-2">
            <Lock className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan/80" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-hairline/60 pt-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Tracking permissions</p>
        <div className="flex items-start gap-2 rounded-xl border border-hairline/60 bg-foreground/[0.02] px-2.5 py-2">
          <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-cyan" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Motion access is requested by your phone on the Movement screen. Anything the sensor cannot read stays
            empty — you can always log activity by hand instead.
          </p>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-hairline/60 bg-foreground/[0.02] px-2.5 py-2">
          <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-violet" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Profile pictures are stored publicly (anyone with the link can open them). Everything else is private.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link to="/crew" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
            Manage team sharing <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link to="/movement" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-cyan">
            Tracking settings <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Panel>
  );
}