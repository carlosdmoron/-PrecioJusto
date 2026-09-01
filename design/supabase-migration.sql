-- =============================================================================
-- PRECIOJUSTO - Migracion Completa de Base de Datos para Supabase
-- Ejecuta este SQL en el SQL Editor de Supabase (https://supabase.com)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'professional', 'client');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');
CREATE TYPE entity_type AS ENUM ('individual', 'empresa');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE prof_admin_status AS ENUM ('pending', 'active', 'suspended', 'rejected', 'blocked');
CREATE TYPE service_status AS ENUM ('draft', 'review', 'published', 'paused', 'archived', 'coming_soon');
CREATE TYPE request_status AS ENUM ('new', 'published', 'inProgress', 'completed', 'cancelled', 'blocked');
CREATE TYPE request_urgency AS ENUM ('asap', 'week', 'month', 'none');
CREATE TYPE quote_status AS ENUM ('draft', 'pending', 'sent', 'viewed', 'contacted', 'selected', 'rejected', 'expired');
CREATE TYPE job_status AS ENUM ('selected', 'started', 'inProgress', 'completed', 'cancelled', 'disputed');
CREATE TYPE review_status AS ENUM ('pending', 'published', 'flagged', 'hidden', 'removed');
CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'flagged');
CREATE TYPE transaction_type AS ENUM ('lead', 'commission', 'topup', 'refund', 'withdrawal');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'inProgress', 'waiting', 'resolved', 'closed');
CREATE TYPE form_question_type AS ENUM ('radio', 'checkbox', 'text', 'textarea', 'number', 'date', 'select', 'phone', 'email', 'file', 'scale');

-- =============================================================================
-- 2. TABLAS CORE
-- =============================================================================

-- PERFILES (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'es',
  status user_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PROFESIONALES
CREATE TABLE professionals (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type entity_type DEFAULT 'individual',
  business_name TEXT,
  province TEXT,
  municipality TEXT,
  value_proposition TEXT,
  experience_years INTEGER DEFAULT 0,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  verification_status verification_status DEFAULT 'pending',
  admin_status prof_admin_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CATEGORIAS
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICIOS
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  status service_status DEFAULT 'draft',
  requests_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICIOS DEL PROFESIONAL (N:M)
CREATE TABLE professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'active',
  contacts_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, service_id)
);

-- =============================================================================
-- 3. SOLICITUDES Y PRESUPUESTOS
-- =============================================================================

-- SOLICITUDES / REQUESTS
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  location TEXT,
  budget DECIMAL(10,2),
  urgency request_urgency DEFAULT 'none',
  status request_status DEFAULT 'new',
  assigned_professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  quotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PRESUPUESTOS / QUOTES
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  amount_min DECIMAL(10,2),
  amount_max DECIMAL(10,2),
  delivery_days INTEGER,
  message TEXT,
  status quote_status DEFAULT 'draft',
  lead_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- TRABAJOS / JOBS
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  status job_status DEFAULT 'selected',
  commission DECIMAL(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 4. COMUNICACIONES
-- =============================================================================

-- CONVERSACIONES
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'chat',
  status conversation_status DEFAULT 'active',
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MENSAJES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 5. FAVORITOS Y RESEÑAS
-- =============================================================================

-- FAVORITOS
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, professional_id)
);

-- RESEÑAS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  status review_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 6. FORMULARIOS DINAMICOS
-- =============================================================================

-- FORMULARIOS
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  version TEXT DEFAULT 'v1.0',
  question_count INTEGER DEFAULT 0,
  abandonment_rate DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PREGUNTAS DEL FORMULARIO
CREATE TABLE form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  label TEXT NOT NULL,
  type form_question_type DEFAULT 'text',
  required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]'::jsonb,
  condition JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RESPUESTAS DEL FORMULARIO
CREATE TABLE form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}'::jsonb,
  step_completed INTEGER DEFAULT 0,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 7. FINANZAS
-- =============================================================================

-- TRANSACCIONES DE BILLETERA
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  related_request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- METODOS DE PAGO
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  holder_name TEXT,
  card_last_four TEXT,
  card_brand TEXT,
  card_expiry TEXT,
  paypal_email TEXT,
  iban TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CONFIGURACION DE FACTURACION
CREATE TABLE billing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_cost DECIMAL(10,2) DEFAULT 5.00,
  commission_percent DECIMAL(5,2) DEFAULT 15.00,
  min_balance DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 8. SOPORTE Y ADMIN
-- =============================================================================

-- TICKETS DE SOPORTE
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_type TEXT DEFAULT 'client',
  priority ticket_priority DEFAULT 'medium',
  sla_hours INTEGER DEFAULT 48,
  status ticket_status DEFAULT 'open',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- NOTAS DE SOPORTE
CREATE TABLE support_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REGLAS DE MATCHING
CREATE TABLE matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  criterion TEXT NOT NULL,
  zone_postal_code TEXT,
  priority INTEGER DEFAULT 1,
  professionals_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- USUARIOS ADMIN
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role_name TEXT NOT NULL DEFAULT 'Moderador',
  permissions JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'activo',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PAGINAS DE MARKETING
CREATE TABLE marketing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'borrador',
  content JSONB DEFAULT '{}'::jsonb,
  last_edit DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PROMOCIONES
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'discount',
  discount_value TEXT,
  status TEXT DEFAULT 'activa',
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PLANTILLAS DE NOTIFICACIONES
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  channel TEXT DEFAULT 'email',
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'active',
  last_sent DATE,
  deliverability DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CONFIGURACION SEO
CREATE TABLE seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  title_tag TEXT,
  meta_description TEXT,
  score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CONFIGURACION DE SEGURIDAD
CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mfa_required BOOLEAN DEFAULT false,
  revocable_sessions BOOLEAN DEFAULT true,
  password_policy TEXT DEFAULT 'medium',
  ip_control_enabled BOOLEAN DEFAULT false,
  allowed_ip_ranges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LOG DE AUDITORIA
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INTEGRACIONES
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'desconectado',
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- 9. TRIGGER: Crear perfil automaticamente al registrarse
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Funcion is_admin: evita recursion infinita al validar admins.
-- SECURITY DEFINER no re-aplica RLS de forma recursiva sobre el owner.
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_config ENABLE ROW LEVEL SECURITY;

-- POLICIES: Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  public.is_admin()
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  public.is_admin()
);

-- POLICIES: Professionals
CREATE POLICY "Anyone can view active professionals" ON professionals FOR SELECT USING (admin_status = 'active');
CREATE POLICY "Professionals can update own profile" ON professionals FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all professionals" ON professionals FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Categories & Services (public read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Anyone can view published services" ON services FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage all services" ON services FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Professional Services
CREATE POLICY "Anyone can view active professional services" ON professional_services FOR SELECT USING (status = 'active');
CREATE POLICY "Professionals can manage own services" ON professional_services FOR ALL USING (auth.uid() = professional_id);

-- POLICIES: Requests
CREATE POLICY "Clients can view own requests" ON requests FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create requests" ON requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own requests" ON requests FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Clients can delete own requests" ON requests FOR DELETE USING (auth.uid() = client_id);
CREATE POLICY "Professionals can view published requests" ON requests FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage all requests" ON requests FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Quotes
CREATE POLICY "Professionals can view own quotes" ON quotes FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Professionals can create quotes" ON quotes FOR INSERT WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "Clients can view quotes for own requests" ON quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage all quotes" ON quotes FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Jobs
CREATE POLICY "Users can view own jobs" ON jobs FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = professional_id
);
CREATE POLICY "Admins can manage all jobs" ON jobs FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = professional_id
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = client_id OR auth.uid() = professional_id
);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (
  auth.uid() = client_id OR auth.uid() = professional_id
);

-- POLICIES: Messages
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id AND (client_id = auth.uid() OR professional_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in own conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations
    WHERE id = conversation_id AND (client_id = auth.uid() OR professional_id = auth.uid())
  )
);

-- POLICIES: Favorites
CREATE POLICY "Clients can view own favorites" ON favorites FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can add favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can remove own favorites" ON favorites FOR DELETE USING (auth.uid() = client_id);

-- POLICIES: Reviews
CREATE POLICY "Anyone can view published reviews" ON reviews FOR SELECT USING (status = 'published');
CREATE POLICY "Clients can create reviews for own jobs" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Forms
CREATE POLICY "Anyone can view active forms" ON forms FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage all forms" ON forms FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Form Questions
CREATE POLICY "Anyone can view questions for active forms" ON form_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM forms WHERE id = form_id AND status = 'active')
);
CREATE POLICY "Admins can manage all form questions" ON form_questions FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Form Responses
CREATE POLICY "Users can view own responses" ON form_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid())
);
CREATE POLICY "Users can create responses" ON form_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM requests WHERE id = request_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage all responses" ON form_responses FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Wallet
CREATE POLICY "Professionals can view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = professional_id);
CREATE POLICY "Admins can manage all transactions" ON wallet_transactions FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Payment Methods
CREATE POLICY "Professionals can manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = professional_id);

-- POLICIES: Support
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins can manage all tickets" ON support_tickets FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Users can view notes for own tickets" ON support_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND sender_id = auth.uid())
);
CREATE POLICY "Admins can manage all notes" ON support_notes FOR ALL USING (
  public.is_admin()
);

-- POLICIES: Admin tables (admin-only)
CREATE POLICY "Admins can manage matching rules" ON matching_rules FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can manage admin users" ON admin_users FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can manage marketing pages" ON marketing_pages FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can manage notification templates" ON notification_templates FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Anyone can view SEO settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage SEO settings" ON seo_settings FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can manage security settings" ON security_settings FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  public.is_admin()
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage integrations" ON integrations FOR ALL USING (
  public.is_admin()
);
CREATE POLICY "Admins can manage billing config" ON billing_config FOR ALL USING (
  public.is_admin()
);

-- =============================================================================
-- 11. DATOS INICIALES (Seed)
-- =============================================================================

-- Categorias iniciales
INSERT INTO categories (name, slug) VALUES
  ('Reformas', 'reformas'),
  ('Electricidad', 'electricidad'),
  ('Fontaneria', 'fontaneria'),
  ('Pintura', 'pintura'),
  ('Climatizacion', 'climatizacion'),
  ('Mudanzas', 'mudanzas'),
  ('Limpieza', 'limpieza'),
  ('Carpinteria', 'carpinteria'),
  ('Jardineria', 'jardineria'),
  ('Fotografia', 'fotografia');

-- Servicios iniciales
INSERT INTO services (category_id, name, slug, status) VALUES
  ((SELECT id FROM categories WHERE slug = 'reformas'), 'Reforma integral', 'reforma-integral', 'published'),
  ((SELECT id FROM categories WHERE slug = 'electricidad'), 'Instalacion electrica', 'instalacion-electrica', 'published'),
  ((SELECT id FROM categories WHERE slug = 'fontaneria'), 'Reparacion de tuberias', 'reparacion-tuberias', 'published'),
  ((SELECT id FROM categories WHERE slug = 'pintura'), 'Pintura de interiores', 'pintura-interiores', 'published'),
  ((SELECT id FROM categories WHERE slug = 'climatizacion'), 'Instalacion de aire acondicionado', 'instalacion-aire-acondicionado', 'published'),
  ((SELECT id FROM categories WHERE slug = 'mudanzas'), 'Mudanza local', 'mudanza-local', 'published'),
  ((SELECT id FROM categories WHERE slug = 'limpieza'), 'Limpieza del hogar', 'limpieza-hogar', 'published'),
  ((SELECT id FROM categories WHERE slug = 'carpinteria'), 'Carpinteria a medida', 'carpinteria-medida', 'published'),
  ((SELECT id FROM categories WHERE slug = 'jardineria'), 'Mantenimiento de jardin', 'mantenimiento-jardin', 'published'),
  ((SELECT id FROM categories WHERE slug = 'fotografia'), 'Fotografia de eventos', 'fotografia-eventos', 'published');

-- Configuracion de facturacion por defecto
INSERT INTO billing_config (lead_cost, commission_percent, min_balance, currency)
VALUES (5.00, 15.00, 0.00, 'EUR');

-- Seguridad por defecto
INSERT INTO security_settings DEFAULT VALUES;

-- =============================================================================
-- FIN DE LA MIGRACION
-- =============================================================================
