import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Ismael3s",
  EMAIL: "ismael.santana.dev@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Astro Nano is a minimal and lightweight blog and portfolio.",
};

export const BLOG: Metadata = {
  TITLE: "Digital Garden",
  DESCRIPTION: "A collection of articles on topics that I'm learning.",
};

export const GARDEN: Metadata = {
  TITLE: "Digital Garden",
  DESCRIPTION: "A collection of articles on topics that I'm learning.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, that I worked/working",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/ismael3s",
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/ismael3s",
  },
];
