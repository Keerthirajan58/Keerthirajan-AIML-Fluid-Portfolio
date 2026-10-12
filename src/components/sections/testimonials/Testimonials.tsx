import { localContent } from "@/content";
import { sectionInfo } from "@/content/site";
import type { PortfolioContent } from "@/content/types";
import { Section } from "@/components/ui/Section";
import { RecommendationCarousel } from "./RecommendationCarousel";

export function Testimonials({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  if (!content.testimonials.length) return null;
  const { eyebrow, title } = sectionInfo("testimonials");
  return (
    <Section id="testimonials" eyebrow={eyebrow} title={title}>
      <RecommendationCarousel items={content.testimonials} />
    </Section>
  );
}
