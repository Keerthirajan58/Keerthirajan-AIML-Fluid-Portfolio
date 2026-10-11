import { cache } from "react";
import { localContent, readWithFallback } from "./repository";
import { parseCollections, WebflowContentRepository } from "./webflow";
// Server-only usage: this module is imported only by async route/layout modules.
export const loadContent = cache(async () => {
  const token = process.env.WEBFLOW_API_TOKEN,
    collections = parseCollections(process.env.WEBFLOW_COLLECTIONS);
  if (!token || !collections) return localContent;
  return readWithFallback(
    new WebflowContentRepository(token, collections),
    () =>
      console.warn(
        "Webflow unavailable or invalid; using the verified local content snapshot.",
      ),
  );
});
