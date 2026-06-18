'use client'

import { cn } from '@/lib/utils'
import { CompanyAvatar, StatusBadge } from './visuals'
import { daysSince, type Application } from '@/lib/db'

export function SidebarList({
  apps,
  selectedId,
  onSelect,
}: {
  apps: Application[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ul className="flex flex-col gap-1 p-2">
      {apps.map((app) => {
        const active = app.id === selectedId
        const age = daysSince(app.appliedAt)
        return (
          <li key={app.id}>
            <button
              type="button"
              onClick={() => onSelect(app.id)}
              aria-current={active}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors',
                active
                  ? 'border-border bg-card shadow-xs'
                  : 'border-transparent hover:bg-card/60',
              )}
            >
              <CompanyAvatar url={app.url} name={app.company || app.title} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {app.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {app.company || app.portalLabel}
                  {' · '}
                  {age === 0 ? 'today' : `${age}d`}
                </p>
              </div>
              <StatusBadge status={app.status} className="hidden sm:inline-flex" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
