import { localContent, type PortfolioContent } from "@/content/repository";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  AppleIcon,
  GraduationIcon,
  MapPinIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function Hero({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, contact } = content;
  const [first, ...rest] = profile.name.split(" ");
  return (
    <section id="hero" aria-labelledby="hero-heading" className="hero">
      <div className="hero-inner shell">
        <p className="availability">
          <span className="status-dot" aria-hidden="true" />
          Open to AIML &amp; software engineering roles
        </p>
        <h1 id="hero-heading" className="hero-name">
          <span>{first}</span> <span>{rest.join(" ")}</span>
        </h1>
        <p className="hero-intro">AIML + Software Engineering</p>
        <p className="hero-description">
          I build machine-learning systems, evaluate LLMs, and ship the
          full-stack software around them.
        </p>
        <ul className="hero-facts">
          <li>
            <span className="fact-icon">
              <AppleIcon />
            </span>
            Apple AIML Intern
          </li>
          <li>
            <span className="fact-icon">
              <GraduationIcon />
            </span>
            MS CS · GWU 2026
          </li>
          <li>
            <span className="fact-icon">
              <MapPinIcon />
            </span>
            {profile.location}
          </li>
        </ul>
        <div className="hero-actions">
          <MagneticLink href="#projects">
            Explore my work <ArrowUpRightIcon />
          </MagneticLink>
          <a className="button button-secondary" href={contact.resumeUrl}>
            View résumé <ArrowUpRightIcon />
          </a>
          <SocialLinks contact={contact} />
        </div>
      </div>
    </section>
  );
}
