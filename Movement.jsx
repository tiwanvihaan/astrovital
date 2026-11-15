import React from 'react';
import useCollection from '@/hooks/useCollection';
import useProfile from '@/hooks/useProfile';
import useAutoTracking from '@/hooks/useAutoTracking';
import { summariseMovement, summariseSessions } from '@/lib/tracking';
import SensorStatusCard from '@/components/tracking/SensorStatusCard';
import LiveMovementCard from '@/components/tracking/LiveMovementCard';
import ManualActivityForm from '@/components/tracking/ManualActivityForm';
import MovementHistory from '@/components/tracking/MovementHistory';
import MovementMetrics from '@/components/tracking/MovementMetrics';
import TrackingControls from '@/components/tracking/TrackingControls';
import HealthPlatformPanel from '@/components/tracking/HealthPlatformPanel';

export default function Movement() {
  const profile = useProfile();
  const tracking = useAutoTracking(profile?.id);
  const logs = useCollection('ActivityLog', {}, { sort: '-created_date', limit: 200 });
  const sessions = useCollection('TrackingSession', {}, { sort: '-started_at', limit: 20 });
  const summary = summariseMovement(logs || []);
  const observed = summariseSessions(sessions || []);

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Movement · how much you move</p>
        <h1 className="mt-2 text-[26px] font-medium leading-tight tracking-tight sm:text-[31px]">Movement</h1>
        <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
          Steps, active minutes, sessions and still time read directly from this device's accelerometer and gyroscope.
          Tracking starts on its own when the app opens. Nothing here needs Apple Health or Google Fit.
        </p>
      </header>

      <MovementMetrics summary={summary} sessions={observed} />

      <SensorStatusCard
        sensorStatus={tracking.sensorStatus}
        supported={tracking.supported}
        busy={tracking.busy}
        onEnable={tracking.enable}
      />

      <LiveMovementCard tracking={tracking} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ManualActivityForm />
        </div>
        <div className="lg:col-span-3">
          <MovementHistory logs={logs || []} summary={summary} />
        </div>
      </div>

      <TrackingControls tracking={tracking} />

      <HealthPlatformPanel profile={profile} />

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground/80">
        Limits we do not hide: a browser only reads motion while AstroVital is open, so observed inactivity covers exactly the minutes the
        tracker ran and never the hours the app was closed. Step counts and cadence are estimates from acceleration peaks — every estimate is
        labelled as one. Sensors cannot measure joint range, force or loading, so nothing here is presented as mobility or recovery.
      </p>
    </div>
  );
}