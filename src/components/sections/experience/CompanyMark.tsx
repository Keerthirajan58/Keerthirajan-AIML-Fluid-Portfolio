import Image from "next/image";
import type { CompanyLogo } from "@/content/types";
import { BriefcaseIcon, Icon } from "@/components/ui/icons";

/** A company's badge on the timeline: its icon, its logo, or a briefcase. */
export function CompanyMark({ logo }: { logo?: CompanyLogo }) {
  return (
    <span className="company-mark" aria-hidden="true">
      {!logo ? (
        <BriefcaseIcon />
      ) : "icon" in logo ? (
        <Icon name={logo.icon} />
      ) : (
        <Image src={logo.src} width={56} height={56} alt="" />
      )}
    </span>
  );
}
