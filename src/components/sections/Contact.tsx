import Image from "next/image";
import { localContent, type PortfolioContent } from "@/content/repository";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { ContactLauncher } from "@/components/ContactLauncher";
import { findPublicImage } from "@/lib/imageSize";

export function Contact({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, contact } = content;
  const email = contact.emails[0];
  // A dedicated contact portrait wins when one is present in /public/images.
  const photo = findPublicImage("images/contact-profile") ?? profile.photo;
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
          <ContactLauncher
            email={email}
            formId={process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}
            className="button button-primary"
          >
            Say hello <ArrowUpRightIcon />
          </ContactLauncher>
          <a className="button button-secondary" href={contact.resumeUrl}>
            View résumé <ArrowUpRightIcon />
          </a>
        </div>
        <div className="contact-card glass">
          <div className="contact-person">
            <span className="contact-avatar">
              <Image
                src={photo}
                width={112}
                height={112}
                sizes="160px"
                alt=""
              />
            </span>
            <span>
              <a className="contact-email" href={"mailto:" + email}>
                {email}
              </a>
              <small>AIML &amp; software engineering opportunities</small>
            </span>
          </div>
          <SocialLinks contact={contact} />
        </div>
      </div>
    </section>
  );
}
