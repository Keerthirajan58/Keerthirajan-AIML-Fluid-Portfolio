import { profile, contact } from "@/content/data";
import { Section } from "@/components/ui/Section";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  DownloadIcon,
} from "@/components/ui/icons";

export function Contact() {
  return (
    <Section id="contact" eyebrow="Contact" title="Let's build something">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
        <div>
          <p className="max-w-md text-base leading-7 text-ink-muted sm:text-lg">
            I&apos;m actively looking for AIML / software engineering roles
            {profile.openToRelocation ? " and open to relocation" : ""}. The
            fastest way to reach me is email — I read everything.
          </p>
          <a
            href={contact.resumeUrl}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-wine"
          >
            <DownloadIcon width={16} height={16} />
            Download résumé
          </a>
          <div className="mt-8">
            <SocialLinks />
          </div>
        </div>

        <ul className="space-y-5">
          <li className="flex items-start gap-3">
            <MailIcon className="mt-0.5 shrink-0 text-crimson" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Email
              </p>
              {contact.emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="block text-ink underline-offset-4 hover:text-crimson hover:underline"
                >
                  {email}
                </a>
              ))}
            </div>
          </li>
          <li className="flex items-start gap-3">
            <PhoneIcon className="mt-0.5 shrink-0 text-crimson" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Phone
              </p>
              <p className="text-ink">{contact.phone}</p>
              <p className="text-sm text-ink-muted">
                WhatsApp {contact.whatsapp}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 shrink-0 text-crimson" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Location
              </p>
              <p className="text-ink">{contact.location}</p>
            </div>
          </li>
        </ul>
      </div>
    </Section>
  );
}
