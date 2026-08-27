import type { MetadataRoute } from 'next';

/**
 * cvs-ux-job build: this deployment is an unlisted copy sent to one employer.
 * It must never be indexed — disallow everything, and see the `robots` block in
 * app/layout.tsx for the matching <meta name="robots"> tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
