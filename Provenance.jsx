import React from 'react';
import moment from 'moment';

export const SOURCE_LABELS = {
  device_motion: 'Device motion · sensor',
  manual: 'Manual entry',
  self_assessment: 'Self assessment',
  healthkit: 'Apple HealthKit',
  health_connect: 'Android Health Connect',
};

export default function Provenance({ source, updatedAt, className }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/80 ${className || ''}`}>
      <span>{SOURCE_LABELS[source] || source}</span>
      <span aria-hidden="true">·</span>
      <span>{updatedAt ? `updated ${moment(updatedAt).fromNow()}` : 'not updated yet'}</span>
    </p>
  );
}