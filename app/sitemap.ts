import type { MetadataRoute } from 'next';

const siteUrl = 'https://www.boredteacher.online';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/about', '/games', '/resources', '/blog'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));
}