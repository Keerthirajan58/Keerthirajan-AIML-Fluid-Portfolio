import { Hero } from "@/components/sections/Hero";
import { Highlights } from "@/components/sections/Highlights";
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
  return (
    <>
      <Hero content={content} />
      {/* The white sheet slides over the light field and ends before Contact,
          so the field frames the page at both ends. */}
      <div className="sheet">
        <Highlights content={content} />
        <About content={content} />
        <Experience content={content} />
        <Projects content={content} />
        <Skills content={content} />
        <Credentials content={content} />
        <Testimonials content={content} />
      </div>
      <Contact content={content} />
    </>
  );
}
