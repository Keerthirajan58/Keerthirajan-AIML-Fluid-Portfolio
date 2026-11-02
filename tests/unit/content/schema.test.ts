/**
 * Validation rules for any content (local or CMS): the shape, safe links and
 * images, and cross-references a type checker can't see.
 */
import { describe, expect, it } from "vitest";
import { localContent } from "@/content";
import {
  cmsImageHosts,
  schemaMatchesTypes,
  validateContent,
} from "@/lib/content/schema";
import { caseStudyRoutes } from "@/lib/content/repository";
import { contentWith, newCaseStudy, newProject } from "../../support/content";

const rejects = (edit: Parameters<typeof contentWith>[0], message?: string) =>
  expect(() => validateContent(contentWith(edit))).toThrow(message);

describe("content schema", () => {
  it("describes exactly the TypeScript content types", () => {
    expect(schemaMatchesTypes).toBe(true);
  });

  it("accepts the local content and a new, complete project", () => {
    expect(validateContent(localContent)).toEqual(localContent);
    const content = contentWith((c) =>
      c.projects.push(newProject({ caseStudy: newCaseStudy() })),
    );
    expect(validateContent(content).projects.at(-1)?.slug).toBe(
      "orbit-planner",
    );
  });

  it("rejects missing or blank required text", () => {
    rejects((c) => {
      c.profile.name = "   ";
    });
    rejects((c) => {
      c.profile.bio = [];
    });
    rejects((c) => {
      c.experience = [];
    });
    rejects((c) => {
      c.experience[0].bullets = [];
    });
    rejects((c) => {
      c.skills[0].skills = [""];
    });
  });

  it("rejects unsafe links and addresses", () => {
    rejects((c) => {
      c.contact.resumeUrl = "javascript:alert(1)";
    }, "Unsafe URL");
    rejects((c) => {
      c.contact.socials[0].href = "http://insecure.example.com";
    }, "Unsafe URL");
    rejects((c) => {
      c.projects[0].links = { github: "//evil.example.com" };
    }, "Unsafe URL");
    rejects((c) => {
      c.certifications[0].url = "data:text/html,hi";
    }, "Unsafe URL");
    rejects((c) => {
      c.contact.emails = ["not-an-email"];
    });
  });

  it("accepts local images and the CMS CDN only", () => {
    const withPhoto = (photo: string) =>
      contentWith((c) => {
        c.profile.photo = photo;
      });
    expect(() =>
      validateContent(withPhoto(`https://${cmsImageHosts[0]}/a.jpg`)),
    ).not.toThrow();
    for (const bad of [
      "/images/../secrets.txt",
      "http://cdn.prod.website-files.com/a.jpg",
      "https://example.com/a.jpg",
      "images/no-leading-slash.jpg",
      "not a url",
    ])
      expect(() => validateContent(withPhoto(bad)), bad).toThrow(
        "Unsupported image",
      );
  });

  it("rejects values outside the fixed choices", () => {
    rejects((c) => {
      (c.profile.aboutHighlights[0] as { icon: string }).icon = "rocket";
    });
    rejects((c) => {
      (c.education[0].tint as string[]) = ["navy", "teal"];
    });
    rejects((c) => {
      (c.projects[0].filters as string[]) = ["blockchain"];
    });
    rejects((c) => {
      (c.contact.socials[0] as { network: string }).network = "myspace";
    });
  });

  it("requires URL-safe, unique project slugs", () => {
    rejects((c) => {
      c.projects[0].slug = "Not A Slug";
    }, "Slugs use a-z, 0-9 and single hyphens");
    rejects((c) => {
      c.projects.push({ ...c.projects[0] });
    }, "Duplicate project slug: siri-core-modeling");
  });

  it("requires a case study to have sections; screenshots are optional", () => {
    rejects((c) => {
      c.projects[0].caseStudy!.sections = [];
    });
    expect(() =>
      validateContent(
        contentWith((c) => {
          delete c.projects[0].caseStudy!.gallery;
        }),
      ),
    ).not.toThrow();
    rejects((c) => {
      c.projects[0].caseStudy!.gallery = { cover: "not an image", slides: [] };
    }, "Unsupported image");
  });

  it("keeps a private project's code unlinked", () => {
    rejects((c) => {
      const p = c.projects.find((q) => q.privateRepo)!;
      p.links = { github: "https://github.com/x/y" };
    }, "Private project links its repository: job-event-search");
  });

  it("only lists maintained projects that exist, and checks every contribution", () => {
    rejects((c) => {
      c.openSource.maintained.push("not-a-project");
    }, "Unknown maintained project: not-a-project");
    rejects((c) => {
      c.openSource.contributions[0].repo = "no-slash";
    }, "Repos are owner/name");
    rejects((c) => {
      c.openSource.contributions[0].url = "http://insecure.example.com/pr/1";
    }, "Unsafe URL");
    rejects((c) => {
      (c.openSource.contributions[0] as { status: string }).status = "closed";
    });
  });

  it("only lets a chapter continue a real case study", () => {
    const chapter = {
      of: "barterbrain",
      badge: "Next",
      label: "Next chapter",
      teaser: "What came next",
      back: "Back to the original",
    };
    // A chapter needs its own case study …
    rejects(
      (c) => c.projects.push(newProject({ chapter })),
      "Invalid chapter: orbit-planner",
    );
    // … and must continue a project that has one and isn't a chapter itself.
    rejects(
      (c) =>
        c.projects.push(
          newProject({
            chapter: { ...chapter, of: "moodbites" },
            caseStudy: newCaseStudy(),
          }),
        ),
      "Invalid chapter",
    );
    rejects(
      (c) =>
        c.projects.push(
          newProject({
            chapter: { ...chapter, of: "barterbrain-nvc" },
            caseStudy: newCaseStudy(),
          }),
        ),
      "Invalid chapter",
    );
    rejects(
      (c) =>
        c.projects.push(
          newProject({
            chapter: { ...chapter, of: "missing" },
            caseStudy: newCaseStudy(),
          }),
        ),
      "Invalid chapter",
    );
  });

  it("matches case studies to the built pages exactly when routes are given", () => {
    expect(() =>
      validateContent(
        contentWith((c) => {
          c.projects = c.projects.filter((p) => p.slug !== "pitchpulse");
        }),
        caseStudyRoutes,
      ),
    ).toThrow("Missing published case study: pitchpulse");
    expect(() =>
      validateContent(
        contentWith((c) =>
          c.projects.push(newProject({ caseStudy: newCaseStudy() })),
        ),
        caseStudyRoutes,
      ),
    ).toThrow("Unknown case study route: orbit-planner");
  });
});
