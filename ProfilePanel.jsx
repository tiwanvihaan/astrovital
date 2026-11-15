import React, { useState } from 'react';
import { Image as ImageIcon, Loader2, LogOut, Save, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { invalidateProfile } from '@/hooks/useProfile';
import { DISPLAY_NAME_STORAGE_KEY } from '@/lib/displayName';
import Panel from '@/components/common/Panel';
import MemberAvatar from '@/components/teams/MemberAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilePanel({ profile, user }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    if (!displayName.trim()) {
      setError('A display name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await base44.entities.AstronautProfile.update(profile.id, {
        display_name: displayName.trim(),
        bio: bio.trim(),
      });
      window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName.trim());
      invalidateProfile();
      setMessage('Profile saved.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.AstronautProfile.update(profile.id, { avatar_url: result.file_url });
      invalidateProfile();
      setMessage('Profile picture updated.');
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Panel eyebrow="Your profile" title="How your crew sees you" subtitle="Display name and picture appear in team rosters, chat and direct messages.">
      <div className="flex flex-wrap items-center gap-4">
        <MemberAvatar name={displayName || profile?.full_name} src={profile?.avatar_url} size="lg" />
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-hairline px-3 py-1.5 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload picture
          <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
        </label>
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground/70">
          <ImageIcon className="mr-1 inline h-2.5 w-2.5" /> stored publicly — anyone with the link can open it
        </p>
      </div>

      <form onSubmit={save} className="mt-4 space-y-2.5">
        <div>
          <label htmlFor="display" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Display name
          </label>
          <Input
            id="display"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={60}
            placeholder="How you want to be addressed"
            className="mt-1 h-10 rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
          />
        </div>
        <div>
          <label htmlFor="bio" className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Short bio (optional)
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={2}
            maxLength={240}
            placeholder="Role, focus, current assignment…"
            className="mt-1 rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
          />
        </div>

        {error && <p className="text-[11px] text-destructive">{error}</p>}
        {message && <p className="text-[11px] text-brand-mint">{message}</p>}

        <Button type="submit" disabled={saving || !profile?.id} className="h-9 rounded-xl text-[12px]">
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          Save profile
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline/60 pt-3">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
          {user?.email || 'signed in'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => base44.auth.logout('/login')}
          className="rounded-xl border-hairline text-[11.5px]"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    </Panel>
  );
}