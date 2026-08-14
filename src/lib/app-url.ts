/**
 * Canonical base URL for links sent in emails. Prefers the explicit
 * NEXT_PUBLIC_APP_URL env var (so a custom domain can be pinned), but falls
 * back to Vercel's own auto-provided production URL whenever that var is
 * unset or still pointing at localhost — so a forgotten/misconfigured env
 * var can't silently leak local links into real customer emails again.
 */
export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (productionUrl) return `https://${productionUrl}`;

  return configured || "http://localhost:3000";
}
