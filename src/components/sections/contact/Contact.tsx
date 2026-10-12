import Image from "next/image";
import { localContent } from "@/content";
import { copy } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { HoverLens } from "@/components/ui/HoverLens";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { FORMSPREE_FORM_ID } from "@/lib/contact";
import { findPublicImage } from "@/lib/server/images";
import { ContactLauncher } from "./ContactLauncher";

export function Contact({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, contact } = content;
  const text = copy.contact;
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
            {text.availability}
          </span>
        </p>
        <h2 id="contact-heading">
          {text.heading} <span>{text.headingAccent}</span>
        </h2>
        <p className="contact-lede">{text.lede(profile.location)}</p>
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
              <small>{text.cardNote}</small>
            </span>
          </div>
          <SocialLinks contact={contact} />
        </div>
        <HoverLens items=".contact-inner > .availability, .contact-actions .button, .contact-card .social-link" />
      </div>
    </section>
  );
}
