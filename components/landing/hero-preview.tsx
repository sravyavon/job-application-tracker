import { Building2, Feather } from 'lucide-react'

type Row = {
  title: string
  company: string
  meta: string
  status: 'applied' | 'pending' | 'interview' | 'offer' | 'rejected'
}

const ROWS: Row[] = [
  { title: 'Senior Product Designer', company: 'Northwind', meta: 'LinkedIn · 2d', status: 'interview' },
  { title: 'Frontend Engineer', company: 'Lumen Labs', meta: 'Indeed · 5d', status: 'applied' },
  { title: 'UX Researcher', company: 'Harbor', meta: 'Glassdoor · 9d', status: 'pending' },
  { title: 'Design Systems Lead', company: 'Atlas', meta: 'Company site · 12d', status: 'offer' },
]

const BADGE: Record<Row['status'], string> = {
  applied: 'bg-applied text-applied-foreground',
  pending: 'bg-pending text-pending-foreground',
  interview: 'bg-interview text-interview-foreground',
  offer: 'bg-offer text-offer-foreground',
  rejected: 'bg-rejected text-rejected-foreground',
}

const LABEL: Record<Row['status'], string> = {
  applied: 'Applied',
  pending: 'Pending',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

export function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/5">
      <div className="flex items-center gap-2 border-b border-border bg-sidebar px-4 py-3">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Feather className="size-3.5" />
        </span>
        <span className="font-serif text-sm font-semibold">Herontrack</span>
        <div className="ml-auto flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted" />
          <span className="size-2.5 rounded-full bg-muted" />
          <span className="size-2.5 rounded-full bg-muted" />
        </div>
      </div>
      <div className="space-y-2 p-4">
        {ROWS.map((r) => (
          <div
            key={r.title}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.company} · {r.meta}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[r.status]}`}
            >
              <span className="size-1.5 rounded-full bg-current opacity-70" />
              {LABEL[r.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
