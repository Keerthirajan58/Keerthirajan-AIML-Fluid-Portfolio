import { localContent, type PortfolioContent } from "@/content/repository";
import Image from "next/image";
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
  return (
    <section
      id="contact"
      tabIndex={-1}
      aria-labelledby="contact-heading"
      className="section shell contact-stage"
    >
      <div className="contact-prelude">
        <span className="eyebrow">07 / The next conversation</span>
        <span className="contact-availability">
          <span className="status-dot" />
          Open to opportunities
        </span>
      </div>
      <div className="contact-invitation">
        <h2 id="contact-heading">
          Good ideas deserve
          <br />
          <span>a conversation.</span>
        </h2>
        <div className="contact-person">
          <Image src={profile.photo} width={76} height={76} alt="" />
          <p>
            Have a role in mind?
            <br />
            Let&apos;s see what we can build.
          </p>
        </div>
      </div>
      <div className="contact-line">
        <a
          href={"mailto:" + contact.emails[0]}
          className="contact-orbit"
          aria-label="Say hello — Send an email"
        >
          <ArrowUpRightIcon />
          <span>Say hello</span>
        </a>
      </div>
      <div className="contact-directory">
        <div className="contact-direct">
          <span className="eyebrow">Start here</span>
          <a href={"mailto:" + contact.emails[0]}>
            {contact.emails[0]}
            <ArrowUpRightIcon />
          </a>
          <p>AIML & software engineering opportunities.</p>
        </div>
        <div>
          <span className="eyebrow">Based in</span>
          <p>{profile.location}</p>
          <small>Open to relocation</small>
        </div>
        <div>
          <span className="eyebrow">Find me elsewhere</span>
          <SocialLinks contact={contact} />
          <a className="text-link" href={contact.resumeUrl}>
            View résumé <ArrowUpRightIcon />
          </a>
        </div>
      </div>
      {formEndpoint(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID) && (
        <div className="contact-message">
          <div>
            <h3>Prefer to leave a message?</h3>
            <p>A little context is a great place to start.</p>
          </div>
          <div>
            <ContactForm
              formId={process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}
              email={contact.emails[0]}
            />
          </div>
        </div>
      )}
    </section>
  );
}
