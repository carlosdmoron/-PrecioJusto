-- 0020_core_rpcs.sql
-- Lógica crítica en la base de datos (transaccional, SECURITY DEFINER, atómica):
--   * submit_proposal  -> valida + descuenta créditos + crea propuesta + ledger +
--                         conversación + mensaje + match update + notificación
--   * accept_proposal  -> aceptación única (evita dobles), rechaza el resto, crea job
--   * reject_proposal  -> rechazo del cliente
--   * run_matching_for_request -> matching geográfico PostGIS
--   * grant_credit / confirm_credit_purchase / complete_service / notification_create
--   * RLS endurecida: conversaciones y propuestas SOLO se crean por estos RPCs.
-- Idempotente: se puede ejecutar varias veces sin error.

-- 0. PROPS NEcesarias de supports existentes: idempotency en quotes -------------
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS duration_hours INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_idempotency
  ON quotes (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Never duplicate: un único requerimiento activo por (request, professional).
CREATE UNIQUE INDEX IF NOT EXISTS ux_quotes_active_request_professional
  ON quotes (request_id, professional_id)
  WHERE status IN ('pending','sent','viewed','contacted');

-- 1. NOTIFICACIÓN (helper) -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notification_create(
  p_recipient_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE v_id uuid;
BEGIN
  IF p_recipient_id IS NULL THEN RETURN NULL; END IF;
  INSERT INTO public.notifications (recipient_id, type, title, body, data)
  VALUES (p_recipient_id, p_type, p_title, p_body, COALESCE(p_data, '{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- 2. WALLET HELPER -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_credit_wallet(p_professional_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_wallet_id uuid;
BEGIN
  SELECT id INTO v_wallet_id FROM public.credit_wallets
  WHERE professional_id = p_professional_id;
  IF v_wallet_id IS NULL THEN
    INSERT INTO public.credit_wallets (professional_id, balance)
    VALUES (p_professional_id, 0)
    RETURNING id INTO v_wallet_id;
  END IF;
  RETURN v_wallet_id;
END;
$$;

-- 3. AÑADIR CRÉDITOS (bonus, compra confirmada, refund, admin) ---------------------
CREATE OR REPLACE FUNCTION public.grant_credit(
  p_professional_id uuid,
  p_amount integer,
  p_type text DEFAULT 'bonus',
  p_description text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL,
  p_reference_type text DEFAULT NULL,
  p_reference_id uuid DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_wallet_id uuid;
  v_balance integer;
BEGIN
  IF v_uid IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  v_wallet_id := public.ensure_credit_wallet(p_professional_id);

  -- Idempotencia: si ya existe la transacción, devuelve su balance_after.
  IF p_idempotency_key IS NOT NULL THEN
    SELECT balance_after INTO v_balance FROM public.credit_transactions
    WHERE idempotency_key = p_idempotency_key LIMIT 1;
    IF v_balance IS NOT NULL THEN RETURN v_balance; END IF;
  END IF;

  BEGIN
    UPDATE public.credit_wallets
    SET balance = balance + p_amount
    WHERE id = v_wallet_id
    RETURNING balance INTO v_balance;

    INSERT INTO public.credit_transactions
      (wallet_id, professional_id, type, amount, balance_after,
       reference_type, reference_id, description, idempotency_key)
    VALUES
      (v_wallet_id, p_professional_id, COALESCE(p_type, 'admin_adjustment'), p_amount, v_balance,
       p_reference_type, p_reference_id, p_description, p_idempotency_key);
  EXCEPTION WHEN unique_violation THEN
    -- Corre competidor con la misma clave: devuelve el resultado previo.
    SELECT balance_after INTO v_balance FROM public.credit_transactions
    WHERE idempotency_key = p_idempotency_key LIMIT 1;
    IF v_balance IS NULL THEN RAISE; END IF;
  END;

  RETURN v_balance;
END;
$$;

-- 4. MATCHING GEOGRÁFICO (PostGIS) -----------------------------------------------
CREATE OR REPLACE FUNCTION public.run_matching_for_request(p_request_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_request public.requests%ROWTYPE;
  v_max integer;
  n integer := 0;
BEGIN
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not found'; END IF;
  IF v_request.location IS NULL THEN
    RAISE EXCEPTION 'request has no location';
  END IF;
  IF v_request.status NOT IN ('new','published') THEN
    RAISE EXCEPTION 'request not open for matching';
  END IF;

  SELECT COALESCE(NULLIF(value, '')::integer, 25) INTO v_max
  FROM public.platform_config WHERE key = 'matching_max_assignments';
  IF v_max IS NULL THEN v_max := 25; END IF;

  -- Candidatos: activos, ofrecen la categoría, dentro del radio y no repetidos.
  INSERT INTO public.match_assignments
    (request_id, professional_id, distance_km, match_score, status, notified_at)
  SELECT
    v_request.id,
    p.id,
    ROUND((ST_Distance(v_request.location, p.location) / 1000.0)::numeric, 2),
    GREATEST(0, 100 - ROUND((ST_Distance(v_request.location, p.location) / 1000.0)::numeric)::integer),
    'notified',
    now()
  FROM public.professionals p
  JOIN public.professional_services ps
    ON ps.professional_id = p.id
   AND ps.service_id = v_request.service_id
   AND ps.status = 'active'
  WHERE p.admin_status = 'active'
    AND p.location IS NOT NULL
    AND ST_DWithin(v_request.location, p.location, (COALESCE(p.service_radius_km, 20)) * 1000.0)
    AND NOT EXISTS (
      SELECT 1 FROM public.match_assignments m
      WHERE m.request_id = v_request.id AND m.professional_id = p.id
    )
  ORDER BY ST_Distance(v_request.location, p.location) ASC
  LIMIT v_max
  ON CONFLICT (request_id, professional_id) DO NOTHING;

  GET DIAGNOSTICS n = ROW_COUNT;

  -- Analytics (defensivo)
  BEGIN
    INSERT INTO public.analytics_events (event, actor_id, request_id, payload)
    VALUES ('request_matched', NULL, v_request.id, jsonb_build_object('matches', n));
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  RETURN n;
END;
$$;

-- 5. ENVÍO DE PROPUESTA (ATÓMICO) ------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_proposal(
  p_request_id uuid,
  p_professional_id uuid,
  p_amount_min numeric DEFAULT NULL,
  p_amount_max numeric DEFAULT NULL,
  p_delivery_days integer DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_request public.requests%ROWTYPE;
  v_prof public.professionals%ROWTYPE;
  v_cost integer := 3;
  v_wallet_id uuid;
  v_balance integer;
  v_quote_id uuid;
  v_conv_id uuid;
  v_service_name text;
BEGIN
  -- 1) Autenticación: el actor debe ser el propio profesional (o backend service_role).
  IF v_uid IS NOT NULL AND v_uid <> p_professional_id THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  -- 2) Profesional activo.
  SELECT * INTO v_prof FROM public.professionals WHERE id = p_professional_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'professional not found'; END IF;
  IF v_prof.admin_status <> 'active' THEN
    RAISE EXCEPTION 'professional not active';
  END IF;

  -- 3) Solicitud abierta y vigente.
  SELECT * INTO v_request FROM public.requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not found'; END IF;
  IF v_request.status NOT IN ('new','published') THEN
    RAISE EXCEPTION 'request not open for proposals';
  END IF;
  IF v_request.expires_at IS NOT NULL AND v_request.expires_at < now() THEN
    RAISE EXCEPTION 'request expired';
  END IF;

  -- 4) El profesional debe haber recibido la oportunidad (match).
  PERFORM 1 FROM public.match_assignments m
  WHERE m.request_id = p_request_id
    AND m.professional_id = p_professional_id
    AND m.status NOT IN ('rejected', 'expired');
  IF NOT FOUND THEN RAISE EXCEPTION 'not matched to this request'; END IF;

  -- 5) Idempotencia + duplicado activo.
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_quote_id FROM public.quotes
    WHERE idempotency_key = p_idempotency_key LIMIT 1;
    IF v_quote_id IS NOT NULL THEN RETURN v_quote_id; END IF;
  END IF;

  SELECT id INTO v_quote_id FROM public.quotes q
  WHERE q.request_id = p_request_id
    AND q.professional_id = p_professional_id
    AND q.status IN ('pending','sent','viewed','contacted')
  LIMIT 1;
  IF v_quote_id IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'duplicate proposal for this request';
  END IF;

  -- 6) Coste configurable + descuento atómico (row lock, sin doble gasto).
  SELECT COALESCE(NULLIF(value, '')::integer, 3) INTO v_cost
  FROM public.platform_config WHERE key = 'proposal_credit_cost';
  IF v_cost IS NULL THEN v_cost := 3; END IF;

  v_wallet_id := public.ensure_credit_wallet(p_professional_id);

  IF v_cost > 0 THEN
    UPDATE public.credit_wallets
    SET balance = balance - v_cost
    WHERE id = v_wallet_id AND balance >= v_cost
    RETURNING balance INTO v_balance;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'P2001', MESSAGE = 'insufficient credits';
    END IF;
  ELSE
    SELECT balance INTO v_balance FROM public.credit_wallets WHERE id = v_wallet_id;
  END IF;

  -- 7) Propuesta.
  INSERT INTO public.quotes
    (request_id, professional_id, amount_min, amount_max, delivery_days, message, status, idempotency_key)
  VALUES
    (p_request_id, p_professional_id, p_amount_min, p_amount_max, p_delivery_days,
     NULLIF(p_message, ''), 'pending', p_idempotency_key)
  RETURNING id INTO v_quote_id;

  -- 8) Ledger (amount negativo = consumo).
  INSERT INTO public.credit_transactions
    (wallet_id, professional_id, type, amount, balance_after, reference_type, reference_id,
     description, idempotency_key)
  VALUES
    (v_wallet_id, p_professional_id, 'proposal', -v_cost, v_balance, 'proposal', v_quote_id,
     'Envío de propuesta', NULLIF('proposal:' || p_idempotency_key, 'proposal:'));

  -- 9) El match pasa a 'proposal_sent'.
  UPDATE public.match_assignments
  SET status = 'proposal_sent', responded_at = now()
  WHERE request_id = p_request_id AND professional_id = p_professional_id;

  -- 10) Contador de propuestas de la solicitud.
  UPDATE public.requests
  SET quotes_count = COALESCE(quotes_count, 0) + 1, updated_at = now()
  WHERE id = p_request_id;

  -- 11) Conversación desbloqueada (única por request+profesional).
  SELECT id INTO v_conv_id FROM public.conversations
  WHERE request_id = p_request_id AND professional_id = p_professional_id
  LIMIT 1;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.conversations
      (request_id, client_id, professional_id, status, last_message, last_message_at, last_message_type)
    VALUES
      (p_request_id, v_request.client_id, p_professional_id, 'active', p_message, now(), 'proposal')
    RETURNING id INTO v_conv_id;
  ELSE
    UPDATE public.conversations
    SET last_message = p_message, last_message_at = now(), last_message_type = 'proposal', status = 'active'
    WHERE id = v_conv_id;
  END IF;

  -- 12) Primer mensaje = mensaje de la propuesta (sección 48: sin mensajes libres).
  INSERT INTO public.messages (conversation_id, sender_id, text, type, payload)
  VALUES (v_conv_id, p_professional_id, COALESCE(NULLIF(p_message, ''), 'Propuesta enviada'),
          'proposal', jsonb_build_object('quote_id', v_quote_id));

  -- 13) Notificación al cliente.
  SELECT name INTO v_service_name FROM public.services WHERE id = v_request.service_id;
  PERFORM public.notification_create(
    v_request.client_id,
    'proposal_received',
    'Nueva propuesta recibida',
    'Recibiste una propuesta para "' || COALESCE(v_service_name, 'tu solicitud') || '"',
    jsonb_build_object('request_id', p_request_id, 'quote_id', v_quote_id));

  -- 14) Analytics.
  BEGIN
    INSERT INTO public.analytics_events (event, actor_id, request_id, payload)
    VALUES ('proposal_sent', p_professional_id, p_request_id,
            jsonb_build_object('quote_id', v_quote_id, 'credits_consumed', v_cost, 'message_chars', char_length(COALESCE(p_message, ''))));
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  RETURN v_quote_id;
END;
$$;

-- 6. ACEPTACIÓN DE PROPUESTA (ATÓMICA, sin dobles aceptaciones) -----------------
CREATE OR REPLACE FUNCTION public.accept_proposal(p_quote_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_quote public.quotes%ROWTYPE;
  v_request public.requests%ROWTYPE;
  v_uid uuid := auth.uid();
  v_job_id uuid;
  v_commission numeric := 0;
BEGIN
  -- 1) Autenticación: el cliente dueño de la solicitud (o backend/admin).
  SELECT * INTO v_quote FROM public.quotes WHERE id = p_quote_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'proposal not found'; END IF;

  SELECT * INTO v_request FROM public.requests WHERE id = v_quote.request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'request not found'; END IF;

  IF v_uid IS NOT NULL AND v_uid <> v_request.client_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  IF v_request.status NOT IN ('new','published') THEN
    RAISE EXCEPTION 'request not accepteable in current status';
  END IF;

  -- 2) Aceptación única: falla si ya hay otra 'selected' (transacción atómica).
  UPDATE public.quotes
  SET status = 'selected', updated_at = now()
  WHERE id = p_quote_id
    AND status IN ('pending','sent','viewed','contacted')
    AND NOT EXISTS (
      SELECT 1 FROM public.quotes q2
      WHERE q2.request_id = v_quote.request_id AND q2.status = 'selected'
    )
  RETURNING * INTO v_quote;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P2002', MESSAGE = 'proposal already accepted';
  END IF;

  -- 3) Las demás propuestas de la solicitud quedan rechazadas.
  UPDATE public.quotes
  SET status = 'rejected', updated_at = now()
  WHERE request_id = v_quote.request_id
    AND id <> v_quote.id
    AND status IN ('pending','sent','viewed','contacted');

  -- 4) Solicitud en curso.
  UPDATE public.requests
  SET status = 'inProgress', assigned_professional_id = v_quote.professional_id, updated_at = now()
  WHERE id = v_request.id;

  -- 5) Job (contratación) con comisión configurable.
  SELECT COALESCE(commission_percent, 0) INTO v_commission
  FROM public.billing_config LIMIT 1;
  IF v_commission IS NULL THEN v_commission := 0; END IF;

  INSERT INTO public.jobs
    (request_id, quote_id, client_id, professional_id, status, commission)
  VALUES
    (v_quote.request_id, v_quote.id, v_request.client_id, v_quote.professional_id, 'selected',
     ROUND(COALESCE(v_quote.amount_max, v_quote.amount_min, 0) * (v_commission / 100.0), 2))
  RETURNING id INTO v_job_id;

  -- 6) Match del seleccionado -> contacted.
  UPDATE public.match_assignments
  SET status = 'contacted', responded_at = now()
  WHERE request_id = v_quote.request_id AND professional_id = v_quote.professional_id;

  -- 7) Notificaciones.
  PERFORM public.notification_create(
    v_quote.professional_id,
    'proposal_accepted',
    '¡Tu propuesta fue aceptada!',
    'El cliente aceptó tu propuesta para la solicitud. Revisa tu sección de trabajos.',
    jsonb_build_object('request_id', v_quote.request_id, 'job_id', v_job_id));

  -- 8) Analytics.
  BEGIN
    INSERT INTO public.analytics_events (event, actor_id, request_id, payload)
    VALUES ('proposal_accepted', v_quote.professional_id, v_quote.request_id,
            jsonb_build_object('quote_id', v_quote.id, 'job_id', v_job_id));
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  RETURN v_job_id;
END;
$$;

-- 7. RECHAZO DE PROPUESTA ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reject_proposal(p_quote_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_quote public.quotes%ROWTYPE;
  v_request public.requests%ROWTYPE;
  v_uid uuid := auth.uid();
BEGIN
  SELECT * INTO v_quote FROM public.quotes WHERE id = p_quote_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'proposal not found'; END IF;

  SELECT * INTO v_request FROM public.requests
  WHERE id = v_quote.request_id AND client_id = v_uid;
  IF NOT FOUND AND NOT (v_uid IS NOT NULL AND public.is_admin()) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  UPDATE public.quotes
  SET status = 'rejected', updated_at = now()
  WHERE id = p_quote_id AND status IN ('pending','sent','viewed','contacted');

  PERFORM public.notification_create(
    v_quote.professional_id,
    'proposal_rejected',
    'Propuesta no seleccionada',
    'El cliente no seleccionó tu propuesta para esta solicitud.',
    jsonb_build_object('request_id', v_quote.request_id, 'quote_id', v_quote.id));
END;
$$;

-- 8. CONFIRMACIÓN DE COMPRA DE CRÉDITOS (webhook) ----------------------------------
CREATE OR REPLACE FUNCTION public.confirm_credit_purchase(
  p_purchase_id uuid,
  p_provider_reference text DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_purchase public.credit_purchases%ROWTYPE;
  v_balance integer;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  SELECT * INTO v_purchase FROM public.credit_purchases
  WHERE id = p_purchase_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'purchase not found'; END IF;

  -- Idempotente: un webhook duplicado no duplica créditos.
  IF v_purchase.status = 'paid' THEN
    SELECT balance INTO v_balance FROM public.credit_wallets WHERE professional_id = v_purchase.professional_id;
    RETURN v_balance;
  END IF;
  IF v_purchase.status <> 'pending' THEN
    RAISE EXCEPTION 'purchase not payable';
  END IF;

  UPDATE public.credit_purchases
  SET status = 'paid',
      provider_reference = COALESCE(p_provider_reference, provider_reference),
      updated_at = now()
  WHERE id = p_purchase_id;

  v_balance := public.grant_credit(
    v_purchase.professional_id,
    v_purchase.credits,
    'purchase',
    'Compra de ' || v_purchase.credits || ' créditos',
    'purchase:' || v_purchase.id,
    'credit_purchase',
    v_purchase.id
  );

  PERFORM public.notification_create(
    v_purchase.professional_id,
    'payment_received',
    'Créditos añadidos',
    'Tu compra de ' || v_purchase.credits || ' créditos se completó correctamente.',
    jsonb_build_object('purchase_id', v_purchase.id));

  BEGIN
    INSERT INTO public.analytics_events (event, actor_id, payload)
    VALUES ('credit_purchase_completed', v_purchase.professional_id,
            jsonb_build_object('purchase_id', v_purchase.id, 'credits', v_purchase.credits));
  EXCEPTION WHEN undefined_table THEN NULL;
  END;

  RETURN v_balance;
END;
$$;

-- 9. COMPLETAR SERVICIO --------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_service(p_job_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_job public.jobs%ROWTYPE;
  v_uid uuid := auth.uid();
BEGIN
  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'job not found'; END IF;

  IF v_uid IS NOT NULL AND v_uid <> v_job.client_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  IF v_job.status NOT IN ('started', 'inProgress') THEN
    RAISE EXCEPTION 'job not in progress';
  END IF;

  UPDATE public.jobs
  SET status = 'completed', end_date = current_date, updated_at = now()
  WHERE id = p_job_id;

  UPDATE public.requests
  SET status = 'completed', updated_at = now()
  WHERE id = v_job.request_id;

  UPDATE public.professionals
  SET total_jobs_completed = COALESCE(total_jobs_completed, 0) + 1
  WHERE id = v_job.professional_id;

  PERFORM public.notification_create(
    v_job.professional_id,
    'service_completed',
    'Servicio finalizado',
    'El servicio contratado se marcó como completado.',
    jsonb_build_object('job_id', p_job_id));

  BEGIN
    INSERT INTO public.analytics_events (event, actor_id, request_id, payload)
    VALUES ('service_completed', v_job.professional_id, v_job.request_id,
            jsonb_build_object('job_id', p_job_id));
  EXCEPTION WHEN undefined_table THEN NULL;
  END;
END;
$$;

-- 10. RLS: SOLO EL RPC crea conversaciones y propuestas -----------------------------
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "System creates conversations via proposal"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Professionals can create quotes" ON public.quotes;
CREATE POLICY "System creates quotes atomically"
  ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (false);

-- El profesional marca sus matches como vistos (same-row edit security definer no
-- necesario: la fila debe ser suya).
DROP POLICY IF EXISTS "Professionals update own matches" ON public.match_assignments;
CREATE POLICY "Professionals update own matches"
  ON public.match_assignments FOR UPDATE TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- 11. Permisos de ejecución de las funciones ---------------------------------------
REVOKE ALL ON FUNCTION public.run_matching_for_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_proposal(uuid, uuid, numeric, numeric, integer, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_proposal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_proposal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_credit(uuid, integer, text, text, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_credit_purchase(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_service(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notification_create(uuid, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_credit_wallet(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.run_matching_for_request(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_proposal(uuid, uuid, numeric, numeric, integer, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.accept_proposal(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_proposal(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.grant_credit(uuid, integer, text, text, text, text, uuid) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_credit_purchase(uuid, text) TO service_role, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_service(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.notification_create(uuid, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_credit_wallet(uuid) TO service_role;