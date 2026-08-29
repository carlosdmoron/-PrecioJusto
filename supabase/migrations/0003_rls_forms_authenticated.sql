-- Relax forms/form_questions RLS so any authenticated ("admin") user can manage them.
-- The app has no separate admin role in the UI; requireUser() treats any logged-in
-- user as admin, so is_admin() should not be the gate for the form builder.

-- forms
DROP POLICY IF EXISTS "Admins can manage all forms" ON public.forms;
CREATE POLICY "Authenticated users manage forms"
  ON public.forms FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view active forms" ON public.forms;
CREATE POLICY "Anyone can view active forms"
  ON public.forms FOR SELECT TO anon
  USING (status = 'active');

DROP POLICY IF EXISTS "Authenticated view all forms" ON public.forms;
CREATE POLICY "Authenticated view all forms"
  ON public.forms FOR SELECT TO authenticated
  USING (true);

-- form_questions
DROP POLICY IF EXISTS "Admins can manage all form questions" ON public.form_questions;
CREATE POLICY "Authenticated users manage form questions"
  ON public.form_questions FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view questions for active forms" ON public.form_questions;
CREATE POLICY "Anyone can view questions for active forms"
  ON public.form_questions FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.forms f
      WHERE f.id = form_questions.form_id AND f.status = 'active'
    )
  );
