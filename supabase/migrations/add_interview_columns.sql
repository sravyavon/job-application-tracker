-- Run in Supabase SQL Editor if your applications table was created earlier
-- without interview sub-stage columns.

alter table public.applications
  add column if not exists interview_stage text
    check (interview_stage in ('awaiting_schedule', 'scheduled', 'completed')),
  add column if not exists interview_at timestamptz,
  add column if not exists interview_follow_up_at timestamptz;
