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

const highlightIcons = [<AwardIcon key="a" />, <AppleIcon key="b" />, <GraduationIcon key="c" />];

export function About({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { profile, education } = content;
  return (
    <Section id="about" eyebrow="About" title={profile.aboutHeadline}>
      <div className="about-grid">
        <figure className="portrait reveal">
          <Image
            src={profile.photo}
            alt={profile.name}
            fill
            sizes="(max-width: 859px) 90vw, 38vw"
            className="object-cover"
          />
        </figure>
        <div className="about-story reveal">
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="achievement-list">
            {profile.aboutHighlights.map((h, i) => (
              <li key={h.text}>
                <span className="chip-icon">{highlightIcons[i % 3]}</span>
                {h.text}
              </li>
            ))}
          </ul>
          <p className="location-note">
            {profile.location} · Open to relocation
          </p>
        </div>
      </div>
      <div className="education-header reveal">
        <h3>Education</h3>
        <span>One throughline: keep learning.</span>
      </div>
      <div className="education-grid">
        {education.map((e, i) => (
          <DepthCard
            className={`education-card reveal education-${i === 0 ? "graduate" : "undergraduate"}`}
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
              {e.bullets.map((b, j) => {
                const award = i === 0 && j === 0;
                const activity = i === 1 && j < 2;
                const [lead, ...detail] = b.split(" — ");
                return (
                  <li
                    className={award ? "award-row" : activity ? "activity-row" : ""}
                    key={b}
                  >
                    {award ? (
                      <span className="education-medallion">
                        <AwardIcon />
                      </span>
                    ) : activity ? (
                      <span className="education-activity-icon">
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
        ))}
      </div>
    </Section>
  );
}
