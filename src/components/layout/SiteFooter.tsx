import { localContent } from "@/content";
import type { Profile } from "@/content/types";

export function SiteFooter({
  profile = localContent.profile,
}: {
  profile?: Profile;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <p>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
