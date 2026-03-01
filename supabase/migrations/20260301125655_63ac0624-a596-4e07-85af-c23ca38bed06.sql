-- Fix groups policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Leitores can read own groups" ON public.groups;
DROP POLICY IF EXISTS "Role users manage own groups" ON public.groups;

CREATE POLICY "Users can read own groups" ON public.groups FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Role users can manage own groups" ON public.groups FOR ALL USING (user_id = auth.uid() AND (has_role(auth.uid(), 'criador') OR has_role(auth.uid(), 'gerente'))) WITH CHECK (user_id = auth.uid() AND (has_role(auth.uid(), 'criador') OR has_role(auth.uid(), 'gerente')));

-- Fix whatsapp_connections
DROP POLICY IF EXISTS "Users manage own connections" ON public.whatsapp_connections;
CREATE POLICY "Users manage own connections" ON public.whatsapp_connections FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Fix broadcasts
DROP POLICY IF EXISTS "Leitores can read own broadcasts" ON public.broadcasts;
DROP POLICY IF EXISTS "Role users manage own broadcasts" ON public.broadcasts;
CREATE POLICY "Users can read own broadcasts" ON public.broadcasts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Role users can manage own broadcasts" ON public.broadcasts FOR ALL USING (user_id = auth.uid() AND (has_role(auth.uid(), 'criador') OR has_role(auth.uid(), 'gerente'))) WITH CHECK (user_id = auth.uid() AND (has_role(auth.uid(), 'criador') OR has_role(auth.uid(), 'gerente')));

-- Fix schedules
DROP POLICY IF EXISTS "Leitores can read own schedules" ON public.schedules;
DROP POLICY IF EXISTS "Role users manage own schedules" ON public.schedules;
CREATE POLICY "Users can read own schedules" ON public.schedules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Role users can manage own schedules" ON public.schedules FOR ALL USING (user_id = auth.uid() AND (has_role(auth.uid(), 'criador') OR has_role(auth.uid(), 'gerente'))) WITH CHECK (user_id = auth.uid() AND (has_role(auth.uid(), 'criador') OR has_role(auth.uid(), 'gerente')));

-- Fix audit_logs
DROP POLICY IF EXISTS "Gerentes can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Gerentes can read audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'gerente'));
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- Fix consent_records
DROP POLICY IF EXISTS "Users manage own consents" ON public.consent_records;
CREATE POLICY "Users manage own consents" ON public.consent_records FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Fix broadcast_groups
DROP POLICY IF EXISTS "Users manage own broadcast_groups" ON public.broadcast_groups;
CREATE POLICY "Users manage own broadcast_groups" ON public.broadcast_groups FOR ALL USING (broadcast_id IN (SELECT id FROM broadcasts WHERE user_id = auth.uid())) WITH CHECK (broadcast_id IN (SELECT id FROM broadcasts WHERE user_id = auth.uid()));

-- Fix broadcast_logs
DROP POLICY IF EXISTS "Users read own broadcast_logs" ON public.broadcast_logs;
CREATE POLICY "Users read own broadcast_logs" ON public.broadcast_logs FOR SELECT USING (broadcast_id IN (SELECT id FROM broadcasts WHERE user_id = auth.uid()));

-- Fix schedule_groups
DROP POLICY IF EXISTS "Users manage own schedule_groups" ON public.schedule_groups;
CREATE POLICY "Users manage own schedule_groups" ON public.schedule_groups FOR ALL USING (schedule_id IN (SELECT id FROM schedules WHERE user_id = auth.uid())) WITH CHECK (schedule_id IN (SELECT id FROM schedules WHERE user_id = auth.uid()));

-- Fix profiles
DROP POLICY IF EXISTS "Gerentes can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'gerente'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- Fix user_roles
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can delete roles" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'gerente'));
CREATE POLICY "Gerentes can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'gerente'));
CREATE POLICY "Gerentes can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'gerente'));
CREATE POLICY "Gerentes can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'gerente'));