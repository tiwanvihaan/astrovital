import React from 'react';
import useProfile from '@/hooks/useProfile';
import useAutoTracking from '@/hooks/useAutoTracking';
import useCollection from '@/hooks/useCollection';
import useTeamOverview from '@/hooks/useTeamOverview';
import { recoveryBreakdown, summariseMovement, mobilityBreakdown } from '@/lib/tracking';
import { firstNameOf, resolveDisplayName } from '@/lib/displayName';
import SensorStatusCard from '@/components/tracking/SensorStatusCard';
import RecoveryPanel from '@/components/recovery/RecoveryPanel';
import OverviewRings from '@/components/dashboard/OverviewRings';
import AstroPointsPanel from '@/components/dashboard/AstroPointsPanel';
import TeamNotifications from '@/components/dashboard/TeamNotifications';
import MovementSection from '@/components/dashboard/MovementSection';
import MobilitySection from '@/components/dashboard/MobilitySection';
import TeamSection from '@/components/dashboard/TeamSection';
import UpcomingReminders from '@/components/dashboard/UpcomingReminders';
import SecretDot from '@/components/devtools/SecretDot';

export default function Overview() {
  const profile = useProfile();
  const tracking = useAutoTracking(profile?.id);
  const activityLogs = useCollection('ActivityLog', {}, { sort: '-created_date', limit: 200 });
  const assessments = useCollection('MobilityAssessment', {}, { sort: '-assessed_at', limit: 200 });
  const checkins = useCollection('RecoveryCheckin', {}, { sort: '-date', limit: 30 });
  const teamOverview = useTeamOverview();

  const displayName = resolveDisplayName(profile);
  const movement = summariseMovement(activityLogs || []);
  const mobility = mobilityBreakdown(assessments || []);
  const recovery = recoveryBreakdown((checkins || [])[0] || null);
  const sensorLive = tracking.sensorStatus === 'granted' && !tracking.paused;

  return (
    <div className="space-y-4">
      <header data-tour="dashboard-header" className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <span className={`h-1 w-1 rounded-full ${sensorLive ? 'bg-brand-cyan animate-pulse-soft' : 'bg-muted-foreground/60'}`} />
            {sensorLive ? 'Live motion tracking' : 'Tracking without sensor data'}
          </p>
          <h1 className="mt-2 text-[23px] leading-[1.15] sm:text-[29px]">
            Welcome back, {firstNameOf(displayName)}
          </h1>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
            Movement, mobility, recovery and stretch breaks — each section shows where its numbers come from and when it last changed.
          </p>
        </div>
      </header>

      <TeamNotifications data={teamOverview} />

      <div data-tour="rings">
        <OverviewRings movement={movement} mobility={mobility} recovery={recovery} />
      </div>

      <AstroPointsPanel />

      <SensorStatusCard
        sensorStatus={tracking.sensorStatus}
        supported={tracking.supported}
        busy={tracking.busy}
        onEnable={tracking.enable}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MovementSection summary={movement} sensorStatus={tracking.sensorStatus} />
        <MobilitySection breakdown={mobility} />
      </div>

      <RecoveryPanel checkins={checkins || []} />

      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingReminders />
        <TeamSection />
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/80">
        Every figure above is stored data from your own records. Sensors are only read while this app is open, and recovery and
        mobility are self-reported rather than measured.
      </p>

      <SecretDot />
    </div>
  );
}