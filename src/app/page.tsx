import { profile } from "@/content/data";

// Phase 1/2 smoke test only: proves content/data.ts and the locked design
// tokens are wired up end-to-end. Real hero design lands in Phase 3.
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-paper font-body">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-4 py-32 px-16 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {profile.name}
        </h1>
        <p className="max-w-md text-lg leading-8 text-ink-muted">
          {profile.tagline}
        </p>
      </main>
    </div>
  );
}
