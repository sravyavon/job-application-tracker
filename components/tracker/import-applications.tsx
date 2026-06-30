'use client'

import { useRef, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { importApplications } from '@/lib/applications-store'

export function ImportApplicationsButton() {
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

  return (
    <div className="flex flex-col items-end gap-1">
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
      {message && (
        <p className="max-w-48 text-right text-xs text-primary">{message}</p>
      )}
      {error && (
        <p className="max-w-48 text-right text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
