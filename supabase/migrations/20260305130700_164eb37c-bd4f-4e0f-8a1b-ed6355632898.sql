
-- Add invite_link column to groups
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS invite_link text;

-- Add max_members with default 256 (WhatsApp limit)
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS max_members integer NOT NULL DEFAULT 256;

-- Allow public (anon) read access to active groups for the join page
CREATE POLICY "Public can read active groups for join link"
ON public.groups
FOR SELECT
TO anon
USING (is_active = true AND invite_link IS NOT NULL);
