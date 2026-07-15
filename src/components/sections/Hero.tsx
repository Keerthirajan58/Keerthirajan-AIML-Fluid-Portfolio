import { HeroIntro } from "@/components/motion/HeroIntro";
import { NodeCluster } from "@/components/NodeCluster";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 md:grid-cols-[1.1fr_0.9fr]"
    >
      <HeroIntro />

      <div
        data-hero-cluster
        className="relative mx-auto w-full max-w-sm md:max-w-none"
      >
        <NodeCluster />
      </div>
    </section>
  );
}
