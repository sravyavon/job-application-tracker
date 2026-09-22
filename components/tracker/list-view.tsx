'use client'

import { useState } from 'react'
import { Archive, ArchiveRestore, ExternalLink } from 'lucide-react'
import { CompanyAvatar } from './visuals'
import { StatusActions } from './status-actions'
import {
  daysSince,
  interviewSummary,
  isArchived,
  restoreAsAppliedToday,
  toggleArchive,
  type Application,
} from '@/lib/db'

export function ListView({ apps }: { apps: Application[] }) {
  // Row whose age-based restore is awaiting confirmation.
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null)

  async function handleArchiveToggle(app: Application) {
    if ((await toggleArchive(app)) === 'needs-confirm') {
      setConfirmRestoreId(app.id)
    }
  }

  async function handleConfirmRestore(id: string) {
    await restoreAsAppliedToday(id)
    setConfirmRestoreId(null)
  }

  return (
    <ul className="flex flex-col gap-2">
      {apps.map((app) => {
        const age = daysSince(app.appliedAt)
        const interview = interviewSummary(app)
        const archived = isArchived(app)
        const label = archived ? 'Restore' : 'Archive'
        return (
          <li
            key={app.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/15 sm:flex-row sm:items-center sm:gap-4"
          >
            <CompanyAvatar url={app.url} name={app.company || app.title} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {app.title}
                </h3>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Open job posting"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {[app.company, app.portalLabel, app.location]
                  .filter(Boolean)
                  .join(' · ')}
                {' · '}
                {age === 0 ? 'applied today' : `${age} days ago`}
              </p>
              {interview && (
                <p className="truncate text-xs font-medium text-interview-foreground">
                  {interview}
                </p>
              )}
            </div>

            <StatusActions
              id={app.id}
              current={app.status}
              size="sm"
              className="sm:justify-end"
            />

            {confirmRestoreId === app.id ? (
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                <span className="text-xs text-muted-foreground">
                  Restore as applied today?
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmRestoreId(null)
                  }}
                  className="h-8 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleConfirmRestore(app.id)
                  }}
                  aria-label={`Restore (applied ${age} days ago; will be treated as applied today)`}
                  title={`Applied ${age} days ago. Restoring will treat it as applied today.`}
                  className="flex h-8 items-center gap-1 rounded-lg bg-primary px-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <ArchiveRestore className="size-3.5" /> Restore
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void handleArchiveToggle(app)
                }}
                aria-label={label}
                title={label}
                className="hidden size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                {archived ? (
                  <ArchiveRestore className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
