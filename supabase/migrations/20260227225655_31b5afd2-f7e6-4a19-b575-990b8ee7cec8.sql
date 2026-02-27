
-- 1. Audit Logs table
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL, -- view, edit, delete, export, decrypt, login, role_change
  table_name text,
  record_id text,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only gerentes can read audit logs
CREATE POLICY "Gerentes can read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'gerente'));

-- Authenticated users can insert their own audit logs
CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create index for efficient filtering
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);

-- 2. Consent Records table (LGPD)
CREATE TABLE public.consent_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  consent_type text NOT NULL, -- marketing, analytics, data_sharing
  granted boolean NOT NULL DEFAULT false,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consents"
  ON public.consent_records FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_consent_records_user ON public.consent_records(user_id);

-- 3. Fix broadcast_logs: ensure no unauthorized writes
-- broadcast_logs already has RLS enabled with only SELECT policy
-- This is correct - logs should only be written by service role (edge functions)

-- 4. Make broadcast-media bucket private
UPDATE storage.buckets SET public = false WHERE id = 'broadcast-media';

-- 5. Add storage SELECT policy for authenticated users
CREATE POLICY "Authenticated users can view broadcast media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'broadcast-media');
