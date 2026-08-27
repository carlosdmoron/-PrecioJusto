-- =============================================================================
-- PRECIOJUSTO - Fix RLS: Recursion infinita en policy de admin_users
-- =============================================================================
-- Problema: 42P17 infinite recursion detected in policy for relation "admin_users"
-- Causa: la policy "Admins can manage admin users" consulta admin_users sobre si
--        misma (EXISTS (SELECT 1 FROM admin_users ...)), generando recursion.
--        La recursion se propaga a TODAS las tablas por la cadena de subconsultas.
--
-- Solucion: crear funcion SECURITY DEFINER is_admin() (no re-aplica RLS de forma
--           recursiva sobre el owner) y usarla en todas las policies admin.
-- =============================================================================

-- 0) Funcion is_admin (SECURITY DEFINER rompe la recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid() AND status = 'activo'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- =============================================================================
-- Profiles
-- =============================================================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (public.is_admin());

-- =============================================================================
-- Professionals
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all professionals" ON professionals;
CREATE POLICY "Admins can manage all professionals" ON professionals FOR ALL USING (public.is_admin());

-- =============================================================================
-- Categories
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (public.is_admin());

-- =============================================================================
-- Services
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all services" ON services;
CREATE POLICY "Admins can manage all services" ON services FOR ALL USING (public.is_admin());

-- =============================================================================
-- Requests
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;
CREATE POLICY "Admins can manage all requests" ON requests FOR ALL USING (public.is_admin());

-- =============================================================================
-- Quotes
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all quotes" ON quotes;
CREATE POLICY "Admins can manage all quotes" ON quotes FOR ALL USING (public.is_admin());

-- =============================================================================
-- Jobs
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all jobs" ON jobs;
CREATE POLICY "Admins can manage all jobs" ON jobs FOR ALL USING (public.is_admin());

-- =============================================================================
-- Reviews
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (public.is_admin());

-- =============================================================================
-- Forms
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all forms" ON forms;
CREATE POLICY "Admins can manage all forms" ON forms FOR ALL USING (public.is_admin());

-- =============================================================================
-- Form Questions
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all form questions" ON form_questions;
CREATE POLICY "Admins can manage all form questions" ON form_questions FOR ALL USING (public.is_admin());

-- =============================================================================
-- Form Responses
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all responses" ON form_responses;
CREATE POLICY "Admins can manage all responses" ON form_responses FOR ALL USING (public.is_admin());

-- =============================================================================
-- Wallet Transactions
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all transactions" ON wallet_transactions;
CREATE POLICY "Admins can manage all transactions" ON wallet_transactions FOR ALL USING (public.is_admin());

-- =============================================================================
-- Support Tickets & Notes
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
CREATE POLICY "Admins can manage all tickets" ON support_tickets FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can manage all notes" ON support_notes;
CREATE POLICY "Admins can manage all notes" ON support_notes FOR ALL USING (public.is_admin());

-- =============================================================================
-- Matching Rules
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage matching rules" ON matching_rules;
CREATE POLICY "Admins can manage matching rules" ON matching_rules FOR ALL USING (public.is_admin());

-- =============================================================================
-- Admin Users  (ESTA ERA LA RECURSIVA)
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
CREATE POLICY "Admins can manage admin users" ON admin_users FOR ALL USING (public.is_admin());

-- =============================================================================
-- Marketing / Promotions / Templates / SEO / Security / Audit / Integrations / Billing
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage marketing pages" ON marketing_pages;
CREATE POLICY "Admins can manage marketing pages" ON marketing_pages FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage promotions" ON promotions;
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage notification templates" ON notification_templates;
CREATE POLICY "Admins can manage notification templates" ON notification_templates FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage SEO settings" ON seo_settings;
CREATE POLICY "Admins can manage SEO settings" ON seo_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage security settings" ON security_settings;
CREATE POLICY "Admins can manage security settings" ON security_settings FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage integrations" ON integrations;
CREATE POLICY "Admins can manage integrations" ON integrations FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage billing config" ON billing_config;
CREATE POLICY "Admins can manage billing config" ON billing_config FOR ALL USING (public.is_admin());
