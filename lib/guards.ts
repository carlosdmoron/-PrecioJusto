const DASHBOARD_CHOOSER_EMAILS = ["carlosdmoron1225@gmail.com"] as const;

export function shouldShowDashboardChooser(email?: string | null): boolean {
  if (!email) return false;
  return (DASHBOARD_CHOOSER_EMAILS as readonly string[]).includes(
    email.trim().toLowerCase()
  );
}
