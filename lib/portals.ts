export type PortalKey =
  | 'linkedin'
  | 'indeed'
  | 'glassdoor'
  | 'wellfound'
  | 'ziprecruiter'
  | 'monster'
  | 'lever'
  | 'greenhouse'
  | 'workday'
  | 'naukri'
  | 'company'
  | 'other'

export type PortalInfo = {
  key: PortalKey
  label: string
}

const PORTAL_RULES: { match: string[]; key: PortalKey; label: string }[] = [
  { match: ['linkedin.'], key: 'linkedin', label: 'LinkedIn' },
  { match: ['indeed.'], key: 'indeed', label: 'Indeed' },
  { match: ['glassdoor.'], key: 'glassdoor', label: 'Glassdoor' },
  { match: ['wellfound.', 'angel.co'], key: 'wellfound', label: 'Wellfound' },
  { match: ['ziprecruiter.'], key: 'ziprecruiter', label: 'ZipRecruiter' },
  { match: ['monster.'], key: 'monster', label: 'Monster' },
  { match: ['lever.co'], key: 'lever', label: 'Lever' },
  { match: ['greenhouse.io', 'boards.greenhouse'], key: 'greenhouse', label: 'Greenhouse' },
  { match: ['myworkdayjobs.', 'workday.'], key: 'workday', label: 'Workday' },
  { match: ['naukri.'], key: 'naukri', label: 'Naukri' },
]

/**
 * Detect which job portal a URL belongs to, based on its hostname.
 * Anything unrecognised is treated as a direct company website.
 */
export function detectPortal(url: string): PortalInfo {
  let host = ''
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return { key: 'other', label: 'Other' }
  }

  for (const rule of PORTAL_RULES) {
    if (rule.match.some((m) => host.includes(m))) {
      return { key: rule.key, label: rule.label }
    }
  }

  return { key: 'company', label: 'Company site' }
}

/** A clean, human-readable hostname for display. */
export function prettyHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
