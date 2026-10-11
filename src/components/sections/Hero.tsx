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
  return (
    <section id="hero" aria-labelledby="hero-heading" className="hero shell">
      <div className="hero-top">
        <span className="eyebrow">
          <span className="status-dot" /> {profile.heroEyebrow}
        </span>
        <span className="edition">PORTFOLIO / 2026</span>
      </div>
      <div className="hero-copy">
        <h1 id="hero-heading">
          <span>{profile.name.split(" ")[0]}</span>
          <span>
            {profile.name.split(" ").slice(1).join(" ")}
            <span className="hero-period">.</span>
          </span>
        </h1>
        <div className="hero-intro">
          <p>
            AIML + Software Engineering.
            <br />
            <span>Intelligence, put to work.</span>
          </p>
        </div>
        <p className="hero-description">
          From AI systems to the software around them.
          <br className="desktop-break" /> I build the whole experience.
        </p>
        <ul className="hero-facts">
          <li>
            <span className="fact-icon icon-apple">
              <AppleIcon />
            </span>
            Apple AIML Intern
          </li>
          <li>
            <span className="fact-icon icon-school">
              <GraduationIcon />
            </span>
            MS CS · GWU 2026
          </li>
          <li>
            <span className="fact-icon icon-location">
              <MapPinIcon />
            </span>
            {profile.location}
          </li>
        </ul>
        <div className="hero-actions">
          <MagneticLink href="#projects">
            Explore my work <ArrowUpRightIcon />
          </MagneticLink>
          <a className="text-link" href={contact.resumeUrl}>
            View résumé <ArrowUpRightIcon width={16} height={16} />
          </a>
          <SocialLinks contact={contact} />
        </div>
      </div>
      <div className="hero-bottom">
        <span className="hero-footnote">
          Thoughtful systems. Tangible experiences.
        </span>
        <a className="scroll-cue" href="#about">
          Scroll to discover <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
