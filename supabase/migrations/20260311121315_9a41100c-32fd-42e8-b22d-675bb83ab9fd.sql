
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- audit_logs
DROP POLICY IF EXISTS "Gerentes can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;

CREATE POLICY "Gerentes can read audit logs" ON public.audit_logs
  FOR SELECT TO public USING (has_role(auth.uid(), 'gerente'::app_role));

CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
  FOR INSERT TO public WITH CHECK (user_id = auth.uid());

-- broadcast_groups
DROP POLICY IF EXISTS "Users manage own broadcast_groups" ON public.broadcast_groups;

CREATE POLICY "Users manage own broadcast_groups" ON public.broadcast_groups
  FOR ALL TO public
  USING (broadcast_id IN (SELECT id FROM broadcasts WHERE user_id = auth.uid()))
  WITH CHECK (broadcast_id IN (SELECT id FROM broadcasts WHERE user_id = auth.uid()));

-- broadcast_logs
DROP POLICY IF EXISTS "Users read own broadcast_logs" ON public.broadcast_logs;

CREATE POLICY "Users read own broadcast_logs" ON public.broadcast_logs
  FOR SELECT TO public
  USING (broadcast_id IN (SELECT id FROM broadcasts WHERE user_id = auth.uid()));

-- broadcasts
DROP POLICY IF EXISTS "Users can read own broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Role users can manage own broadcasts" ON public.broadcasts;

CREATE POLICY "Users can read own broadcasts" ON public.broadcasts
  FOR SELECT TO public USING (user_id = auth.uid());

CREATE POLICY "Role users can manage own broadcasts" ON public.broadcasts
  FOR ALL TO public
  USING ((user_id = auth.uid()) AND (has_role(auth.uid(), 'criador'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)))
  WITH CHECK ((user_id = auth.uid()) AND (has_role(auth.uid(), 'criador'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)));

-- consent_records
DROP POLICY IF EXISTS "Users manage own consents" ON public.consent_records;

CREATE POLICY "Users manage own consents" ON public.consent_records
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- groups
DROP POLICY IF EXISTS "Users can read own groups" ON public.groups;
DROP POLICY IF EXISTS "Role users can manage own groups" ON public.groups;
DROP POLICY IF EXISTS "Public can read active groups for join link" ON public.groups;

CREATE POLICY "Users can read own groups" ON public.groups
  FOR SELECT TO public USING (user_id = auth.uid());

CREATE POLICY "Role users can manage own groups" ON public.groups
  FOR ALL TO public
  USING ((user_id = auth.uid()) AND (has_role(auth.uid(), 'criador'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)))
  WITH CHECK ((user_id = auth.uid()) AND (has_role(auth.uid(), 'criador'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)));

CREATE POLICY "Public can read active groups for join link" ON public.groups
  FOR SELECT TO anon USING ((is_active = true) AND (invite_link IS NOT NULL));

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO public USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'gerente'::app_role));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO public WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO public USING (user_id = auth.uid());

-- schedule_groups
DROP POLICY IF EXISTS "Users manage own schedule_groups" ON public.schedule_groups;

CREATE POLICY "Users manage own schedule_groups" ON public.schedule_groups
  FOR ALL TO public
  USING (schedule_id IN (SELECT id FROM schedules WHERE user_id = auth.uid()))
  WITH CHECK (schedule_id IN (SELECT id FROM schedules WHERE user_id = auth.uid()));

-- schedules
DROP POLICY IF EXISTS "Users can read own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Role users can manage own schedules" ON public.schedules;

CREATE POLICY "Users can read own schedules" ON public.schedules
  FOR SELECT TO public USING (user_id = auth.uid());

CREATE POLICY "Role users can manage own schedules" ON public.schedules
  FOR ALL TO public
  USING ((user_id = auth.uid()) AND (has_role(auth.uid(), 'criador'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)))
  WITH CHECK ((user_id = auth.uid()) AND (has_role(auth.uid(), 'criador'::app_role) OR has_role(auth.uid(), 'gerente'::app_role)));

-- user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can delete roles" ON public.user_roles;

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO public USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'gerente'::app_role));

CREATE POLICY "Gerentes can insert roles" ON public.user_roles
  FOR INSERT TO public WITH CHECK (has_role(auth.uid(), 'gerente'::app_role));

CREATE POLICY "Gerentes can update roles" ON public.user_roles
  FOR UPDATE TO public USING (has_role(auth.uid(), 'gerente'::app_role));

CREATE POLICY "Gerentes can delete roles" ON public.user_roles
  FOR DELETE TO public USING (has_role(auth.uid(), 'gerente'::app_role));

-- whatsapp_connections
DROP POLICY IF EXISTS "Users manage own connections" ON public.whatsapp_connections;

CREATE POLICY "Users manage own connections" ON public.whatsapp_connections
  FOR ALL TO public
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
