export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Berlin Schools Map",
  description:
    "Interactive map of all schools in Berlin with detailed statistics, construction projects, and travel time estimates. Find the right school for your child with comprehensive data from official Berlin government sources.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://berlin-schools.netlify.app",
  ogImage: "/og-image.png",
  keywords: [
    "Berlin schools",
    "Berlin education",
    "school search Berlin",
    "Grundschule Berlin",
    "Gymnasium Berlin",
    "school map Berlin",
    "Berlin school finder",
    "school statistics Berlin",
    "Berlin school construction",
    "German schools",
    "school comparison Berlin",
  ],
  creator: "Alex Melnik",
  locale: "en",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
};
