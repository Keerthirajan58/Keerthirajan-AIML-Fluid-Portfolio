import Image from "next/image";
import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import {
  AwardIcon,
  AppleIcon,
  GraduationIcon,
  BriefcaseIcon,
  PeopleIcon,
} from "@/components/ui/icons";
import { DepthCard } from "@/components/ui/DepthCard";

export function About({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, education } = content;
  return (
    <Section
      id="about"
      eyebrow="01 / The person behind the work"
      title={profile.aboutHeadline}
    >
      <div className="about-grid">
        <figure className="portrait">
          <Image
            src={profile.photo}
            alt={profile.name}
            fill
            sizes="(max-width: 767px) 85vw, 32vw"
            className="object-cover"
          />
          <figcaption>Curiosity, with a practical purpose.</figcaption>
        </figure>
        <div className="about-story">
          <span className="eyebrow">A little about me</span>
          <p className="large-copy">
            I turn questions into
            <br />
            <em>working systems.</em>
          </p>
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="achievement-list">
            {profile.aboutHighlights.map((h, i) => (
              <li key={h.text}>
                <span
                  className={`highlight-icon ${i === 0 ? "icon-award" : i === 1 ? "icon-apple" : "icon-school"}`}
                >
                  {i === 0 ? (
                    <AwardIcon />
                  ) : i === 1 ? (
                    <AppleIcon />
                  ) : (
                    <GraduationIcon />
                  )}
                </span>
                {h.text}
              </li>
            ))}
          </ul>
          <p className="location-note">
            {profile.location} · Open to relocation
          </p>
        </div>
      </div>
      <div className="education-header">
        <h3>Education</h3>
        <span>One throughline: keep learning.</span>
      </div>
      <div className="education-grid">
        {education.map((e, i) => (
          <DepthCard
            className={`education-card education-${i === 0 ? "graduate" : "undergraduate"}`}
            key={e.degree}
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
              <span>{e.dates}</span>
            </div>
            <p className="eyebrow">{i === 0 ? "Graduate" : "Undergraduate"}</p>
            <h4>{e.degree}</h4>
            <p className="institution">{e.institution}</p>
            <ul>
              {e.bullets.map((b, j) => (
                <li
                  className={
                    i === 0 && j === 0
                      ? "award-row"
                      : i === 1 && j < 2
                        ? "activity-row"
                        : ""
                  }
                  key={b}
                >
                  {i === 0 && j === 0 ? (
                    <span className="education-medallion">
                      <AwardIcon />
                    </span>
                  ) : i === 1 && j < 2 ? (
                    <span className="education-activity-icon">
                      {j === 0 ? <BriefcaseIcon /> : <PeopleIcon />}
                    </span>
                  ) : null}
                  {i === 0 && j === 0 && b.includes(" — ") ? (
                    <span>
                      <strong>{b.split(" — ")[0]}</strong>
                      {b.split(" — ").slice(1).join(" — ")}
                    </span>
                  ) : (
                    <span>{b}</span>
                  )}
                </li>
              ))}
            </ul>
          </DepthCard>
        ))}
      </div>
    </Section>
  );
}
