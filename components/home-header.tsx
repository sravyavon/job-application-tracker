'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Feather } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { createClient } from '@/lib/supabase/client'

export function HomeHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(Boolean(data.user))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user))
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Feather className="size-4" />
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">
            Herontrack
          </span>
        </Link>

        {!isAuthenticated && (
          <div className="ml-auto hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
          </div>
        )}

        <div
          className={
            isAuthenticated
              ? 'ml-auto flex items-center gap-2'
              : 'ml-auto flex items-center gap-2 sm:ml-6'
          }
        >
          <ThemeToggle />
          {isAuthenticated ? (
            <SignOutButton />
          ) : (
            <Button render={<Link href="/tracker" />} size="lg">
              Sign in
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}
