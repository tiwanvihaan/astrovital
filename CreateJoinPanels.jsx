import React, { useState } from 'react';
import { KeyRound, Plus, Users } from 'lucide-react';
import Panel from '@/components/common/Panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CreateJoinPanels({ onCreate, onJoin, busy }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');

  const submitCreate = async (event) => {
    event.preventDefault();
    const created = await onCreate({ name, description });
    if (created) {
      setName('');
      setDescription('');
    }
  };

  const submitJoin = async (event) => {
    event.preventDefault();
    const joined = await onJoin(code);
    if (joined) setCode('');
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel eyebrow="New crew" title="Create a team" subtitle="You become the team leader and get an invitation code.">
        <form onSubmit={submitCreate} className="space-y-2.5">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Team name"
            maxLength={60}
            className="h-10 rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
            required
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is this crew working on? (optional)"
            maxLength={400}
            rows={2}
            className="rounded-xl border-hairline bg-white/[0.03] text-[12.5px]"
          />
          <Button type="submit" disabled={busy || !name.trim()} className="h-9 w-full rounded-xl text-[12.5px]">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create team
          </Button>
        </form>
      </Panel>

      <Panel eyebrow="Invitation" title="Join a team" subtitle="Enter the code a team leader shared with you.">
        <form onSubmit={submitJoin} className="space-y-2.5">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="AST-XXXXXX"
              maxLength={24}
              className="h-10 rounded-xl border-hairline bg-white/[0.03] pl-9 font-mono text-[12.5px] uppercase tracking-[0.08em]"
              required
            />
          </div>
          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <Users className="mt-0.5 h-3 w-3 shrink-0" /> Only members can read a team's chat, roster and shared metrics.
          </p>
          <Button type="submit" variant="outline" disabled={busy || !code.trim()} className="h-9 w-full rounded-xl border-hairline text-[12.5px]">
            Join team
          </Button>
        </form>
      </Panel>
    </div>
  );
}