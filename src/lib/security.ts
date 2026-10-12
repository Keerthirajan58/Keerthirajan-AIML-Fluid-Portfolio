/**
 * Sent with every response. The policy blocks framing, plugins, <base>
 * hijacking and form posts anywhere but this site and Formspree; scripts are
 * left to Next.js (its inline bootstrap scripts need no nonce here).
 */
export const securityHeaders: { key: string; value: string }[] = [
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self' https://formspree.io",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];
