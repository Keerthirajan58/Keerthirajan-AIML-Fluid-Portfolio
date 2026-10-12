import { cache } from "react";
import { localContent } from "@/content";
import { readWithFallback } from "./repository";
import { parseCollections, WebflowContentRepository } from "./webflow";

/**
 * The content for this request (server only): the Webflow CMS when it is
 * configured and valid, otherwise the local content.
 */
export const loadContent = cache(async () => {
  const token = process.env.WEBFLOW_API_TOKEN,
    collections = parseCollections(process.env.WEBFLOW_COLLECTIONS);
  if (!token || !collections) return localContent;
  return readWithFallback(
    new WebflowContentRepository(token, collections),
    () =>
      console.warn("Webflow unavailable or invalid; using the local content."),
  );
});
