-- PRECIOJUSTO - Fix: "Database error saving/creating new user" (500)
-- =============================================================================
-- Problema: al registrarse/login, Supabase Auth inserta en auth.users y el
--           trigger on_auth_user_created -> handle_new_user() intenta insertar
--           en public.profiles. Ese INSERT falla (permisos / RLS), y como el
--           trigger aborta la transaccion, NO se crea ningun usuario.
--
-- Sintoma verificado: HTTP 500 "Database error saving new user" (signup)
--                     HTTP 500 "Database error creating new user" (admin create)
--
-- Solucion: garantizar que handle_new_user() sea SECURITY DEFINER (corre como
--           el owner == superusuario, bypasea RLS) y concederle al rol que
--           ejecuta el signup los permisos necesarios sobre public.
-- =============================================================================

-- 1) Asegurar SECURITY DEFINER + search_path fijo (idempotente)
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public;

-- 2) Permitir al rol interno de Supabase Auth insertar en el schema y tablas
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO supabase_auth_admin, service_role;

-- 3) La app tambien crea/edita profiles con service_role (bypasa RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
