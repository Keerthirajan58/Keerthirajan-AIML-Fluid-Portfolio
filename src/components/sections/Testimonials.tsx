import { localContent, type PortfolioContent } from "@/content/repository";
import { Section } from "@/components/ui/Section";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
export function Testimonials({
  content = localContent,
}: {
  content?: PortfolioContent;
}) {
  const { testimonials } = content;
  return (
    <Section
      id="testimonials"
      eyebrow="Recommendations"
      title="From people I've worked with"
    >
      <RecommendationCarousel items={testimonials} />
    </Section>
  );
}
