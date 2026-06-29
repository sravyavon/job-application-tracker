'use client'

import { useEffect, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Building2,
  CalendarDays,
  ExternalLink,
  MapPin,
  Pencil,
  Save,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CompanyAvatar } from './visuals'
import { StatusActions } from './status-actions'
import { InterviewDetails } from './interview-details'
import {
  daysSince,
  deleteApplication,
  isArchived,
  updateApplication,
  type Application,
} from '@/lib/db'
import { prettyHost } from '@/lib/portals'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function toDateInput(ts: number): string {
  const d = new Date(ts)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

function todayInput(): string {
  return toDateInput(Date.now())
}

export function ApplicationDetail({
  app,
  onDeleted,
}: {
  app: Application
  onDeleted?: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(app.title)
  const [company, setCompany] = useState(app.company)
  const [location, setLocation] = useState(app.location ?? '')
  const [appliedDate, setAppliedDate] = useState(toDateInput(app.appliedAt))
  const [notes, setNotes] = useState(app.notes ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setEditing(false)
    setTitle(app.title)
    setCompany(app.company)
    setLocation(app.location ?? '')
    setAppliedDate(toDateInput(app.appliedAt))
    setNotes(app.notes ?? '')
    setConfirmDelete(false)
  }, [app.id, app.title, app.company, app.location, app.appliedAt, app.notes])

  const archived = isArchived(app)
  const age = daysSince(app.appliedAt)

  async function handleSave() {
    const appliedAt = appliedDate
      ? new Date(`${appliedDate}T12:00:00`).getTime()
      : app.appliedAt
    await updateApplication(app.id, {
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      appliedAt,
    })
    setEditing(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-4 border-b border-border p-6">
        <CompanyAvatar url={app.url} name={app.company || app.title} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {app.portalLabel}
            </span>
            {archived && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                Archived
              </span>
            )}
          </div>
          {editing ? (
            <div className="mt-2 space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Role / title"
                className="font-serif text-lg font-semibold"
              />
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
              />
            </div>
          ) : (
            <>
              <h2 className="mt-2 text-pretty font-serif text-2xl font-semibold leading-tight text-foreground">
                {app.title}
              </h2>
              {app.company && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="size-4" />
                  {app.company}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3.5" /> Applied
            </p>
            {editing ? (
              <Input
                type="date"
                value={appliedDate}
                max={todayInput()}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="mt-1 sm:max-w-full"
              />
            ) : (
              <>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(app.appliedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {age === 0
                    ? 'today'
                    : age === 1
                      ? '1 day ago'
                      : `${age} days ago`}
                </p>
              </>
            )}
          </div>
          {(editing || app.location) && (
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="size-3.5" /> Location
              </p>
              {editing ? (
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote · Berlin"
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm font-medium text-foreground">
                  {app.location}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-foreground">Status</p>
          <StatusActions id={app.id} current={app.status} />
          <InterviewDetails app={app} />
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-foreground">Notes</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            readOnly={!editing}
            placeholder="Recruiter name, referral, follow-up reminders…"
            className="min-h-28"
          />
        </div>

        <div className="mt-6">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="size-4" />
            {prettyHost(app.url)}
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border p-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            void updateApplication(app.id, { archived: !app.archived })
          }
        >
          {app.archived ? (
            <>
              <ArchiveRestore className="size-4" /> Restore
            </>
          ) : (
            <>
              <Archive className="size-4" /> Archive
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-xs text-muted-foreground">Delete for good?</span>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={async () => {
                  await deleteApplication(app.id)
                  onDeleted?.()
                }}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={editing ? 'default' : 'outline'}
                size="lg"
                onClick={() => {
                  if (editing) void handleSave()
                  else setEditing(true)
                }}
              >
                {editing ? (
                  <>
                    <Save className="size-4" /> Save
                  </>
                ) : (
                  <>
                    <Pencil className="size-4" /> Edit
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
