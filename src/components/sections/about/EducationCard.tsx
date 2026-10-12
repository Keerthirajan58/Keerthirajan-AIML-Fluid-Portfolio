import Image from "next/image";
import type { CSSProperties } from "react";
import type { EducationEntry } from "@/content/types";
import { DepthCard } from "@/components/ui/DepthCard";
import { AwardIcon, Icon } from "@/components/ui/icons";

/** One degree: badge, dates, level, award, activities and coursework. */
export function EducationCard({ entry: e }: { entry: EducationEntry }) {
  const [from, to] = e.tint;
  return (
    <DepthCard
      className="education-card surface tinted"
      style={
        {
          "--tint-from": `var(--tint-${from})`,
          "--tint-to": `var(--tint-${to})`,
        } as CSSProperties
      }
    >
      <div className="card-top">
        {"monogram" in e.logo ? (
          <span className="school-monogram" data-tone={e.logo.tone}>
            {e.logo.monogram}
          </span>
        ) : (
          <span className="school-monogram">
            <Image src={e.logo.src} width={72} height={72} alt={e.logo.alt} />
          </span>
        )}
        <span className="card-dates">{e.dates}</span>
      </div>
      <p className="eyebrow">{e.level}</p>
      <h4>{e.degree}</h4>
      <p className="institution">{e.institution}</p>
      <ul>
        {e.award && (
          <li className="award-row">
            <span className="education-medallion">
              <AwardIcon />
            </span>
            <span>
              <strong>{e.award.title}</strong>
              {e.award.detail}
            </span>
          </li>
        )}
        {e.activities?.map((a) => (
          <li className="activity-row" key={a.text}>
            <span className="education-activity-icon" data-tone={a.tone}>
              <Icon name={a.icon} />
            </span>
            <span>{a.text}</span>
          </li>
        ))}
        {e.notes?.map((note) => (
          <li key={note}>
            <span>{note}</span>
          </li>
        ))}
        {e.coursework && (
          <li>
            <span>{`Relevant Coursework: ${e.coursework.join(", ")}.`}</span>
          </li>
        )}
      </ul>
    </DepthCard>
  );
}
