
-- Enums
CREATE TYPE public.group_category AS ENUM ('varejo', 'atacado', 'vip', 'internacional', 'promocoes', 'lancamentos', 'outros');
CREATE TYPE public.broadcast_status AS ENUM ('draft', 'sending', 'sent', 'failed', 'scheduled');
CREATE TYPE public.broadcast_content_type AS ENUM ('text', 'image', 'video', 'pdf', 'catalog', 'link');
CREATE TYPE public.schedule_frequency AS ENUM ('once', 'daily', 'weekly', 'monthly', 'custom');
CREATE TYPE public.connection_status AS ENUM ('connected', 'disconnected', 'blocked');

-- WhatsApp Connections
CREATE TABLE public.whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  device_name TEXT,
  status public.connection_status NOT NULL DEFAULT 'disconnected',
  max_groups INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own connections" ON public.whatsapp_connections
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Groups
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category public.group_category NOT NULL DEFAULT 'outros',
  description TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own groups" ON public.groups
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Broadcasts
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  content_type public.broadcast_content_type NOT NULL DEFAULT 'text',
  media_url TEXT,
  status public.broadcast_status NOT NULL DEFAULT 'draft',
  mention_mode TEXT DEFAULT 'none',
  delay_seconds INTEGER NOT NULL DEFAULT 3,
  total_groups INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own broadcasts" ON public.broadcasts
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Broadcast target groups (many-to-many)
CREATE TABLE public.broadcast_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  UNIQUE(broadcast_id, group_id)
);

ALTER TABLE public.broadcast_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own broadcast_groups" ON public.broadcast_groups
  FOR ALL TO authenticated
  USING (broadcast_id IN (SELECT id FROM public.broadcasts WHERE user_id = auth.uid()))
  WITH CHECK (broadcast_id IN (SELECT id FROM public.broadcasts WHERE user_id = auth.uid()));

-- Schedules
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type public.broadcast_content_type NOT NULL DEFAULT 'text',
  connection_id UUID REFERENCES public.whatsapp_connections(id) ON DELETE SET NULL,
  frequency public.schedule_frequency NOT NULL DEFAULT 'once',
  scheduled_at TIMESTAMPTZ,
  cron_expression TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedules" ON public.schedules
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Schedule target groups
CREATE TABLE public.schedule_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  UNIQUE(schedule_id, group_id)
);

ALTER TABLE public.schedule_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own schedule_groups" ON public.schedule_groups
  FOR ALL TO authenticated
  USING (schedule_id IN (SELECT id FROM public.schedules WHERE user_id = auth.uid()))
  WITH CHECK (schedule_id IN (SELECT id FROM public.schedules WHERE user_id = auth.uid()));

-- Broadcast logs
CREATE TABLE public.broadcast_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  group_name TEXT,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own broadcast_logs" ON public.broadcast_logs
  FOR SELECT TO authenticated
  USING (broadcast_id IN (SELECT id FROM public.broadcasts WHERE user_id = auth.uid()));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON public.whatsapp_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_broadcasts_updated_at BEFORE UPDATE ON public.broadcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_groups_user_id ON public.groups(user_id);
CREATE INDEX idx_groups_category ON public.groups(category);
CREATE INDEX idx_broadcasts_user_id ON public.broadcasts(user_id);
CREATE INDEX idx_broadcasts_status ON public.broadcasts(status);
CREATE INDEX idx_schedules_user_id ON public.schedules(user_id);
CREATE INDEX idx_schedules_next_run ON public.schedules(next_run_at);
CREATE INDEX idx_broadcast_logs_broadcast ON public.broadcast_logs(broadcast_id);
CREATE INDEX idx_whatsapp_connections_user ON public.whatsapp_connections(user_id);
