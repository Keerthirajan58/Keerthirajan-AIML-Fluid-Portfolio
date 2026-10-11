import { profile } from "@/content/data";
import Link from "next/link";
import { BrandMark } from "./ui/BrandMark";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <Link href="/" className="wordmark" aria-label="KS. — Back home">
          <BrandMark idPrefix="ks-foot" />
        </Link>
        <p>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
