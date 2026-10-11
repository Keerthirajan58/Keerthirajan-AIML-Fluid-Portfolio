import { contact as defaultContact, type ContactInfo } from "@/content/data";
import { GitHubIcon, LinkedInIcon, LeetCodeIcon } from "./icons";

export function SocialLinks({
  className = "",
  contact = defaultContact,
}: {
  className?: string;
  contact?: ContactInfo;
}) {
  const LINKS = [
    { href: contact.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: contact.social.github, label: "GitHub", Icon: GitHubIcon },
    { href: contact.social.leetcode, label: "LeetCode", Icon: LeetCodeIcon },
  ];

  return (
    <ul className={`social-links ${className}`}>
      {LINKS.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`social-link social-${label.toLowerCase()}`}
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
