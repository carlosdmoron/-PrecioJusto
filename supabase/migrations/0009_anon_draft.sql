-- 0009_anon_draft.sql
-- Soporte para borradores de solicitud creados sin sesión (flujo de la landing):
-- el usuario completa el formulario dinámico y la solicitud queda guardada como
-- 'draft' asociada a un código anónimo (anon_code). Al iniciar sesión/registrarse,
-- el código se vincula a la cuenta y la solicitud pasa a 'new'.
-- Es idempotente: se puede ejecutar varias veces sin error.

-- 1. Nuevo valor 'draft' en el enum de estado de solicitudes -----------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.request_status'::regtype AND enumlabel = 'draft'
  ) THEN
    ALTER TYPE request_status ADD VALUE 'draft';
  END IF;
END
$$;

-- 2. Columna anon_code en requests -------------------------------------------
ALTER TABLE requests ADD COLUMN IF NOT EXISTS anon_code TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_requests_anon_code ON requests(anon_code);