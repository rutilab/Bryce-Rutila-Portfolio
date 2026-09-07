import type { MetadataRoute } from 'next';
import { AI_CRAWLERS, SEO_CRAWLERS } from '@/lib/bots';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Named refusals first, so a crawler reading top-down finds its own rule.
      ...[...AI_CRAWLERS, ...SEO_CRAWLERS].map(userAgent => ({
        userAgent,
        disallow: '/',
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
  };
}
