import Image from "next/image";
import { localContent, type PortfolioContent } from "@/content/repository";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { ContactLauncher } from "@/components/ContactLauncher";
import { findPublicImage } from "@/lib/imageSize";
import { FORMSPREE_FORM_ID } from "@/lib/contact";
import { HoverLens } from "@/components/ui/HoverLens";

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
          <span className="lens-content">
            <span className="status-dot" aria-hidden="true" />
            Open to opportunities
          </span>
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
            formId={
              process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || FORMSPREE_FORM_ID
            }
            className="button button-primary"
          >
            <span className="lens-content">
              Say hello <ArrowUpRightIcon />
            </span>
          </ContactLauncher>
          <a className="button button-secondary" href={contact.resumeUrl}>
            <span className="lens-content">
              View résumé <ArrowUpRightIcon />
            </span>
          </a>
        </div>
        <div className="contact-card surface">
          <div className="contact-person">
            <span className="contact-avatar">
              <Image
                src={photo}
                width={128}
                height={157}
                sizes="128px"
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
        <HoverLens items=".contact-inner > .availability, .contact-actions .button, .contact-card .social-link" />
      </div>
    </section>
  );
}
