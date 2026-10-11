import Link from "next/link";
import { localContent, type PortfolioContent } from "@/content/repository";
import { getProjectBySlug } from "@/lib/projects";
import { AppleIcon, AwardIcon, ArrowUpRightIcon } from "@/components/ui/icons";

/** Three recognisable credentials at the top of the sheet, each linking to its proof. */
export function Highlights({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const apple = content.experience.find((job) => job.company === "Apple");
  const technica = getProjectBySlug("barterbrain", content.projects);
  const nvc = getProjectBySlug("barterbrain-nvc", content.projects);
  const items = [
    apple && {
      href: "/projects/siri-core-modeling",
      kicker: `Apple · ${apple.dates.slice(-4)}`,
      title: "Siri Core Modeling",
      detail: apple.role,
      icon: <AppleIcon />,
    },
    technica?.achievement && {
      href: "/projects/barterbrain",
      kicker: "Technica",
      title: "Hackathon winner",
      detail: `BarterBrAIn · ${technica.achievement.detail}`,
      icon: <AwardIcon />,
    },
    nvc?.achievement && {
      href: "/projects/barterbrain-nvc",
      kicker: "GW New Venture Competition",
      title: `${nvc.achievement.label} finalist`,
      detail: "Social Innovation · field of 215 teams",
      icon: <AwardIcon />,
    },
  ].filter((item) => !!item);
  return (
    <section aria-label="Highlights" className="highlights-band shell">
      <ul className="highlights">
        {items.map((item) => (
          <li key={item.href} className="reveal">
            <Link href={item.href} className="highlight">
              <span className="highlight-top">
                <span className="highlight-icon">{item.icon}</span>
                <ArrowUpRightIcon className="highlight-arrow" />
              </span>
              <span>
                <span className="highlight-kicker">{item.kicker}</span>
                <strong>{item.title}</strong>
                <span className="highlight-detail">{item.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
