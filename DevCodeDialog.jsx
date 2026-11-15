import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, Lock, FolderDown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { APP_FILES } from '@/lib/appSource';
import { downloadAppFolder } from '@/lib/appDownload';

const PASSWORD = '1617';

export default function DevCodeDialog({ open, onOpenChange }) {
  const [stage, setStage] = useState('password');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activePath, setActivePath] = useState(APP_FILES[0]?.path || '');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState('');
  const [busy, setBusy] = useState(false);

  const active = useMemo(() => APP_FILES.find((file) => file.path === activePath), [activePath]);

  const close = (next) => {
    if (!next) {
      setStage('password');
      setPassword('');
      setError('');
      setCopied(false);
      setResult('');
      setBusy(false);
    }
    onOpenChange(next);
  };

  const submitPassword = (event) => {
    event.preventDefault();
    if (password.trim() === PASSWORD) {
      setStage('confirm');
      setError('');
      setPassword('');
    } else {
      setError('Wrong password.');
    }
  };

  const download = async () => {
    setBusy(true);
    const outcome = await downloadAppFolder(APP_FILES);
    setBusy(false);
    if (outcome === 'cancelled') return;
    setResult(outcome === 'folder' ? 'Saved to the folder you picked.' : 'Downloaded as astro-vital-code.zip — unzip it, then open the folder in VS Code.');
    setStage('code');
  };

  const copy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-4xl gap-0 p-0">
        {stage === 'password' && (
          <form onSubmit={submitPassword} className="p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[15px]">
                <Lock className="h-3.5 w-3.5 text-primary" /> Restricted
              </DialogTitle>
              <DialogDescription className="text-[12px]">Enter the password to view the app code.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              type="password"
              inputMode="numeric"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="mt-4"
            />
            {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
            <Button type="submit" size="sm" className="mt-4 w-full">
              Unlock
            </Button>
          </form>
        )}

        {stage === 'confirm' && (
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[15px]">
                <FolderDown className="h-3.5 w-3.5 text-primary" /> Download app code?
              </DialogTitle>
              <DialogDescription className="text-[12px] leading-relaxed">
                You are about to download all {APP_FILES.length} source files as a folder, so you can open them in VS Code.
                If your browser can't write to a folder, it gives you a .zip instead.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button size="sm" onClick={download} disabled={busy} className="sm:flex-1">
                <Download className="h-3.5 w-3.5" />
                {busy ? 'Preparing…' : 'Yes, download the folder'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStage('code')} disabled={busy} className="sm:flex-1">
                No, just show me the code
              </Button>
            </div>
          </div>
        )}

        {stage === 'code' && (
          <div className="flex h-[72vh] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
              <div className="min-w-0">
                <DialogTitle className="text-[13px]">App code</DialogTitle>
                <DialogDescription className="mt-0.5 font-mono text-[10px]">
                  {APP_FILES.length} files · read only
                </DialogDescription>
              </div>
              <Button size="sm" variant="outline" onClick={copy} disabled={!active}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy file'}
              </Button>
            </div>
            <div className="grid min-h-0 flex-1 md:grid-cols-[16rem_1fr]">
              <ul className="max-h-40 overflow-y-auto border-b border-hairline md:max-h-none md:border-b-0 md:border-r">
                {APP_FILES.map((file) => (
                  <li key={file.path}>
                    <button
                      type="button"
                      onClick={() => setActivePath(file.path)}
                      className={`w-full truncate px-4 py-1.5 text-left font-mono text-[10.5px] transition-colors hover:bg-foreground/5 ${
                        file.path === activePath ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {file.path}
                    </button>
                  </li>
                ))}
              </ul>
              <pre className="min-h-0 overflow-auto bg-background/60 p-4 font-mono text-[11px] leading-relaxed text-foreground/90">
                <code>{active?.code}</code>
              </pre>
            </div>
            <p className="border-t border-hairline px-5 py-2 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">
              {result || "Browsers can't launch VS Code — download the folder, then open it there"}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}