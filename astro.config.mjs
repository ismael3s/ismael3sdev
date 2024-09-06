import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";

export default defineConfig({
  site: "https://ismael3s.dev",
  integrations: [expressiveCode(), mdx(), sitemap(), tailwind()],
});
