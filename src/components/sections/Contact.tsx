import Image from "next/image";
import { localContent, type PortfolioContent } from "@/content/repository";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { ContactForm } from "@/components/ContactForm";
import { formEndpoint } from "@/lib/contact";
export function Contact({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, contact } = content;
  const email = contact.emails[0];
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;
  return (
    <section
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-heading"
      className="contact"
    >
      <div className="contact-inner shell reveal">
        <p className="availability">
          <span className="status-dot" aria-hidden="true" />
          Open to opportunities
        </p>
        <h2 id="contact-heading">
          Have a role in mind? <span>Let&apos;s talk.</span>
        </h2>
        <p className="contact-lede">
          I&apos;m looking for AIML and software engineering roles. Based in{" "}
          {profile.location}, open to relocation.
        </p>
        <div className="contact-actions">
          <a
            href={"mailto:" + email}
            className="button button-primary"
            aria-label="Say hello — Send an email"
          >
            Say hello <ArrowUpRightIcon />
          </a>
          <a className="button button-secondary" href={contact.resumeUrl}>
            View résumé <ArrowUpRightIcon />
          </a>
        </div>
        <div className="contact-card">
          <div className="contact-person">
            <Image src={profile.photo} width={96} height={96} alt="" />
            <span>
              <a className="contact-email" href={"mailto:" + email}>
                {email}
              </a>
              <small>AIML &amp; software engineering opportunities</small>
            </span>
          </div>
          <SocialLinks contact={contact} />
        </div>
        {formEndpoint(formId) && (
          <div className="contact-message">
            <h3>Prefer to leave a message?</h3>
            <ContactForm formId={formId} email={email} />
          </div>
        )}
      </div>
    </section>
  );
}
