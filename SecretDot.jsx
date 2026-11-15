import React, { useState } from 'react';
import DevCodeDialog from './DevCodeDialog';

export default function SecretDot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Developer access"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-40 h-2 w-2 rounded-full bg-muted-foreground/25 transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      />
      <DevCodeDialog open={open} onOpenChange={setOpen} />
    </>
  );
}