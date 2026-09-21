-- 0019_notifications_messages.sql
-- 1. Notificaciones in-app reutilizables (cada evento puede conectar después con
--    email/push/WhatsApp). 2. Tipos de mensaje y metadatos para el chat de propuesta.
-- Idempotente: se puede ejecutar varias veces sin error.

-- NOTIFICACIONES ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- new_request | proposal_received | new_message | proposal_accepted | payment_received | service_completed ...
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications (recipient_id) WHERE read_at IS NULL;

-- MENSAJES: tipo + payload ------------------------------------------------------
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS payload JSONB;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at ASC);

-- CONVERSACIONES: último tipo de mensaje (para renderizar tarjetas de propuesta).
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS last_message_type TEXT DEFAULT 'text';

-- RLS NOTIFICACIONES --------------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients view own notifications" ON notifications;
CREATE POLICY "Recipients view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Recipients update own notifications" ON notifications;
CREATE POLICY "Recipients update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage notifications" ON notifications;
CREATE POLICY "Admins manage notifications"
  ON notifications FOR ALL TO authenticated USING (public.is_admin());

-- Se permite INSERT vía backend (RPC notification_create con SECURITY DEFINER);
-- no hay política de INSERT para el rol authenticated: los usuarios no pueden
-- escribir notificaciones directas.