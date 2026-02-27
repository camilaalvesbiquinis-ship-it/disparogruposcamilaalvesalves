
-- Fix 1: Restrict profiles SELECT to own profile or gerente
DROP POLICY "Users can read all profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Gerentes can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'gerente'));

-- Fix 2: Add role-based RLS on broadcasts (criador or gerente can manage)
DROP POLICY "Users manage own broadcasts" ON public.broadcasts;

CREATE POLICY "Role users manage own broadcasts"
  ON public.broadcasts FOR ALL TO authenticated
  USING (user_id = auth.uid() AND (public.has_role(auth.uid(), 'criador') OR public.has_role(auth.uid(), 'gerente')))
  WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'criador') OR public.has_role(auth.uid(), 'gerente')));

-- Allow leitores to read their own broadcasts (view only)
CREATE POLICY "Leitores can read own broadcasts"
  ON public.broadcasts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Fix 3: Add role-based RLS on schedules
DROP POLICY "Users manage own schedules" ON public.schedules;

CREATE POLICY "Role users manage own schedules"
  ON public.schedules FOR ALL TO authenticated
  USING (user_id = auth.uid() AND (public.has_role(auth.uid(), 'criador') OR public.has_role(auth.uid(), 'gerente')))
  WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'criador') OR public.has_role(auth.uid(), 'gerente')));

CREATE POLICY "Leitores can read own schedules"
  ON public.schedules FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Fix 4: Add role-based RLS on groups
DROP POLICY "Users manage own groups" ON public.groups;

CREATE POLICY "Role users manage own groups"
  ON public.groups FOR ALL TO authenticated
  USING (user_id = auth.uid() AND (public.has_role(auth.uid(), 'criador') OR public.has_role(auth.uid(), 'gerente')))
  WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'criador') OR public.has_role(auth.uid(), 'gerente')));

CREATE POLICY "Leitores can read own groups"
  ON public.groups FOR SELECT TO authenticated
  USING (user_id = auth.uid());
