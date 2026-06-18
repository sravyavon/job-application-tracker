import type { Metadata } from 'next'
import { TrackerApp } from '@/components/tracker/tracker-app'

export const metadata: Metadata = {
  title: 'Tracker',
  description:
    'Track every job application in one calm dashboard — paste a link, auto-fill the details, and follow each role from Applied to Offer.',
}

export default function TrackerPage() {
  return <TrackerApp />
}
