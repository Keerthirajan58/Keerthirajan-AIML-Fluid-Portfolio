import type { OpenSourceWork } from "./types";

/**
 * Open-source work: projects I maintain (by slug) and pull requests to other
 * people's projects. Status and dates were checked on GitHub on 2026-11-02;
 * update a contribution's `status` and `date` when it is merged.
 */
export const openSource: OpenSourceWork = {
  maintained: ["bugbout"],
  contributions: [
    {
      project: "Nebari",
      repo: "nebari-dev/llm-serving-pack",
      url: "https://github.com/nebari-dev/llm-serving-pack/pull/179",
      title: "Report missing provider credentials in model status",
      summary:
        "A model served through an external provider could show Ready while every request failed with 401. The Go operator now reports why in a status condition and re-checks only the models whose Secret changed.",
      status: "merged",
      date: "Oct 2026",
      tech: ["Go", "Kubernetes", "controller-runtime"],
    },
    {
      project: "OpenTeams Collab Hub",
      repo: "openteams-ai/collab-hub-pack",
      url: "https://github.com/openteams-ai/collab-hub-pack/pull/79",
      title: "Live PostgreSQL tests for frame-group cleanup",
      summary:
        "Opt-in tests against a real PostgreSQL database for the JSONB membership lookup, its GIN index and multi-tenant cleanup when a frame is deleted, which were only covered in memory before.",
      status: "merged",
      date: "Sep 2026",
      tech: ["Python", "PostgreSQL", "pytest"],
    },
    {
      project: "Gorilla (Berkeley Function Calling Leaderboard)",
      repo: "ShishirPatil/gorilla",
      url: "https://github.com/ShishirPatil/gorilla/pull/1365",
      title: "Fix a BFCL CLI crash on a missing audio dependency",
      summary:
        "Even `bfcl --help` failed unless an unrelated audio package was installed. The Qwen Agent import now waits until a Qwen handler starts, with a regression test.",
      status: "open",
      date: "Sep 2026",
      tech: ["Python", "LLM evaluation"],
    },
    {
      project: "Nebari",
      repo: "nebari-dev/nebi",
      url: "https://github.com/nebari-dev/nebi/pull/567",
      title: "Digest-pinned OCI imports",
      summary:
        "The CLI and API can import environments by sha256 digest and record the resolved digest, so a moved tag can't change what gets installed.",
      status: "open",
      date: "Sep 2026",
      tech: ["Go", "OCI registries"],
    },
    {
      project: "Nebari",
      repo: "nebari-dev/llm-serving-pack",
      url: "https://github.com/nebari-dev/llm-serving-pack/pull/186",
      title: "Restore the default Endpoint Picker image",
      summary:
        "Fresh installs failed because an upstream image was renamed. The defaults now point at the new image, and a CI job checks that every default image is still published.",
      status: "open",
      date: "Sep 2026",
      tech: ["Go", "Helm", "GitHub Actions"],
    },
    {
      project: "Nebari",
      repo: "nebari-dev/data-science-pack",
      url: "https://github.com/nebari-dev/data-science-pack/pull/246",
      title: "Configurable shared memory for JupyterHub pods",
      summary:
        "User pods now get a memory-backed /dev/shm, sized per profile, so Ray and PyTorch DataLoader workers aren't held to Kubernetes' 64 MiB default.",
      status: "open",
      date: "Sep 2026",
      tech: ["Kubernetes", "Helm", "JupyterHub"],
    },
  ],
};
