import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginWithSocial } from '@/lib/authMfa';
import GoogleIcon from '@/components/GoogleIcon';
import MicrosoftIcon from './MicrosoftIcon';
import AppleIcon from './AppleIcon';

const PROVIDERS = [
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon },
  { id: 'apple', label: 'Apple', Icon: AppleIcon },
];

export default function ProviderButtons({ returnTo = '/' }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');
  // Guard against a second sign-in attempt: starting the provider hand-off twice
  // (double click, or a click while the popup is still open) invalidates the
  // first attempt's session and comes back as "Login session expired".
  const busy = useRef(false);

  const handleProvider = async (provider) => {
    if (busy.current) return;
    busy.current = true;
    setError('');
    setPending(provider);
    try {
      await loginWithSocial(provider, returnTo);
    } catch (err) {
      setError(err?.message || 'Unable to start sign-in. Please try again.');
      busy.current = false;
      setPending(null);
      return;
    }
    // The provider hand-off (redirect or popup) is in flight — keep the buttons
    // locked so a second attempt can't interrupt it.
    setTimeout(() => {
      busy.current = false;
      setPending(null);
    }, 15000);
  };

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
          {error}
        </div>
      )}
      {PROVIDERS.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          disabled={Boolean(pending)}
          onClick={() => handleProvider(id)}
          className="h-11 w-full justify-start gap-3 rounded-xl border-hairline bg-white/[0.03] px-4 text-[13px] font-medium text-foreground hover:border-hairline hover:bg-white/[0.07] disabled:opacity-60"
        >
          {pending === id ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Icon className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1 text-left">
            {pending === id ? `Waiting for ${label}…` : `Continue with ${label}`}
          </span>
        </Button>
      ))}
    </div>
  );
}