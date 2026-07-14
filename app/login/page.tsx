import Link from 'next/link'
import { Feather } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Herontrack to access your job application tracker.',
}

function safeNext(path: string | undefined): string {
  if (path && path.startsWith('/') && !path.startsWith('//')) return path
  return '/tracker'
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = safeNext(params.next)
  const authError = params.error === 'auth'

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Feather className="size-4" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">
              Herontrack
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Welcome to Herontrack
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in or create an account with your email to access your job
            application tracker.
          </p>

          {authError && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Sign-in failed. Please try again.
            </p>
          )}

          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  )
}
