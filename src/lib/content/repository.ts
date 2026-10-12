import { localContent } from "@/content";
import type { PortfolioContent } from "@/content/types";
import { validateContent } from "./schema";

/** A source of portfolio content (local files or a CMS). */
export interface ContentRepository {
  read(): Promise<PortfolioContent>;
}

export class LocalContentRepository implements ContentRepository {
  async read() {
    return localContent;
  }
}

/** Case-study pages are generated at build time from the local content. */
export const caseStudyRoutes = localContent.projects
  .filter((p) => p.caseStudy)
  .map((p) => p.slug);

/**
 * Reads and validates a repository's content. Any failure (an outage,
 * invalid data or a route the build doesn't have) falls back to the local
 * content as a whole, never a mix of the two.
 */
export async function readWithFallback(
  repository: ContentRepository,
  onError: (error: unknown) => void = () => {},
): Promise<PortfolioContent> {
  try {
    return validateContent(await repository.read(), caseStudyRoutes);
  } catch (error) {
    onError(error);
    return localContent;
  }
}
