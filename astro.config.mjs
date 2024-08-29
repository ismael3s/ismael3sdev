import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import sentry from "@sentry/astro";

export default defineConfig({
  site: "https://ismael3s.dev",
  integrations: [
    expressiveCode(),
    mdx(),
    sitemap(),
    tailwind(),
    sentry({
      dsn: "https://d37e68d13e23d587da1bfa1edba1311e@o4507820477186048.ingest.us.sentry.io/4507860001488896",
      sourceMapsUploadOptions: {
        project: "ismael3sdev",
        authToken:
          process.env.SENTRY_AUTH_TOKEN ||
          "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",
      },
    }),
  ],
});
