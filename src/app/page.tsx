import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Credentials } from "@/components/sections/Credentials";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { loadContent } from "@/content/load";

export default async function Home() {
  const content = await loadContent();
  // Every section sits directly on the living background (see Atmosphere).
  return (
    <>
      <Hero content={content} />
      <About content={content} />
      <Experience content={content} />
      <Projects content={content} />
      <Skills content={content} />
      <Credentials content={content} />
      <Testimonials content={content} />
      <Contact content={content} />
    </>
  );
}
