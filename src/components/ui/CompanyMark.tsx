import Image from "next/image";
import { AppleIcon, BriefcaseIcon } from "./icons";

export function CompanyMark({ company }: { company: string }) {
  return (
    <span className="company-mark" aria-hidden="true">
      {company === "Apple" ? (
        <AppleIcon />
      ) : company === "TCS" ? (
        <Image src="/images/brands/tcs.svg" width={56} height={56} alt="" />
      ) : company === "The Sparks Foundation" ? (
        <Image src="/images/brands/sparks.png" width={56} height={56} alt="" />
      ) : (
        <BriefcaseIcon />
      )}
    </span>
  );
}
