import Image from "next/image";
import type { CSSProperties } from "react";
import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import {
  AwardIcon,
  AppleIcon,
  GraduationIcon,
  BriefcaseIcon,
  PeopleIcon,
  MapPinIcon,
} from "@/components/ui/icons";
import { DepthCard } from "@/components/ui/DepthCard";

/** Colour-coded chips: gold for awards, ink for Apple, navy for academics. */
const chipStyles = [
  { icon: <AwardIcon />, tone: "gold" },
  { icon: <AppleIcon />, tone: "ink" },
  { icon: <GraduationIcon />, tone: "navy" },
];

export function About({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, education } = content;
  return (
    <Section id="about" eyebrow="About" title={profile.aboutHeadline}>
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
          <div className="about-story surface reveal">
            {profile.bio.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ul className="achievement-list">
              {profile.aboutHighlights.map((h, i) => (
                <li key={h.text}>
                  <span
                    className="chip-icon"
                    data-tone={chipStyles[i % 3].tone}
                  >
                    {chipStyles[i % 3].icon}
                  </span>
                  {h.text}
                </li>
              ))}
            </ul>
            <div className="location-pill">
              <span className="location-icon" aria-hidden="true">
                <MapPinIcon />
              </span>
              <span>
                <strong>{profile.location}</strong>
                <small>
                  <span className="status-dot" aria-hidden="true" />
                  Open to relocation
                </small>
              </span>
            </div>
          </div>
          <div className="education">
            <div className="education-header reveal">
              <h3>Education</h3>
              <span>One throughline: keep learning.</span>
            </div>
            <div className="education-stack">
              {education.map((e, i) => (
                // Each card sits in a sticky slot: it lands and stays fully
                // readable before the next one slides over it.
                <div
                  className="education-slot"
                  style={{ "--i": i } as CSSProperties}
                  key={e.degree}
                >
                  <DepthCard
                    className={`education-card surface education-${i === 0 ? "graduate" : "undergraduate"}`}
                  >
                    <div className="card-top">
                      <span className="school-monogram">
                        {i === 0 ? (
                          "GW"
                        ) : (
                          <Image
                            src="/images/brands/svce.jpg"
                            width={72}
                            height={72}
                            alt="SVCE, Sriperumbudur emblem"
                          />
                        )}
                      </span>
                      <span className="card-dates">{e.dates}</span>
                    </div>
                    <p className="eyebrow">
                      {i === 0 ? "Graduate" : "Undergraduate"}
                    </p>
                    <h4>{e.degree}</h4>
                    <p className="institution">{e.institution}</p>
                    <ul>
                      {e.bullets.map((b, j) => {
                        const award = i === 0 && j === 0;
                        const activity = i === 1 && j < 2;
                        const [lead, ...detail] = b.split(" — ");
                        return (
                          <li
                            className={
                              award
                                ? "award-row"
                                : activity
                                  ? "activity-row"
                                  : ""
                            }
                            key={b}
                          >
                            {award ? (
                              <span className="education-medallion">
                                <AwardIcon />
                              </span>
                            ) : activity ? (
                              <span
                                className="education-activity-icon"
                                data-tone={j === 0 ? "navy" : "crimson"}
                              >
                                {j === 0 ? <BriefcaseIcon /> : <PeopleIcon />}
                              </span>
                            ) : null}
                            {award && detail.length ? (
                              <span>
                                <strong>{lead}</strong>
                                {detail.join(" — ")}
                              </span>
                            ) : (
                              <span>{b}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </DepthCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
