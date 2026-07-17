// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Site URL drives canonical links, sitemap, and RSS. Update if the domain changes.
export default defineConfig({
  site: 'https://blakegrosskopf.com',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
