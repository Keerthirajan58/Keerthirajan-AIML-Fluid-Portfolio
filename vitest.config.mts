import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.tsx"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    reporters: [
      "default",
      ["json", { outputFile: "coverage/unit-results.json" }],
    ],
    coverage: {
      provider: "v8",
      // Everything under src counts, routes included (they're unit-tested
      // too); only type-only modules have nothing to execute.
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/content/types.ts"],
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      thresholds: { lines: 99, statements: 99, functions: 99, branches: 99 },
    },
  },
});
