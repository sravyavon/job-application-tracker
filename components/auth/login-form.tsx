'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Step = 'initial' | 'code-sent' | 'password'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">or</span>
      </div>
    </div>
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
  const [step, setStep] = useState<Step>('initial')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isNewAccount, setIsNewAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function resetFeedback() {
    setError(null)
    setMessage(null)
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    resetFeedback()

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setGoogleLoading(false)
    }
  }

  async function handleSendCode() {
    resetFeedback()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setMessage('Check your email — we sent you a sign-in link.')
    setStep('code-sent')
    setLoading(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetFeedback()

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      return
    }

    if (isNewAccount && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (isNewAccount && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (isNewAccount) {
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
      setStep('initial')
      setIsNewAccount(false)
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
      {/* Google sign-in */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={googleLoading || loading}
        onClick={() => void handleGoogleSignIn()}
      >
        {googleLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <>
            <GoogleIcon className="size-5" />
            Continue with Google
          </>
        )}
      </Button>

      <Divider />

      {/* Email-first flow */}
      {step === 'initial' && (
        <div className="space-y-3">
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
              onChange={(e) => {
                setEmail(e.target.value)
                resetFeedback()
              }}
              disabled={loading}
              required
            />
          </div>

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

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={() => void handleSendCode()}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Mail className="size-4" />
                Send me a sign-in link
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              resetFeedback()
              setStep('password')
            }}
            className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Use a password instead
          </button>
        </div>
      )}

      {/* Code sent confirmation */}
      {step === 'code-sent' && (
        <div className="space-y-3">
          {message && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-foreground">
              {message}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            We sent a sign-in link to{' '}
            <span className="font-medium text-foreground">{email.trim()}</span>.
            Check your inbox and click the link to continue.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => {
                resetFeedback()
                setStep('initial')
              }}
            >
              Back
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={loading}
              onClick={() => void handleSendCode()}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Resend link'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Password flow */}
      {step === 'password' && (
        <form
          onSubmit={(e) => void handlePasswordSubmit(e)}
          className="space-y-3"
        >
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
            placeholder={isNewAccount ? 'At least 6 characters' : 'Your password'}
            autoComplete={isNewAccount ? 'new-password' : 'current-password'}
            disabled={loading}
            minLength={isNewAccount ? 6 : undefined}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword((v) => !v)}
          />

          {isNewAccount && (
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
            ) : isNewAccount ? (
              'Create account'
            ) : (
              'Sign in'
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                resetFeedback()
                setStep('initial')
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Use a sign-in link
            </button>
            <button
              type="button"
              onClick={() => {
                resetFeedback()
                setIsNewAccount((v) => !v)
                setConfirmPassword('')
              }}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {isNewAccount ? 'Have an account? Sign in' : 'New here? Create account'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
