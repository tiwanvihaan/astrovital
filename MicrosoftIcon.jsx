import React from 'react';

export default function MicrosoftIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1.5" y="1.5" width="9.6" height="9.6" fill="#F25022" />
      <rect x="12.9" y="1.5" width="9.6" height="9.6" fill="#7FB900" />
      <rect x="1.5" y="12.9" width="9.6" height="9.6" fill="#00A4EF" />
      <rect x="12.9" y="12.9" width="9.6" height="9.6" fill="#FFB900" />
    </svg>
  );
}