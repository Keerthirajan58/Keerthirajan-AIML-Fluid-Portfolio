/**
 * The real content: facts the owner corrected stay corrected, every file it
 * points at exists, and every cross-reference resolves.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { localContent as content } from "@/content";
import { heroSentence, heroTokens } from "@/content/heroTokens";
import { projectFilters } from "@/content/filters";
import { projects } from "@/content/projects";
import { homeSections, navigation, sectionInfo } from "@/content/site";
import { caseStudyRoutes } from "@/lib/content/repository";
import { validateContent } from "@/lib/content/schema";
import { getImageSize } from "@/lib/server/images";
import { isSafeLink } from "@/lib/navigation";

const publicFile = (path: string) => join(process.cwd(), "public", path);

/** Every /images (or résumé) path the content refers to. */
function referencedFiles() {
  const { profile, contact, experience, education } = content;
  return [
    profile.photo,
    contact.resumeUrl,
    ...experience.flatMap((job) =>
      job.logo && "src" in job.logo ? [job.logo.src] : [],
    ),
    ...education.flatMap((e) => ("src" in e.logo ? [e.logo.src] : [])),
    ...content.projects.flatMap((p) =>
      p.caseStudy
        ? [
            p.caseStudy.gallery.cover,
            ...p.caseStudy.gallery.slides,
            ...p.caseStudy.sections.flatMap((s) =>
              s.media ? [s.media.src] : [],
            ),
          ]
        : [],
    ),
    ...content.certifications.flatMap((c) => (c.logo ? [c.logo] : [])),
    ...content.testimonials.map((t) => t.image),
  ];
}

describe("local content", () => {
  it("passes the same validation as CMS content, with every route", () => {
    expect(validateContent(content, caseStudyRoutes)).toEqual(content);
  });

  it("keeps the owner's corrections", () => {
    const tcs = content.experience.find((e) => e.company === "TCS");
    expect(tcs?.role).toBe("Machine Learning Intern");
    expect(content.profile.location).toBe("San Francisco, CA");
    expect(content.profile.aboutHeadline).toBe("AIML / Software Engineer");
    expect(content.profile.pageTitle).toBe("Keerthirajan · AI, end to end");
    // The hero's location fact is the profile's location, not a copy.
    expect(content.profile.hero.facts.map((f) => f.text)).toContain(
      content.profile.location,
    );
    const gw = content.education[0];
    expect(gw.award?.detail).toBe(
      "50% tuition scholarship, totaling over $38,000.",
    );
  });

  it("never publishes a phone number or a messaging handle", () => {
    const text = JSON.stringify(content);
    expect(text).not.toMatch(/\btel:|whatsapp|\+?\d[\d\s().-]{8,}\d\b/i);
    expect(content.contact).not.toHaveProperty("phone");
  });

  it("points only at files that exist in /public", () => {
    const files = referencedFiles();
    expect(files.length).toBeGreaterThan(30);
    for (const file of files) {
      expect(file.startsWith("/"), file).toBe(true);
      expect(existsSync(publicFile(file)), file).toBe(true);
    }
  });

  it("links only to safe destinations", () => {
    const links = [
      content.contact.resumeUrl,
      ...content.contact.socials.map((s) => s.href),
      ...content.projects.flatMap((p) => Object.values(p.links ?? {})),
      ...content.certifications.map((c) => c.url),
    ];
    for (const link of links) expect(isSafeLink(link), link).toBe(true);
    for (const link of links.filter((l) => !l.startsWith("/")))
      expect(link.startsWith("https://"), link).toBe(true);
  });

  it("lists every project file once, named after its slug", () => {
    const files = readdirSync(join(process.cwd(), "src/content/projects"))
      .filter((f) => f !== "index.ts")
      .map((f) => f.replace(/\.ts$/, ""));
    expect([...files].sort()).toEqual(projects.map((p) => p.slug).sort());
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it("resolves every chapter to a case study it continues", () => {
    const chapters = content.projects.filter((p) => p.chapter);
    expect(chapters.map((p) => p.slug)).toEqual(["barterbrain-nvc"]);
    for (const p of chapters) {
      const parent = content.projects.find((q) => q.slug === p.chapter!.of);
      expect(parent?.caseStudy).toBeDefined();
      expect(p.caseStudy).toBeDefined();
    }
  });

  it("uses only work filters that have a label", () => {
    const ids = new Set<string>(projectFilters.map((f) => f.id));
    for (const p of content.projects)
      for (const filter of p.filters)
        expect(ids.has(filter), filter).toBe(true);
    expect(new Set(projectFilters.map((f) => f.id)).size).toBe(
      projectFilters.length,
    );
  });

  it("keeps the facts in case studies in one place", () => {
    // Siri's "At Apple" section is the Apple internship's own bullets.
    const siri = content.projects.find((p) => p.slug === "siri-core-modeling");
    const apple = content.experience.find((e) => e.company === "Apple");
    expect(
      siri?.caseStudy?.sections.find((s) => s.heading === "At Apple")?.bullets,
    ).toBe(apple?.bullets);
  });

  it("separates the startup chapter's media from the hackathon's", () => {
    const hack = content.projects.find((p) => p.slug === "barterbrain")!;
    const nvc = content.projects.find((p) => p.slug === "barterbrain-nvc")!;
    expect(
      hack.caseStudy!.gallery.slides.every((s) => !s.includes("nvc")),
    ).toBe(true);
    const { cover, slides } = nvc.caseStudy!.gallery;
    expect([cover, ...slides]).toEqual([
      "/images/projects/barterbrain-nvc/slide-2.jpg",
      "/images/projects/barterbrain-nvc/slide-1.jpg",
      "/images/projects/barterbrain-nvc/slide-3.jpg",
      "/images/projects/barterbrain-nvc/cover.jpg",
    ]);
  });

  it("ships certification logos the page can size from the file", () => {
    for (const cert of content.certifications.filter((c) => c.logo)) {
      const size = getImageSize(cert.logo!);
      // A real PNG header, not the 1200×900 fallback for unreadable files.
      expect(size, cert.logo).not.toEqual({ width: 1200, height: 900 });
      expect(size.height).toBeGreaterThan(0);
    }
  });
});

describe("hero line", () => {
  it("spells out exactly the hero sentence, with sane probabilities", () => {
    expect(heroTokens.map((t) => t.text).join(" ")).toBe(heroSentence);
    for (const t of heroTokens) {
      expect(t.alts).toHaveLength(3);
      const total = t.alts.reduce((sum, [, p]) => sum + p, 0);
      expect(total).toBeLessThanOrEqual(1);
      expect(t.alts[0][1]).toBe(Math.max(...t.alts.map(([, p]) => p)));
    }
  });
});

describe("home sections", () => {
  it("run in page order with a header link for the main ones", () => {
    expect(homeSections.map((s) => s.id)).toEqual([
      "hero",
      "about",
      "experience",
      "projects",
      "skills",
      "credentials",
      "testimonials",
      "contact",
    ]);
    expect(navigation).toEqual([
      { id: "about", label: "About" },
      { id: "experience", label: "Experience" },
      { id: "projects", label: "Work" },
      { id: "skills", label: "Skills" },
      { id: "contact", label: "Contact" },
    ]);
    expect(new Set(homeSections.map((s) => s.epoch)).size).toBe(
      homeSections.length,
    );
  });

  it("finds a section's words by id and refuses unknown ids", () => {
    expect(sectionInfo("projects").title).toBe("Selected work");
    expect(() => sectionInfo("nope" as never)).toThrow("Unknown section");
  });
});
