import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://boredteacher.online/sitemap.xml',
    host: 'https://boredteacher.online',
  };
}