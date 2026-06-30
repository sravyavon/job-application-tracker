import Link from 'next/link'
import {
  ArrowRight,
  ClipboardPaste,
  Feather,
  LayoutList,
  ListChecks,
  Lock,
  Moon,
  Archive,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { HeroPreview } from '@/components/landing/hero-preview'

const PORTALS = [
  'LinkedIn',
  'Indeed',
  'Glassdoor',
  'Wellfound',
  'Greenhouse',
  'Lever',
  'Workday',
  'Company sites',
]

const STEPS = [
  {
    icon: ClipboardPaste,
    title: 'Paste the link',
    body: 'Drop in a job URL from any portal. Herontrack reads the role, company, and source so you don’t retype a thing.',
  },
  {
    icon: ListChecks,
    title: 'Track the status',
    body: 'One tap moves a role between Applied, Pending, Interview, Offer, and Rejected. No spreadsheets, no clutter.',
  },
  {
    icon: Archive,
    title: 'Let it settle',
    body: 'Anything older than 90 days quietly moves to Archived, so your active list only shows what still needs you.',
  },
]

const FEATURES = [
  {
    icon: Link2,
    title: 'Auto-filled from the URL',
    body: 'Title, company, and portal are detected for you — paste and go.',
  },
  {
    icon: LayoutList,
    title: 'Two calm views',
    body: 'A focused sidebar with details, or a relaxed list with quick actions.',
  },
  {
    icon: Lock,
    title: 'Secure account access',
    body: 'Sign in to keep your tracker connected to your account and available when you come back.',
  },
  {
    icon: Moon,
    title: 'Light & dark',
    body: 'A soft, low-glare palette designed to be easy on tired eyes.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">
              Herontrack
            </span>
          </Link>
          <div className="ml-auto hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:ml-6">
            <ThemeToggle />
            <Button render={<Link href="/tracker" />} size="lg">
              Sign in
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              A quiet home for a noisy job search
            </span>
            <h1 className="mt-5 text-balance font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Track every job application without the stress
            </h1>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Applied on LinkedIn, Indeed, or a company site? Paste the link and
              Herontrack remembers the role, the company, and where things stand —
              so your headspace stays clear.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button render={<Link href="/tracker" />} size="lg" className="h-11 px-5 text-sm">
                Sign in to start
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<a href="#how" />}
                variant="outline"
                size="lg"
                className="h-11 px-5 text-sm"
              >
                See how it works
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sign in or create an account to keep your tracker synced.
            </p>
          </div>
          <div className="lg:pl-6">
            <HeroPreview />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border bg-sidebar/50">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
            <div className="max-w-xl">
              <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight text-foreground">
                Three steps. That’s the whole thing.
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                Built to take seconds, because a job search already takes enough out
                of you.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <step.icon className="size-5" />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
          <div className="max-w-xl">
            <h2 className="text-balance font-serif text-3xl font-semibold tracking-tight text-foreground">
              Thoughtful where it counts
            </h2>
            <p className="mt-3 text-pretty text-muted-foreground">
              Every detail is tuned to lower the friction — and the anxiety — of
              keeping track.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          {/* Portals */}
          <div className="mt-12 rounded-2xl border border-border bg-sidebar/50 p-6 sm:p-8">
            <p className="text-sm font-medium text-foreground">
              Works with the places you already apply
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PORTALS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-border bg-primary px-6 py-14 text-center text-primary-foreground">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Feather className="size-6" />
            </span>
            <h2 className="max-w-lg text-balance font-serif text-3xl font-semibold tracking-tight">
              Give your job search a calm place to live
            </h2>
            <p className="max-w-md text-pretty text-sm text-primary-foreground/80">
              Start in seconds. Sign in to securely save and access your tracker.
            </p>
            <Button
              render={<Link href="/tracker" />}
              variant="secondary"
              size="lg"
              className="h-11 px-6 text-sm"
            >
              Sign in to open tracker
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Feather className="size-3.5" />
            </span>
            <span className="font-serif font-semibold text-foreground">Herontrack</span>
          </div>
          <p>A calm link tracker — built for job seekers, useful for anyone.</p>
        </div>
      </footer>
    </div>
  )
}
