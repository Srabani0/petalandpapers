import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      NEXT_PUBLIC_APP_URL: "https://www.petalandpapers.test",
      CONTACT_RECEIVER_EMAIL: "owner@petalandpapers.test",
    },
  },
});
