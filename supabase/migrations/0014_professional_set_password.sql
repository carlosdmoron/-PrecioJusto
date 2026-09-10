-- 0014_professional_set_password.sql
-- Marco de "primera contraseña" para profesionales que se registran desde el
-- formulario de inscripción: la cuenta se crea confirmada con una contraseña
-- temporal generada por el servidor y se inicia sesión automáticamente. El
-- dashboard detecta la marca y muestra un popup para que elija su contraseña.
-- Idempotente: se puede ejecutar varias veces sin error.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS must_set_password BOOLEAN NOT NULL DEFAULT false;