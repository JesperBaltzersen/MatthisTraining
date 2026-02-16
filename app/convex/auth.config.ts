import type { AuthConfig } from "convex/server";

/**
 * Clerk JWT validation for Convex.
 * Set CLERK_JWT_ISSUER_DOMAIN in the Convex Dashboard (or .env.local for convex dev)
 * to your Clerk "convex" JWT template's Issuer URL (Clerk Frontend API URL).
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
