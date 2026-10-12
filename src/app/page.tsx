import { homeSections } from "@/content/site";
import { sectionComponents } from "@/components/sections";
import { loadContent } from "@/lib/content/load";

export default async function Home() {
  const content = await loadContent();
  // Every section sits directly on the living background (see Atmosphere).
  return (
    <>
      {homeSections.map(({ id }) => {
        const Section = sectionComponents[id];
        return <Section key={id} content={content} />;
      })}
    </>
  );
}
