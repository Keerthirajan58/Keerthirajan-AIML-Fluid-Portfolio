import { profile } from "@/content/data";
export function SiteFooter() {
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
