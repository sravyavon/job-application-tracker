import { createClient } from '@/lib/supabase/client'
import type {
  Application,
  ApplicationStatus,
  InterviewStage,
} from '@/lib/db'

const CHANGED = 'herontrack:applications-changed'

export function notifyApplicationsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGED))
  }
}

export function onApplicationsChanged(handler: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(CHANGED, handler)
  return () => window.removeEventListener(CHANGED, handler)
}

type ApplicationRow = {
  id: string
  user_id: string
  url: string
  title: string
  company: string
  location: string | null
  portal_key: string
  portal_label: string
  status: ApplicationStatus
  notes: string | null
  interview_stage: InterviewStage | null
  interview_at: string | null
  interview_follow_up_at: string | null
  applied_at: string
  created_at: string
  updated_at: string
  archived: boolean
}

function ts(value: string | null | undefined): number | undefined {
  if (!value) return undefined
  return new Date(value).getTime()
}

function iso(value: number | undefined): string | null {
  if (value === undefined) return null
  return new Date(value).toISOString()
}

function rowToApp(row: ApplicationRow): Application {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    company: row.company,
    location: row.location ?? undefined,
    portalKey: row.portal_key as Application['portalKey'],
    portalLabel: row.portal_label,
    status: row.status,
    notes: row.notes ?? undefined,
    interviewStage: row.interview_stage ?? undefined,
    interviewAt: ts(row.interview_at),
    interviewFollowUpAt: ts(row.interview_follow_up_at),
    appliedAt: new Date(row.applied_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    archived: row.archived,
  }
}

async function requireUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('Not signed in')
  return { supabase, user }
}

export async function fetchApplications(): Promise<Application[]> {
  const { supabase } = await requireUser()
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('applied_at', { ascending: false })

  if (error) throw error
  return (data as ApplicationRow[]).map(rowToApp)
}

export async function addApplication(
  data: Omit<
    Application,
    'id' | 'createdAt' | 'updatedAt' | 'status' | 'archived'
  > & { status?: ApplicationStatus },
): Promise<string> {
  const { supabase, user } = await requireUser()
  const now = new Date().toISOString()

  const { data: row, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      url: data.url,
      title: data.title,
      company: data.company,
      location: data.location ?? null,
      portal_key: data.portalKey,
      portal_label: data.portalLabel,
      status: data.status ?? 'applied',
      notes: data.notes ?? null,
      interview_stage: data.interviewStage ?? null,
      interview_at: iso(data.interviewAt),
      interview_follow_up_at: iso(data.interviewFollowUpAt),
      applied_at: new Date(data.appliedAt).toISOString(),
      created_at: now,
      updated_at: now,
      archived: false,
    })
    .select('id')
    .single()

  if (error) throw error
  notifyApplicationsChanged()
  return row.id
}

function toRowUpdate(
  changes: Partial<Omit<Application, 'id' | 'createdAt'>>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (changes.url !== undefined) row.url = changes.url
  if (changes.title !== undefined) row.title = changes.title
  if (changes.company !== undefined) row.company = changes.company
  if (changes.location !== undefined) row.location = changes.location ?? null
  if (changes.portalKey !== undefined) row.portal_key = changes.portalKey
  if (changes.portalLabel !== undefined) row.portal_label = changes.portalLabel
  if (changes.status !== undefined) row.status = changes.status
  if (changes.notes !== undefined) row.notes = changes.notes ?? null
  if (changes.archived !== undefined) row.archived = changes.archived
  if (changes.appliedAt !== undefined) {
    row.applied_at = new Date(changes.appliedAt).toISOString()
  }
  if ('interviewStage' in changes) {
    row.interview_stage = changes.interviewStage ?? null
  }
  if ('interviewAt' in changes) {
    row.interview_at = iso(changes.interviewAt)
  }
  if ('interviewFollowUpAt' in changes) {
    row.interview_follow_up_at = iso(changes.interviewFollowUpAt)
  }

  return row
}

export async function updateApplication(
  id: string,
  changes: Partial<Omit<Application, 'id' | 'createdAt'>>,
): Promise<void> {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from('applications')
    .update(toRowUpdate(changes))
    .eq('id', id)

  if (error) throw error
  notifyApplicationsChanged()
}

export async function getApplication(id: string): Promise<Application | undefined> {
  const { supabase } = await requireUser()
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? rowToApp(data as ApplicationRow) : undefined
}

export async function deleteApplication(id: string): Promise<void> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) throw error
  notifyApplicationsChanged()
}

function appToRow(app: Application, userId: string) {
  return {
    id: app.id,
    user_id: userId,
    url: app.url,
    title: app.title,
    company: app.company ?? '',
    location: app.location ?? null,
    portal_key: app.portalKey,
    portal_label: app.portalLabel,
    status: app.status,
    notes: app.notes ?? null,
    interview_stage: app.interviewStage ?? null,
    interview_at: iso(app.interviewAt),
    interview_follow_up_at: iso(app.interviewFollowUpAt),
    applied_at: new Date(app.appliedAt).toISOString(),
    created_at: new Date(app.createdAt).toISOString(),
    updated_at: new Date(app.updatedAt).toISOString(),
    archived: app.archived ?? false,
  }
}

function parseExportItem(raw: unknown): Application | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>

  if (typeof o.url !== 'string' || typeof o.title !== 'string') return null
  if (typeof o.portalKey !== 'string' || typeof o.portalLabel !== 'string') {
    return null
  }

  const now = Date.now()
  const appliedAt = typeof o.appliedAt === 'number' ? o.appliedAt : now
  const createdAt = typeof o.createdAt === 'number' ? o.createdAt : appliedAt
  const updatedAt = typeof o.updatedAt === 'number' ? o.updatedAt : createdAt

  return {
    id: typeof o.id === 'string' ? o.id : crypto.randomUUID(),
    url: o.url,
    title: o.title,
    company: typeof o.company === 'string' ? o.company : '',
    location: typeof o.location === 'string' ? o.location : undefined,
    portalKey: o.portalKey as Application['portalKey'],
    portalLabel: o.portalLabel,
    status: (o.status as ApplicationStatus) ?? 'applied',
    notes: typeof o.notes === 'string' ? o.notes : undefined,
    interviewStage: o.interviewStage as InterviewStage | undefined,
    interviewAt: typeof o.interviewAt === 'number' ? o.interviewAt : undefined,
    interviewFollowUpAt:
      typeof o.interviewFollowUpAt === 'number'
        ? o.interviewFollowUpAt
        : undefined,
    appliedAt,
    createdAt,
    updatedAt,
    archived: Boolean(o.archived),
  }
}

/** Import applications from a browser/IndexedDB JSON export into the signed-in user's account. */
export async function importApplications(items: unknown[]): Promise<number> {
  const { supabase, user } = await requireUser()
  const apps = items.map(parseExportItem).filter((a): a is Application => a !== null)

  if (apps.length === 0) {
    throw new Error('No valid applications found in the file.')
  }

  const rows = apps.map((app) => appToRow(app, user.id))
  const { error } = await supabase.from('applications').upsert(rows, {
    onConflict: 'id',
  })

  if (error) throw error
  notifyApplicationsChanged()
  return rows.length
}
