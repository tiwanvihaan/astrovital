import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import moment from 'moment';
import { CATEGORIES, SCHEDULES, WEEKDAYS } from '@/lib/reminderSchedule';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fieldClass = 'mt-1 h-9 w-full rounded-xl border border-hairline bg-white/[0.03] px-2.5 text-[12px] text-foreground outline-none focus:border-primary/40';

function Label({ children }) {
  return <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{children}</span>;
}

export default function ReminderForm({ initial, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'wellness');
  const [schedule, setSchedule] = useState(initial?.schedule || 'daily');
  const [time, setTime] = useState(initial?.time_of_day || '08:00');
  const [weekday, setWeekday] = useState(initial?.weekday ?? 1);
  const [date, setDate] = useState(initial?.date || moment().add(1, 'day').format('YYYY-MM-DD'));
  const [notification, setNotification] = useState(initial?.notification ?? true);
  const [notes, setNotes] = useState(initial?.notes || '');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return setError('Give the reminder a title.');
    if (!time) return setError('Choose a time of day.');
    if (schedule === 'once' && !date) return setError('Choose a date for a one-time reminder.');
    setError('');
    await onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      schedule,
      time_of_day: time,
      weekday: Number(weekday),
      date: schedule === 'once' ? date : '',
      notification,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            placeholder="Evening mobility routine"
            className="mt-1 h-9 rounded-xl border-hairline bg-white/[0.03] text-[12px]"
          />
        </label>

        <label className="block">
          <Label>Category</Label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value} className="bg-card">
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <Label>Repeat</Label>
          <select value={schedule} onChange={(event) => setSchedule(event.target.value)} className={fieldClass}>
            {SCHEDULES.map((item) => (
              <option key={item.value} value={item.value} className="bg-card">
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <Label>Time</Label>
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 h-9 rounded-xl border-hairline bg-white/[0.03] text-[12px]" />
        </label>

        {schedule === 'weekly' && (
          <label className="block">
            <Label>Day</Label>
            <select value={weekday} onChange={(event) => setWeekday(event.target.value)} className={fieldClass}>
              {WEEKDAYS.map((day, index) => (
                <option key={day} value={index} className="bg-card">
                  {day}
                </option>
              ))}
            </select>
          </label>
        )}

        {schedule === 'once' && (
          <label className="block">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-9 rounded-xl border-hairline bg-white/[0.03] text-[12px]" />
          </label>
        )}

        <label className="block sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            maxLength={240}
            placeholder="What should happen when this fires?"
            className="mt-1 rounded-xl border-hairline bg-white/[0.03] text-[12px]"
          />
        </label>

        <label className="block sm:col-span-2">
          <Label>Private note</Label>
          <Input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={160}
            placeholder="Optional — never shared with the crew"
            className="mt-1 h-9 rounded-xl border-hairline bg-white/[0.03] text-[12px]"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
        <input type="checkbox" checked={notification} onChange={(event) => setNotification(event.target.checked)} className="h-3.5 w-3.5 accent-[hsl(var(--primary))]" />
        Send a browser notification when it is due (needs notification permission)
      </label>

      {category === 'medication' && (
        <p className="rounded-xl border border-hairline/60 bg-white/[0.02] px-3 py-2 text-[10.5px] leading-relaxed text-muted-foreground">
          Enter the schedule your care team gave you. AstroVital never suggests a medication, a dose, or a change to one.
        </p>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="h-9 flex-1 rounded-xl text-[12px]">
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
          {initial ? 'Save changes' : 'Create reminder'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-9 rounded-xl border-hairline px-3 text-[12px]">
          Cancel
        </Button>
      </div>
    </form>
  );
}