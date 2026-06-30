'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, LogOut, Mail, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportApplicationsButton } from '@/components/tracker/import-applications'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function SignOutButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const initial = useMemo(() => {
    const value = email?.trim()
    return value ? value.charAt(0).toUpperCase() : null
  }, [email])

  async function signOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'group flex h-9 items-center gap-1 rounded-full border border-border bg-card py-1 pl-2 pr-1.5 text-sm font-semibold text-foreground shadow-sm transition-colors outline-none',
          'hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        )}
      >
        <span className="relative flex size-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <UserRound className="size-3.5" />
          {initial && (
            <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full border border-card bg-primary text-[0.6rem] font-semibold leading-none text-primary-foreground">
              {initial}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account options"
          className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="flex items-start gap-3 border-b border-border px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initial ?? <UserRound className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Signed in as
              </p>
              <p className="truncate text-sm font-medium">
                {email ?? 'Email unavailable'}
              </p>
            </div>
          </div>

          <div className="p-1.5">
            <ImportApplicationsButton presentation="menuitem" />
            <Button
              variant="ghost"
              className="h-9 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={signingOut}
              onClick={() => void signOut()}
              role="menuitem"
            >
              <LogOut className="size-4" />
              {signingOut ? 'Logging out...' : 'Log out'}
            </Button>
          </div>

          {email && (
            <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground sm:hidden">
              <Mail className="size-3.5" />
              <span className="truncate">{email}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
