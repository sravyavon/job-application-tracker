#!/usr/bin/env node
/**
 * Generate SQL to import a herontrack-export.json file for a specific user.
 *
 * Usage:
 *   node scripts/generate-import-sql.mjs <user-id> <path-to-export.json>
 *
 * Example:
 *   node scripts/generate-import-sql.mjs bf6d8353-28c2-4000-8e07-2d1edc8b186e ~/Downloads/herontrack-export.json
 *
 * Paste the printed SQL into Supabase → SQL Editor → Run.
 */

import fs from 'node:fs'

const userId = process.argv[2]
const filePath = process.argv[3]

if (!userId || !filePath) {
  console.error(
    'Usage: node scripts/generate-import-sql.mjs <user-id> <export.json>',
  )
  process.exit(1)
}

function sqlStr(value) {
  if (value === null || value === undefined || value === '') return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlTs(ms) {
  if (ms === null || ms === undefined) return 'null'
  return `'${new Date(ms).toISOString()}'`
}

const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
if (!Array.isArray(raw)) {
  console.error('Export file must be a JSON array.')
  process.exit(1)
}

const rows = raw
  .filter((item) => item && typeof item.url === 'string' && typeof item.title === 'string')
  .map((app) => {
    const appliedAt = app.appliedAt ?? Date.now()
    const createdAt = app.createdAt ?? appliedAt
    const updatedAt = app.updatedAt ?? createdAt
    return `(
  ${sqlStr(app.id)}::uuid,
  ${sqlStr(userId)}::uuid,
  ${sqlStr(app.url)},
  ${sqlStr(app.title)},
  ${sqlStr(app.company ?? '')},
  ${sqlStr(app.location ?? null)},
  ${sqlStr(app.portalKey)},
  ${sqlStr(app.portalLabel)},
  ${sqlStr(app.status ?? 'applied')},
  ${sqlStr(app.notes ?? null)},
  ${sqlStr(app.interviewStage ?? null)},
  ${sqlTs(app.interviewAt ?? null)},
  ${sqlTs(app.interviewFollowUpAt ?? null)},
  ${sqlTs(appliedAt)},
  ${sqlTs(createdAt)},
  ${sqlTs(updatedAt)},
  ${app.archived ? 'true' : 'false'}
)`
  })

if (rows.length === 0) {
  console.error('No valid applications in file.')
  process.exit(1)
}

console.log(`-- Import ${rows.length} application(s) for user ${userId}`)
console.log(`INSERT INTO public.applications (
  id,
  user_id,
  url,
  title,
  company,
  location,
  portal_key,
  portal_label,
  status,
  notes,
  interview_stage,
  interview_at,
  interview_follow_up_at,
  applied_at,
  created_at,
  updated_at,
  archived
) VALUES
${rows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  url = EXCLUDED.url,
  title = EXCLUDED.title,
  company = EXCLUDED.company,
  location = EXCLUDED.location,
  portal_key = EXCLUDED.portal_key,
  portal_label = EXCLUDED.portal_label,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  interview_stage = EXCLUDED.interview_stage,
  interview_at = EXCLUDED.interview_at,
  interview_follow_up_at = EXCLUDED.interview_follow_up_at,
  applied_at = EXCLUDED.applied_at,
  updated_at = EXCLUDED.updated_at,
  archived = EXCLUDED.archived;`)
