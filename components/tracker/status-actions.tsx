'use client'

import { cn } from '@/lib/utils'
import {
  STATUS_ORDER,
  STATUS_META,
  setStatus,
  type ApplicationStatus,
} from '@/lib/db'

const ACTIVE_STYLE: Record<ApplicationStatus, string> = {
  applied: 'bg-applied text-applied-foreground ring-applied-foreground/30',
  pending: 'bg-pending text-pending-foreground ring-pending-foreground/30',
  interview: 'bg-interview text-interview-foreground ring-interview-foreground/30',
  offer: 'bg-offer text-offer-foreground ring-offer-foreground/30',
  rejected: 'bg-rejected text-rejected-foreground ring-rejected-foreground/30',
}

export function StatusActions({
  id,
  current,
  size = 'md',
  className,
}: {
  id: string
  current: ApplicationStatus
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="group"
      aria-label="Update application status"
    >
      {STATUS_ORDER.map((status) => {
        const isActive = status === current
        return (
          <button
            key={status}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (!isActive) void setStatus(id, status)
            }}
            aria-pressed={isActive}
            title={STATUS_META[status].description}
            className={cn(
              'rounded-full border font-medium transition-all',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
              isActive
                ? cn('border-transparent ring-1', ACTIVE_STYLE[status])
                : 'border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground',
            )}
          >
            {STATUS_META[status].label}
          </button>
        )
      })}
    </div>
  )
}
