import { contact } from "@/content/data";
import { GitHubIcon, LinkedInIcon, LeetCodeIcon } from "./icons";

const LINKS = [
  { href: contact.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: contact.social.github, label: "GitHub", Icon: GitHubIcon },
  { href: contact.social.leetcode, label: "LeetCode", Icon: LeetCodeIcon },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {LINKS.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink-muted transition-colors hover:border-crimson hover:text-crimson"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
