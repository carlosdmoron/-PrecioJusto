-- 0018_credit_system.sql
-- Sistema de créditos/coins del marketplace:
--   * platform_config      -> configuración (coste de propuesta, bonos, etc.)
--   * credit_wallets       -> un wallet de créditos por profesional (balance int)
--   * credit_transactions  -> ledger inmutable: TODA modificación registra fila
--   * credit_packages      -> paquetes de créditos configurables
--   * credit_purchases     -> compras con idempotencia y confirmación backend
-- El consumo se realiza SIEMPRE a través de RPCs transaccionales (ver 0020);
-- nunca hay UPDATE directo del balance desde el cliente.
-- Idempotente: se puede ejecutar varias veces sin error.

-- 1. CONFIGURACIÓN DE PLATAFORMA ---------------------------------------------
CREATE TABLE IF NOT EXISTS platform_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO platform_config (key, value) VALUES
  ('proposal_credit_cost', '3'),
  ('welcome_credit_bonus', '10'),
  ('request_expiration_hours', '48')
ON CONFLICT (key) DO NOTHING;

-- 2. WALLETS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.credit_wallets'::regclass
      AND conname = 'credit_wallets_professional_id_key'
  ) THEN
    -- Un único wallet activo por profesional.
    ALTER TABLE credit_wallets ADD CONSTRAINT credit_wallets_professional_id_key
      UNIQUE (professional_id);
  END IF;
END
$$;

DROP TRIGGER IF EXISTS trg_credit_wallets_updated ON credit_wallets;
CREATE TRIGGER trg_credit_wallets_updated
  BEFORE UPDATE ON credit_wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. LEDGER DE CRÉDITOS ---------------------------------------------------------
-- amount > 0 => créditos añadidos (purchase/bonus/refund/admin_adjustment)
-- amount < 0 => créditos consumidos (proposal/message/expiration)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES credit_wallets(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotencia: nunca duplicar la misma operación.
CREATE UNIQUE INDEX IF NOT EXISTS ux_credit_transactions_idempotency
  ON credit_transactions (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_transactions_professional
  ON credit_transactions (professional_id, created_at DESC);

-- 4. PAQUETES DE CRÉDITOS -------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paquetes iniciales (precios configurables desde admin/BD).
INSERT INTO credit_packages (name, slug, credits, price_cents, currency, status) VALUES
  ('Starter',  'starter',  10,  29900, 'COP', 'active'),
  ('Basic',    'basic',    30,  74900, 'COP', 'active'),
  ('Pro',      'pro',      75, 159000, 'COP', 'active'),
  ('Business', 'business', 200, 349000, 'COP', 'active')
ON CONFLICT (slug) DO NOTHING;

DROP TRIGGER IF EXISTS trg_credit_packages_updated ON credit_packages;
CREATE TRIGGER trg_credit_packages_updated
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. COMPRAS DE CRÉDITOS -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | paid | refunded | failed | void
  provider TEXT NOT NULL DEFAULT 'manual', -- manual | stripe | rapyd | paddle | ...
  provider_reference TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_credit_purchases_idempotency
  ON credit_purchases (idempotency_key) WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_credit_purchases_professional
  ON credit_purchases (professional_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_credit_purchases_updated ON credit_purchases;
CREATE TRIGGER trg_credit_purchases_updated
  BEFORE UPDATE ON credit_purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. RLS ------------------------------------------------------------------------
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Configuración legible por autenticados (para mostrar costes en la UI).
DROP POLICY IF EXISTS "Authenticated read platform config" ON platform_config;
CREATE POLICY "Authenticated read platform config"
  ON platform_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage platform config" ON platform_config;
CREATE POLICY "Admins manage platform config"
  ON platform_config FOR ALL TO authenticated USING (public.is_admin());

-- Wallet: cada profesional solo ve el suyo.
DROP POLICY IF EXISTS "Professionals view own credit wallet" ON credit_wallets;
CREATE POLICY "Professionals view own credit wallet"
  ON credit_wallets FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all credit wallets" ON credit_wallets;
CREATE POLICY "Admins view all credit wallets"
  ON credit_wallets FOR ALL TO authenticated USING (public.is_admin());

-- Ledger: cada profesional ve SUS transacciones (el balance nunca se edita por RLS).
DROP POLICY IF EXISTS "Professionals view own credit transactions" ON credit_transactions;
CREATE POLICY "Professionals view own credit transactions"
  ON credit_transactions FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage credit transactions" ON credit_transactions;
CREATE POLICY "Admins manage credit transactions"
  ON credit_transactions FOR ALL TO authenticated USING (public.is_admin());

-- Paquetes: legibles para cualquier autenticado; solo admin los edita.
DROP POLICY IF EXISTS "Authenticated view credit packages" ON credit_packages;
CREATE POLICY "Authenticated view credit packages"
  ON credit_packages FOR SELECT TO authenticated USING (status = 'active');

DROP POLICY IF EXISTS "Admins manage credit packages" ON credit_packages;
CREATE POLICY "Admins manage credit packages"
  ON credit_packages FOR ALL TO authenticated USING (public.is_admin());

-- Compras: el profesional crea/ve las suyas. El cambio de estado (pending->paid)
-- lo hace exclusivamente el backend vía RPC SECURITY DEFINER (webhook).
DROP POLICY IF EXISTS "Professionals create own purchases" ON credit_purchases;
CREATE POLICY "Professionals create own purchases"
  ON credit_purchases FOR INSERT TO authenticated
  WITH CHECK (professional_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS "Professionals view own purchases" ON credit_purchases;
CREATE POLICY "Professionals view own purchases"
  ON credit_purchases FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage credit purchases" ON credit_purchases;
CREATE POLICY "Admins manage credit purchases"
  ON credit_purchases FOR ALL TO authenticated USING (public.is_admin());