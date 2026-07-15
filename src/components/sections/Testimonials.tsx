import { testimonials } from "@/content/data";
import { Section } from "@/components/ui/Section";

export function Testimonials() {
  return (
    <Section id="testimonials" eyebrow="Recommendations" title="What others say">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl border border-ink/10 bg-surface p-6"
          >
            <blockquote className="flex-1 text-sm leading-7 text-ink-muted sm:text-base">
              <span aria-hidden="true" className="text-crimson">
                “
              </span>
              {t.quote}
              <span aria-hidden="true" className="text-crimson">
                ”
              </span>
            </blockquote>
            <figcaption className="mt-5">
              <p className="font-display text-sm font-semibold text-ink">
                {t.name}
              </p>
              <p className="text-sm text-ink-muted">{t.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
