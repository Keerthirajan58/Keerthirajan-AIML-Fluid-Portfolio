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
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/types/**",
        "src/app/layout.tsx",
        "src/app/page.tsx",
        "src/app/projects/**",
        "src/app/opengraph-image.tsx",
      ],
      reporter: ["text", "html", "json", "json-summary", "lcov"],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 70 },
    },
  },
});
