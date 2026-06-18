'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addApplication } from '@/lib/db'
import { detectPortal } from '@/lib/portals'
import { cn } from '@/lib/utils'

function todayInput(): string {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export function AddApplication({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (id: string) => void
}) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [portalLabel, setPortalLabel] = useState('')
  const [appliedDate, setAppliedDate] = useState(todayInput())
  const [notes, setNotes] = useState('')
  const [fetching, setFetching] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => urlRef.current?.focus(), 50)
    } else {
      // reset on close
      setUrl('')
      setTitle('')
      setCompany('')
      setLocation('')
      setPortalLabel('')
      setAppliedDate(todayInput())
      setNotes('')
      setHint(null)
      setFetching(false)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null

  function onUrlChange(value: string) {
    setUrl(value)
    if (/^https?:\/\//i.test(value)) {
      setPortalLabel(detectPortal(value).label)
    }
  }

  async function handleFetch() {
    if (!/^https?:\/\//i.test(url)) {
      setHint('Add a full URL (including https://) to auto-fill details.')
      return
    }
    setFetching(true)
    setHint(null)
    try {
      const res = await fetch('/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.title) setTitle(data.title)
      if (data.company) setCompany(data.company)
      if (data.location) setLocation(data.location)
      if (data.portalLabel) setPortalLabel(data.portalLabel)
      if (data.error) setHint(data.error)
      else if (!data.title)
        setHint('Could not read the title — please add it manually.')
    } catch {
      setHint('Something went wrong fetching the page. Fill details manually.')
    } finally {
      setFetching(false)
    }
  }

  async function handleSave() {
    if (!url.trim() || !title.trim()) {
      setHint('A job URL and a title are required.')
      return
    }
    const portal = detectPortal(url)
    const appliedAt = appliedDate
      ? new Date(`${appliedDate}T12:00:00`).getTime()
      : Date.now()
    const id = await addApplication({
      url: url.trim(),
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || undefined,
      portalKey: portal.key,
      portalLabel: portalLabel || portal.label,
      notes: notes.trim() || undefined,
      appliedAt,
    })
    onOpenChange(false)
    onCreated?.(id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add a job application"
        className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Track a new application
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste the job link and we&apos;ll fill in the rest.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="job-url">
              Job posting URL
            </label>
            <div className="flex gap-2">
              <Input
                id="job-url"
                ref={urlRef}
                inputMode="url"
                placeholder="https://linkedin.com/jobs/view/..."
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void handleFetch()
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleFetch}
                disabled={fetching}
                className="shrink-0"
              >
                {fetching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {fetching ? 'Reading' : 'Auto-fill'}
              </Button>
            </div>
            {portalLabel && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Detected portal:{' '}
                <span className="font-medium text-foreground">{portalLabel}</span>
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="job-title">
              Role / title
            </label>
            <Input
              id="job-title"
              placeholder="Senior Product Designer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="job-company">
                Company
              </label>
              <Input
                id="job-company"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="job-location">
                Location
              </label>
              <Input
                id="job-location"
                placeholder="Remote · Berlin"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="job-date">
              Date applied
            </label>
            <Input
              id="job-date"
              type="date"
              value={appliedDate}
              max={todayInput()}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="sm:max-w-44"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="job-notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="job-notes"
              placeholder="Referral from Sam, recruiter is Dana, follow up next week…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {hint && (
            <p
              className={cn(
                'rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground',
              )}
            >
              {hint}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="lg" onClick={handleSave}>
            Save application
          </Button>
        </div>
      </div>
    </div>
  )
}
