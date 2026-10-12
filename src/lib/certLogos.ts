/**
 * Issuer logos for the certification cards, keyed by certification slug.
 * Files live in public/images/brands/certs (provenance in
 * THIRD_PARTY_NOTICES.md). API Academy has no logo we could source, so that
 * card keeps its monogram.
 */
export type CertLogo = { src: string; width: number; height: number };

const logo = (name: string, width: number, height: number): CertLogo => ({
  src: `/images/brands/certs/${name}.png`,
  width,
  height,
});

export const CERT_LOGOS: Record<string, CertLogo> = {
  "certification-machine-learning-stanford": logo("stanford", 459, 96),
  // Titled "IBM Certified Project"; issued through ICT Academy's IBM Skills
  // Network portal.
  "certification-ibm-project": logo("ibm", 258, 96),
  "certification-web-development-ucdavis": logo("ucdavis", 561, 96),
  "certification-programming-foundations-duke": logo("duke", 239, 104),
  "certification-relational-db-sql": logo("coursera", 686, 96),
  "certification-ai-event-guvi": logo("guvi", 120, 120),
  "certification-programming-in-java-nptel": logo("nptel", 426, 96),
  "certification-php-mysql-udemy": logo("udemy", 257, 96),
};

export const certLogo = (slug: string): CertLogo | undefined =>
  CERT_LOGOS[slug];
