'use client'

import { CalendarClock, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  INTERVIEW_STAGE_META,
  INTERVIEW_STAGE_ORDER,
  formatInterviewAt,
  updateApplication,
  type Application,
  type InterviewStage,
} from '@/lib/db'
import { cn } from '@/lib/utils'

function toDateInput(ts: number): string {
  const d = new Date(ts)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

function toDatetimeLocal(ts: number): string {
  const d = new Date(ts)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

function stageClass(active: boolean) {
  return cn(
    'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
    active
      ? 'border-interview bg-interview/15 text-foreground ring-1 ring-interview-foreground/25'
      : 'border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground',
  )
}

export function InterviewDetails({ app }: { app: Application }) {
  if (app.status !== 'interview') return null

  const stage = app.interviewStage ?? 'awaiting_schedule'

  async function setStage(next: InterviewStage) {
    const changes: Partial<Application> = { interviewStage: next }

    if (next === 'awaiting_schedule') {
      changes.interviewAt = undefined
    } else if (next === 'scheduled' && !app.interviewAt) {
      const d = new Date()
      d.setMinutes(0, 0, 0)
      d.setHours(d.getHours() + 1)
      changes.interviewAt = d.getTime()
    } else if (next === 'completed') {
      changes.interviewAt = undefined
      changes.interviewFollowUpAt = undefined
    }

    if (next !== 'awaiting_schedule') {
      changes.interviewFollowUpAt = undefined
    }

    await updateApplication(app.id, changes)
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <CalendarClock className="size-4 text-interview-foreground" />
        Interview details
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {INTERVIEW_STAGE_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => void setStage(key)}
            aria-pressed={stage === key}
            title={INTERVIEW_STAGE_META[key].description}
            className={stageClass(stage === key)}
          >
            <span className="font-medium">{INTERVIEW_STAGE_META[key].label}</span>
          </button>
        ))}
      </div>

      {stage === 'awaiting_schedule' && (
        <div className="mt-4">
          <label
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            htmlFor={`interview-follow-up-${app.id}`}
          >
            <Clock className="size-3.5" />
            Follow up by <span className="font-normal">(optional)</span>
          </label>
          <Input
            id={`interview-follow-up-${app.id}`}
            type="date"
            value={app.interviewFollowUpAt ? toDateInput(app.interviewFollowUpAt) : ''}
            onChange={(e) => {
              const value = e.target.value
              void updateApplication(app.id, {
                interviewFollowUpAt: value
                  ? new Date(`${value}T12:00:00`).getTime()
                  : undefined,
              })
            }}
            className="sm:max-w-xs"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Set a reminder if you haven&apos;t heard back by a certain date.
          </p>
        </div>
      )}

      {stage === 'scheduled' && (
        <div className="mt-4">
          <label
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
            htmlFor={`interview-at-${app.id}`}
          >
            Date &amp; time
          </label>
          <Input
            id={`interview-at-${app.id}`}
            type="datetime-local"
            value={app.interviewAt ? toDatetimeLocal(app.interviewAt) : ''}
            onChange={(e) => {
              const value = e.target.value
              if (!value) return
              void updateApplication(app.id, {
                interviewAt: new Date(value).getTime(),
              })
            }}
            className="sm:max-w-xs"
          />
          {app.interviewAt && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {formatInterviewAt(app.interviewAt)}
            </p>
          )}
        </div>
      )}

      {stage === 'completed' && (
        <p className="mt-3 text-xs text-muted-foreground">
          Marked complete — update to Offer or Rejected when you hear back.
        </p>
      )}
    </div>
  )
}
