import Dexie, { type EntityTable } from 'dexie'
import type { PortalKey } from './portals'

export type ApplicationStatus =
  | 'applied'
  | 'pending'
  | 'interview'
  | 'offer'
  | 'rejected'

export interface Application {
  id: string
  url: string
  title: string
  company: string
  location?: string
  portalKey: PortalKey
  portalLabel: string
  status: ApplicationStatus
  notes?: string
  /** When the user applied (ms epoch). Drives the 90-day archive rule. */
  appliedAt: number
  createdAt: number
  updatedAt: number
  /** Manual archive override, independent of the 90-day rule. */
  archived: boolean
}

export const DAY = 1000 * 60 * 60 * 24
export const ARCHIVE_AFTER_DAYS = 90

/** An application is archived if manually archived OR older than 90 days. */
export function isArchived(app: Application, now = Date.now()): boolean {
  if (app.archived) return true
  return now - app.appliedAt > ARCHIVE_AFTER_DAYS * DAY
}

function startOfLocalDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function daysSince(ts: number, now = Date.now()): number {
  return Math.max(
    0,
    Math.floor((startOfLocalDay(now) - startOfLocalDay(ts)) / DAY),
  )
}

const db = new Dexie('herontrack') as Dexie & {
  applications: EntityTable<Application, 'id'>
}

db.version(1).stores({
  applications: 'id, status, appliedAt, archived, portalKey',
})

export { db }

export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'pending',
  'interview',
  'offer',
  'rejected',
]

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; description: string }
> = {
  applied: { label: 'Applied', description: 'Submitted and waiting' },
  pending: { label: 'Pending', description: 'Under review / in progress' },
  interview: { label: 'Interview', description: 'In the interview stage' },
  offer: { label: 'Offer', description: 'You got an offer' },
  rejected: { label: 'Rejected', description: 'Not moving forward' },
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function addApplication(
  data: Omit<
    Application,
    'id' | 'createdAt' | 'updatedAt' | 'status' | 'archived'
  > & { status?: ApplicationStatus },
): Promise<string> {
  const now = Date.now()
  const id = uid()
  await db.applications.add({
    id,
    status: 'applied',
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...data,
  })
  return id
}

export async function updateApplication(
  id: string,
  changes: Partial<Omit<Application, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.applications.update(id, { ...changes, updatedAt: Date.now() })
}

export async function setStatus(
  id: string,
  status: ApplicationStatus,
): Promise<void> {
  await updateApplication(id, { status })
}

export async function deleteApplication(id: string): Promise<void> {
  await db.applications.delete(id)
}
