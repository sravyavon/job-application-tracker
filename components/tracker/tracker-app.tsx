'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import Link from 'next/link'
import {
  ArrowLeft,
  Feather,
  LayoutList,
  PanelsTopLeft,
  Plus,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { AddApplication } from './add-application'
import { SidebarList } from './sidebar-list'
import { ListView } from './list-view'
import { ApplicationDetail } from './application-detail'
import {
  db,
  isArchived,
  STATUS_META,
  STATUS_ORDER,
  type Application,
  type ApplicationStatus,
} from '@/lib/db'
import { cn } from '@/lib/utils'

type Filter = 'all' | ApplicationStatus | 'archived'
type ViewMode = 'sidebar' | 'list'

export function TrackerApp() {
  const all = useLiveQuery(
    () => db.applications.orderBy('appliedAt').reverse().toArray(),
    [],
    undefined,
  )

  const [view, setView] = useState<ViewMode>('sidebar')
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const { active, archived } = useMemo(() => {
    const list = all ?? []
    return {
      active: list.filter((a) => !isArchived(a)),
      archived: list.filter((a) => isArchived(a)),
    }
  }, [all])

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: active.length,
      applied: 0,
      pending: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      archived: archived.length,
    }
    for (const a of active) base[a.status]++
    return base
  }, [active, archived])

  const visible = useMemo(() => {
    let list: Application[] = filter === 'archived' ? archived : active
    if (filter !== 'all' && filter !== 'archived') {
      list = list.filter((a) => a.status === filter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.company.toLowerCase().includes(q) ||
          a.portalLabel.toLowerCase().includes(q),
      )
    }
    return list
  }, [active, archived, filter, query])

  // Keep a valid selection for the sidebar view.
  useEffect(() => {
    if (view !== 'sidebar') return
    if (visible.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !visible.some((a) => a.id === selectedId)) {
      // On desktop we auto-select the first; selection is set lazily otherwise.
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setSelectedId(visible[0].id)
      }
    }
  }, [view, visible, selectedId])

  const selected = visible.find((a) => a.id === selectedId) ?? null
  const loading = all === undefined
  const hasAny = (all?.length ?? 0) > 0

  const tabs: Filter[] = ['all', ...STATUS_ORDER, 'archived']

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Herontrack home">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">
              Herontrack
            </span>
          </Link>

          <div className="relative ml-auto hidden items-center sm:flex">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search roles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-44 pl-9 lg:w-56"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView('sidebar')}
              aria-pressed={view === 'sidebar'}
              aria-label="Sidebar view"
              className={cn(
                'flex size-8 items-center justify-center rounded-md transition-colors',
                view === 'sidebar'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <PanelsTopLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              aria-label="List view"
              className={cn(
                'flex size-8 items-center justify-center rounded-md transition-colors',
                view === 'list'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutList className="size-4" />
            </button>
          </div>

          <ThemeToggle />

          <SignOutButton />

          <Button size="lg" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="mx-auto w-full max-w-6xl px-2 pb-2">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => {
              const label =
                t === 'all'
                  ? 'All'
                  : t === 'archived'
                    ? 'Archived'
                    : STATUS_META[t].label
              const isActive = filter === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setFilter(t)
                    setSelectedId(null)
                  }}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground',
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-xs',
                      isActive ? 'bg-primary-foreground/20' : 'bg-muted',
                    )}
                  >
                    {counts[t]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
        {loading ? (
          <LoadingState />
        ) : !hasAny ? (
          <EmptyState onAdd={() => setAddOpen(true)} firstRun />
        ) : visible.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : view === 'list' ? (
          <ListView apps={visible} />
        ) : (
          <div className="grid min-h-[60vh] overflow-hidden rounded-2xl border border-border bg-sidebar lg:grid-cols-[20rem_1fr]">
            <div
              className={cn(
                'border-border lg:block lg:border-r',
                selected ? 'hidden' : 'block',
              )}
            >
              <SidebarList
                apps={visible}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
            <div
              className={cn('bg-card lg:block', selected ? 'block' : 'hidden')}
            >
              {selected ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="flex items-center gap-1.5 px-6 pt-4 text-sm font-medium text-muted-foreground hover:text-foreground lg:hidden"
                  >
                    <ArrowLeft className="size-4" /> Back to list
                  </button>
                  <ApplicationDetail
                    app={selected}
                    onDeleted={() => setSelectedId(null)}
                  />
                </>
              ) : (
                <div className="hidden h-full items-center justify-center p-10 text-center text-sm text-muted-foreground lg:flex">
                  Select an application to see the details.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AddApplication
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(id) => {
          setFilter('all')
          setSelectedId(id)
        }}
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  )
}

function EmptyState({
  onAdd,
  firstRun = false,
}: {
  onAdd: () => void
  firstRun?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Feather className="size-6" />
      </span>
      <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
        {firstRun ? 'Your search starts here' : 'Nothing in this view'}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {firstRun
          ? 'Paste a job link and Herontrack fills in the role, company, and portal for you. Everything stays private on this device.'
          : 'Try a different tab, clear your search, or add a new application.'}
      </p>
      <Button size="lg" className="mt-5" onClick={onAdd}>
        <Plus className="size-4" /> Add your first application
      </Button>
    </div>
  )
}
