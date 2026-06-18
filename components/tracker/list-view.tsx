'use client'

import { Archive, ArchiveRestore, ExternalLink } from 'lucide-react'
import { CompanyAvatar } from './visuals'
import { StatusActions } from './status-actions'
import { daysSince, updateApplication, type Application } from '@/lib/db'

export function ListView({ apps }: { apps: Application[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {apps.map((app) => {
        const age = daysSince(app.appliedAt)
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
            </div>

            <StatusActions
              id={app.id}
              current={app.status}
              size="sm"
              className="sm:justify-end"
            />

            <button
              type="button"
              onClick={() =>
                void updateApplication(app.id, { archived: !app.archived })
              }
              aria-label={app.archived ? 'Restore' : 'Archive'}
              title={app.archived ? 'Restore' : 'Archive'}
              className="hidden size-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              {app.archived ? (
                <ArchiveRestore className="size-4" />
              ) : (
                <Archive className="size-4" />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
