import Image from "next/image";
import type { CSSProperties } from "react";
import { localContent } from "@/content";
import { copy, sectionInfo } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Section } from "@/components/ui/Section";
import { HoverLens } from "@/components/ui/HoverLens";
import { Icon, MapPinIcon } from "@/components/ui/icons";
import { EducationCard } from "./EducationCard";

export function About({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, education } = content;
  return (
    <Section
      id="about"
      eyebrow={sectionInfo("about").eyebrow}
      title={profile.aboutHeadline}
    >
      {/* The portrait stays pinned (and slowly zooms) while the story and the
          education cards scroll past it. */}
      <div className="about-layout">
        <div className="about-media">
          <figure className="portrait">
            <Image
              src={profile.photo}
              alt={profile.name}
              fill
              sizes="(max-width: 859px) 90vw, 40vw"
              className="object-cover"
            />
          </figure>
        </div>
        <div className="about-flow">
          <div className="about-story surface tinted reveal">
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ul className="achievement-list">
              {profile.aboutHighlights.map((h) => (
                <li key={h.text}>
                  <span className="lens-content">
                    <span className="chip-icon" data-tone={h.tone}>
                      <Icon name={h.icon} />
                    </span>
                    {h.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="location-pill">
              <span className="lens-content">
                <span className="location-icon" aria-hidden="true">
                  <MapPinIcon />
                </span>
                <span>
                  <strong>{profile.location}</strong>
                  <small>
                    <span className="status-dot" aria-hidden="true" />
                    {profile.relocation}
                  </small>
                </span>
              </span>
            </div>
            <HoverLens items=".achievement-list li, .location-pill" />
          </div>
          <div className="education">
            <div className="education-header reveal">
              <h3>{copy.education.title}</h3>
              <span>{copy.education.note}</span>
            </div>
            <div className="education-stack">
              {education.map((entry, i) => (
                // Each card sits in a sticky slot: it lands and stays fully
                // readable before the next one slides over it.
                <div
                  className="education-slot"
                  style={{ "--i": i } as CSSProperties}
                  key={entry.degree}
                >
                  <EducationCard entry={entry} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
