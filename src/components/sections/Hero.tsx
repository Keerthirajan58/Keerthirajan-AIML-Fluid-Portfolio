import { Fragment, type CSSProperties } from "react";
import { localContent, type PortfolioContent } from "@/content/repository";
import { heroSentence, heroTokens } from "@/content/heroTokens";
import { HoverLens } from "@/components/ui/HoverLens";
import { SocialLinks } from "@/components/ui/SocialLinks";
import {
  AppleIcon,
  GraduationIcon,
  MapPinIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { typingOffsets } from "@/lib/typing";

// Where each token's first character falls in the typing sequence.
const typedAt = typingOffsets(heroTokens);

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
          <span className="lens-content">
            <span className="status-dot" aria-hidden="true" />
            Open to AIML &amp; software engineering roles
          </span>
        </p>
        <h1 id="hero-heading" className="hero-name">
          <span>{first}</span> <span>{rest.join(" ")}</span>
        </h1>
        <p className="hero-intro">AIML + Software Engineering</p>
        {/* Types itself out character by character with a caret (CSS only,
            so it runs before hydration and is static under reduced motion).
            Hover a token for its next-token alternatives. */}
        <p className="hero-description token-stream">
          <span className="sr-only">{heroSentence}</span>
          {heroTokens.map((t, i) => (
            <Fragment key={t.text + i}>
              <span className="tok" aria-hidden="true">
                <span className="tok-word">
                  {[...t.text].map((ch, k) => (
                    <span
                      className="tok-char"
                      style={{ "--c": typedAt[i] + k } as CSSProperties}
                      key={k}
                    >
                      {ch}
                    </span>
                  ))}
                </span>
                <span className="tok-probs">
                  <span className="tok-probs-title">Next-token candidates</span>
                  {t.alts.map(([word, p], j) => (
                    <span
                      className="tok-row"
                      data-pick={j === 0 || undefined}
                      key={word}
                    >
                      <span>{word}</span>
                      <span>{p.toFixed(2)}</span>
                      <span className="tok-bar">
                        <i style={{ width: `${p * 100}%` }} />
                      </span>
                    </span>
                  ))}
                  <span className="tok-probs-note">Illustrative</span>
                </span>
              </span>{" "}
            </Fragment>
          ))}
        </p>
        <ul className="hero-facts">
          <li>
            <span className="lens-content">
              <span className="fact-icon">
                <AppleIcon />
              </span>
              Apple AIML Intern
            </span>
          </li>
          <li>
            <span className="lens-content">
              <span className="fact-icon fact-school">
                <GraduationIcon />
              </span>
              MS CS · GWU 2026
            </span>
          </li>
          <li>
            <span className="lens-content">
              <span className="fact-icon fact-place">
                <MapPinIcon />
              </span>
              {profile.location}
            </span>
          </li>
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
