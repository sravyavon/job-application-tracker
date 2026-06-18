import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { detectPortal } from '@/lib/portals'

export const runtime = 'nodejs'

type JobMeta = {
  url: string
  title: string
  company: string
  location: string
  portalKey: string
  portalLabel: string
}

function clean(value?: string | null): string {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}

/**
 * Job posting titles are often noisy, e.g.
 * "Senior Engineer - Acme Corp | LinkedIn". Strip trailing site/company noise.
 */
function tidyTitle(raw: string): string {
  let t = clean(raw)
  // remove a trailing " | Site" or " - Site" segment that looks like a portal
  t = t.replace(/\s*[|·–-]\s*(LinkedIn|Indeed|Glassdoor|Wellfound|ZipRecruiter|Monster|Naukri|Workday|Greenhouse|Lever)\b.*$/i, '')
  return t.trim()
}

function firstJobPosting(json: unknown): Record<string, unknown> | null {
  const visit = (node: unknown): Record<string, unknown> | null => {
    if (!node) return null
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = visit(item)
        if (found) return found
      }
      return null
    }
    if (typeof node === 'object') {
      const obj = node as Record<string, unknown>
      const type = obj['@type']
      const isJob = Array.isArray(type)
        ? type.includes('JobPosting')
        : type === 'JobPosting'
      if (isJob) return obj
      if (obj['@graph']) return visit(obj['@graph'])
    }
    return null
  }
  return visit(json)
}

export async function POST(request: Request) {
  let url = ''
  try {
    const body = await request.json()
    url = String(body?.url ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: 'Please enter a valid URL starting with http(s)://' },
      { status: 400 },
    )
  }

  const portal = detectPortal(url)
  const fallback: JobMeta = {
    url,
    title: '',
    company: '',
    location: '',
    portalKey: portal.key,
    portalLabel: portal.label,
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 9000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; HerontrackBot/1.0; +https://herontrack.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json(
        { ...fallback, partial: true, error: `Site returned ${res.status}.` },
        { status: 200 },
      )
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    let title = ''
    let company = ''
    let location = ''

    // 1) Prefer structured JobPosting data when available.
    $('script[type="application/ld+json"]').each((_, el) => {
      if (title && company) return
      const text = $(el).contents().text()
      if (!text) return
      try {
        const job = firstJobPosting(JSON.parse(text))
        if (job) {
          if (!title && typeof job.title === 'string') title = job.title
          const org = job.hiringOrganization as
            | Record<string, unknown>
            | string
            | undefined
          if (!company) {
            if (typeof org === 'string') company = org
            else if (org && typeof org.name === 'string') company = org.name
          }
          const loc = job.jobLocation as
            | Record<string, unknown>
            | Array<Record<string, unknown>>
            | undefined
          const oneLoc = Array.isArray(loc) ? loc[0] : loc
          const addr = oneLoc?.address as Record<string, unknown> | undefined
          if (!location && addr) {
            const city = clean(addr.addressLocality as string)
            const region = clean(addr.addressRegion as string)
            const country = clean(addr.addressCountry as string)
            location = [city, region, country].filter(Boolean).join(', ')
          }
        }
      } catch {
        /* ignore malformed JSON-LD */
      }
    })

    // 2) Fall back to Open Graph / meta tags.
    const og = (p: string) =>
      clean($(`meta[property="${p}"]`).attr('content')) ||
      clean($(`meta[name="${p}"]`).attr('content'))

    if (!title) title = og('og:title') || clean($('title').first().text())
    if (!company) company = og('og:site_name')

    title = tidyTitle(title)
    company = clean(company)

    // If the company still reads like the portal itself, drop it.
    if (
      company &&
      portal.key !== 'company' &&
      company.toLowerCase() === portal.label.toLowerCase()
    ) {
      company = ''
    }

    return NextResponse.json(
      {
        ...fallback,
        title,
        company,
        location: clean(location),
        partial: !title,
      },
      { status: 200 },
    )
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return NextResponse.json(
      {
        ...fallback,
        partial: true,
        error: aborted
          ? 'The site took too long to respond. You can fill the details in manually.'
          : 'Could not read that page. You can fill the details in manually.',
      },
      { status: 200 },
    )
  }
}
