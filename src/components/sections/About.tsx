import Image from "next/image";
import { profile, contact, education } from "@/content/data";
import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="about" eyebrow="About" title={profile.aboutHeadline}>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
        <div data-reveal className="order-2 md:order-1">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-ink/10 bg-surface">
            <Image
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(max-width: 768px) 20rem, 24rem"
              className="object-cover"
            />
          </div>
        </div>

        <div data-reveal className="order-1 md:order-2">
          {profile.bio.map((para, i) => (
            <p
              key={i}
              className="mb-4 text-base leading-7 text-ink-muted sm:text-lg"
            >
              {para}
            </p>
          ))}

          <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Education
              </dt>
              {education.map((e) => (
                <dd key={e.degree} className="mt-1 text-sm text-ink">
                  {e.degree.split(",")[0]} — {e.institution.split(",")[0]}
                </dd>
              ))}
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-crimson">
                Based in
              </dt>
              <dd className="mt-1 text-sm text-ink">{profile.location}</dd>
              {profile.openToRelocation && (
                <dd className="mt-1 text-sm text-ink-muted">
                  Open to relocation
                </dd>
              )}
            </div>
          </dl>

          <ul className="mt-6 flex flex-wrap gap-2">
            {profile.aboutHighlights.map((h) => (
              <li
                key={h.text}
                className="rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-sm text-ink"
              >
                {h.text}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-ink-muted">
            Reach me at{" "}
            <a
              href={`mailto:${contact.emails[0]}`}
              className="font-medium text-crimson underline-offset-4 hover:underline"
            >
              {contact.emails[0]}
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}
