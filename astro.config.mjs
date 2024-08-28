import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: 'https://ismael3s.github.io',
  base: 'ismael3sdev',
  integrations: [expressiveCode(),mdx(), sitemap(), tailwind(), ]
});