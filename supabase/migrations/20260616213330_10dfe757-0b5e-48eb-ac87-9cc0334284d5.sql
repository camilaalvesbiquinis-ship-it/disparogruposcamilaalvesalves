
-- 1. Groups: remove broad public read policy; expose minimal data via RPC
DROP POLICY IF EXISTS "Public can read active groups for join link" ON public.groups;

CREATE OR REPLACE FUNCTION public.get_join_groups()
RETURNS TABLE(id uuid, name text, invite_link text, member_count integer, max_members integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, name, invite_link, member_count, max_members
  FROM public.groups
  WHERE is_active = true AND invite_link IS NOT NULL
  ORDER BY member_count ASC NULLS FIRST;
$$;

REVOKE ALL ON FUNCTION public.get_join_groups() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_join_groups() TO anon, authenticated;

-- 2. Storage: broadcast-media bucket — drop overly permissive policies, enforce per-user folder
DROP POLICY IF EXISTS "Public read access for broadcast media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view broadcast media" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own broadcast media" ON storage.objects;
DROP POLICY IF EXISTS "Users read own broadcast media" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own broadcast media" ON storage.objects;

CREATE POLICY "Users upload own broadcast media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'broadcast-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own broadcast media"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'broadcast-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own broadcast media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'broadcast-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Poll votes: expose only aggregates via RPC, hide voter_phone
DROP POLICY IF EXISTS "Users read own poll votes" ON public.poll_votes;
REVOKE SELECT ON public.poll_votes FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_poll_results()
RETURNS TABLE(
  broadcast_id uuid,
  option_name text,
  vote_count bigint,
  unique_voters bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH owned AS (
    SELECT id FROM public.broadcasts WHERE user_id = auth.uid()
  ),
  per_broadcast AS (
    SELECT broadcast_id, COUNT(DISTINCT voter_phone) AS unique_voters
    FROM public.poll_votes
    WHERE broadcast_id IN (SELECT id FROM owned)
    GROUP BY broadcast_id
  )
  SELECT pv.broadcast_id,
         pv.option_name,
         COUNT(*)::bigint AS vote_count,
         pb.unique_voters
  FROM public.poll_votes pv
  JOIN per_broadcast pb ON pb.broadcast_id = pv.broadcast_id
  WHERE pv.broadcast_id IN (SELECT id FROM owned)
  GROUP BY pv.broadcast_id, pv.option_name, pb.unique_voters;
$$;

REVOKE ALL ON FUNCTION public.get_poll_results() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_poll_results() TO authenticated;

-- 4. user_roles: prevent privilege escalation and self-modification by gerentes
DROP POLICY IF EXISTS "Gerentes can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Gerentes can delete roles" ON public.user_roles;

CREATE POLICY "Gerentes can insert non-gerente roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'gerente')
    AND user_id <> auth.uid()
    AND role IN ('leitor', 'criador')
  );

CREATE POLICY "Gerentes can update non-gerente roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gerente') AND user_id <> auth.uid())
  WITH CHECK (
    has_role(auth.uid(), 'gerente')
    AND user_id <> auth.uid()
    AND role IN ('leitor', 'criador')
  );

CREATE POLICY "Gerentes can delete non-gerente roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'gerente')
    AND user_id <> auth.uid()
    AND role <> 'gerente'
  );

-- 5. SECURITY DEFINER helper functions: restrict execution to authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
