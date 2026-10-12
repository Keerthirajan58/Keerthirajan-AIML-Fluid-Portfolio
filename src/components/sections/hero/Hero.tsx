import { localContent } from "@/content";
import type { PortfolioContent } from "@/content/types";
import { HoverLens } from "@/components/ui/HoverLens";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ArrowUpRightIcon, Icon } from "@/components/ui/icons";
import { HeroLine } from "./HeroLine";

export function Hero({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, contact } = content;
  const { hero } = profile;
  const [first, ...rest] = profile.name.split(" ");
  return (
    <section id="hero" aria-labelledby="hero-heading" className="hero">
      <div className="hero-inner shell">
        <p className="availability">
          <span className="lens-content">
            <span className="status-dot" aria-hidden="true" />
            {hero.availability}
          </span>
        </p>
        <h1 id="hero-heading" className="hero-name">
          <span>{first}</span> <span>{rest.join(" ")}</span>
        </h1>
        <p className="hero-intro">{hero.intro}</p>
        <HeroLine />
        <ul className="hero-facts">
          {hero.facts.map((fact) => (
            <li key={fact.text}>
              <span className="lens-content">
                <span
                  className={
                    fact.accent ? `fact-icon fact-${fact.accent}` : "fact-icon"
                  }
                >
                  <Icon name={fact.icon} />
                </span>
                {fact.text}
              </span>
            </li>
          ))}
        </ul>
        <div className="hero-actions">
          <MagneticLink href="#projects">
            <span className="lens-content">
              Explore my work <ArrowUpRightIcon />
            </span>
          </MagneticLink>
          <a className="button button-secondary" href={contact.resumeUrl}>
            <span className="lens-content">
              View résumé <ArrowUpRightIcon />
            </span>
          </a>
          <SocialLinks contact={contact} />
        </div>
        <HoverLens items=".availability, .hero-facts li, .hero-actions .button, .hero-actions .social-link" />
      </div>
    </section>
  );
}
