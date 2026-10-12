import type { ComponentType, SVGProps } from "react";
import { localContent } from "@/content";
import type { ContactInfo, SocialNetwork } from "@/content/types";
import { GitHubIcon, LeetCodeIcon, LinkedInIcon } from "./icons";

/** Each network's name and brand icon; colours are `.social-<network>` styles. */
export const socialNetworks: Record<
  SocialNetwork,
  { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  linkedin: { label: "LinkedIn", Icon: LinkedInIcon },
  github: { label: "GitHub", Icon: GitHubIcon },
  leetcode: { label: "LeetCode", Icon: LeetCodeIcon },
};

export function SocialLinks({
  className = "",
  contact = localContent.contact,
}: {
  className?: string;
  contact?: ContactInfo;
}) {
  return (
    <ul className={`social-links ${className}`}>
      {contact.socials.map(({ network, href }) => {
        const { label, Icon } = socialNetworks[network];
        return (
          <li key={network}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`social-link social-${network}`}
            >
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
