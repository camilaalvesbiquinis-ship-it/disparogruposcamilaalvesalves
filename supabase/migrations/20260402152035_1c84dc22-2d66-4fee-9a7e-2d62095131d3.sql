
-- Table to store poll votes received via webhook
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  group_phone TEXT NOT NULL,
  voter_phone TEXT NOT NULL,
  option_name TEXT NOT NULL,
  poll_message_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_poll_votes_broadcast ON public.poll_votes(broadcast_id);
CREATE INDEX idx_poll_votes_poll_msg ON public.poll_votes(poll_message_id);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read poll votes for their own broadcasts
CREATE POLICY "Users read own poll votes" ON public.poll_votes
  FOR SELECT TO authenticated
  USING (broadcast_id IN (SELECT id FROM public.broadcasts WHERE user_id = auth.uid()));

-- Table to map Z-API message IDs to broadcasts (for linking webhook votes)
CREATE TABLE public.broadcast_poll_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id UUID NOT NULL REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  group_phone TEXT NOT NULL,
  zapi_message_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_bpm_message_id ON public.broadcast_poll_messages(zapi_message_id);
CREATE INDEX idx_bpm_broadcast ON public.broadcast_poll_messages(broadcast_id);

ALTER TABLE public.broadcast_poll_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own poll messages" ON public.broadcast_poll_messages
  FOR ALL TO authenticated
  USING (broadcast_id IN (SELECT id FROM public.broadcasts WHERE user_id = auth.uid()))
  WITH CHECK (broadcast_id IN (SELECT id FROM public.broadcasts WHERE user_id = auth.uid()));
