'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { prettyHost } from '@/lib/portals'
import { STATUS_META, type ApplicationStatus } from '@/lib/db'

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  applied: 'bg-applied text-applied-foreground',
  pending: 'bg-pending text-pending-foreground',
  interview: 'bg-interview text-interview-foreground',
  offer: 'bg-offer text-offer-foreground',
  rejected: 'bg-rejected text-rejected-foreground',
}

export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_BADGE[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {STATUS_META[status].label}
    </span>
  )
}

// A soft monogram palette so each avatar feels distinct but calm.
const TILE_TINTS = [
  'bg-[oklch(0.92_0.05_180)] text-[oklch(0.4_0.07_185)] dark:bg-[oklch(0.36_0.05_185)] dark:text-[oklch(0.86_0.07_180)]',
  'bg-[oklch(0.93_0.05_85)] text-[oklch(0.46_0.08_70)] dark:bg-[oklch(0.38_0.05_75)] dark:text-[oklch(0.86_0.08_85)]',
  'bg-[oklch(0.92_0.05_150)] text-[oklch(0.42_0.08_155)] dark:bg-[oklch(0.36_0.05_155)] dark:text-[oklch(0.86_0.08_150)]',
  'bg-[oklch(0.92_0.05_255)] text-[oklch(0.45_0.09_260)] dark:bg-[oklch(0.36_0.05_260)] dark:text-[oklch(0.86_0.08_255)]',
  'bg-[oklch(0.93_0.05_25)] text-[oklch(0.5_0.1_25)] dark:bg-[oklch(0.38_0.06_25)] dark:text-[oklch(0.86_0.09_25)]',
]

function tintFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return TILE_TINTS[h % TILE_TINTS.length]
}

export function CompanyAvatar({
  url,
  name,
  size = 'md',
  className,
}: {
  url: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const host = prettyHost(url)
  const initial = (name || host || '?').trim().charAt(0).toUpperCase()
  const dims =
    size === 'lg' ? 'size-12 text-lg' : size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm'
  const px = size === 'lg' ? 48 : size === 'sm' ? 32 : 40

  if (failed || !host) {
    return (
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl font-semibold',
          dims,
          tintFor(name || host),
          className,
        )}
        aria-hidden
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card',
        dims,
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        className="size-2/3 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
