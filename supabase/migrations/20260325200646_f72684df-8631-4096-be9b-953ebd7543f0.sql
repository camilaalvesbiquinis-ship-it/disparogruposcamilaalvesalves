ALTER TABLE public.schedules
ADD COLUMN IF NOT EXISTS broadcast_id UUID;

CREATE INDEX IF NOT EXISTS idx_schedules_broadcast_id
ON public.schedules (broadcast_id);

ALTER TABLE public.schedules
ADD CONSTRAINT schedules_broadcast_id_fkey
FOREIGN KEY (broadcast_id) REFERENCES public.broadcasts(id)
ON DELETE SET NULL;