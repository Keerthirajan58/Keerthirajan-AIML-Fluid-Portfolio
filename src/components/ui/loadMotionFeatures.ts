/** Loads the animation features on first use, keeping them out of the page bundle. */
export const loadFeatures = () =>
  import("./motionFeatures").then((module) => module.default);
