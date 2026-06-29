'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

function tabClass(active: boolean) {
  return cn(
    'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  minLength,
  showPassword,
  onToggleVisibility,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
  disabled: boolean
  minLength?: number
  showPassword: boolean
  onToggleVisibility: () => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
          minLength={minLength}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function resetFeedback() {
    setError(null)
    setMessage(null)
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setConfirmPassword('')
    setShowPassword(false)
    resetFeedback()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (mode === 'signup') {
      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.session) {
        window.location.href = next
        return
      }

      setMessage(
        'Account created. Check your email for a confirmation link, then sign in.',
      )
      setMode('signin')
      setPassword('')
      setConfirmPassword('')
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = next
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-border bg-muted p-1">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          aria-pressed={mode === 'signin'}
          className={tabClass(mode === 'signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          aria-pressed={mode === 'signup'}
          className={tabClass(mode === 'signup')}
        >
          Create account
        </button>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          disabled={loading}
          minLength={mode === 'signup' ? 6 : undefined}
          showPassword={showPassword}
          onToggleVisibility={() => setShowPassword((v) => !v)}
        />

        {mode === 'signup' && (
          <PasswordField
            id="confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat your password"
            autoComplete="new-password"
            disabled={loading}
            minLength={6}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword((v) => !v)}
          />
        )}

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-foreground">
            {message}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : mode === 'signup' ? (
            'Create account'
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  )
}
