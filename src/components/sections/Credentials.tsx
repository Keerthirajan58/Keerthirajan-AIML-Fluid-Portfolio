import { Section } from "@/components/ui/Section";
import { getPublications, getCertifications } from "@/lib/projects";
import { ArrowUpRightIcon } from "@/components/ui/icons";

export function Credentials() {
  const publications = getPublications();
  const certifications = getCertifications();

  return (
    <Section id="credentials" eyebrow="Credentials" title="Publications & certifications">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        <div data-reveal>
          <h3 className="mb-4 font-display text-base font-semibold text-ink">
            Publications
          </h3>
          <ul className="space-y-4">
            {publications.map((pub) => (
              <li
                key={pub.slug}
                className="border-l-2 border-crimson/30 pl-4"
              >
                <p className="font-medium text-ink">{pub.title}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {pub.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal>
          <h3 className="mb-4 font-display text-base font-semibold text-ink">
            Certifications
          </h3>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {certifications.map((cert) => (
              <li key={cert.slug}>
                <a
                  href={cert.links.credential}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-1 text-sm text-ink-muted transition-colors hover:text-crimson"
                >
                  <span>{cert.title}</span>
                  <ArrowUpRightIcon
                    width={14}
                    height={14}
                    className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
