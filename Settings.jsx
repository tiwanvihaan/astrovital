import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BellRing, Database, Palette, ShieldCheck, Trophy, UserRound, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { teamApi } from '@/lib/teamApi';
import useProfile from '@/hooks/useProfile';
import useStretchReminders from '@/hooks/useStretchReminders';
import Panel from '@/components/common/Panel';
import ProfilePanel from '@/components/settings/ProfilePanel';
import ThemeGrid from '@/components/settings/ThemeGrid';
import TypographyPanel from '@/components/settings/TypographyPanel';
import CurrentTheme from '@/components/settings/CurrentTheme';
import PrivacyPanel from '@/components/settings/PrivacyPanel';
import RecentPlacings from '@/components/settings/RecentPlacings';
import DataSourcesPanel from '@/components/settings/DataSourcesPanel';
import ReminderSettingsPanel from '@/components/reminders/ReminderSettingsPanel';
import RoleBadge from '@/components/teams/RoleBadge';

function SectionTitle({ icon: Icon, title, hint }) {
  return (
    <div className="flex items-end justify-between gap-3 px-1">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h2 className="text-[12px] uppercase tracking-[0.14em] text-foreground">{title}</h2>
      </div>
      {hint && <p className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground sm:block">{hint}</p>}
    </div>
  );
}

export default function Settings() {
  const profile = useProfile();
  const reminders = useStretchReminders({ watch: false });
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [notificationState, setNotificationState] = useState(() => {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission;
  });

  const loadTeams = useCallback(async () => {
    const result = await teamApi('overview');
    setTeams(result.teams || []);
  }, []);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    loadTeams().catch(() => {});
  }, [loadTeams]);

  const requestNotifications = async () => {
    const result = await reminders.requestBrowserNotifications();
    if (result) setNotificationState(result);
  };

  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-primary" />
          Mission control
        </p>
        <h1 className="mt-2 text-[24px] leading-[1.15] sm:text-[29px]">Settings</h1>
        <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
          Your identity, the way AstroVital looks, how often it nudges you, and who gets to see your data.
        </p>
      </header>

      <section className="space-y-3">
        <SectionTitle icon={Palette} title="Appearance" hint="Saved to your account" />
        <Panel
          eyebrow="Color theme"
          title="Choose your palette"
          subtitle="Ten calibrated themes. Selecting one repaints the whole console instantly — no refresh, and it follows you to every device you sign in on."
          action={<CurrentTheme />}
        >
          <ThemeGrid />
          <p className="mt-4 border-t border-hairline/60 pt-3 text-[10.5px] leading-relaxed text-muted-foreground/80">
            Every surface, chart, chart grid, badge and status colour is drawn from the active theme tokens, so text
            contrast is preserved in all ten.
          </p>
          <div className="mt-5 border-t border-hairline/60 pt-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Typography</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Font family, reading size, and separate heading and body scaling. Saved to your account, so it follows you
              to every device you sign in on.
            </p>
            <div className="mt-3">
              <TypographyPanel profile={profile} />
            </div>
          </div>
        </Panel>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={UserRound} title="Account" hint={user?.email || 'Signed in'} />
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ProfilePanel profile={profile} user={user} />
          </div>

          <div className="lg:col-span-2">
            <Panel eyebrow="Teams" title="Your memberships" action={<Users className="h-4 w-4 text-muted-foreground" />}>
              <div className="space-y-2">
                {teams.map((team) => (
                  <Link
                    key={team.id}
                    to={`/crew/${team.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-hairline/60 bg-foreground/[0.02] px-3 py-2 transition-colors hover:border-primary/35"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium tracking-tight text-foreground">{team.name}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        {team.member_count} member{team.member_count === 1 ? '' : 's'}
                      </span>
                    </span>
                    <RoleBadge role={team.role} />
                  </Link>
                ))}
                {!teams.length && (
                  <p className="text-[11.5px] leading-relaxed text-muted-foreground">You are not in a team yet.</p>
                )}
                <Link to="/crew" className="inline-flex items-center gap-1 pt-1 text-[11px] text-muted-foreground hover:text-primary">
                  Manage teams <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={Trophy} title="Recent placings" hint="AstroPoints standings" />
        <RecentPlacings />
      </section>

      <section className="space-y-3">
        <SectionTitle icon={BellRing} title="Notifications" hint="Stretch nudges and alerts" />
        <div className="grid gap-4 lg:grid-cols-2">
          <ReminderSettingsPanel
            settings={reminders.settings}
            onSave={reminders.save}
            onFire={reminders.fire}
            onRequestNotifications={requestNotifications}
            notificationState={notificationState}
          />
          <Panel
            eyebrow="Other alerts"
            title="What AstroVital tells you"
            subtitle="Only what your own records justify — nothing simulated."
          >
            <ul className="space-y-2 text-[11.5px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan/80" />
                Recovery and mobility reminders appear when a check-in or assessment has not been logged.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan/80" />
                Team activity (messages, direct messages, announcements) shows on the dashboard and in the alert centre.
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-brand-cyan/80" />
                Browser notifications are optional and only fire while AstroVital is open.
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-4">
              <Link to="/alerts" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                Open alert centre <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link to="/reminders" className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
                Manage reminders <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </Panel>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={Database} title="Data sources" hint="Only what is really connected" />
        <Panel
          eyebrow="Sources"
          title="Where your numbers come from"
          subtitle="AstroVital shows a source as connected only when it is actually delivering data. Simulated or absent sources are labelled as such."
        >
          <DataSourcesPanel />
        </Panel>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={ShieldCheck} title="Privacy & data" hint="Yours by default" />
        <PrivacyPanel />
      </section>
    </div>
  );
}