'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { importApplications } from '@/lib/applications-store'
import { cn } from '@/lib/utils'

export function ImportApplicationsButton({
  presentation = 'button',
  className,
}: {
  presentation?: 'button' | 'menuitem'
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onFile(file: File) {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const text = await file.text()
      const data: unknown = JSON.parse(text)
      if (!Array.isArray(data)) {
        throw new Error('File must be a JSON array of applications.')
      }
      const count = await importApplications(data)
      setMessage(`Imported ${count} application${count === 1 ? '' : 's'}.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.')
    } finally {
      setLoading(false)
    }
  }

  const control =
    presentation === 'menuitem' ? (
      <Button
        variant="ghost"
        className="h-9 w-full justify-start gap-2"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        role="menuitem"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Import applications
      </Button>
    ) : (
      <Button
        variant="outline"
        size="lg"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        <span className="hidden sm:inline">Import</span>
      </Button>
    )

  return (
    <div
      className={cn(
        presentation === 'menuitem'
          ? 'flex flex-col gap-1'
          : 'flex flex-col items-end gap-1',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void onFile(file)
          e.target.value = ''
        }}
      />
      {control}
      {message && (
        <p
          className={cn(
            'max-w-48 text-xs text-primary',
            presentation === 'button' && 'text-right',
          )}
        >
          {message}
        </p>
      )}
      {error && (
        <p
          className={cn(
            'max-w-48 text-xs text-destructive',
            presentation === 'button' && 'text-right',
          )}
        >
          {error}
        </p>
      )}
    </div>
  )
}
