import { SITE_URL } from "@/lib/site";

export default function sitemap() {
  const now = new Date();
  return [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/renginiai", priority: 0.8, changeFrequency: "weekly" },
    { path: "/idejos", priority: 0.7, changeFrequency: "daily" },
    { path: "/apklausos", priority: 0.6, changeFrequency: "weekly" },
    { path: "/klausimai", priority: 0.6, changeFrequency: "weekly" },
    { path: "/taryba", priority: 0.8, changeFrequency: "monthly" },
    { path: "/galerija", priority: 0.7, changeFrequency: "weekly" },
  ].map(({ path, ...rest }) => ({ url: `${SITE_URL}${path}`, lastModified: now, ...rest }));
}
