'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Application } from '@/lib/db'
import {
  fetchApplications,
  onApplicationsChanged,
} from '@/lib/applications-store'

export function useApplications() {
  const [apps, setApps] = useState<Application[] | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchApplications()
      setApps(data)
    } catch (e) {
      setApps([])
      setError(e instanceof Error ? e.message : 'Failed to load applications')
    }
  }, [])

  useEffect(() => {
    void reload()
    return onApplicationsChanged(() => void reload())
  }, [reload])

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void reload()
    })
    return () => subscription.unsubscribe()
  }, [reload])

  return { apps, error, reload }
}
