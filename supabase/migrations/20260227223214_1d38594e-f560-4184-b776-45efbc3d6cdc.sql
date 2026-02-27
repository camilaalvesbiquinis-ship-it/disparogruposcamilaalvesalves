-- Add archived column to broadcasts
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Enable pg_cron and pg_net for auto-timeout
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;